// components/ui/Card.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import PressableScale from './PressableScale';
import { colors, gradients, radii, shadows, spacing } from '../../theme/tokens';

/**
 * Card — derinlikli yüzey (gölge + radius). Opsiyonel gradient kenar ve dokunma.
 * Props: { children, style, gradientBorder=false, onPress }
 */
export default function Card({ children, style, gradientBorder = false, onPress }) {
  const inner = (
    <View style={[styles.card, style]}>{children}</View>
  );

  const content = gradientBorder ? (
    <LinearGradient
      colors={gradients.goldToBrown}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.border}
    >
      <View style={[styles.card, styles.innerOnBorder, style]}>{children}</View>
    </LinearGradient>
  ) : (
    inner
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
  shadow: {
    ...shadows.card,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  border: {
    borderRadius: radii.lg + 2,
    padding: 2,
  },
  innerOnBorder: {
    borderRadius: radii.lg,
  },
});
