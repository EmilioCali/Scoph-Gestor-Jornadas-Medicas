// c:\IN6AM\gitIN6AM\Scoph-Gestor-Jornadas-Medicas\scoph-mobile\src\features\auth\screens\LoginScreen.jsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth.js';
import { Input } from '../../../shared/components/common/Input.jsx';
import { Button } from '../../../shared/components/common/Button.jsx';
import { COLORS, SPACING, FONT_SIZE } from '../../../shared/constants/theme.js';
import { logo as logoDefault } from '../../../shared/assets/logoDefault.js';

export function LoginScreen({ navigation }) {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      emailOrUsername: '',
      password: ''
    }
  });
  const { handleLogin, loading, error } = useAuth();

  const onSubmit = async (values) => {
    try {
      await handleLogin(values);
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || err.message || error || 'No se pudo iniciar sesión.');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={logoDefault} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>Iniciar sesión</Text>
      <Controller
        control={control}
        name="emailOrUsername"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Correo o usuario"
            placeholder="Ingresa tu correo o usuario"
            value={value}
            onChangeText={onChange}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <Input
            label="Contraseña"
            placeholder="Ingresa tu contraseña"
            value={value}
            onChangeText={onChange}
            secureTextEntry
          />
        )}
      />
      <Button title="Ingresar" onPress={handleSubmit(onSubmit)} loading={loading} />
      <View style={styles.footer}>
        <Text style={styles.footerText}>¿No tienes cuenta?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>Regístrate</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
    justifyContent: 'center'
  },
  logo: {
    width: 140,
    height: 140,
    alignSelf: 'center',
    marginBottom: SPACING.lg
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
    fontWeight: '700'
  },
  footer: {
    marginTop: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xs
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm
  },
  link: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.sm,
    fontWeight: '700'
  }
});
