// components/ui/Badge.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radii, spacing, typography } from '../../theme/tokens';

/**
 * Badge — durum/etiket rozeti.
 * Props: { label, tone='signed'|'pending'|'approved'|'rejected'|'neutral', icon }
 *   icon: MaterialCommunityIcons adı (string) — opsiyonel; verilmezse tone'a göre
 *         mantıklı bir varsayılan ikon seçilir.
 */
const TONES = {
  signed: { bg: '#4e342e', fg: '#fff', icon: 'seal-variant' },
  pending: { bg: '#f9a825', fg: '#4e342e', icon: 'clock-outline' },
  approved: { bg: '#2e7d32', fg: '#fff', icon: 'check-circle-outline' },
  rejected: { bg: '#c62828', fg: '#fff', icon: 'close-circle-outline' },
  neutral: { bg: 'rgba(78,52,46,0.10)', fg: '#4e342e', icon: 'tag-outline' },
};

export default function Badge({ label, tone = 'neutral', icon }) {
  const t = TONES[tone] || TONES.neutral;
  const iconName = icon || t.icon;

  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      {iconName ? (
        <MaterialCommunityIcons
          name={iconName}
          size={13}
          color={t.fg}
          style={styles.icon}
        />
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
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.pill,
  },
  icon: {
    marginRight: 4,
  },
  label: {
    ...typography.label,
    fontWeight: '700',
  },
});
