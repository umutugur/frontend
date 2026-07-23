// components/ui/GradientButton.js
import React from 'react';
import { Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import PressableScale from './PressableScale';
import { colors, gradients, radii, spacing, typography } from '../../theme/tokens';

/**
 * GradientButton — gradient dolgulu, press-scale animasyonlu, loading destekli buton.
 * Props: { title, onPress, loading, disabled, variant='primary', icon, style }
 *   variant: 'primary' (goldToBrown) | 'secondary' (heroDark) | 'danger' (düz danger)
 *   icon: Ionicons adı (string) — opsiyonel, başlığın soluna yerleşir.
 */
const VARIANT_GRADIENTS = {
  primary: gradients.goldToBrown,
  secondary: gradients.heroDark,
  danger: [colors.danger, '#8e1c1c'],
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
  const isDisabled = disabled || loading;
  const gradientColors = VARIANT_GRADIENTS[variant] || VARIANT_GRADIENTS.primary;

  return (
    <PressableScale
      onPress={onPress}
      disabled={isDisabled}
      style={[styles.wrapper, isDisabled && styles.disabled, style]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <View style={styles.content}>
            {icon ? (
              <Ionicons
                name={icon}
                size={18}
                color={colors.white}
                style={styles.icon}
              />
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
  wrapper: {
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  disabled: {
    opacity: 0.6,
  },
  gradient: {
    minHeight: 50,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.white,
  },
});
