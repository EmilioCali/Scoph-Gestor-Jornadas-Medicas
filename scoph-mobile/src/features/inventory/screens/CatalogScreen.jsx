// c:\IN6AM\gitIN6AM\Scoph-Gestor-Jornadas-Medicas\scoph-mobile\src\features\inventory\screens\CatalogScreen.jsx
import React, { useEffect } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { useMedicines } from "../hooks/useMedicines.js";
import { Common } from "../../../shared/components/common/Common.jsx";
import { COLORS, SPACING, FONT_SIZES } from "../../../shared/constants/theme.js";

export default function CatalogScreen() {
  const { medicines, loading, error, fetchMedicines } = useMedicines();

  useEffect(() => {
    fetchMedicines();
  }, []);

  if (loading) {
    return <Common.LoadingSpinner />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (medicines.length === 0) {
    return <Common.EmptyState message="No hay medicamentos en el catálogo" />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={medicines}
        keyExtractor={(item) => item.id?.toString()}
        renderItem={({ item }) => (
          <Common.Card>
            <Text style={styles.medicineName}>{item.name || "Sin nombre"}</Text>
            <Text style={styles.medicineInfo}>Principio activo: {item.activeIngredient || "N/A"}</Text>
            <Text style={styles.medicineInfo}>Presentación: {item.presentation || "N/A"}</Text>
            <Text style={styles.medicineInfo}>Dosis: {item.dosage || "N/A"}</Text>
          </Common.Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  medicineName: {
    color: COLORS.text,
    fontSize: FONT_SIZES.base,
    fontWeight: "700",
  },
  medicineInfo: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.xs,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.base,
    textAlign: "center",
  },
});
