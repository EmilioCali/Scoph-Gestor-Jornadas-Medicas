// c:\IN6AM\gitIN6AM\Scoph-Gestor-Jornadas-Medicas\scoph-mobile\src\features\auth\screens\LoginScreen.jsx
import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useAuth } from "../hooks/useAuth.js";
import Input from "../../../shared/components/common/Input.jsx";
import Button from "../../../shared/components/common/Button.jsx";
import { COLORS } from "../../../shared/constants/theme.js";

const logo = require("../../../../assets/kinal_sports.png");

export default function LoginScreen({ navigation }) {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      emailOrUsername: "",
      password: "",
    },
  });

  const { handleLogin, loading, error } = useAuth();

  const onSubmit = async (values) => {
    try {
      await handleLogin(values);
    } catch (err) {
      Alert.alert("Error", error || "No se pudo iniciar sesión.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Bienvenido a SCOPH</Text>
        <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

        <Controller
          name="emailOrUsername"
          control={control}
          rules={{ required: "Ingresa correo o usuario." }}
          render={({ field: { onChange, value }, fieldState: { error: fieldError } }) => (
            <Input
              label="Correo o usuario"
              placeholder="Correo o usuario"
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

        {error ? <Text style={styles.formError}>{error}</Text> : null}

        <Button label="Iniciar sesión" onPress={handleSubmit(onSubmit)} loading={loading} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>¿No tienes cuenta?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}> 
            <Text style={styles.footerLink}>Regístrate</Text>
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
  logo: {
    width: 160,
    height: 120,
    alignSelf: "center",
    marginBottom: 24,
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
    marginBottom: 32,
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
