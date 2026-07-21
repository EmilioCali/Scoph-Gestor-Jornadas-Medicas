// c:\IN6AM\gitIN6AM\Scoph-Gestor-Jornadas-Medicas\scoph-mobile\src\features\jornadas\screens\JornadasScreen.jsx
import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { useJornadas } from '../hooks/useJornadas.js';
import { Card, LoadingSpinner, EmptyState } from '../../../shared/components/common/Common.jsx';
import { ScreenHeader } from '../../../shared/components/common/ScreenHeader.jsx';
import { Badge } from '../../../shared/components/common/Badge.jsx';
import { Button } from '../../../shared/components/common/Button.jsx';
import { COLORS, FONT_SIZE, SPACING, SHADOWS } from '../../../shared/constants/theme.js';
import { createWorkday } from '../../../shared/api/workdayService.js';

const initialForm = {
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  department: '',
  municipality: '',
  address: '',
  estimatedPatients: '',
  estimatedMedicines: '',
  status: 'PLANNED'
};

const statusOptions = [
  { value: 'PLANNED', label: 'Planificada' },
  { value: 'IN_PROGRESS', label: 'En curso' },
  { value: 'FINISHED', label: 'Finalizada' },
  { value: 'CANCELLED', label: 'Cancelada' }
];

function getStatusBadge(status) {
  const map = {
    IN_PROGRESS: <Badge variant="success">En curso</Badge>,
    PLANNED: <Badge variant="info">Planificada</Badge>,
    FINISHED: <Badge variant="gray">Finalizada</Badge>,
    COMPLETED: <Badge variant="gray">Finalizada</Badge>,
    CANCELLED: <Badge variant="danger">Cancelada</Badge>
  };
  return map[status] || <Badge variant="warning">{status || 'N/E'}</Badge>;
}

