// c:\IN6AM\gitIN6AM\Scoph-Gestor-Jornadas-Medicas\scoph-mobile\src\features\dashboard\screens\DashboardScreen.jsx
import React, { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, FlatList } from "react-native";
import { useAuthStore } from "../../../shared/store/authStore.js";
import { useWorkdays } from "../../workdays/hooks/useWorkdays.js";
import { useUsers } from "../../users/hooks/useUsers.js";
import { Common } from "../../../shared/components/common/Common.jsx";
import { COLORS, SPACING, FONT_SIZES } from "../../../shared/constants/theme.js";

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const { workdays, loading: workdaysLoading, fetchWorkdays } = useWorkdays();
  const { users, loading: usersLoading, fetchUsers } = useUsers();

  useEffect(() => {
    fetchWorkdays();
    fetchUsers();
  }, []);

  if (workdaysLoading || usersLoading) {
    return <Common.LoadingSpinner />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Bienvenido</Text>
        <Text style={styles.userName}>{user?.name || "Usuario"}</Text>
      </View>

      <View style={styles.statsContainer}>
        <Common.Card style={styles.statCard}>
          <Text style={styles.statNumber}>{users.length}</Text>
          <Text style={styles.statLabel}>Usuarios</Text>
        </Common.Card>

        <Common.Card style={styles.statCard}>
          <Text style={styles.statNumber}>{workdays.length}</Text>
          <Text style={styles.statLabel}>Jornadas</Text>
        </Common.Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Últimas jornadas</Text>
        {workdays.length === 0 ? (
          <Common.EmptyState message="Sin jornadas registradas" />
        ) : (
          <FlatList
            data={workdays.slice(0, 3)}
            keyExtractor={(item) => item.id?.toString()}
            renderItem={({ item }) => (
              <Common.Card>
                <Text style={styles.itemTitle}>{item.title || item.name || "Sin título"}</Text>
                <Text style={styles.itemDate}>
                  {item.date || item.createdAt?.split("T")[0] || "N/A"}
                </Text>
              </Common.Card>
            )}
            scrollEnabled={false}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  greeting: {
    color: COLORS.secondary,
    fontSize: FONT_SIZES.sm,
    fontWeight: "500",
  },
  userName: {
    color: COLORS.primary,
    fontSize: FONT_SIZES["3xl"],
    fontWeight: "700",
    marginTop: SPACING.xs,
  },
  statsContainer: {
    flexDirection: "row",
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: SPACING.lg,
  },
  statNumber: {
    color: COLORS.primary,
    fontSize: FONT_SIZES["2xl"],
    fontWeight: "700",
  },
  statLabel: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.xs,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZES.lg,
    fontWeight: "700",
    marginBottom: SPACING.md,
  },
  itemTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZES.base,
    fontWeight: "600",
  },
  itemDate: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.xs,
  },
});
