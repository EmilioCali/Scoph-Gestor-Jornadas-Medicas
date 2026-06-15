// c:\IN6AM\gitIN6AM\Scoph-Gestor-Jornadas-Medicas\scoph-mobile\src\features\reports\screens\ReportsScreen.jsx
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useReports } from '../hooks/useReports.js';
import { Card, LoadingSpinner, EmptyState } from '../../../shared/components/common/Common.jsx';
import { ScreenHeader } from '../../../shared/components/common/ScreenHeader.jsx';
import { Badge } from '../../../shared/components/common/Badge.jsx';
import { Button } from '../../../shared/components/common/Button.jsx';
import { COLORS, FONT_SIZE, SPACING, SHADOWS } from '../../../shared/constants/theme.js';

const tabs = [
  { key: 'movements', label: 'Movimientos' },
  { key: 'inventory', label: 'Inventario' },
  { key: 'workdays', label: 'Jornadas' },
  { key: 'alerts', label: 'Alertas' },
];

const movementTypes = [
  { key: '', label: 'Todos' },
  { key: 'ENTRADA', label: 'Entradas' },
  { key: 'SALIDA', label: 'Salidas' },
  { key: 'TRANSFERENCIA', label: 'Transferencias' },
];

function getTypeBadge(type) {
  const map = {
    ENTRADA: <Badge variant="success">Entrada</Badge>,
    SALIDA: <Badge variant="danger">Salida</Badge>,
    TRANSFERENCIA: <Badge variant="info">Transferencia</Badge>,
  };
  return map[type] || <Badge>{type || 'N/E'}</Badge>;
}

function getStatusBadge(status) {
  const map = {
    IN_PROGRESS: <Badge variant="success">En Curso</Badge>,
    PLANNED: <Badge variant="info">Planificada</Badge>,
    FINISHED: <Badge variant="gray">Finalizada</Badge>,
    COMPLETED: <Badge variant="gray">Finalizada</Badge>,
    CANCELLED: <Badge variant="danger">Cancelada</Badge>,
  };
  return map[status] || <Badge>{status || 'N/E'}</Badge>;
}

function getExpirationBadge(days) {
  if (days <= 15) return <Badge variant="danger">{days} días</Badge>;
  if (days <= 30) return <Badge variant="warning">{days} días</Badge>;
  return <Badge variant="info">{days} días</Badge>;
}

