// c:\IN6AM\gitIN6AM\Scoph-Gestor-Jornadas-Medicas\scoph-mobile\src\features\users\screens\UsersScreen.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  RefreshControl
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useUsers } from '../hooks/useUsers.js';
import { Card, LoadingSpinner, EmptyState } from '../../../shared/components/common/Common.jsx';
import { ScreenHeader } from '../../../shared/components/common/ScreenHeader.jsx';
import { Button } from '../../../shared/components/common/Button.jsx';
import { Badge } from '../../../shared/components/common/Badge.jsx';
import { COLORS, FONT_SIZE, SPACING, SHADOWS } from '../../../shared/constants/theme.js';
import {
  createUser,
  updateUser,
  deleteUser
} from '../../../shared/api/usersService.js';

const initialForm = {
  nombre: '',
  apellido: '',
  username: '',
  correo: '',
  telefono: '',
  rol: 'MEDICO',
  isActive: true
};

function getRolBadge(rol) {
  return rol === 'ADMIN' || rol === 'SUPER_ADMIN' ? (
    <Badge variant="primary">Administrador</Badge>
  ) : (
    <Badge variant="info">Médico</Badge>
  );
}

function getStatusBadge(isActive) {
  return isActive ? (
    <Badge variant="success">Activo</Badge>
  ) : (
    <Badge variant="danger">Inactivo</Badge>
  );
}

