// c:\IN6AM\gitIN6AM\Scoph-Gestor-Jornadas-Medicas\scoph-mobile\src\shared\components\common\Input.jsx
import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZE, SPACING } from '../../constants/theme.js';

export function Input({ label, placeholder, value, onChangeText, secureTextEntry = false, error, keyboardType = 'default', disabled = false }) {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={COLORS.textSecondary}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        editable={!disabled}
        style={[styles.input, disabled && styles.disabledInput]}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: SPACING.md
  },
  label: {
    marginBottom: SPACING.xs,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
    fontSize: FONT_SIZE.md
  },
  disabledInput: {
    backgroundColor: COLORS.background,
    color: COLORS.textSecondary
  },
  error: {
    marginTop: SPACING.xs,
    color: COLORS.error,
    fontSize: FONT_SIZE.xs
  }
});
