// c:\IN6AM\gitIN6AM\Scoph-Gestor-Jornadas-Medicas\scoph-mobile\src\features\dashboard\screens\DashboardScreen.jsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList } from 'react-native';
import { useDashboard } from '../hooks/useDashboard.js';
import { Card, LoadingSpinner, EmptyState } from '../../../shared/components/common/Common.jsx';
import { ScreenHeader } from '../../../shared/components/common/ScreenHeader.jsx';
import { Badge } from '../../../shared/components/common/Badge.jsx';
import { useAuthStore } from '../../../shared/store/authStore.js';
import { COLORS, FONT_SIZE, SPACING, SHADOWS } from '../../../shared/constants/theme.js';

function getStatusBadge(status) {
  const map = {
    IN_PROGRESS: <Badge variant="success">En Curso</Badge>,
    PLANNED: <Badge variant="info">Planificada</Badge>,
    FINISHED: <Badge variant="gray">Finalizada</Badge>,
    COMPLETED: <Badge variant="gray">Finalizada</Badge>,
    CANCELLED: <Badge variant="danger">Cancelada</Badge>,
  };
  return map[status] || <Badge>{status}</Badge>;
}

function getExpirationBadge(days) {
  if (days <= 15) return <Badge variant="danger">{days} días</Badge>;
  if (days <= 30) return <Badge variant="warning">{days} días</Badge>;
  return <Badge variant="info">{days} días</Badge>;
}

