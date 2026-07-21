import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, FONT_SIZE, SPACING, SHADOWS } from '../shared/constants/theme.js';

export function InventoryTabMenu({ onSelectOption, expanded, onToggle, userRole }) {
  const options = [
    { label: 'Catálogo', route: 'Catalogo', icon: 'book' },
    { label: 'Inventario Central', route: 'InventarioCentral', icon: 'storage', adminOnly: true },
    { label: 'Movimientos', route: 'Movimientos', icon: 'trending-up' }
  ];

  const filteredOptions = options.filter((option) => !option.adminOnly || userRole === 'ADMIN' || userRole === 'SUPER_ADMIN');
  const [activeOption, setActiveOption] = useState('Catalogo');

  const handleSelectOption = (route) => {
    setActiveOption(route);
    onSelectOption(route);
  };

  if (!expanded) {
    return null;
  }

  return (
    <Modal
      transparent
      visible={expanded}
      animationType="fade"
      onRequestClose={onToggle}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onToggle}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.menuContainer}
          onPress={() => {}}
        >
          {/* Header */}
          <View style={styles.menuHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.iconContainer}>
                <MaterialIcons name="inventory" size={24} color="#ffffff" />
              </View>
              <View>
                <Text style={styles.menuTitle}>Inventario</Text>
                <Text style={styles.menuSubtitle}>Selecciona una opción</Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={onToggle}
              style={styles.closeButton}
            >
              <MaterialIcons name="expand-less" size={24} color="#f27405" />
            </TouchableOpacity>
          </View>

          {/* Separator */}
          <View style={styles.separator} />

          {/* Options */}
          <View style={styles.optionsContainer}>
            {filteredOptions.map((option, index) => (
              <TouchableOpacity
                key={option.route}
                style={[
                  styles.option,
                  activeOption === option.route && styles.optionActive,
                  index !== filteredOptions.length - 1 && styles.optionBorder
                ]}
                onPress={() => handleSelectOption(option.route)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.optionIconContainer,
                  activeOption === option.route && styles.optionIconContainerActive
                ]}>
                  <MaterialIcons
                    name={option.icon}
                    size={22}
                    color={activeOption === option.route ? '#ffffff' : '#f27405'}
                  />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={[
                    styles.optionText,
                    activeOption === option.route && styles.optionTextActive
                  ]}>
                    {option.label}
                  </Text>
                </View>
                {activeOption === option.route && (
                  <View style={styles.optionCheckmark}>
                    <MaterialIcons name="check-circle" size={24} color="#f27405" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Opción actualmente seleccionada</Text>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  menuContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: SPACING.lg,
    minHeight: 400,
    ...SHADOWS.md
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.md
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#f27405',
    justifyContent: 'center',
    alignItems: 'center'
  },
  menuTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: '#101828'
  },
  menuSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  closeButton: {
    padding: SPACING.sm
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.lg
  },
  optionsContainer: {
    gap: 0,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    borderRadius: 12,
    backgroundColor: 'transparent'
  },
  optionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  optionActive: {
    backgroundColor: 'rgba(242, 116, 5, 0.1)'
  },
  optionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(242, 116, 5, 0.15)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  optionIconContainerActive: {
    backgroundColor: '#f27405'
  },
  optionTextContainer: {
    flex: 1
  },
  optionText: {
    fontSize: FONT_SIZE.md,
    color: '#101828',
    fontWeight: '600'
  },
  optionTextActive: {
    color: '#f27405',
    fontWeight: '700'
  },
  optionCheckmark: {
    marginLeft: SPACING.md
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: SPACING.md
  },
  footerText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center'
  }
});
