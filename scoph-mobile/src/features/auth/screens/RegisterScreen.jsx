// c:\IN6AM\gitIN6AM\Scoph-Gestor-Jornadas-Medicas\scoph-mobile\src\features\auth\screens\RegisterScreen.jsx
import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth.js';
import { Input } from '../../../shared/components/common/Input.jsx';
import { Button } from '../../../shared/components/common/Button.jsx';
import { COLORS, SPACING, FONT_SIZE } from '../../../shared/constants/theme.js';

export function RegisterScreen({ navigation }) {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      name: '',
      surname: '',
      username: '',
      email: '',
      password: '',
      phone: ''
    }
  });
  const { handleRegister, loading, error } = useAuth();

  const onSubmit = async (values) => {
    try {
      await handleRegister(values);
      Alert.alert('Registro exitoso', 'Tu cuenta se ha creado correctamente.', [
        { text: 'Continuar', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (err) {
      Alert.alert('Error', error || 'No se pudo crear la cuenta.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear cuenta</Text>
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value } }) => (
          <Input label="Nombre" placeholder="Tu nombre" value={value} onChangeText={onChange} />
        )}
      />
      <Controller
        control={control}
        name="surname"
        render={({ field: { onChange, value } }) => (
          <Input label="Apellido" placeholder="Tu apellido" value={value} onChangeText={onChange} />
        )}
      />
      <Controller
        control={control}
        name="username"
        render={({ field: { onChange, value } }) => (
          <Input label="Usuario" placeholder="Nombre de usuario" value={value} onChangeText={onChange} />
        )}
      />
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <Input label="Correo" placeholder="Correo electrónico" value={value} onChangeText={onChange} keyboardType="email-address" />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <Input label="Contraseña" placeholder="Crea una contraseña" value={value} onChangeText={onChange} secureTextEntry />
        )}
      />
      <Controller
        control={control}
        name="phone"
        render={({ field: { onChange, value } }) => (
          <Input label="Teléfono" placeholder="Número de teléfono" value={value} onChangeText={onChange} keyboardType="phone-pad" />
        )}
      />
      <Button title="Registrarse" onPress={handleSubmit(onSubmit)} loading={loading} />
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
  title: {
    fontSize: FONT_SIZE.xxl,
    color: COLORS.text,
    marginBottom: SPACING.lg,
    textAlign: 'center',
    fontWeight: '700'
  }
});
