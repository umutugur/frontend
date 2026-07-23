// components/ui/Card.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import PressableScale from './PressableScale';
import { colors, gradients, radii, shadows, spacing } from '../../theme/tokens';

/**
 * Card — sıcak yüzey + ince hairline kenar + yumuşak gölge.
 * Props: { children, style, gradientBorder=false, onPress }
 */
export default function Card({ children, style, gradientBorder = false, onPress }) {
  const content = gradientBorder ? (
    <LinearGradient
      colors={gradients.gold}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.border}
    >
      <View style={[styles.card, style]}>{children}</View>
    </LinearGradient>
  ) : (
    <View style={[styles.card, styles.hairline, style]}>{children}</View>
  );

  if (onPress) {
    return (
      <PressableScale onPress={onPress} style={styles.shadow}>
        {content}
      </PressableScale>
    );
  }
  return <View style={styles.shadow}>{content}</View>;
}

const styles = StyleSheet.create({
  shadow: { ...shadows.card, borderRadius: radii.lg },
  card: {
    backgroundColor: colors.creamHi,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  hairline: {
    borderWidth: 1,
    borderColor: colors.line,
  },
  border: {
    borderRadius: radii.lg + 2,
    padding: 1.5,
  },
});
