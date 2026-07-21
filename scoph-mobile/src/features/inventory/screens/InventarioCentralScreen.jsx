import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useInventarioCentral } from '../hooks/useInventarioCentral.js';
import { Card, EmptyState, LoadingSpinner } from '../../../shared/components/common/Common.jsx';
import { ScreenHeader } from '../../../shared/components/common/ScreenHeader.jsx';
import { Button } from '../../../shared/components/common/Button.jsx';
import { Badge } from '../../../shared/components/common/Badge.jsx';
import { COLORS, FONT_SIZE, SHADOWS, SPACING } from '../../../shared/constants/theme.js';
import { medicineCategories } from '../../../shared/constants/catalogOptions.js';
import { useAuthStore } from '../../../shared/store/authStore.js';

const ADD_INITIAL = { medicineId: '', minimumStock: '', batch: '', expirationDate: '', initialStock: '0' };
const ENTRY_INITIAL = { tipoEntrada: 'DONACION', batch: '', expirationDate: '', quantity: '' };
const EXIT_INITIAL = { batch: '', quantity: '' };

function getStockVariant(totalStock, minimumStock) {
  if (totalStock <= 0) return { label: 'Agotado', variant: 'danger' };
  if (totalStock <= minimumStock * 0.5) return { label: 'Critico', variant: 'danger' };
  if (totalStock <= minimumStock) return { label: 'Bajo', variant: 'warning' };
  return { label: 'Normal', variant: 'success' };
}

function getExpirationInfo(lots) {
  if (!lots || lots.length === 0) return { label: 'Sin lotes', variant: 'gray' };

  const today = new Date();
  const minDays = Math.min(
    ...lots.map((lot) => Math.ceil((new Date(lot.expirationDate) - today) / (1000 * 60 * 60 * 24)))
  );

  if (minDays <= 0) return { label: 'Vencido', variant: 'danger' };
  if (minDays <= 15) return { label: `Vence en ${minDays}d`, variant: 'danger' };
  if (minDays <= 30) return { label: `Vence en ${minDays}d`, variant: 'warning' };
  if (minDays <= 60) return { label: `Vence en ${minDays}d`, variant: 'info' };

  return {
    label: new Date(lots[0].expirationDate).toLocaleDateString('es-GT'),
    variant: 'success'
  };
}

