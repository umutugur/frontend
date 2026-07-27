// components/ui/ScreenHeader.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import PressableScale from './PressableScale';
import { colors, gradients, radii, spacing, typography, shadows } from '../../theme/tokens';

/**
 * ScreenHeader — heritage başlık + GERİ butonu. Push edilen tüm ekranların üstünde kullanılır.
 * Props: { title, subtitle, onBack, right, variant='plain'|'hero', showBack=true }
 *   variant 'plain': krem üzerinde daire geri butonu + serif başlık + altın hairline.
 *   variant 'hero' : koyu gradient bant + geri butonu + büyük serif başlık + süsleme.
 */
export default function ScreenHeader({
  title,
  subtitle,
  onBack,
  right,
  variant = 'plain',
  showBack = true,
}) {
  const navigation = useNavigation();
  const goBack = onBack || (() => navigation.goBack());

  if (variant === 'hero') {
    return (
      <LinearGradient
        colors={gradients.heroDark}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, shadows.card]}
      >
        <LinearGradient colors={gradients.sheen} style={styles.heroSheen} pointerEvents="none" />
        <View style={styles.heroTop}>
          {showBack ? (
            <PressableScale style={styles.backHero} onPress={goBack}>
              <Ionicons name="chevron-back" size={22} color={colors.creamHi} />
            </PressableScale>
          ) : (
            <View style={styles.slot} />
          )}
          <View style={styles.slot}>{right}</View>
        </View>
        <Text style={styles.heroTitle} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={styles.heroSub} numberOfLines={1}>{subtitle}</Text> : null}
        <View style={styles.orn}>
          <View style={styles.ornLine} />
          <View style={styles.ornDiamond} />
          <View style={styles.ornLine} />
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.plain}>
      {showBack ? (
        <PressableScale style={styles.back} onPress={goBack}>
          <Ionicons name="chevron-back" size={22} color={colors.brownDark} />
        </PressableScale>
      ) : (
        <View style={styles.back} />
      )}
      <View style={styles.titleWrap}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={styles.sub} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      <View style={styles.back}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  // plain
  plain: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.creamHi,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  titleWrap: { flex: 1, alignItems: 'center', paddingHorizontal: spacing.sm },
  title: { ...typography.h2, textAlign: 'center' },
  sub: { ...typography.small, textAlign: 'center', marginTop: 1 },

  // hero
  hero: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderBottomLeftRadius: radii.xl,
    borderBottomRightRadius: radii.xl,
    alignItems: 'center',
    overflow: 'hidden',
  },
  heroSheen: { position: 'absolute', top: 0, left: 0, right: 0, height: '55%' },
  heroTop: { flexDirection: 'row', alignSelf: 'stretch', justifyContent: 'space-between', marginBottom: spacing.sm },
  backHero: {
    width: 42,
    height: 42,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,251,240,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(216,178,90,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slot: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  heroTitle: { ...typography.h1, color: colors.creamHi, textAlign: 'center' },
  heroSub: { ...typography.body, color: 'rgba(255,247,234,0.7)', textAlign: 'center', marginTop: 2 },
  orn: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
  ornLine: { width: 30, height: 1, backgroundColor: 'rgba(216,178,90,0.5)' },
  ornDiamond: { width: 6, height: 6, backgroundColor: colors.goldLight, transform: [{ rotate: '45deg' }], marginHorizontal: spacing.sm },
});
