// components/ui/Badge.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radii, spacing, fonts } from '../../theme/tokens';

/**
 * Badge — durum/etiket rozeti.
 * Props: { label, tone='signed'|'pending'|'approved'|'rejected'|'neutral', icon }
 */
const TONES = {
  signed: { bg: 'rgba(58,36,28,0.92)', fg: colors.goldLight, icon: 'seal-variant' },
  pending: { bg: '#fbefd0', fg: '#8a5a12', icon: 'clock-outline' },
  approved: { bg: colors.priceGreenBg, fg: '#1f6b23', icon: 'check-circle-outline' },
  rejected: { bg: colors.dangerBg, fg: colors.danger, icon: 'close-circle-outline' },
  neutral: { bg: 'rgba(78,52,46,0.08)', fg: colors.brown, icon: 'tag-outline' },
};

export default function Badge({ label, tone = 'neutral', icon }) {
  const t = TONES[tone] || TONES.neutral;
  const iconName = icon || t.icon;

  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      {iconName ? (
        <MaterialCommunityIcons name={iconName} size={13} color={t.fg} style={styles.icon} />
      ) : null}
      <Text style={[styles.label, { color: t.fg }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 5,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: radii.pill,
  },
  icon: { marginRight: 4 },
  label: {
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 0.6,
  },
});
