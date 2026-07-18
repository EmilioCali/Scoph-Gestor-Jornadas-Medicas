import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
  RefreshControl
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useInventory } from '../hooks/useInventory.js';
import { Card, LoadingSpinner, EmptyState } from '../../../shared/components/common/Common.jsx';
import { ScreenHeader } from '../../../shared/components/common/ScreenHeader.jsx';
import { Button } from '../../../shared/components/common/Button.jsx';
import { Badge } from '../../../shared/components/common/Badge.jsx';
import { COLORS, FONT_SIZE, SPACING, SHADOWS } from '../../../shared/constants/theme.js';
import {
  medicineCategories,
  medicinePresentations,
  medicineUnits
} from '../../../shared/constants/catalogOptions.js';
import { useAuthStore } from '../../../shared/store/authStore.js';

const INITIAL_FORM = {
  name: '',
  compound: '',
  concentration: '',
  barcode: '',
  presentation: '',
  unitOfMeasure: '',
  category: '',
  status: 'ACTIVO'
};

function MedicineBadge({ status }) {
  return status === 'ACTIVO' ? (
    <Badge variant="success">Activo</Badge>
  ) : (
    <Badge variant="danger">Inactivo</Badge>
  );
}

function OptionGroup({ label, value, options, onChange }) {
  return (
    <View style={styles.selectorRow}>
      <Text style={styles.selectorLabel}>{label}</Text>
      <View style={styles.selectorGroup}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            onPress={() => onChange(option)}
            style={[styles.selectorButton, value === option && styles.selectorButtonActive]}
          >
            <Text style={[styles.selectorButtonText, value === option && styles.selectorButtonTextActive]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export function CatalogScreen() {
  const { loading, error, catalog, refetch, create, update, toggleStatus } = useInventory();
  const currentUser = useAuthStore((state) => state.user);
  const canManageCatalog = currentUser?.rol === 'ADMIN' || currentUser?.rol === 'SUPER_ADMIN';

  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const filteredData = useMemo(
    () =>
      catalog.filter((item) => {
        const query = searchText.toLowerCase();
        const matchesSearch =
          item.name?.toLowerCase().includes(query) ||
          item.compound?.toLowerCase().includes(query) ||
          item.barcode?.includes(searchText);
        const matchesCategory = filterCategory ? item.category === filterCategory : true;
        const matchesStatus = filterStatus ? item.status === filterStatus : true;

        return matchesSearch && matchesCategory && matchesStatus;
      }),
    [catalog, searchText, filterCategory, filterStatus]
  );

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const openCreateModal = () => {
    setSelectedItem(null);
    setForm(INITIAL_FORM);
    setFormError(null);
    setIsEditMode(false);
    setModalVisible(true);
  };

  const openEditModal = (item) => {
    setSelectedItem(item);
    setForm({
      name: item.name ?? '',
      compound: item.compound ?? '',
      concentration: item.concentration ?? '',
      barcode: item.barcode ?? '',
      presentation: item.presentation ?? '',
      unitOfMeasure: item.unitOfMeasure ?? '',
      category: item.category ?? '',
      status: item.status ?? 'ACTIVO'
    });
    setFormError(null);
    setIsEditMode(true);
    setModalVisible(true);
  };

  const validateForm = () => {
    if (!form.name || !form.compound || !form.concentration || !form.presentation || !form.unitOfMeasure || !form.category) {
      setFormError('Completa todos los campos obligatorios.');
      return false;
    }

    const duplicated = catalog.find((medicine) => {
      if (selectedItem && medicine._id === selectedItem._id) return false;

      const sameName = medicine.name?.trim().toLowerCase() === form.name.trim().toLowerCase();
      const sameBarcode = form.barcode.trim() && medicine.barcode === form.barcode.trim();
      return sameName || sameBarcode;
    });

    if (duplicated) {
      setFormError(
        duplicated.name?.trim().toLowerCase() === form.name.trim().toLowerCase()
          ? 'Ya existe un medicamento con ese nombre'
          : 'Ya existe un medicamento con ese codigo de barras'
      );
      return false;
    }

    setFormError(null);
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSubmitting(true);

    try {
      const payload = {
        name: form.name.trim(),
        compound: form.compound.trim(),
        concentration: form.concentration.trim(),
        barcode: form.barcode.trim(),
        presentation: form.presentation,
        unitOfMeasure: form.unitOfMeasure,
        category: form.category
      };

      if (isEditMode && selectedItem) {
        const changedStatus = form.status !== selectedItem.status;
        if (changedStatus) {
          await toggleStatus(selectedItem._id, form.status);
        }

        const changedFields = Object.keys(payload).some((key) => payload[key] !== (selectedItem[key] ?? ''));
        if (changedFields) {
          await update(selectedItem._id, payload);
        }
      } else {
        await create({ ...payload, status: 'ACTIVO' });
      }

      setModalVisible(false);
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'No se pudo guardar el medicamento');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmToggleStatus = (item) => {
    const nextStatus = item.status === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    Alert.alert(
      item.status === 'ACTIVO' ? 'Desactivar medicamento' : 'Activar medicamento',
      item.status === 'ACTIVO'
        ? `"${item.name}" quedara inactivo y no aparecera en nuevos movimientos.`
        : `"${item.name}" volvera a estar disponible en el sistema.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: nextStatus === 'ACTIVO' ? 'Activar' : 'Desactivar',
          style: nextStatus === 'ACTIVO' ? 'default' : 'destructive',
          onPress: async () => {
            try {
              await toggleStatus(item._id, nextStatus);
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || err.message || 'No se pudo cambiar el estado');
            }
          }
        }
      ]
    );
  };

  const showExportUnavailable = (type) => {
    Alert.alert(type, 'La exportacion desde mobile aun no esta disponible.');
  };

  if (loading && catalog.length === 0) {
    return (
      <>
        <ScreenHeader title="Catalogo de Medicamentos" subtitle="Registro maestro de todos los medicamentos del sistema" />
        <LoadingSpinner />
      </>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <ScreenHeader
        title="Catalogo de Medicamentos"
        subtitle="Registro maestro de todos los medicamentos del sistema"
        action={
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerIconButton} onPress={refetch} disabled={loading}>
              <MaterialIcons name="refresh" size={20} color={COLORS.primary} />
            </TouchableOpacity>
            {canManageCatalog && (
              <Button title="Nuevo" onPress={openCreateModal} style={styles.newButton} />
            )}
          </View>
        }
      />

      <ScrollView
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} tintColor={COLORS.primary} />}
      >
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={refetch}>
              <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}

        <Card style={styles.filtersCard}>
          <View style={styles.searchBox}>
            <MaterialIcons name="search" size={20} color={COLORS.textSecondary} />
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Buscar por nombre, compuesto o codigo de barras..."
              placeholderTextColor={COLORS.textSecondary}
              style={styles.searchInput}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <TouchableOpacity
              style={[styles.filterChip, !filterCategory && styles.filterChipActive]}
              onPress={() => setFilterCategory('')}
            >
              <Text style={[styles.filterChipText, !filterCategory && styles.filterChipTextActive]}>
                Todas las categorias
              </Text>
            </TouchableOpacity>
            {medicineCategories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[styles.filterChip, filterCategory === category && styles.filterChipActive]}
                onPress={() => setFilterCategory(category)}
              >
                <Text style={[styles.filterChipText, filterCategory === category && styles.filterChipTextActive]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.statusFilters}>
            {[
              { value: '', label: 'Todos los estados' },
              { value: 'ACTIVO', label: 'Activo' },
              { value: 'INACTIVO', label: 'Inactivo' }
            ].map((option) => (
              <TouchableOpacity
                key={option.label}
                style={[styles.statusChip, filterStatus === option.value && styles.statusChipActive]}
                onPress={() => setFilterStatus(option.value)}
              >
                <Text style={[styles.statusChipText, filterStatus === option.value && styles.statusChipTextActive]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.exportRow}>
            <Button title="PDF" variant="secondary" onPress={() => showExportUnavailable('PDF')} style={styles.exportButton} />
            <Button title="Excel" variant="secondary" onPress={() => showExportUnavailable('Excel')} style={styles.exportButton} />
          </View>

          <Text style={styles.resultCount}>
            Mostrando <Text style={styles.resultCountStrong}>{filteredData.length}</Text> de{' '}
            <Text style={styles.resultCountStrong}>{catalog.length}</Text> medicamentos
          </Text>
        </Card>

        {filteredData.length > 0 ? (
          <View style={styles.listContainer}>
            {filteredData.map((item) => (
              <Card key={item._id || item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleSection}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemCompound}>
                      {item.compound} - {item.concentration}
                    </Text>
                  </View>
                  <MedicineBadge status={item.status} />
                </View>

                <View style={styles.cardDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Presentacion</Text>
                    <Text style={styles.detailValue}>{item.presentation}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Unidad</Text>
                    <Text style={styles.detailValue}>{item.unitOfMeasure}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Categoria</Text>
                    <Badge variant="primary">{item.category}</Badge>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Cod. Barras</Text>
                    <Text style={styles.detailValueSmall}>{item.barcode || '-'}</Text>
                  </View>
                </View>

                {canManageCatalog && (
                  <View style={styles.actionsRow}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => openEditModal(item)}>
                      <MaterialIcons name="edit" size={20} color={COLORS.primaryDark} />
                      <Text style={styles.actionText}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, item.status === 'ACTIVO' && styles.dangerActionButton]}
                      onPress={() => confirmToggleStatus(item)}
                    >
                      <MaterialIcons
                        name="power-settings-new"
                        size={20}
                        color={item.status === 'ACTIVO' ? COLORS.error : COLORS.primaryDark}
                      />
                      <Text style={[styles.actionText, item.status === 'ACTIVO' && styles.dangerActionText]}>
                        {item.status === 'ACTIVO' ? 'Desactivar' : 'Activar'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </Card>
            ))}
          </View>
        ) : (
          <View style={styles.emptyWrapper}>
            <EmptyState title="No se encontraron medicamentos" message="Ajusta la busqueda o los filtros para ver resultados." />
          </View>
        )}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView contentContainerStyle={styles.modalScroll}>
                <Text style={styles.modalTitle}>{isEditMode ? 'Editar Medicamento' : 'Nuevo Medicamento'}</Text>
                {formError && <Text style={styles.formError}>{formError}</Text>}

                <TextInput
                  placeholder="Nombre comercial"
                  value={form.name}
                  onChangeText={(value) => handleChange('name', value)}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Compuesto activo"
                  value={form.compound}
                  onChangeText={(value) => handleChange('compound', value)}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Concentracion"
                  value={form.concentration}
                  onChangeText={(value) => handleChange('concentration', value)}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Codigo de barras"
                  value={form.barcode}
                  onChangeText={(value) => handleChange('barcode', value)}
                  style={styles.input}
                />

                <OptionGroup
                  label="Presentacion"
                  value={form.presentation}
                  options={medicinePresentations}
                  onChange={(value) => handleChange('presentation', value)}
                />
                <OptionGroup
                  label="Unidad de medida"
                  value={form.unitOfMeasure}
                  options={medicineUnits}
                  onChange={(value) => handleChange('unitOfMeasure', value)}
                />
                <OptionGroup
                  label="Categoria"
                  value={form.category}
                  options={medicineCategories}
                  onChange={(value) => handleChange('category', value)}
                />

                {isEditMode && (
                  <OptionGroup
                    label="Estado"
                    value={form.status}
                    options={['ACTIVO', 'INACTIVO']}
                    onChange={(value) => handleChange('status', value)}
                  />
                )}

                <View style={styles.modalActions}>
                  <Button
                    title="Cancelar"
                    variant="secondary"
                    onPress={() => setModalVisible(false)}
                    style={styles.modalButton}
                  />
                  <Button
                    title={submitting ? 'Guardando...' : isEditMode ? 'Guardar cambios' : 'Registrar medicamento'}
                    onPress={handleSave}
                    disabled={submitting}
                    loading={submitting}
                    style={styles.modalButton}
                  />
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  contentContainer: {
    flex: 1
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm
  },
  headerIconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: COLORS.surface
  },
  newButton: {
    minWidth: 96
  },
  errorBanner: {
    margin: SPACING.lg,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md
  },
  errorText: {
    flex: 1,
    color: '#b91c1c',
    fontSize: FONT_SIZE.sm
  },
  retryText: {
    color: COLORS.primaryDark,
    fontWeight: '700',
    fontSize: FONT_SIZE.sm
  },
  filtersCard: {
    margin: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  searchInput: {
    flex: 1,
    minHeight: 44,
    color: COLORS.text,
    fontSize: FONT_SIZE.sm
  },
  filterScroll: {
    marginTop: SPACING.md
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  filterChipText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text,
    fontWeight: '700'
  },
  filterChipTextActive: {
    color: COLORS.surface
  },
  statusFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.md
  },
  statusChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface
  },
  statusChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#fed7aa'
  },
  statusChipText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    fontWeight: '700'
  },
  statusChipTextActive: {
    color: COLORS.primaryDark
  },
  exportRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md
  },
  exportButton: {
    flex: 1
  },
  resultCount: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.md
  },
  resultCountStrong: {
    color: COLORS.text,
    fontWeight: '700'
  },
  listContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    gap: SPACING.md
  },
  card: {
    padding: SPACING.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: SPACING.md,
    marginBottom: SPACING.md
  },
  cardTitleSection: {
    flex: 1
  },
  itemName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs
  },
  itemCompound: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary
  },
  cardDetails: {
    gap: SPACING.sm
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.md
  },
  detailLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: '600'
  },
  detailValue: {
    flexShrink: 1,
    textAlign: 'right',
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    fontWeight: '600'
  },
  detailValueSmall: {
    flexShrink: 1,
    textAlign: 'right',
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: '600'
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.md,
    marginTop: SPACING.md
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.xs
  },
  dangerActionButton: {
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2'
  },
  actionText: {
    color: COLORS.primaryDark,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600'
  },
  dangerActionText: {
    color: COLORS.error
  },
  emptyWrapper: {
    padding: SPACING.lg
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
    maxHeight: '90%'
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
  formError: {
    color: '#b91c1c',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
    padding: SPACING.sm,
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
  selectorRow: {
    marginBottom: SPACING.md
  },
  selectorLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.xs,
    fontWeight: '600'
  },
  selectorGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm
  },
  selectorButton: {
    flexBasis: '48%',
    minHeight: 42,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface
  },
  selectorButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary
  },
  selectorButtonText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    textAlign: 'center'
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
