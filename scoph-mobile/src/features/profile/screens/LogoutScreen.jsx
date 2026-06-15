// c:\IN6AM\gitIN6AM\Scoph-Gestor-Jornadas-Medicas\scoph-mobile\src\features\profile\screens\LogoutScreen.jsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../auth/hooks/useAuth.js';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme.js';

export function LogoutScreen() {
  const { logout } = useAuth();

  useEffect(() => {
    (async () => {
      await logout();
    })();
  }, [logout]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Cerrando sesión...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.lg
  },
  text: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.textSecondary
  }
});
