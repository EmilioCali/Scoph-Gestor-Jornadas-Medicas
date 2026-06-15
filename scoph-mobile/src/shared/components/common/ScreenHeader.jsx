import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HamburgerMenu } from './HamburgerMenu.jsx';
import { COLORS, FONT_SIZE, SPACING } from '../../constants/theme.js';

export function ScreenHeader({ title, subtitle, action, navigation, showMenu = false }) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {showMenu && navigation ? (
          <HamburgerMenu navigation={navigation} />
        ) : action ? (
          <View style={styles.action}>{action}</View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#101828'
  },
  header: {
    backgroundColor: '#101828',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    paddingTop: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between'
  },
  titleWrapper: {
    flex: 1,
    paddingRight: SPACING.md
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: SPACING.md
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: '#ffffff',
    opacity: 0.8
  },
  action: {
    marginTop: SPACING.sm
  }
});
