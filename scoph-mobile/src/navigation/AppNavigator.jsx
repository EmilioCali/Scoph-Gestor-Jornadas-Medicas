// c:\IN6AM\gitIN6AM\Scoph-Gestor-Jornadas-Medicas\scoph-mobile\src\navigation\AppNavigator.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AuthStack } from './AuthStack.jsx';
import { MainTabs } from './MainTabs.jsx';
import { useAuthStore } from '../shared/store/authStore.js';
import { COLORS, FONT_SIZE, SPACING } from '../shared/constants/theme.js';

export function AppNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);

  if (!hasHydrated) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando aplicación...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.lg
  },
  loadingText: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.textSecondary
  },
  authenticatedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.lg
  },
  authenticatedText: {
    fontSize: FONT_SIZE.xl,
    color: COLORS.primary,
    fontWeight: '700'
  }
});
