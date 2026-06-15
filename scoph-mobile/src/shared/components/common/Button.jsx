// c:\IN6AM\gitIN6AM\Scoph-Gestor-Jornadas-Medicas\scoph-mobile\src\shared\components\common\Button.jsx
import React from 'react';
import { Pressable, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZE, SPACING, SHADOWS } from '../../constants/theme.js';

const variants = {
  primary: {
    backgroundColor: COLORS.primary,
    textColor: COLORS.surface
  },
  secondary: {
    backgroundColor: COLORS.secondary,
    textColor: COLORS.text
  },
  ghost: {
    backgroundColor: 'transparent',
    textColor: COLORS.primary
  }
};

export function Button({ title, onPress, variant = 'primary', disabled = false, loading = false, style }) {
  const color = variants[variant] || variants.primary;
  const shouldDisable = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={shouldDisable}
      style={[styles.button, { backgroundColor: color.backgroundColor }, shouldDisable && styles.disabled, style]}
    >
      {loading ? (
        <ActivityIndicator color={color.textColor} />
      ) : (
        <Text style={[styles.text, { color: color.textColor }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm
  },
  text: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700'
  },
  disabled: {
    opacity: 0.6
  }
});
