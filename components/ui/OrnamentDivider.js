// components/ui/OrnamentDivider.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '../../theme/tokens';

/**
 * OrnamentDivider — altın çizgiler arasında elmas motifi (heritage ayıraç).
 * Props: { style }
 */
export default function OrnamentDivider({ style }) {
  return (
    <View style={[styles.row, style]}>
      <View style={styles.line} />
      <View style={styles.diamond} />
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: spacing.xl },
  line: { width: 48, height: 1, backgroundColor: colors.lineStrong },
  diamond: {
    width: 7,
    height: 7,
    backgroundColor: colors.gold,
    transform: [{ rotate: '45deg' }],
    marginHorizontal: spacing.md,
  },
});
