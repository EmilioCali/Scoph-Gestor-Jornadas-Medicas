// c:\IN6AM\gitIN6AM\Scoph-Gestor-Jornadas-Medicas\scoph-mobile\src\shared\components\common\Common.jsx
import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { COLORS, SPACING, FONT_SIZES } from "../../constants/theme.js";

export const LoadingSpinner = ({ size = "large" }) => (
  <View style={styles.spinnerContainer}>
    <ActivityIndicator size={size} color={COLORS.primary} />
  </View>
);

export const EmptyState = ({ message = "No hay datos disponibles", icon = "📭" }) => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyIcon}>{icon}</Text>
    <Text style={styles.emptyText}>{message}</Text>
  </View>
);

export const Card = ({ children, style }) => (
  <View style={[styles.card, style]}>
    {children}
  </View>
);

export const Common = {
  LoadingSpinner,
  EmptyState,
  Card,
};

const styles = StyleSheet.create({
  spinnerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.base,
    textAlign: "center",
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});
