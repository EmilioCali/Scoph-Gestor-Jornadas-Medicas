import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore.js';
import { COLORS, FONT_SIZE, SPACING } from '../../constants/theme.js';

export function HamburgerMenu({ navigation }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();

  const handleViewProfile = () => {
    setMenuOpen(false);
    navigation.navigate('Profile');
  };

  const handleEditProfile = () => {
    setMenuOpen(false);
    navigation.navigate('Profile', { edit: true });
  };

  return (
    <>
      <TouchableOpacity
        style={styles.hamburgerButton}
        onPress={() => setMenuOpen(true)}
        activeOpacity={0.7}
      >
        <MaterialIcons name="menu" size={24} color="#ffffff" />
      </TouchableOpacity>

      <Modal
        visible={menuOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setMenuOpen(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setMenuOpen(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.menuContainer}
            onPress={() => {}}
          >
            {/* Header del menú */}
            <View style={styles.menuHeader}>
              <View>
                <Text style={styles.userName}>{user?.nombre || user?.email}</Text>
                <Text style={styles.userRole}>{user?.rol || 'Usuario'}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setMenuOpen(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            {/* Opciones del menú */}
            <TouchableOpacity
              style={styles.menuOption}
              onPress={handleViewProfile}
            >
              <MaterialIcons name="person" size={20} color={COLORS.primary} />
              <View style={styles.optionContent}>
                <Text style={styles.optionText}>Ver Perfil</Text>
                <Text style={styles.optionSubtitle}>Información personal</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuOption}
              onPress={handleEditProfile}
            >
              <MaterialIcons name="edit" size={20} color={COLORS.primary} />
              <View style={styles.optionContent}>
                <Text style={styles.optionText}>Editar Perfil</Text>
                <Text style={styles.optionSubtitle}>Modificar datos</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={[styles.menuOption, styles.logoutOption]}
              onPress={() => {
                setMenuOpen(false);
                logout();
              }}
            >
              <MaterialIcons name="logout" size={20} color={COLORS.danger} />
              <View style={styles.optionContent}>
                <Text style={[styles.optionText, { color: COLORS.danger }]}>Cerrar Sesión</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={COLORS.danger} />
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  hamburgerButton: {
    padding: SPACING.sm,
    marginRight: SPACING.sm
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start'
  },
  menuContainer: {
    backgroundColor: COLORS.background,
    marginTop: 0,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg,
    width: '70%',
    minHeight: '100%',
    borderBottomRightRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 8
  },
  menuHeader: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  userName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs
  },
  userRole: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: '500'
  },
  closeButton: {
    padding: SPACING.sm
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.md
  },
  optionContent: {
    flex: 1
  },
  optionText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs
  },
  optionSubtitle: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary
  },
  logoutOption: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.lg,
    marginTop: SPACING.md
  }
});