export function DashboardScreen({ navigation }) {
  const { user } = useAuthStore();
  const isAdmin = user?.rol === "ADMIN" || user?.rol === "SUPER_ADMIN";
  const {
    metrics,
    stockAlerts,
    expirationAlerts,
    recentWorkdays,
    workdayStats,
    updatedAt,
    loading,
    error,
    refetch,
  } = useDashboard(isAdmin);

  const fechaActualizacion = updatedAt
    ? new Date(updatedAt).toLocaleString('es-GT')
    : '-';

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error && isAdmin) {
    return <EmptyState title="Dashboard" message={error} />;
  }

  if (!isAdmin) {
    return (
      <>
        <ScreenHeader
          title="Inicio"
          subtitle="Dashboard de aplicación"
          navigation={navigation}
          showMenu={true}
        />
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Card style={styles.welcomeCard}>
              <Text style={styles.welcomeTitle}>Bienvenido al Sistema</Text>
              <Text style={styles.welcomeText}>
                Estás utilizando el módulo de gestión de jornadas médicas. Accede al inventario, reportes y gestión de usuarios desde el menú principal.
              </Text>
            </Card>
          </View>

          <View style={styles.spacer} />
        </ScrollView>
      </>
    );
  }

  return (
    <>
      <ScreenHeader
        title="Inicio"
        subtitle={`Última actualización: ${fechaActualizacion}`}
        navigation={navigation}
        showMenu={true}
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Tarjetas de métricas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Métricas Principales</Text>
        <View style={styles.metricsGrid}>
          <Card style={[styles.metricCard, styles.primaryCard]}>
            <Text style={styles.metricLabel}>Total Medicamentos</Text>
            <Text style={styles.metricValue}>{metrics.totalMedicamentos}</Text>
            <Text style={styles.metricSubtitle}>En inventario central</Text>
          </Card>
          <Card style={[styles.metricCard, styles.successCard]}>
            <Text style={styles.metricLabel}>Jornadas Activas</Text>
            <Text style={styles.metricValue}>{metrics.jornadasActivas}</Text>
            <Text style={styles.metricSubtitle}>En curso actualmente</Text>
          </Card>
          <Card style={[styles.metricCard, styles.warningCard]}>
            <Text style={styles.metricLabel}>Alertas Stock</Text>
            <Text style={styles.metricValue}>{metrics.stockBajo}</Text>
            <Text style={styles.metricSubtitle}>Medicamentos con stock bajo</Text>
          </Card>
          <Card style={[styles.metricCard, styles.dangerCard]}>
            <Text style={styles.metricLabel}>Alertas Vencimiento</Text>
            <Text style={styles.metricValue}>{metrics.alertasVencimiento}</Text>
            <Text style={styles.metricSubtitle}>Próximos 60 días</Text>
          </Card>
        </View>
      </View>

      {/* Estadísticas de jornadas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estadísticas de Jornadas</Text>
        <Card style={styles.statsContainer}>
          <Text style={styles.statsSubtitle}>Total: {workdayStats.total}</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Activas</Text>
              <Text style={styles.statValue}>{workdayStats.activas}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Planificadas</Text>
              <Text style={styles.statValue}>{workdayStats.planificadas}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Finalizadas</Text>
              <Text style={styles.statValue}>{workdayStats.finalizadas}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Movimientos</Text>
              <Text style={styles.statValue}>{metrics.movimientosMes}</Text>
            </View>
          </View>
        </Card>
      </View>

      {/* Alertas de stock bajo */}
      {stockAlerts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alertas de Stock Bajo</Text>
          <FlatList
            data={stockAlerts.slice(0, 5)}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <Card style={styles.alertCard}>
                <View style={styles.alertHeader}>
                  <Text style={styles.alertTitle} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Badge variant="warning">Bajo</Badge>
                </View>
                <View style={styles.alertDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Stock: </Text>
                    <Text style={styles.detailValue}>{item.currentStock}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Mínimo: </Text>
                    <Text style={styles.detailValue}>{item.minimumStock}</Text>
                  </View>
                </View>
              </Card>
            )}
          />
        </View>
      )}

      {/* Alertas de vencimiento */}
      {expirationAlerts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alertas de Vencimiento</Text>
          <FlatList
            data={expirationAlerts.slice(0, 5)}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <Card style={styles.alertCard}>
                <View style={styles.alertHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.alertTitle} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.alertSubtitle}>Lote: {item.batch}</Text>
                  </View>
                  {getExpirationBadge(item.daysRemaining)}
                </View>
                <View style={styles.alertDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Vencimiento: </Text>
                    <Text style={styles.detailValue}>
                      {new Date(item.expirationDate).toLocaleDateString('es-GT')}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Stock: </Text>
                    <Text style={styles.detailValue}>{item.currentStock}</Text>
                  </View>
                </View>
              </Card>
            )}
          />
        </View>
      )}

      {/* Jornadas recientes */}
      {recentWorkdays.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Jornadas Recientes</Text>
          <FlatList
            data={recentWorkdays.slice(0, 5)}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <Card style={styles.workdayCard}>
                <View style={styles.workdayHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.workdayTitle} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.workdaySubtitle} numberOfLines={1}>
                      {item.location}
                    </Text>
                  </View>
                  {getStatusBadge(item.status)}
                </View>
                <View style={styles.workdayDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Fecha: </Text>
                    <Text style={styles.detailValue}>
                      {new Date(item.startDate).toLocaleDateString('es-GT')}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Responsable: </Text>
                    <Text style={styles.detailValue} numberOfLines={1}>
                      {item.manager}
                    </Text>
                  </View>
                </View>
              </Card>
            )}
          />
        </View>
      )}

      <View style={styles.spacer} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZE.title,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  refreshBtn: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  metricsGrid: {
    gap: SPACING.md,
  },
  metricCard: {
    padding: SPACING.md,
    borderRadius: 12,
    ...SHADOWS.sm,
  },
  primaryCard: {
    backgroundColor: '#fed7aa',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  successCard: {
    backgroundColor: '#dcfce7',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  warningCard: {
    backgroundColor: '#fef3c7',
    borderLeftWidth: 4,
    borderLeftColor: '#eab308',
  },
  dangerCard: {
    backgroundColor: '#fee2e2',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  metricLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  metricSubtitle: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  statsContainer: {
    padding: SPACING.md,
    borderRadius: 12,
    ...SHADOWS.sm,
  },
  statsSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  statItem: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  alertCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    ...SHADOWS.sm,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  alertTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  alertSubtitle: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  alertDetails: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
  },
  workdayCard: {
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    ...SHADOWS.sm,
  },
  workdayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  workdayTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  workdaySubtitle: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  workdayDetails: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  detailLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    fontWeight: '600',
    maxWidth: '60%',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xl,
  },
  spacer: {
    height: SPACING.xl,
  },
  welcomeCard: {
    padding: SPACING.lg,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    ...SHADOWS.md,
  },
  welcomeTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  welcomeText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
});
