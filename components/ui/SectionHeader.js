// components/ui/SectionHeader.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import PressableScale from './PressableScale';
import { colors, spacing, typography } from '../../theme/tokens';

/**
 * SectionHeader — bölüm başlığı + opsiyonel aksiyon ("tümü" gibi).
 * Props: { title, actionLabel, onAction }
 */
export default function SectionHeader({ title, actionLabel, onAction }) {
  return (
    <View style={styles.row}>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      {actionLabel && onAction ? (
        <PressableScale onPress={onAction} style={styles.action}>
          <Text style={styles.actionText}>{actionLabel}</Text>
          <Feather name="chevron-right" size={16} color={colors.brown} />
        </PressableScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.brownDark,
    flexShrink: 1,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.sm,
  },
  actionText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.brown,
    marginRight: 2,
  },
});
