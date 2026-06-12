// c:\IN6AM\gitIN6AM\Scoph-Gestor-Jornadas-Medicas\scoph-mobile\src\features\inventory\screens\InventoryScreen.jsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS, SPACING, FONT_SIZES } from "../../../shared/constants/theme.js";

export default function InventoryScreen({ navigation }) {
  const menuItems = [
    { label: "Catálogo", icon: "category", screen: "Catalog" },
    { label: "Inventario Central", icon: "warehouse", screen: "CentralInventory" },
    { label: "Movimientos", icon: "trending-up", screen: "Movements" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inventario</Text>
      <View style={styles.grid}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.screen}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.screen)}
          >
            <MaterialIcons name={item.icon} size={40} color={COLORS.primary} />
            <Text style={styles.menuLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  title: {
    color: COLORS.primary,
    fontSize: FONT_SIZES["2xl"],
    fontWeight: "700",
    marginBottom: SPACING.lg,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  menuItem: {
    width: "48%",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    marginVertical: SPACING.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  menuLabel: {
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
    marginTop: SPACING.md,
    textAlign: "center",
  },
});
