// components/ui/CountdownHero.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, fonts, gradients, radii, shadows, spacing, typography } from '../../theme/tokens';

/**
 * CountdownHero — bugünkü TR saatiyle `endsAtHour`:00'a geri sayan gradient başlık.
 * Props: { endsAtHour=22 }
 * Salt görsel — veri/istek yok. setInterval kullanır, unmount'ta temizler.
 * Not: Türkiye kalıcı olarak UTC+3'tür (yaz saati yok), bu yüzden ofset sabit.
 */
const TR_OFFSET_HOURS = 3;

function getRemaining(endsAtHour) {
  const nowMs = Date.now();
  // TR duvar saatini elde etmek için UTC'ye +3 saat kayan bir tarih.
  const shifted = new Date(nowMs + TR_OFFSET_HOURS * 3600 * 1000);
  const y = shifted.getUTCFullYear();
  const mo = shifted.getUTCMonth();
  const d = shifted.getUTCDate();
  // Hedef TR duvar saati = bugün endsAtHour:00 → UTC olarak (endsAtHour - 3):00.
  const targetUtcMs = Date.UTC(y, mo, d, endsAtHour - TR_OFFSET_HOURS, 0, 0, 0);
  let diff = targetUtcMs - nowMs;
  let tomorrow = false;
  if (diff < 0) {
    // Bugünkü bitiş geçti → yarına sar.
    diff += 24 * 3600 * 1000;
    tomorrow = true;
  }
  return { ms: diff, tomorrow };
}

function format(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return { h: pad(h), m: pad(m), s: pad(s) };
}

export default function CountdownHero({ endsAtHour = 22 }) {
  const [remaining, setRemaining] = useState(() => getRemaining(endsAtHour));

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(getRemaining(endsAtHour));
    }, 1000);
    return () => clearInterval(id);
  }, [endsAtHour]);

  const { h, m, s } = format(remaining.ms);
  const dayLabel = remaining.tomorrow ? 'yarın' : 'bugün';

  const Unit = ({ value, unitLabel }) => (
    <View style={styles.unit}>
      <Text style={styles.unitValue}>{value}</Text>
      <Text style={styles.unitLabel}>{unitLabel}</Text>
    </View>
  );

  return (
    <LinearGradient
      colors={gradients.heroDark}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.hero}
    >
      <View style={styles.header}>
        <MaterialCommunityIcons name="gavel" size={20} color={colors.cream} />
        <Text style={styles.heading}>Mezatlar {dayLabel} {endsAtHour}:00'de bitiyor</Text>
      </View>

      <View style={styles.timer}>
        <Unit value={h} unitLabel="saat" />
        <Text style={styles.colon}>:</Text>
        <Unit value={m} unitLabel="dk" />
        <Text style={styles.colon}>:</Text>
        <Unit value={s} unitLabel="sn" />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: radii.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.raised,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  heading: {
    ...typography.h3,
    color: colors.cream,
    marginLeft: spacing.sm,
    flexShrink: 1,
  },
  timer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unit: {
    alignItems: 'center',
    minWidth: 56,
  },
  unitValue: {
    fontSize: 32,
    fontFamily: fonts.extrabold,
    color: colors.white,
    fontVariant: ['tabular-nums'],
  },
  unitLabel: {
    ...typography.label,
    color: colors.cream,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  colon: {
    fontSize: 28,
    fontFamily: fonts.extrabold,
    color: 'rgba(255,255,255,0.6)',
    marginHorizontal: spacing.xs,
    marginBottom: spacing.md,
  },
});
