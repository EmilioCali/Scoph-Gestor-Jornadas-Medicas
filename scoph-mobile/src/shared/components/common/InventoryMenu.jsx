import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, FONT_SIZE, SPACING, SHADOWS } from '../../constants/theme.js';

export function InventoryMenu({ navigation, currentTab }) {
  const [expanded, setExpanded] = useState(false);

  const menuItems = [
    { name: 'Catálogo', route: 'Catalogo', icon: 'book' },
    { name: 'Inventario Central', route: 'InventarioCentral', icon: 'storage' },
    { name: 'Movimientos', route: 'Movimientos', icon: 'trending-up' }
  ];

  const handlePress = (route) => {
    navigation.navigate(route);
    setExpanded(false);
  };

  const currentItem = menuItems.find(item => item.route === currentTab);
  const displayName = currentItem?.name || 'Inventario';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <MaterialIcons name="inventory" size={20} color="#ffffff" />
        <Text style={styles.triggerText}>{displayName}</Text>
        <MaterialIcons 
          name={expanded ? "expand-less" : "expand-more"} 
          size={20} 
          color="#ffffff" 
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.dropdown}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.route}
              style={[
                styles.option,
                currentTab === item.route && styles.optionActive
              ]}
              onPress={() => handlePress(item.route)}
              activeOpacity={0.6}
            >
              <MaterialIcons 
                name={item.icon} 
                size={18} 
                color={currentTab === item.route ? '#f27405' : COLORS.textSecondary}
              />
              <Text style={[
                styles.optionText,
                currentTab === item.route && styles.optionTextActive
              ]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    zIndex: 100
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: '#f27405',
    borderRadius: 12,
    justifyContent: 'space-between'
  },
  triggerText: {
    fontSize: FONT_SIZE.md,
    color: '#ffffff',
    fontWeight: '600',
    flex: 1,
    marginLeft: SPACING.sm
  },
  dropdown: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...SHADOWS.md
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  optionActive: {
    backgroundColor: '#f2f2f0'
  },
  optionText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    fontWeight: '500'
  },
  optionTextActive: {
    color: '#f27405',
    fontWeight: '700'
  }
});
