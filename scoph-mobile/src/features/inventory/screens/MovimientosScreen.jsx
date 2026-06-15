// c:\IN6AM\gitIN6AM\Scoph-Gestor-Jornadas-Medicas\scoph-mobile\src\features\inventory\screens\MovimientosScreen.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  RefreshControl
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useMovimientos } from '../hooks/useMovimientos.js';
import { Card, LoadingSpinner, EmptyState } from '../../../shared/components/common/Common.jsx';
import { ScreenHeader } from '../../../shared/components/common/ScreenHeader.jsx';
import { COLORS, FONT_SIZE, SPACING, SHADOWS } from '../../../shared/constants/theme.js';

function getTypeBadge(type) {
  if (type === 'ENTRADA') return { label: 'Entrada', color: '#16a34a', bgColor: '#dcfce7' };
  if (type === 'SALIDA') return { label: 'Salida', color: '#dc2626', bgColor: '#fee2e2' };
  return { label: 'Transferencia', color: '#2563eb', bgColor: '#dbeafe' };
}

function getSubTypeBadge(subType) {
  const map = {
    DONACION: { label: 'Donación', color: '#16a34a', bgColor: '#dcfce7' },
    COMPRA: { label: 'Compra', color: '#2563eb', bgColor: '#dbeafe' },
    RECETA: { label: 'Receta', color: '#ea580c', bgColor: '#fed7aa' },
    CONSUMO_JORNADA: { label: 'Consumo Jornada', color: '#ea580c', bgColor: '#fed7aa' },
    ASIGNACION_JORNADA: { label: 'Asignación Jornada', color: '#7c3aed', bgColor: '#ede9fe' },
    RETORNO_JORNADA: { label: 'Retorno Jornada', color: '#16a34a', bgColor: '#dcfce7' }
  };
  return map[subType] ?? { label: subType, color: '#6b7280', bgColor: '#f3f4f6' };
}

function getStatusBadge(status) {
  if (status === 'APLICADO') return { label: 'Aplicado', color: '#16a34a', bgColor: '#dcfce7' };
  if (status === 'CANCELADO') return { label: 'Cancelado', color: '#dc2626', bgColor: '#fee2e2' };
  return { label: 'Pendiente', color: '#ea580c', bgColor: '#fed7aa' };
}

