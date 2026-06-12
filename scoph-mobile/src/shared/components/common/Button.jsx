// c:\IN6AM\gitIN6AM\Scoph-Gestor-Jornadas-Medicas\scoph-mobile\src\shared\components\common\Button.jsx
import React from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native";
import { COLORS, SPACING, FONT_SIZES } from "../../constants/theme.js";

export default function Button({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  style,
}) {
  const isDisabled = loading || disabled;
  const backgroundColor =
    variant === "primary" ? COLORS.primary : variant === "secondary" ? COLORS.secondary : COLORS.primary;
  const opacity = isDisabled ? 0.6 : 1;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor, opacity },
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.surface} size="small" />
      ) : (
        <Text style={styles.text}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: SPACING.sm,
  },
  text: {
    color: COLORS.surface,
    fontSize: FONT_SIZES.base,
    fontWeight: "600",
  },
});