function SelectorGroup({ label, options, value, onChange, getLabel = (option) => option }) {
  return (
    <View style={styles.selectorRow}>
      <Text style={styles.selectorLabel}>{label}</Text>
      <View style={styles.selectorGroup}>
        {options.map((option) => (
          <TouchableOpacity
            key={String(option.value ?? option)}
            style={[styles.selectorButton, value === (option.value ?? option) && styles.selectorButtonActive]}
            onPress={() => onChange(option.value ?? option)}
          >
            <Text style={[styles.selectorButtonText, value === (option.value ?? option) && styles.selectorButtonTextActive]}>
              {getLabel(option)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export function InventarioCentralScreen() {
  const currentUser = useAuthStore((state) => state.user);
  const canModifyCentralInventory = currentUser?.rol === 'ADMIN' || currentUser?.rol === 'SUPER_ADMIN';
  const {
    inventory,
    loading,
    error,
    refetch,
    availableMedicines,
    addToInventory,
    registrarEntrada,
    registrarSalida
  } = useInventarioCentral();

  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStock, setFilterStock] = useState('');
  const [modalType, setModalType] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [addForm, setAddForm] = useState(ADD_INITIAL);
  const [entryForm, setEntryForm] = useState(ENTRY_INITIAL);
  const [exitForm, setExitForm] = useState(EXIT_INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const filteredInventory = useMemo(
    () =>
      inventory.filter((item) => {
        const query = searchText.toLowerCase();
        const matchesSearch =
          item.name?.toLowerCase().includes(query) ||
          item.compound?.toLowerCase().includes(query);
        const matchesCategory = filterCategory ? item.category === filterCategory : true;
        const matchesStock = (() => {
          if (!filterStock) return true;
          if (filterStock === 'AGOTADO') return item.totalStock <= 0;
          if (filterStock === 'CRITICO') return item.totalStock > 0 && item.totalStock <= item.minimumStock * 0.5;
          if (filterStock === 'BAJO') return item.totalStock > item.minimumStock * 0.5 && item.totalStock <= item.minimumStock;
          if (filterStock === 'NORMAL') return item.totalStock > item.minimumStock;
          return true;
        })();

        return matchesSearch && matchesCategory && matchesStock;
      }),
    [inventory, searchText, filterCategory, filterStock]
  );

  const summary = useMemo(
    () => ({
      total: inventory.length,
      agotados: inventory.filter((item) => item.totalStock <= 0).length,
      bajos: inventory.filter((item) => item.totalStock > 0 && item.totalStock <= item.minimumStock).length,
      normales: inventory.filter((item) => item.totalStock > item.minimumStock).length
    }),
    [inventory]
  );

  const openAddModal = () => {
    setAddForm(ADD_INITIAL);
    setFormError(null);
    setModalType('add');
  };

  const openEntryModal = (item) => {
    setSelectedItem(item);
    setEntryForm(ENTRY_INITIAL);
    setFormError(null);
    setModalType('entry');
  };

  const openExitModal = (item) => {
    setSelectedItem(item);
    setExitForm(EXIT_INITIAL);
    setFormError(null);
    setModalType('exit');
  };

  const openLotsModal = (item) => {
    setSelectedItem(item);
    setModalType('lots');
  };

  const closeModal = () => {
    setModalType(null);
    setFormError(null);
  };

  const validateAddForm = () => {
    const stock = Number(addForm.initialStock || 0);
    if (!addForm.medicineId || addForm.minimumStock === '') {
      setFormError('Selecciona un medicamento e ingresa el stock minimo.');
      return false;
    }
    if (Number(addForm.minimumStock) < 0 || stock < 0) {
      setFormError('El stock no puede ser negativo.');
      return false;
    }
    if (stock > 0 && (!addForm.batch || !addForm.expirationDate)) {
      setFormError('Para stock inicial debes indicar lote y fecha de vencimiento.');
      return false;
    }
    return true;
  };

  const handleAddToInventory = async () => {
    if (!validateAddForm()) return;
    setSubmitting(true);
    setFormError(null);

    try {
      await addToInventory(addForm);
      closeModal();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'No se pudo agregar al inventario');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterEntry = async () => {
    if (!entryForm.batch || !entryForm.expirationDate || Number(entryForm.quantity) <= 0) {
      setFormError('Completa lote, vencimiento y una cantidad mayor a 0.');
      return;
    }
    setSubmitting(true);
    setFormError(null);

    try {
      await registrarEntrada({ item: selectedItem, ...entryForm });
      closeModal();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'No se pudo registrar la entrada');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterExit = async () => {
    const selectedLot = selectedItem?.lots?.find((lot) => lot.batch === exitForm.batch);
    const quantity = Number(exitForm.quantity);

    if (!selectedLot || quantity <= 0) {
      setFormError('Selecciona un lote e ingresa una cantidad mayor a 0.');
      return;
    }
    if (quantity > selectedLot.stock) {
      setFormError(`Stock insuficiente en el lote. Disponible: ${selectedLot.stock}`);
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      await registrarSalida({ item: selectedItem, ...exitForm });
      closeModal();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'No se pudo registrar la salida');
    } finally {
      setSubmitting(false);
    }
  };

  const showExportUnavailable = (type) => {
    Alert.alert(type, 'La exportacion desde mobile aun no esta disponible.');
  };

  if (loading && inventory.length === 0) {
    return (
      <>
        <ScreenHeader title="Inventario Central" subtitle="Control de stock, lotes y vencimientos de medicamentos" />
        <LoadingSpinner />
      </>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <ScreenHeader
        title="Inventario Central"
        subtitle="Control de stock, lotes y vencimientos de medicamentos"
        action={
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerIconButton} onPress={refetch} disabled={loading}>
              <MaterialIcons name="refresh" size={20} color={COLORS.primary} />
            </TouchableOpacity>
            {canModifyCentralInventory && (
              <Button title="Agregar" onPress={openAddModal} style={styles.addButton} />
            )}
          </View>
        }
      />

      <ScrollView
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} tintColor={COLORS.primary} />}
      >
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={refetch}>
              <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.summaryGrid}>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Registros</Text>
            <Text style={styles.summaryValue}>{summary.total}</Text>
          </Card>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Agotados</Text>
            <Text style={[styles.summaryValue, styles.dangerText]}>{summary.agotados}</Text>
          </Card>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Stock Bajo</Text>
            <Text style={[styles.summaryValue, styles.warningText]}>{summary.bajos}</Text>
          </Card>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Stock Normal</Text>
            <Text style={[styles.summaryValue, styles.successText]}>{summary.normales}</Text>
          </Card>
        </View>

        <Card style={styles.filtersCard}>
          <View style={styles.searchBox}>
            <MaterialIcons name="search" size={20} color={COLORS.textSecondary} />
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Buscar por nombre o compuesto..."
              placeholderTextColor={COLORS.textSecondary}
              style={styles.searchInput}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <TouchableOpacity
              style={[styles.filterChip, !filterCategory && styles.filterChipActive]}
              onPress={() => setFilterCategory('')}
            >
              <Text style={[styles.filterChipText, !filterCategory && styles.filterChipTextActive]}>
                Todas las categorias
              </Text>
            </TouchableOpacity>
            {medicineCategories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[styles.filterChip, filterCategory === category && styles.filterChipActive]}
                onPress={() => setFilterCategory(category)}
              >
                <Text style={[styles.filterChipText, filterCategory === category && styles.filterChipTextActive]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.statusFilters}>
            {[
              { value: '', label: 'Todo el stock' },
              { value: 'NORMAL', label: 'Normal' },
              { value: 'BAJO', label: 'Bajo' },
              { value: 'CRITICO', label: 'Critico' },
              { value: 'AGOTADO', label: 'Agotado' }
            ].map((option) => (
              <TouchableOpacity
                key={option.label}
                style={[styles.statusChip, filterStock === option.value && styles.statusChipActive]}
                onPress={() => setFilterStock(option.value)}
              >
                <Text style={[styles.statusChipText, filterStock === option.value && styles.statusChipTextActive]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.exportRow}>
            <Button title="PDF" variant="secondary" onPress={() => showExportUnavailable('PDF')} style={styles.exportButton} />
            <Button title="Excel" variant="secondary" onPress={() => showExportUnavailable('Excel')} style={styles.exportButton} />
          </View>

          <Text style={styles.resultCount}>
            Mostrando <Text style={styles.resultCountStrong}>{filteredInventory.length}</Text> de{' '}
            <Text style={styles.resultCountStrong}>{inventory.length}</Text> registros
          </Text>
        </Card>

        {filteredInventory.length > 0 ? (
          <View style={styles.listContainer}>
            {filteredInventory.map((item) => {
              const stockInfo = getStockVariant(item.totalStock, item.minimumStock);
              const expirationInfo = getExpirationInfo(item.lots);

              return (
                <Card key={String(item.medicineId)} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardTitleSection}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemCompound}>{item.compound} - {item.category}</Text>
                    </View>
                    <Badge variant={stockInfo.variant}>{stockInfo.label}</Badge>
                  </View>

                  <View style={styles.cardDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Unidad</Text>
                      <Text style={styles.detailValue}>{item.unitOfMeasure}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Stock Total</Text>
                      <View style={styles.rightDetail}>
                        <Text style={styles.detailValue}>{item.totalStock}</Text>
                        <Text style={styles.detailValueSmall}>Min: {item.minimumStock}</Text>
                      </View>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Vencimiento</Text>
                      <Badge variant={expirationInfo.variant}>{expirationInfo.label}</Badge>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Lotes</Text>
                      <TouchableOpacity onPress={() => openLotsModal(item)}>
                        <Text style={styles.linkText}>Ver {item.lots?.length ?? 0} lote(s)</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {canModifyCentralInventory ? (
                    <View style={styles.actionsRow}>
                      <TouchableOpacity style={styles.actionButton} onPress={() => openEntryModal(item)}>
                        <MaterialIcons name="arrow-upward" size={20} color={COLORS.primaryDark} />
                        <Text style={styles.actionText}>Entrada</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionButton} onPress={() => openExitModal(item)}>
                        <MaterialIcons name="arrow-downward" size={20} color={COLORS.error} />
                        <Text style={[styles.actionText, styles.dangerText]}>Salida</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <Text style={styles.readOnlyText}>Solo lectura</Text>
                  )}
                </Card>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyWrapper}>
            <EmptyState title="No hay medicamentos en el inventario central" message="Ajusta la busqueda o agrega medicamentos al inventario." />
          </View>
        )}
      </ScrollView>

      <Modal visible={!!modalType} animationType="slide" transparent onRequestClose={closeModal}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView contentContainerStyle={styles.modalScroll}>
                {modalType === 'add' && (
                  <>
                    <Text style={styles.modalTitle}>Agregar al Inventario Central</Text>
                    {formError && <Text style={styles.formError}>{formError}</Text>}

                    <SelectorGroup
                      label="Medicamento del catalogo"
                      value={addForm.medicineId}
                      options={availableMedicines.map((medicine) => ({
                        value: medicine._id,
                        label: `${medicine.name} - ${medicine.compound} ${medicine.concentration}`
                      }))}
                      getLabel={(option) => option.label}
                      onChange={(value) => setAddForm((prev) => ({ ...prev, medicineId: value }))}
                    />

                    <TextInput
                      placeholder="Stock minimo"
                      value={addForm.minimumStock}
                      onChangeText={(value) => setAddForm((prev) => ({ ...prev, minimumStock: value.replace(/[^0-9]/g, '') }))}
                      keyboardType="numeric"
                      style={styles.input}
                    />
                    <Text style={styles.helperText}>Lote inicial opcional. Si no hay stock, deja 0.</Text>
                    <TextInput
                      placeholder="Numero de lote"
                      value={addForm.batch}
                      onChangeText={(value) => setAddForm((prev) => ({ ...prev, batch: value }))}
                      style={styles.input}
                    />
                    <TextInput
                      placeholder="Fecha de vencimiento (YYYY-MM-DD)"
                      value={addForm.expirationDate}
                      onChangeText={(value) => setAddForm((prev) => ({ ...prev, expirationDate: value }))}
                      style={styles.input}
                    />
                    <TextInput
                      placeholder="Stock inicial"
                      value={addForm.initialStock}
                      onChangeText={(value) => setAddForm((prev) => ({ ...prev, initialStock: value.replace(/[^0-9]/g, '') }))}
                      keyboardType="numeric"
                      style={styles.input}
                    />

                    <View style={styles.modalActions}>
                      <Button title="Cancelar" variant="secondary" onPress={closeModal} style={styles.modalButton} />
                      <Button title="Agregar al inventario" onPress={handleAddToInventory} loading={submitting} disabled={submitting} style={styles.modalButton} />
                    </View>
                  </>
                )}

                {modalType === 'entry' && (
                  <>
                    <Text style={styles.modalTitle}>Registrar Entrada</Text>
                    {formError && <Text style={styles.formError}>{formError}</Text>}
                    <View style={styles.selectedInfo}>
                      <Text style={styles.selectedLabel}>Medicamento</Text>
                      <Text style={styles.selectedName}>{selectedItem?.name}</Text>
                      <Text style={styles.selectedLabel}>Stock actual: {selectedItem?.totalStock} {selectedItem?.unitOfMeasure}</Text>
                    </View>

                    <SelectorGroup
                      label="Tipo de entrada"
                      value={entryForm.tipoEntrada}
                      options={['DONACION', 'COMPRA']}
                      onChange={(value) => setEntryForm((prev) => ({ ...prev, tipoEntrada: value }))}
                    />
                    <TextInput
                      placeholder="Numero de lote"
                      value={entryForm.batch}
                      onChangeText={(value) => setEntryForm((prev) => ({ ...prev, batch: value }))}
                      style={styles.input}
                    />
                    <TextInput
                      placeholder="Fecha de vencimiento (YYYY-MM-DD)"
                      value={entryForm.expirationDate}
                      onChangeText={(value) => setEntryForm((prev) => ({ ...prev, expirationDate: value }))}
                      style={styles.input}
                    />
                    <TextInput
                      placeholder="Cantidad a ingresar"
                      value={entryForm.quantity}
                      onChangeText={(value) => setEntryForm((prev) => ({ ...prev, quantity: value.replace(/[^0-9]/g, '') }))}
                      keyboardType="numeric"
                      style={styles.input}
                    />

                    <View style={styles.modalActions}>
                      <Button title="Cancelar" variant="secondary" onPress={closeModal} style={styles.modalButton} />
                      <Button title="Registrar entrada" onPress={handleRegisterEntry} loading={submitting} disabled={submitting} style={styles.modalButton} />
                    </View>
                  </>
                )}

                {modalType === 'exit' && (
                  <>
                    <Text style={styles.modalTitle}>Registrar Salida</Text>
                    {formError && <Text style={styles.formError}>{formError}</Text>}
                    <View style={styles.selectedInfo}>
                      <Text style={styles.selectedLabel}>Medicamento</Text>
                      <Text style={styles.selectedName}>{selectedItem?.name}</Text>
                      <Text style={styles.selectedLabel}>Stock actual: {selectedItem?.totalStock} {selectedItem?.unitOfMeasure}</Text>
                    </View>

                    <SelectorGroup
                      label="Lote a retirar"
                      value={exitForm.batch}
                      options={(selectedItem?.lots ?? [])
                        .filter((lot) => lot.stock > 0)
                        .map((lot) => ({
                          value: lot.batch,
                          label: `${lot.batch} - Stock: ${lot.stock} - Vence: ${new Date(lot.expirationDate).toLocaleDateString('es-GT')}`
                        }))}
                      getLabel={(option) => option.label}
                      onChange={(value) => setExitForm((prev) => ({ ...prev, batch: value }))}
                    />
                    <TextInput
                      placeholder="Cantidad a retirar"
                      value={exitForm.quantity}
                      onChangeText={(value) => setExitForm((prev) => ({ ...prev, quantity: value.replace(/[^0-9]/g, '') }))}
                      keyboardType="numeric"
                      style={styles.input}
                    />

                    <View style={styles.modalActions}>
                      <Button title="Cancelar" variant="secondary" onPress={closeModal} style={styles.modalButton} />
                      <Button title="Registrar salida" onPress={handleRegisterExit} loading={submitting} disabled={submitting} style={styles.modalButton} />
                    </View>
                  </>
                )}

                {modalType === 'lots' && (
                  <>
                    <Text style={styles.modalTitle}>Lotes - {selectedItem?.name}</Text>
                    {(selectedItem?.lots ?? []).length > 0 ? (
                      selectedItem.lots.map((lot) => {
                        const days = Math.ceil((new Date(lot.expirationDate) - new Date()) / (1000 * 60 * 60 * 24));
                        const lotBadge =
                          days <= 0
                            ? { label: 'Vencido', variant: 'danger' }
                            : days <= 30
                              ? { label: `Vence en ${days}d`, variant: 'danger' }
                              : days <= 60
                                ? { label: `Vence en ${days}d`, variant: 'warning' }
                                : { label: 'Vigente', variant: 'success' };

                        return (
                          <View key={lot.batch} style={styles.lotRow}>
                            <View>
                              <Text style={styles.lotTitle}>Lote {lot.batch}</Text>
                              <Text style={styles.lotSubtitle}>
                                Vence: {new Date(lot.expirationDate).toLocaleDateString('es-GT')}
                              </Text>
                            </View>
                            <View style={styles.lotRight}>
                              <Text style={styles.lotStock}>{lot.stock} uds.</Text>
                              <Badge variant={lotBadge.variant}>{lotBadge.label}</Badge>
                            </View>
                          </View>
                        );
                      })
                    ) : (
                      <Text style={styles.noLotsText}>Sin lotes registrados</Text>
                    )}
                    <Button title="Cerrar" variant="secondary" onPress={closeModal} style={styles.closeLotsButton} />
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
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
    flex: 1
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm
  },
  headerIconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: COLORS.surface
  },
  addButton: {
    minWidth: 96
  },
  errorBanner: {
    margin: SPACING.lg,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md
  },
  errorText: {
    flex: 1,
    color: '#b91c1c',
    fontSize: FONT_SIZE.sm
  },
  retryText: {
    color: COLORS.primaryDark,
    fontWeight: '700',
    fontSize: FONT_SIZE.sm
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    padding: SPACING.lg,
    paddingBottom: 0
  },
  summaryCard: {
    flexBasis: '47%',
    minHeight: 92,
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm
  },
  summaryLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    fontWeight: '600'
  },
  summaryValue: {
    color: COLORS.text,
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800'
  },
  dangerText: {
    color: COLORS.error
  },
  warningText: {
    color: '#ca8a04'
  },
  successText: {
    color: COLORS.success
  },
  filtersCard: {
    margin: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  searchInput: {
    flex: 1,
    minHeight: 44,
    color: COLORS.text,
    fontSize: FONT_SIZE.sm
  },
  filterScroll: {
    marginTop: SPACING.md
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  filterChipText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.text,
    fontWeight: '700'
  },
  filterChipTextActive: {
    color: COLORS.surface
  },
  statusFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.md
  },
  statusChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface
  },
  statusChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#fed7aa'
  },
  statusChipText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    fontWeight: '700'
  },
  statusChipTextActive: {
    color: COLORS.primaryDark
  },
  exportRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md
  },
  exportButton: {
    flex: 1
  },
  resultCount: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.md
  },
  resultCountStrong: {
    color: COLORS.text,
    fontWeight: '700'
  },
  listContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    gap: SPACING.md
  },
  card: {
    padding: SPACING.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: SPACING.md,
    marginBottom: SPACING.md
  },
  cardTitleSection: {
    flex: 1
  },
  itemName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs
  },
  itemCompound: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary
  },
  cardDetails: {
    gap: SPACING.sm
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.md
  },
  detailLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: '600'
  },
  detailValue: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    fontWeight: '700'
  },
  detailValueSmall: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    textAlign: 'right'
  },
  rightDetail: {
    alignItems: 'flex-end'
  },
  linkText: {
    color: COLORS.primaryDark,
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    textDecorationLine: 'underline'
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.md,
    marginTop: SPACING.md
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.xs
  },
  actionText: {
    color: COLORS.primaryDark,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600'
  },
  readOnlyText: {
    marginTop: SPACING.md,
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    fontStyle: 'italic'
  },
  emptyWrapper: {
    padding: SPACING.lg
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%'
  },
  modalScroll: {
    padding: SPACING.lg
  },
  modalTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md
  },
  formError: {
    color: '#b91c1c',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
    padding: SPACING.sm,
    marginBottom: SPACING.md
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    backgroundColor: COLORS.background,
    color: COLORS.text,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md
  },
  helperText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    marginBottom: SPACING.sm
  },
  selectedInfo: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: SPACING.md,
    marginBottom: SPACING.md
  },
  selectedLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs
  },
  selectedName: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    marginVertical: SPACING.xs
  },
  selectorRow: {
    marginBottom: SPACING.md
  },
  selectorLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.xs,
    fontWeight: '600'
  },
  selectorGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm
  },
  selectorButton: {
    flexBasis: '48%',
    minHeight: 42,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface
  },
  selectorButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary
  },
  selectorButtonText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    textAlign: 'center'
  },
  selectorButtonTextActive: {
    color: COLORS.surface
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
    marginTop: SPACING.md
  },
  modalButton: {
    flex: 1
  },
  lotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: SPACING.md,
    marginBottom: SPACING.md
  },
  lotTitle: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    fontWeight: '700'
  },
  lotSubtitle: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.xs
  },
  lotRight: {
    alignItems: 'flex-end',
    gap: SPACING.xs
  },
  lotStock: {
    color: COLORS.text,
    fontSize: FONT_SIZE.sm,
    fontWeight: '800'
  },
  noLotsText: {
    color: COLORS.textSecondary,
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
    paddingVertical: SPACING.lg
  },
  closeLotsButton: {
    marginTop: SPACING.md
  }
});
