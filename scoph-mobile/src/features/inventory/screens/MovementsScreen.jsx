// c:\IN6AM\gitIN6AM\Scoph-Gestor-Jornadas-Medicas\scoph-mobile\src\features\inventory\screens\MovementsScreen.jsx
import React, { useEffect } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { useMovements } from "../hooks/useMovements.js";
import { Common } from "../../../shared/components/common/Common.jsx";
import { COLORS, SPACING, FONT_SIZES } from "../../../shared/constants/theme.js";

export default function MovementsScreen() {
  const { movements, loading, error, fetchMovements } = useMovements();

  useEffect(() => {
    fetchMovements();
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

  if (movements.length === 0) {
    return <Common.EmptyState message="No hay movimientos registrados" />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={movements}
        keyExtractor={(item) => item.id?.toString()}
        renderItem={({ item }) => (
          <Common.Card>
            <Text style={styles.movementType}>{item.type || "Movimiento"}</Text>
            <Text style={styles.movementInfo}>{item.medicineName || "Medicamento desconocido"}</Text>
            <Text style={styles.movementInfo}>Cantidad: {item.quantity || 0}</Text>
            <Text style={styles.movementDate}>
              {item.date?.split("T")[0] || item.createdAt?.split("T")[0] || "N/A"}
            </Text>
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
  movementType: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.base,
    fontWeight: "700",
  },
  movementInfo: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.xs,
  },
  movementDate: {
    color: COLORS.secondary,
    fontSize: FONT_SIZES.xs,
    marginTop: SPACING.xs,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.base,
    textAlign: "center",
  },
});
