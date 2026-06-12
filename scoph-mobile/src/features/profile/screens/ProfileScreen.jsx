// c:\IN6AM\gitIN6AM\Scoph-Gestor-Jornadas-Medicas\scoph-mobile\src\features\reports\screens\ReportsScreen.jsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../../../shared/constants/theme.js";

export default function ReportsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reportes</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  title: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "700",
  },
});
