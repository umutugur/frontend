// components/ui/GradientButton.js
import React from 'react';
import { Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import PressableScale from './PressableScale';
import { colors, gradients, radii, spacing, typography, shadows } from '../../theme/tokens';

/**
 * GradientButton — gradient dolgulu, üst sheen'li, gölgeli buton.
 * Props: { title, onPress, loading, disabled, variant='primary'|'secondary'|'danger', icon, style }
 */
const VARIANTS = {
  primary: { grad: gradients.goldToBrown, shadow: shadows.gold },
  gold: { grad: gradients.gold, shadow: shadows.gold },
  secondary: { grad: gradients.heroDark, shadow: shadows.card },
  danger: { grad: ['#d0503f', '#a5271a'], shadow: shadows.card },
};

export default function GradientButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  icon,
  style,
}) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const isOff = disabled || loading;

  return (
    <PressableScale
      onPress={onPress}
      disabled={isOff}
      style={[!isOff && v.shadow, style]}
    >
      <LinearGradient
        colors={isOff ? [colors.muted, colors.brown] : v.grad}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <LinearGradient colors={gradients.sheen} style={styles.sheen} pointerEvents="none" />
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <View style={styles.content}>
            {icon ? (
              <Ionicons name={icon} size={18} color={colors.white} style={styles.icon} />
            ) : null}
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          </View>
        )}
      </LinearGradient>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  gradient: {
    minHeight: 54,
    borderRadius: radii.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sheen: { position: 'absolute', top: 0, left: 0, right: 0, height: '55%' },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  icon: { marginRight: spacing.sm },
  title: { ...typography.button },
});
