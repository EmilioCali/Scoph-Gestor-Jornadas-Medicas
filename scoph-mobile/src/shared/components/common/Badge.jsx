import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZE, SPACING } from '../../constants/theme.js';

const variants = {
  success: { backgroundColor: '#dcfce7', textColor: '#166534' },
  warning: { backgroundColor: '#fef3c7', textColor: '#92400e' },
  danger: { backgroundColor: '#fee2e2', textColor: '#991b1b' },
  info: { backgroundColor: '#dbeafe', textColor: '#1e40af' },
  gray: { backgroundColor: '#f3f4f6', textColor: '#374151' },
  primary: { backgroundColor: '#fed7aa', textColor: '#b45309' },
};

export function Badge({ children, variant = 'gray' }) {
  const style = variants[variant] || variants.gray;

  return (
    <View style={[styles.badge, { backgroundColor: style.backgroundColor }]}>
      <Text style={[styles.text, { color: style.textColor }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
});
