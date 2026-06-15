// c:\IN6AM\gitIN6AM\Scoph-Gestor-Jornadas-Medicas\scoph-mobile\src\features\profile\screens\ProfileScreen.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Alert, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useRoute } from '@react-navigation/native';
import { useProfile } from '../hooks/useProfile.js';
import { LoadingSpinner, EmptyState, Card } from '../../../shared/components/common/Common.jsx';
import { Input } from '../../../shared/components/common/Input.jsx';
import { Button } from '../../../shared/components/common/Button.jsx';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme.js';
import { avatarDefault } from '../../../shared/assets/avatarDefault.js';

export function ProfileScreen() {
  const route = useRoute();
  const { loading, error, profile, saveProfile, logout } = useProfile();
  const [editing, setEditing] = useState(route.params?.edit ?? false);
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      nombre: '',
      apellido: '',
      username: '',
      correo: '',
      telefono: '',
      roles: ''
    }
  });

  useEffect(() => {
    if (profile) {
      reset({
        nombre: profile?.nombre ?? profile?.name ?? '',
        apellido: profile?.apellido ?? profile?.surname ?? '',
        username: profile?.username ?? profile?.usuario ?? '',
        correo: profile?.correo ?? profile?.email ?? '',
        telefono: profile?.telefono ?? profile?.phone ?? '',
        roles: profile?.roles ?? profile?.roles ?? ''
      });
    }
  }, [profile, reset]);

  const imageSource = profile?.avatar && typeof profile.avatar === 'string' && profile.avatar.startsWith('http')
    ? { uri: profile.avatar }
    : avatarDefault;

  const onSave = async (values) => {
    try {
      await saveProfile(values);
      setEditing(false);
      Alert.alert('Perfil actualizado', 'Tu información se guardó correctamente.');
    } catch (_) {
      Alert.alert('Error', 'No se pudo guardar el perfil.');
    }
  };

  const confirmLogout = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro que deseas cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: logout }
    ]);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <EmptyState title="Perfil" message={error} />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Perfil</Text>
      <Card style={styles.profileCard}>
        <Image source={imageSource} style={styles.avatar} />
        <View style={styles.row}>
          <Text style={styles.displayName}>{`${profile?.nombre ?? profile?.name ?? ''} ${profile?.apellido ?? profile?.surname ?? ''}`.trim()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.metaLabel}>Usuario:</Text>
          <Text style={styles.metaValue}>{profile?.username ?? profile?.usuario ?? 'N/A'}</Text>
        </View>
      </Card>

      <Card>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Información</Text>
          <Button title={editing ? 'Cancelar' : 'Editar'} variant="ghost" onPress={() => setEditing((prev) => !prev)} />
        </View>

        <Controller
          control={control}
          name="nombre"
          render={({ field: { onChange, value } }) => (
            <Input label="Nombre" placeholder="Nombre" value={value} onChangeText={onChange} disabled={!editing} />
          )}
        />
        <Controller
          control={control}
          name="apellido"
          render={({ field: { onChange, value } }) => (
            <Input label="Apellido" placeholder="Apellido" value={value} onChangeText={onChange} disabled={!editing} />
          )}
        />
        <Controller
          control={control}
          name="username"
          render={({ field: { onChange, value } }) => (
            <Input label="Usuario" placeholder="Usuario" value={value} onChangeText={onChange} disabled={!editing} />
          )}
        />
        <Controller
          control={control}
          name="correo"
          render={({ field: { onChange, value } }) => (
            <Input label="Correo" placeholder="Correo" value={value} onChangeText={onChange} keyboardType="email-address" disabled={!editing} />
          )}
        />
        <Controller
          control={control}
          name="telefono"
          render={({ field: { onChange, value } }) => (
            <Input label="Teléfono" placeholder="Teléfono" value={value} onChangeText={onChange} keyboardType="phone-pad" disabled={!editing} />
          )}
        />
        <Controller
          control={control}
          name="roles"
          render={({ field: { onChange, value } }) => (
            <Input label="Roles" placeholder="Roles separados por comas" value={value} onChangeText={onChange} disabled={!editing} />
          )}
        />

        {editing && <Button title="Guardar cambios" onPress={handleSubmit(onSave)} loading={loading} style={styles.saveButton} />}
      </Card>

      <Button title="Cerrar sesión" variant="secondary" onPress={confirmLogout} style={styles.logoutButton} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  contentContainer: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    marginBottom: SPACING.lg
  },
  profileCard: {
    alignItems: 'center',
    marginBottom: SPACING.lg
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 60,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface
  },
  row: {
    width: '100%',
    alignItems: 'center'
  },
  displayName: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700'
  },
  metaLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.xs
  },
  metaValue: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: '600'
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700'
  },
  saveButton: {
    marginTop: SPACING.md
  },
  logoutButton: {
    marginTop: SPACING.lg
  }
});