export function UsersScreen() {
  const { loading, error, users, refreshUsers } = useUsers();
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [actionLoading, setActionLoading] = useState(false);

  const openCreateModal = () => {
    setSelectedUser(null);
    setForm(initialForm);
    setIsEditMode(false);
    setModalVisible(true);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setForm({
      nombre: user.nombre ?? '',
      apellido: user.apellido ?? '',
      username: user.username ?? '',
      correo: user.correo ?? '',
      telefono: user.telefono ?? '',
      rol: user.rol ?? 'MEDICO',
      isActive: user.isActive ?? true
    });
    setIsEditMode(true);
    setModalVisible(true);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!form.nombre || !form.apellido || !form.username || !form.correo) {
      Alert.alert('Error', 'Nombre, apellido, usuario y correo son obligatorios.');
      return false;
    }
    if (form.telefono && !/^\d{8}$/.test(form.telefono)) {
      Alert.alert('Error', 'El teléfono debe tener exactamente 8 dígitos.');
      return false;
    }
    return true;
  };

  const handleSaveUser = async () => {
    if (!validateForm()) return;
    setActionLoading(true);

    try {
      if (isEditMode && selectedUser) {
        await updateUser(selectedUser._id, form);
        Alert.alert('Listo', 'Usuario actualizado correctamente.');
      } else {
        await createUser(form);
        Alert.alert('Listo', 'Usuario creado correctamente.');
      }
      setModalVisible(false);
      refreshUsers();
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Error en la solicitud.';
      Alert.alert('Error', message);
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDelete = (user) => {
    setSelectedUser(user);
    Alert.alert(
      'Eliminar usuario',
      `¿Estás seguro que deseas eliminar a ${user.nombre} ${user.apellido}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: handleDeleteUser }
      ]
    );
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setActionLoading(true);

    try {
      await deleteUser(selectedUser._id);
      Alert.alert('Listo', 'Usuario eliminado correctamente.');
      refreshUsers();
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Error al eliminar usuario.';
      Alert.alert('Error', message);
    } finally {
      setActionLoading(false);
    }
  };

  const renderUserItem = ({ item }) => (
    <Card style={styles.userCard}>
      <View style={styles.userHeader}>
        <View>
          <Text style={styles.userName} numberOfLines={1}>
            {item.nombre} {item.apellido}
          </Text>
          <Text style={styles.userEmail} numberOfLines={1}>
            {item.correo}
          </Text>
        </View>
        <View style={styles.badgeRow}>
          {getRolBadge(item.rol)}
          {getStatusBadge(item.isActive)}
        </View>
      </View>

      <View style={styles.userDetails}>
        <Text style={styles.detailLabel}>Username</Text>
        <Text style={styles.detailValue}>{item.username}</Text>
        <Text style={styles.detailLabel}>Teléfono</Text>
        <Text style={styles.detailValue}>{item.telefono || 'No registrado'}</Text>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.iconButton} onPress={() => openEditModal(item)}>
          <MaterialIcons name="edit" size={20} color={COLORS.primaryDark} />
          <Text style={styles.actionText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => confirmDelete(item)}>
          <MaterialIcons name="delete" size={20} color={COLORS.error} />
          <Text style={[styles.actionText, { color: COLORS.error }]}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <>
        <ScreenHeader title="Usuarios" subtitle="Gestión de usuarios del sistema" />
        <LoadingSpinner />
      </>
    );
  }

  if (error) {
    return (
      <>
        <ScreenHeader title="Usuarios" subtitle="Gestión de usuarios del sistema" />
        <EmptyState title="Usuarios" message={error} />
      </>
    );
  }

  return (
    <>
      <ScreenHeader
        title="Usuarios"
        subtitle="Gestión de usuarios del sistema"
        action={<Button title="Nuevo" onPress={openCreateModal} style={styles.createButton} />}
      />
      <View style={styles.container}>
        <FlatList
          data={users}
          keyExtractor={(item) => item._id || item.id || `${item.username}-${Math.random()}`}
          contentContainerStyle={styles.list}
          renderItem={renderUserItem}
          ListEmptyComponent={
            <EmptyState title="Usuarios" message="No hay usuarios registrados." />
          }
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={refreshUsers} tintColor={COLORS.primary} />
          }
        />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView contentContainerStyle={styles.modalScroll}>
                <Text style={styles.modalTitle}>
                  {isEditMode ? 'Editar Usuario' : 'Nuevo Usuario'}
                </Text>

                <TextInput
                  placeholder="Nombre"
                  value={form.nombre}
                  onChangeText={(value) => handleChange('nombre', value)}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Apellido"
                  value={form.apellido}
                  onChangeText={(value) => handleChange('apellido', value)}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Username"
                  value={form.username}
                  onChangeText={(value) => handleChange('username', value)}
                  style={styles.input}
                  autoCapitalize="none"
                />
                <TextInput
                  placeholder="Correo electrónico"
                  value={form.correo}
                  onChangeText={(value) => handleChange('correo', value)}
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TextInput
                  placeholder="Teléfono"
                  value={form.telefono}
                  onChangeText={(value) => handleChange('telefono', value.replace(/[^0-9]/g, ''))}
                  style={styles.input}
                  keyboardType="numeric"
                  maxLength={8}
                />

                <View style={styles.selectorRow}>
                  <Text style={styles.selectorLabel}>Rol</Text>
                  <View style={styles.selectorGroup}>
                    {['MEDICO', 'ADMIN', 'SUPER_ADMIN'].map((role) => (
                      <TouchableOpacity
                        key={role}
                        onPress={() => handleChange('rol', role)}
                        style={[
                          styles.selectorButton,
                          form.rol === role && styles.selectorButtonActive
                        ]}
                      >
                        <Text
                          style={[
                            styles.selectorButtonText,
                            form.rol === role && styles.selectorButtonTextActive
                          ]}
                        >
                          {role === 'ADMIN' ? 'Administrador' : role === 'SUPER_ADMIN' ? 'Super Administrador' : 'Médico'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {isEditMode && (
                  <View style={styles.selectorRow}>
                    <Text style={styles.selectorLabel}>Estado</Text>
                    <View style={styles.selectorGroup}>
                      {[
                        { value: true, label: 'Activo' },
                        { value: false, label: 'Inactivo' }
                      ].map((option) => (
                        <TouchableOpacity
                          key={option.label}
                          onPress={() => handleChange('isActive', option.value)}
                          style={[
                            styles.selectorButton,
                            form.isActive === option.value && styles.selectorButtonActive
                          ]}
                        >
                          <Text
                            style={[
                              styles.selectorButtonText,
                              form.isActive === option.value && styles.selectorButtonTextActive
                            ]}
                          >
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                <View style={styles.modalActions}>
                  <Button
                    title="Cancelar"
                    variant="secondary"
                    onPress={() => setModalVisible(false)}
                    style={styles.modalButton}
                  />
                  <Button
                    title={isEditMode ? 'Guardar' : 'Crear'}
                    onPress={handleSaveUser}
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
    minWidth: 100
  },
  list: {
    paddingBottom: SPACING.xl
  },
  userCard: {
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
    marginBottom: SPACING.md
  },
  badgeRow: {
    alignItems: 'flex-end',
    gap: SPACING.xs
  },
  userName: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700'
  },
  userEmail: {
    marginTop: SPACING.xs,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm
  },
  userDetails: {
    marginBottom: SPACING.md
  },
  detailLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.sm
  },
  detailValue: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    marginTop: SPACING.xs
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.md
  },
  iconButton: {
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
  actionText: {
    color: COLORS.primaryDark,
    fontSize: FONT_SIZE.sm,
    marginLeft: SPACING.xs
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
    gap: SPACING.sm
  },
  selectorButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: COLORS.surface
  },
  selectorButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
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