function formatDate(dateString) {
  if (!dateString) return 'Sin fecha';
  const date = new Date(dateString);
  return isNaN(date.getTime())
    ? 'Fecha inválida'
    : date.toLocaleDateString('es-GT', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function JornadasScreen() {
  const { loading, error, jornadas, summary, refetch } = useJornadas();
  const [modalVisible, setModalVisible] = React.useState(false);
  const [form, setForm] = React.useState(initialForm);
  const [actionLoading, setActionLoading] = React.useState(false);

  const openCreateModal = () => {
    setForm(initialForm);
    setModalVisible(true);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!form.name || !form.startDate || !form.endDate || !form.department || !form.municipality || !form.address) {
      Alert.alert('Error', 'Nombre, fechas y ubicacion son obligatorios.');
      return false;
    }

    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      Alert.alert('Error', 'Ingresa las fechas en formato YYYY-MM-DD.');
      return false;
    }

    if (start > end) {
      Alert.alert('Error', 'La fecha de inicio no puede ser posterior a la fecha de fin.');
      return false;
    }

    if (Number(form.estimatedPatients) < 0 || Number(form.estimatedMedicines) < 0) {
      Alert.alert('Error', 'Las cantidades estimadas no pueden ser negativas.');
      return false;
    }

    return true;
  };

  const handleCreateWorkday = async () => {
    if (!validateForm()) return;
    setActionLoading(true);

    try {
      await createWorkday({
        name: form.name.trim(),
        description: form.description.trim(),
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        location: {
          department: form.department.trim(),
          municipality: form.municipality.trim(),
          address: form.address.trim()
        },
        estimatedPatients: Number(form.estimatedPatients || 0),
        estimatedMedicines: Number(form.estimatedMedicines || 0),
        status: form.status
      });

      Alert.alert('Listo', 'Jornada creada correctamente.');
      setModalVisible(false);
      refetch();
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Error al crear jornada.';
      Alert.alert('Error', message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <ScreenHeader title="Jornadas" subtitle="Gestión de jornadas médicas" />
        <LoadingSpinner />
      </>
    );
  }

  if (error) {
    return (
      <>
        <ScreenHeader title="Jornadas" subtitle="Gestión de jornadas médicas" />
        <EmptyState title="Jornadas" message={error} />
      </>
    );
  }

  return (
    <>
      <ScreenHeader
        title="Jornadas"
        subtitle="Gestión de jornadas médicas"
        action={<Button title="Agregar jornada" onPress={openCreateModal} style={styles.createButton} />}
      />
      <View style={styles.container}>
      <View style={styles.statsGrid}>
        <Card style={[styles.statCard, styles.statPrimary]}>
          <Text style={styles.statLabel}>Total</Text>
          <Text style={styles.statValue}>{summary.total}</Text>
        </Card>
        <Card style={[styles.statCard, styles.statSuccess]}>
          <Text style={styles.statLabel}>En curso</Text>
          <Text style={styles.statValue}>{summary.activas}</Text>
        </Card>
        <Card style={[styles.statCard, styles.statInfo]}>
          <Text style={styles.statLabel}>Planificadas</Text>
          <Text style={styles.statValue}>{summary.planificadas}</Text>
        </Card>
        <Card style={[styles.statCard, styles.statGray]}>
          <Text style={styles.statLabel}>Finalizadas</Text>
          <Text style={styles.statValue}>{summary.finalizadas}</Text>
        </Card>
      </View>

      <FlatList
        data={jornadas}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} tintColor={COLORS.primary} />
        }
        ListEmptyComponent={
          <EmptyState title="Jornadas" message="No hay jornadas registradas." />
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.workdayName}>{item.name}</Text>
                <Text style={styles.workdaySubtitle} numberOfLines={1}>
                  {item.location?.municipality || 'Sin ubicación'},{' '}
                  {item.location?.department || 'Sin departamento'}
                </Text>
              </View>
              {getStatusBadge(item.status)}
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailBlock}>
                <Text style={styles.detailLabel}>Inicio</Text>
                <Text style={styles.detailValue}>{formatDate(item.startDate)}</Text>
              </View>
              <View style={styles.detailBlock}>
                <Text style={styles.detailLabel}>Fin</Text>
                <Text style={styles.detailValue}>{formatDate(item.endDate)}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailBlock}>
                <Text style={styles.detailLabel}>Responsable</Text>
                <Text style={styles.detailValue}>{item.manager?.name || 'Sin responsable'}</Text>
              </View>
              <View style={styles.detailBlock}>
                <Text style={styles.detailLabel}>Pacientes</Text>
                <Text style={styles.detailValue}>{item.estimatedPatients}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailBlock}>
                <Text style={styles.detailLabel}>Médicos</Text>
                <Text style={styles.detailValue}>
                  {(item.doctors || []).length > 0
                    ? item.doctors.map((d) => d.name).join(', ')
                    : 'Sin médicos asignados'}
                </Text>
              </View>
              <View style={styles.detailBlock}>
                <Text style={styles.detailLabel}>Medicamentos</Text>
                <Text style={styles.detailValue}>{item.estimatedMedicines}</Text>
              </View>
            </View>
          </Card>
        )}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView contentContainerStyle={styles.modalScroll}>
                <Text style={styles.modalTitle}>Agregar jornada</Text>

                <TextInput
                  placeholder="Nombre"
                  value={form.name}
                  onChangeText={(value) => handleChange('name', value)}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Descripcion"
                  value={form.description}
                  onChangeText={(value) => handleChange('description', value)}
                  style={[styles.input, styles.textArea]}
                  multiline
                />
                <TextInput
                  placeholder="Fecha inicio (YYYY-MM-DD)"
                  value={form.startDate}
                  onChangeText={(value) => handleChange('startDate', value)}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Fecha fin (YYYY-MM-DD)"
                  value={form.endDate}
                  onChangeText={(value) => handleChange('endDate', value)}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Departamento"
                  value={form.department}
                  onChangeText={(value) => handleChange('department', value)}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Municipio"
                  value={form.municipality}
                  onChangeText={(value) => handleChange('municipality', value)}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Direccion"
                  value={form.address}
                  onChangeText={(value) => handleChange('address', value)}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Pacientes estimados"
                  value={form.estimatedPatients}
                  onChangeText={(value) => handleChange('estimatedPatients', value.replace(/[^0-9]/g, ''))}
                  style={styles.input}
                  keyboardType="numeric"
                />
                <TextInput
                  placeholder="Medicamentos estimados"
                  value={form.estimatedMedicines}
                  onChangeText={(value) => handleChange('estimatedMedicines', value.replace(/[^0-9]/g, ''))}
                  style={styles.input}
                  keyboardType="numeric"
                />

                <View style={styles.selectorRow}>
                  <Text style={styles.selectorLabel}>Estado</Text>
                  <View style={styles.selectorGroup}>
                    {statusOptions.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        onPress={() => handleChange('status', option.value)}
                        style={[
                          styles.selectorButton,
                          form.status === option.value && styles.selectorButtonActive
                        ]}
                      >
                        <Text
                          style={[
                            styles.selectorButtonText,
                            form.status === option.value && styles.selectorButtonTextActive
                          ]}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <Button
                    title="Cancelar"
                    variant="secondary"
                    onPress={() => setModalVisible(false)}
                    style={styles.modalButton}
                  />
                  <Button
                    title="Crear"
                    onPress={handleCreateWorkday}
                    disabled={actionLoading}
                    loading={actionLoading}
                    style={styles.modalButton}
                  />
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg
  },
  createButton: {
    minWidth: 150
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.md,
    marginBottom: SPACING.md
  },
  statCard: {
    flexBasis: '48%',
    minHeight: 96,
    justifyContent: 'space-between'
  },
  statPrimary: {
    backgroundColor: '#fef3c7'
  },
  statSuccess: {
    backgroundColor: '#dcfce7'
  },
  statInfo: {
    backgroundColor: '#dbeafe'
  },
  statGray: {
    backgroundColor: '#e5e7eb'
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    marginBottom: SPACING.xs
  },
  statValue: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xl,
    fontWeight: '700'
  },
  list: {
    paddingBottom: SPACING.xl
  },
  card: {
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.md
  },
  workdayName: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700'
  },
  workdaySubtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    marginTop: SPACING.xs
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
    marginBottom: SPACING.sm
  },
  detailBlock: {
    flex: 1
  },
  detailLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    marginBottom: SPACING.xs
  },
  detailValue: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%'
  },
  modalScroll: {
    padding: SPACING.lg
  },
  modalTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    backgroundColor: COLORS.background,
    color: COLORS.text,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md
  },
  textArea: {
    minHeight: 88,
    textAlignVertical: 'top'
  },
  selectorRow: {
    marginBottom: SPACING.md
  },
  selectorLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.xs
  },
  selectorGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm
  },
  selectorButton: {
    flexBasis: '48%',
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: COLORS.surface
  },
  selectorButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary
  },
  selectorButtonText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600'
  },
  selectorButtonTextActive: {
    color: COLORS.surface
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
    marginTop: SPACING.md
  },
  modalButton: {
    flex: 1
  }
});