function DetalleModal({ movimiento, onClose }) {
  if (!movimiento) return null;

  const type = getTypeBadge(movimiento.type);
  const subType = getSubTypeBadge(movimiento.subType);
  const status = getStatusBadge(movimiento.status);

  return (
    <View style={styles.detalleContainer}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Grid de información principal */}
        <View style={styles.gridContainer}>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Tipo</Text>
            <View style={[styles.badge, { backgroundColor: type.bgColor }]}>
              <Text style={[styles.badgeText, { color: type.color }]}>{type.label}</Text>
            </View>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Subtipo</Text>
            <View style={[styles.badge, { backgroundColor: subType.bgColor }]}>
              <Text style={[styles.badgeText, { color: subType.color }]}>{subType.label}</Text>
            </View>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Estado</Text>
            <View style={[styles.badge, { backgroundColor: status.bgColor }]}>
              <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Usuario</Text>
            <Text style={styles.gridValue}>{movimiento.userId || '—'}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Origen</Text>
            <Text style={styles.gridValue}>{movimiento.origin?.type || '—'}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Destino</Text>
            <Text style={styles.gridValue}>{movimiento.destination?.type || '—'}</Text>
          </View>
        </View>

        {/* Fecha */}
        <View style={styles.dateSection}>
          <Text style={styles.gridLabel}>Fecha de aplicación</Text>
          <Text style={styles.gridValue}>
            {movimiento.appliedAt
              ? new Date(movimiento.appliedAt).toLocaleString('es-GT')
              : '—'}
          </Text>
        </View>

        {/* Detalle de medicamentos */}
        {movimiento.detail && movimiento.detail.length > 0 && (
          <View style={styles.medicinesSection}>
            <Text style={styles.medicinesTitle}>Medicamentos</Text>
            {movimiento.detail.map((d, i) => (
              <View key={i} style={styles.medicineCard}>
                <View>
                  <Text style={styles.medicineName}>{d.medicationSnapshot?.name || '—'}</Text>
                  <Text style={styles.medicineDetail}>{d.medicationSnapshot?.concentration || '—'}</Text>
                  <Text style={styles.medicineDetail}>Lote: {d.batch}</Text>
                  <Text style={styles.medicineDetail}>
                    Vence: {new Date(d.expirationDate).toLocaleDateString('es-GT')}
                  </Text>
                </View>
                <Text style={styles.medicineQuantity}>{d.quantity} uds.</Text>
              </View>
            ))}
          </View>
        )}

        {/* Observación */}
        {movimiento.metadata?.reason && (
          <View style={styles.observationSection}>
            <Text style={styles.gridLabel}>Observación</Text>
            <Text style={styles.observationText}>{movimiento.metadata.reason}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Cerrar</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

export function MovimientosScreen() {
  const { movimientos, total, loading, error, filtros, refetch, aplicarFiltros, cambiarPagina } = useMovimientos();
  const [modalDetalle, setModalDetalle] = useState(false);
  const [selectedMovimiento, setSelectedMovimiento] = useState(null);
  const [filtroType, setFiltroType] = useState('');
  const [filtroSubType, setFiltroSubType] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');

  const totalPaginas = Math.ceil(total / filtros.limit);

  const handleBuscar = () => {
    aplicarFiltros({
      type: filtroType || undefined,
      subType: filtroSubType || undefined,
      fecha: filtroFecha || undefined
    });
  };

  const handleLimpiar = () => {
    setFiltroType('');
    setFiltroSubType('');
    setFiltroFecha('');
    aplicarFiltros({
      type: undefined,
      subType: undefined,
      fecha: undefined
    });
  };

  if (error && !movimientos.length) {
    return (
      <View style={styles.mainContainer}>
        <ScreenHeader title="Movimientos" subtitle="Historial de movimientos de inventario" />
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color={COLORS.danger} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <ScreenHeader title="Movimientos" subtitle="Historial de movimientos de inventario" />
      
      <ScrollView
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
      >
        {/* Tarjetas resumen */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total</Text>
            <Text style={styles.summaryValue}>{total}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Entradas</Text>
            <Text style={[styles.summaryValue, { color: '#16a34a' }]}>
              {movimientos.filter((m) => m.type === 'ENTRADA').length}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Salidas</Text>
            <Text style={[styles.summaryValue, { color: '#dc2626' }]}>
              {movimientos.filter((m) => m.type === 'SALIDA').length}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Transferencias</Text>
            <Text style={[styles.summaryValue, { color: '#2563eb' }]}>
              {movimientos.filter((m) => m.type === 'TRANSFERENCIA').length}
            </Text>
          </View>
        </View>

        {/* Filtros */}
        <View style={styles.filtersContainer}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Tipo</Text>
            <View style={styles.selectContainer}>
              <MaterialIcons name="arrow-drop-down" size={20} color={COLORS.primary} />
              <TextInput
                style={styles.select}
                placeholder="Todos"
                value={filtroType}
                onChangeText={setFiltroType}
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>
          </View>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Subtipo</Text>
            <View style={styles.selectContainer}>
              <MaterialIcons name="arrow-drop-down" size={20} color={COLORS.primary} />
              <TextInput
                style={styles.select}
                placeholder="Todos"
                value={filtroSubType}
                onChangeText={setFiltroSubType}
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>
          </View>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Fecha</Text>
            <View style={styles.selectContainer}>
              <MaterialIcons name="calendar-today" size={20} color={COLORS.primary} />
              <TextInput
                style={styles.select}
                placeholder="YYYY-MM-DD"
                value={filtroFecha}
                onChangeText={setFiltroFecha}
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>
          </View>
        </View>

        {/* Botones de filtro */}
        <View style={styles.filterButtonsContainer}>
          <TouchableOpacity
            style={[styles.filterButton, styles.filterButtonPrimary]}
            onPress={handleBuscar}
            disabled={loading}
          >
            <MaterialIcons name="filter-alt" size={18} color="#ffffff" />
            <Text style={styles.filterButtonText}>Filtrar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, styles.filterButtonGhost]}
            onPress={handleLimpiar}
            disabled={loading}
          >
            <Text style={styles.filterButtonGhostText}>Limpiar</Text>
          </TouchableOpacity>
        </View>

        {/* Info de paginación */}
        <View style={styles.paginationInfo}>
          <Text style={styles.paginationText}>
            Mostrando <Text style={styles.paginationBold}>{movimientos.length}</Text> de{' '}
            <Text style={styles.paginationBold}>{total}</Text> movimientos
          </Text>
          <Text style={styles.paginationText}>
            Página <Text style={styles.paginationBold}>{filtros.page}</Text> de{' '}
            <Text style={styles.paginationBold}>{totalPaginas || 1}</Text>
          </Text>
        </View>

        {/* Lista de movimientos */}
        {movimientos.length > 0 ? (
          <View style={styles.listContainer}>
            {movimientos.map((movimiento) => (
              <Card key={movimiento._id || movimiento.id} style={styles.movimientoCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardLeft}>
                    <View>
                      <Text style={styles.cardDate}>
                        {new Date(movimiento.createdAt).toLocaleDateString('es-GT')}
                      </Text>
                      <Text style={styles.cardTime}>
                        {new Date(movimiento.createdAt).toLocaleTimeString('es-GT', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.cardRight}>
                    <View
                      style={[
                        styles.typeBadgeCard,
                        { backgroundColor: getTypeBadge(movimiento.type).bgColor }
                      ]}
                    >
                      <Text
                        style={[
                          styles.typeBadgeCardText,
                          { color: getTypeBadge(movimiento.type).color }
                        ]}
                      >
                        {getTypeBadge(movimiento.type).label}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.cardDivider} />

                <View style={styles.cardContent}>
                  <Text style={styles.subTypeLabel}>
                    {getSubTypeBadge(movimiento.subType).label}
                  </Text>
                  <Text style={styles.medicineNameCard}>
                    {movimiento.detail?.[0]?.medicationSnapshot?.name ?? '—'}
                  </Text>
                  {movimiento.detail && movimiento.detail.length > 1 && (
                    <Text style={styles.moreItems}>+{movimiento.detail.length - 1} más</Text>
                  )}
                  <View style={styles.quantitySection}>
                    <Text style={styles.quantityLabel}>Cantidad:</Text>
                    <Text style={styles.quantityValue}>
                      {movimiento.detail?.reduce((acc, d) => acc + d.quantity, 0) ?? 0} uds.
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => {
                    setSelectedMovimiento(movimiento);
                    setModalDetalle(true);
                  }}
                >
                  <Text style={styles.viewButtonText}>Ver detalle</Text>
                  <MaterialIcons name="arrow-forward" size={16} color={COLORS.primary} />
                </TouchableOpacity>
              </Card>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <EmptyState
              title="Sin movimientos"
              message="No se encontraron movimientos con los filtros aplicados."
            />
          </View>
        )}

        {/* Paginación */}
        {totalPaginas > 1 && (
          <View style={styles.paginationContainer}>
            <TouchableOpacity
              style={[styles.paginationButton, filtros.page <= 1 && styles.paginationButtonDisabled]}
              onPress={() => cambiarPagina(filtros.page - 1)}
              disabled={filtros.page <= 1 || loading}
            >
              <MaterialIcons name="arrow-back" size={18} color={COLORS.primary} />
              <Text style={styles.paginationButtonText}>Anterior</Text>
            </TouchableOpacity>

            <Text style={styles.paginationCounter}>
              {filtros.page} / {totalPaginas}
            </Text>

            <TouchableOpacity
              style={[
                styles.paginationButton,
                filtros.page >= totalPaginas && styles.paginationButtonDisabled
              ]}
              onPress={() => cambiarPagina(filtros.page + 1)}
              disabled={filtros.page >= totalPaginas || loading}
            >
              <Text style={styles.paginationButtonText}>Siguiente</Text>
              <MaterialIcons name="arrow-forward" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Modal detalle */}
      <Modal visible={modalDetalle} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Movimiento — {selectedMovimiento?.subType}
              </Text>
              <TouchableOpacity onPress={() => setModalDetalle(false)}>
                <MaterialIcons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <DetalleModal
              movimiento={selectedMovimiento}
              onClose={() => setModalDetalle(false)}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  contentContainer: {
    flex: 1,
    paddingBottom: SPACING.lg
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg
  },
  errorText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.danger,
    marginTop: SPACING.md,
    textAlign: 'center'
  },
  retryButton: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: 8
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center'
  },
  summaryGrid: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    width: '48%',
    ...SHADOWS.sm
  },
  summaryLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: SPACING.xs
  },
  summaryValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text
  },
  filtersContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
    gap: SPACING.sm
  },
  filterGroup: {
    marginBottom: SPACING.sm
  },
  filterLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: SPACING.xs
  },
  selectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.background,
    position: 'relative'
  },
  select: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    fontSize: FONT_SIZE.sm,
    color: COLORS.text
  },
  filterButtonsContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    gap: SPACING.md
  },
  filterButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs
  },
  filterButtonPrimary: {
    backgroundColor: COLORS.primary
  },
  filterButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: FONT_SIZE.sm
  },
  filterButtonGhost: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  filterButtonGhostText: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: FONT_SIZE.sm
  },
  paginationInfo: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md
  },
  paginationText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs
  },
  paginationBold: {
    fontWeight: '700',
    color: COLORS.text
  },
  listContainer: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
    paddingVertical: SPACING.md
  },
  movimientoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...SHADOWS.sm
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: SPACING.lg
  },
  cardLeft: {
    flex: 1
  },
  cardDate: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs
  },
  cardTime: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary
  },
  cardRight: {
    marginLeft: SPACING.md
  },
  typeBadgeCard: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 6
  },
  typeBadgeCardText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700'
  },
  cardDivider: {
    height: 1,
    backgroundColor: COLORS.border
  },
  cardContent: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  subTypeLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: SPACING.sm
  },
  medicineNameCard: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs
  },
  moreItems: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm
  },
  quantitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm
  },
  quantityLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: '600'
  },
  quantityValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.xs
  },
  viewButtonText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.primary
  },
  emptyContainer: {
    padding: SPACING.lg
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg
  },
  paginationButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    gap: SPACING.xs
  },
  paginationButtonDisabled: {
    opacity: 0.5
  },
  paginationButtonText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.primary
  },
  paginationCounter: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    minWidth: 50,
    textAlign: 'center'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: SPACING.lg
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  modalTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1
  },
  detalleContainer: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.lg
  },
  gridItem: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md
  },
  gridLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: SPACING.xs
  },
  gridValue: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.xs
  },
  badge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 6,
    alignSelf: 'flex-start'
  },
  badgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700'
  },
  dateSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.lg
  },
  medicinesSection: {
    marginBottom: SPACING.lg
  },
  medicinesTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md
  },
  medicineCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.sm
  },
  medicineName: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs
  },
  medicineDetail: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs
  },
  medicineQuantity: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text
  },
  observationSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.lg
  },
  observationText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    marginTop: SPACING.xs
  },
  closeButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: SPACING.lg
  },
  closeButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: FONT_SIZE.md
  }
});