export function ReportsScreen() {
  const [activeTab, setActiveTab] = useState('movements');
  const [filterType, setFilterType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const {
    loading,
    error,
    metrics,
    stockItems,
    alerts,
    recentWorkdays,
    movements,
    refresh,
  } = useReports();

  const filteredMovements = useMemo(
    () =>
      movements.filter((item) => {
        const matchType = filterType ? item.type === filterType : true;
        const matchStart = startDate ? new Date(item.createdAt) >= new Date(startDate) : true;
        const matchEnd = endDate ? new Date(item.createdAt) <= new Date(endDate) : true;
        return matchType && matchStart && matchEnd;
      }),
    [movements, filterType, startDate, endDate]
  );

  if (loading) {
    return (
      <>
        <ScreenHeader title="Reportes" subtitle="Consultas agregadas, métricas y alertas del sistema" />
        <LoadingSpinner />
      </>
    );
  }

  if (error) {
    return (
      <>
        <ScreenHeader title="Reportes" subtitle="Consultas agregadas, métricas y alertas del sistema" />
        <EmptyState title="Reportes" message={error} />
      </>
    );
  }

  return (
    <>
      <ScreenHeader title="Reportes" subtitle="Consultas agregadas, métricas y alertas del sistema" />
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.metricsRow}>
          <Card style={[styles.metricCard, styles.primaryCard]}>
            <Text style={styles.metricLabel}>Total Movimientos</Text>
            <Text style={styles.metricValue}>{metrics.totalMovements}</Text>
            <Text style={styles.metricSubtitle}>Movimientos registrados</Text>
          </Card>
          <Card style={[styles.metricCard, styles.successCard]}>
            <Text style={styles.metricLabel}>Medicamentos en stock</Text>
            <Text style={styles.metricValue}>{metrics.totalInventory}</Text>
            <Text style={styles.metricSubtitle}>Inventario central</Text>
          </Card>
          <Card style={[styles.metricCard, styles.warningCard]}>
            <Text style={styles.metricLabel}>Jornadas registradas</Text>
            <Text style={styles.metricValue}>{metrics.totalWorkdays}</Text>
            <Text style={styles.metricSubtitle}>Encuentros médicos</Text>
          </Card>
          <Card style={[styles.metricCard, styles.dangerCard]}>
            <Text style={styles.metricLabel}>Alertas activas</Text>
            <Text style={styles.metricValue}>{metrics.expirationAlerts}</Text>
            <Text style={styles.metricSubtitle}>Vencimientos próximos</Text>
          </Card>
        </View>

        <View style={styles.tabs}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabButton, activeTab === tab.key && styles.tabButtonActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'movements' && (
          <View style={styles.tabContent}>
            <View style={styles.filterRow}>
              {movementTypes.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.filterPill,
                    filterType === option.key && styles.filterPillActive,
                  ]}
                  onPress={() => setFilterType(option.key)}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      filterType === option.key && styles.filterPillTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.dateRow}>
              <TextInput
                style={styles.dateInput}
                placeholder="Desde (YYYY-MM-DD)"
                placeholderTextColor={COLORS.textSecondary}
                value={startDate}
                onChangeText={setStartDate}
              />
              <TextInput
                style={styles.dateInput}
                placeholder="Hasta (YYYY-MM-DD)"
                placeholderTextColor={COLORS.textSecondary}
                value={endDate}
                onChangeText={setEndDate}
              />
            </View>
            <Text style={styles.sectionSubtitle}>{filteredMovements.length} movimientos</Text>
            {filteredMovements.length === 0 ? (
              <EmptyState title="Movimientos" message="No hay movimientos que coincidan con los filtros." />
            ) : (
              <FlatList
                data={filteredMovements}
                keyExtractor={(item) => item._id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <Card style={styles.itemCard}>
                    <View style={styles.itemHeader}>
                      <View style={styles.itemHeaderLeft}>
                        <Text style={styles.itemTitle}>{item.medicine}</Text>
                        <Text style={styles.itemSubtitle}>Lote: {item.batch}</Text>
                      </View>
                      {getTypeBadge(item.type)}
                    </View>
                    <View style={styles.itemDetailRow}>
                      <Text style={styles.detailLabel}>Cantidad:</Text>
                      <Text style={styles.detailValue}>{item.quantity}</Text>
                    </View>
                    <View style={styles.itemDetailRow}>
                      <Text style={styles.detailLabel}>Usuario:</Text>
                      <Text style={styles.detailValue}>{item.user}</Text>
                    </View>
                    <View style={styles.itemDetailRow}>
                      <Text style={styles.detailLabel}>Fecha:</Text>
                      <Text style={styles.detailValue}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString('es-GT') : '-'}</Text>
                    </View>
                  </Card>
                )}
              />
            )}
          </View>
        )}

        {activeTab === 'inventory' && (
          <View style={styles.tabContent}>
            {stockItems.length === 0 ? (
              <EmptyState title="Inventario" message="No hay datos de inventario disponibles." />
            ) : (
              <FlatList
                data={stockItems}
                keyExtractor={(item) => item._id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <Card style={styles.itemCard}>
                    <View style={styles.itemHeader}>
                      <View style={styles.itemHeaderLeft}>
                        <Text style={styles.itemTitle}>{item.name}</Text>
                        <Text style={styles.itemSubtitle}>{item.compound}</Text>
                      </View>
                      <Badge variant={item.totalStock <= 0 ? 'danger' : item.totalStock <= item.minimumStock ? 'warning' : 'success'}>
                        {item.totalStock <= 0 ? 'Agotado' : item.totalStock <= item.minimumStock ? 'Bajo' : 'Normal'}
                      </Badge>
                    </View>
                    <View style={styles.itemDetailRow}>
                      <Text style={styles.detailLabel}>Stock total:</Text>
                      <Text style={styles.detailValue}>{item.totalStock}</Text>
                    </View>
                    <View style={styles.itemDetailRow}>
                      <Text style={styles.detailLabel}>Stock mínimo:</Text>
                      <Text style={styles.detailValue}>{item.minimumStock}</Text>
                    </View>
                  </Card>
                )}
              />
            )}
          </View>
        )}

        {activeTab === 'workdays' && (
          <View style={styles.tabContent}>
            {recentWorkdays.length === 0 ? (
              <EmptyState title="Jornadas" message="No hay jornadas recientes disponibles." />
            ) : (
              <FlatList
                data={recentWorkdays}
                keyExtractor={(item) => item._id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <Card style={styles.itemCard}>
                    <View style={styles.itemHeader}>
                      <View style={styles.itemHeaderLeft}>
                        <Text style={styles.itemTitle}>{item.name}</Text>
                        <Text style={styles.itemSubtitle}>{item.location}</Text>
                      </View>
                      {getStatusBadge(item.status)}
                    </View>
                    <View style={styles.itemDetailRow}>
                      <Text style={styles.detailLabel}>Fecha inicio:</Text>
                      <Text style={styles.detailValue}>{item.startDate ? new Date(item.startDate).toLocaleDateString('es-GT') : '-'}</Text>
                    </View>
                    <View style={styles.itemDetailRow}>
                      <Text style={styles.detailLabel}>Responsable:</Text>
                      <Text style={styles.detailValue}>{item.manager}</Text>
                    </View>
                  </Card>
                )}
              />
            )}
          </View>
        )}

        {activeTab === 'alerts' && (
          <View style={styles.tabContent}>
            {alerts.length === 0 ? (
              <EmptyState title="Alertas" message="No hay alertas de vencimiento." />
            ) : (
              <FlatList
                data={alerts}
                keyExtractor={(item) => item._id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <Card style={styles.itemCard}>
                    <View style={styles.itemHeader}>
                      <View style={styles.itemHeaderLeft}>
                        <Text style={styles.itemTitle}>{item.name}</Text>
                        <Text style={styles.itemSubtitle}>Lote: {item.batch}</Text>
                      </View>
                      {getExpirationBadge(item.daysRemaining)}
                    </View>
                    <View style={styles.itemDetailRow}>
                      <Text style={styles.detailLabel}>Vencimiento:</Text>
                      <Text style={styles.detailValue}>{item.expirationDate ? new Date(item.expirationDate).toLocaleDateString('es-GT') : '-'}</Text>
                    </View>
                    <View style={styles.itemDetailRow}>
                      <Text style={styles.detailLabel}>Stock:</Text>
                      <Text style={styles.detailValue}>{item.currentStock}</Text>
                    </View>
                  </Card>
                )}
              />
            )}
          </View>
        )}

        <View style={styles.actionRow}>
          <Button title="Actualizar" onPress={refresh} variant="secondary" style={styles.refreshButton} />
        </View>
        <View style={styles.spacer} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  metricCard: {
    width: '48%',
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: 16,
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
    borderLeftColor: COLORS.secondary,
  },
  dangerCard: {
    backgroundColor: '#fee2e2',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  metricLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  metricValue: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  metricSubtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
  },
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  tabButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
    marginRight: SPACING.sm,
  },
  tabButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.surface,
  },
  tabContent: {
    marginBottom: SPACING.lg,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  filterPill: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: 999,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  filterPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterPillText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  filterPillTextActive: {
    color: COLORS.surface,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  dateInput: {
    flex: 1,
    padding: SPACING.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    marginRight: SPACING.sm,
  },
  sectionSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  itemCard: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  itemHeaderLeft: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  itemTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  itemSubtitle: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  itemDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  detailLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text,
    fontWeight: '600',
    maxWidth: '55%',
    textAlign: 'right',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.sm,
  },
  refreshButton: {
    minWidth: 120,
  },
  spacer: {
    height: SPACING.xl,
  },
});
