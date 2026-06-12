// c:\IN6AM\gitIN6AM\Scoph-Gestor-Jornadas-Medicas\scoph-mobile\src\features\auth\screens\RegisterScreen.jsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useAuth } from "../hooks/useAuth.js";
import Input from "../../../shared/components/common/Input.jsx";
import Button from "../../../shared/components/common/Button.jsx";
import { COLORS } from "../../../shared/constants/theme.js";

export default function RegisterScreen({ navigation }) {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      name: "",
      surname: "",
      username: "",
      email: "",
      password: "",
      phone: "",
    },
  });

  const { handleRegister, loading, error } = useAuth();

  const onSubmit = async (values) => {
    try {
      await handleRegister(values);
      Alert.alert("Registro exitoso", "Tu cuenta fue creada correctamente.", [
        { text: "Continuar", onPress: () => navigation.navigate("Login") },
      ]);
    } catch (err) {
      Alert.alert("Error", error || "No se pudo registrar.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Regístrate</Text>
        <Text style={styles.subtitle}>Crea tu cuenta para comenzar a usar SCOPH.</Text>

        <Controller
          name="name"
          control={control}
          rules={{ required: "Ingresa tu nombre." }}
          render={({ field: { onChange, value }, fieldState: { error: fieldError } }) => (
            <Input
              label="Nombre"
              placeholder="Nombre"
              value={value}
              onChangeText={onChange}
              error={fieldError?.message}
            />
          )}
        />

        <Controller
          name="surname"
          control={control}
          rules={{ required: "Ingresa tu apellido." }}
          render={({ field: { onChange, value }, fieldState: { error: fieldError } }) => (
            <Input
              label="Apellido"
              placeholder="Apellido"
              value={value}
              onChangeText={onChange}
              error={fieldError?.message}
            />
          )}
        />

        <Controller
          name="username"
          control={control}
          rules={{ required: "Ingresa un nombre de usuario." }}
          render={({ field: { onChange, value }, fieldState: { error: fieldError } }) => (
            <Input
              label="Usuario"
              placeholder="Usuario"
              value={value}
              onChangeText={onChange}
              error={fieldError?.message}
            />
          )}
        />

        <Controller
          name="email"
          control={control}
          rules={{ required: "Ingresa tu correo electrónico." }}
          render={({ field: { onChange, value }, fieldState: { error: fieldError } }) => (
            <Input
              label="Correo electrónico"
              placeholder="Correo electrónico"
              keyboardType="email-address"
              value={value}
              onChangeText={onChange}
              error={fieldError?.message}
            />
          )}
        />

        <Controller
          name="password"
          control={control}
          rules={{ required: "Ingresa tu contraseña." }}
          render={({ field: { onChange, value }, fieldState: { error: fieldError } }) => (
            <Input
              label="Contraseña"
              placeholder="Contraseña"
              secureTextEntry
              value={value}
              onChangeText={onChange}
              error={fieldError?.message}
            />
          )}
        />

        <Controller
          name="phone"
          control={control}
          rules={{ required: "Ingresa tu teléfono." }}
          render={({ field: { onChange, value }, fieldState: { error: fieldError } }) => (
            <Input
              label="Teléfono"
              placeholder="Teléfono"
              keyboardType="phone-pad"
              value={value}
              onChangeText={onChange}
              error={fieldError?.message}
            />
          )}
        />

        {error ? <Text style={styles.formError}>{error}</Text> : null}

        <Button label="Crear cuenta" onPress={handleSubmit(onSubmit)} loading={loading} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>¿Ya tienes cuenta?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}> 
            <Text style={styles.footerLink}>Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    color: COLORS.primary,
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.secondary,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  footer: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  footerText: {
    color: COLORS.text,
  },
  footerLink: {
    color: COLORS.primary,
    fontWeight: "700",
  },
  formError: {
    color: COLORS.error,
    marginBottom: 12,
    textAlign: "center",
  },
});
