// c:\IN6AM\gitIN6AM\Scoph-Gestor-Jornadas-Medicas\scoph-mobile\src\features\users\screens\UsersScreen.jsx
import React, { useEffect } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { useUsers } from "../hooks/useUsers.js";
import { Common } from "../../../shared/components/common/Common.jsx";
import { COLORS, SPACING, FONT_SIZES } from "../../../shared/constants/theme.js";

export default function UsersScreen() {
  const { users, loading, error, fetchUsers } = useUsers();

  useEffect(() => {
    fetchUsers();
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

  if (users.length === 0) {
    return <Common.EmptyState message="No hay usuarios registrados" />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id?.toString()}
        renderItem={({ item }) => (
          <Common.Card>
            <Text style={styles.userName}>
              {item.name} {item.surname}
            </Text>
            <Text style={styles.userEmail}>{item.email}</Text>
            <Text style={styles.userPhone}>{item.phone}</Text>
            <View style={styles.statusContainer}>
              <Text
                style={[
                  styles.status,
                  { color: item.isActive ? COLORS.success : COLORS.error },
                ]}
              >
                {item.isActive ? "Activo" : "Inactivo"}
              </Text>
            </View>
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
  userName: {
    color: COLORS.text,
    fontSize: FONT_SIZES.base,
    fontWeight: "700",
  },
  userEmail: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.xs,
  },
  userPhone: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.xs,
  },
  statusContainer: {
    marginTop: SPACING.sm,
  },
  status: {
    fontSize: FONT_SIZES.xs,
    fontWeight: "600",
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.base,
    textAlign: "center",
  },
});
