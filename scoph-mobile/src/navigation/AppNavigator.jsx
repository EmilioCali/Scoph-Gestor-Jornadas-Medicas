// c:\IN6AM\gitIN6AM\Scoph-Gestor-Jornadas-Medicas\scoph-mobile\src\navigation\AppNavigator.jsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { useAuthStore } from "../shared/store/authStore.js";
import AuthStack from "./AuthStack.jsx";
import MainTabs from "./MainTabs.jsx";
import { Common } from "../shared/components/common/Common.jsx";
import { COLORS } from "../shared/constants/theme.js";

export default function AppNavigator() {
  const { isAuthenticated, _hasHydrated } = useAuthStore();

  if (!_hasHydrated) {
    return (
      <View style={styles.center}>
        <Common.LoadingSpinner />
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
});
