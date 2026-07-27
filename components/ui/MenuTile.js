// components/ui/MenuTile.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Feather } from '@expo/vector-icons';
import PressableScale from './PressableScale';
import { colors, gradients, radii, shadows, spacing, typography } from '../../theme/tokens';

/**
 * MenuTile — tam genişlik menü satırı (ikon + başlık + opsiyonel alt metin + chevron).
 * Uzun etiketlerde dar sütun/harf kırılması sorunu yaşamaz.
 * Props: { icon (Ionicons adı), title, subtitle, onPress, tone='default'|'danger' }
 */
export default function MenuTile({ icon, title, subtitle, onPress, tone = 'default' }) {
  const grad = tone === 'danger' ? ['#d0503f', '#a5271a'] : gradients.goldToBrown;

  return (
    <PressableScale onPress={onPress} style={styles.shadow}>
      <View style={styles.tile}>
        <LinearGradient
          colors={grad}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconChip}
        >
          <Ionicons name={icon} size={22} color={colors.white} />
        </LinearGradient>

        <View style={styles.textCol}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        <Feather name="chevron-right" size={20} color={colors.muted} />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  shadow: { ...shadows.soft, borderRadius: radii.lg, marginBottom: spacing.md },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.creamHi,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.md,
  },
  iconChip: {
    width: 46,
    height: 46,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  textCol: { flex: 1, paddingRight: spacing.sm },
  title: { ...typography.title, fontSize: 15 },
  subtitle: { ...typography.small, marginTop: 1 },
});
