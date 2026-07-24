// components/toastConfig.js
// Heritage temalı react-native-toast-message konfigürasyonu.
// success / error / info — krem kart, hairline kenar, sol altın/kırmızı vurgu şeridi,
// Fraunces başlık (typography.h3) + Manrope gövde (typography.small).
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radii, spacing, typography, shadows } from '../theme/tokens';

const VARIANTS = {
  success: { accent: colors.gold, icon: 'check-decagram-outline' },
  error: { accent: colors.danger, icon: 'alert-circle-outline' },
  info: { accent: colors.brown, icon: 'information-outline' },
};

function ToastCard({ tone, text1, text2 }) {
  const v = VARIANTS[tone] || VARIANTS.info;
  return (
    <View style={styles.wrap}>
      <View style={[styles.card, shadows.raised]}>
        <View style={[styles.accent, { backgroundColor: v.accent }]} />
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons name={v.icon} size={20} color={v.accent} />
        </View>
        <View style={styles.textWrap}>
          {text1 ? (
            <Text style={styles.title} numberOfLines={2}>
              {text1}
            </Text>
          ) : null}
          {text2 ? (
            <Text style={styles.body} numberOfLines={3}>
              {text2}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

export const toastConfig = {
  success: (props) => (
    <ToastCard tone="success" text1={props.text1} text2={props.text2} />
  ),
  error: (props) => <ToastCard tone="error" text1={props.text1} text2={props.text2} />,
  info: (props) => <ToastCard tone="info" text1={props.text1} text2={props.text2} />,
};

export default toastConfig;

const styles = StyleSheet.create({
  wrap: {
    width: '92%',
    alignSelf: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.creamHi,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
    paddingVertical: spacing.md,
    paddingRight: spacing.lg,
  },
  accent: {
    width: 4,
    alignSelf: 'stretch',
    marginRight: spacing.md,
  },
  iconWrap: {
    marginTop: 1,
    marginRight: spacing.sm,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    ...typography.h3,
  },
  body: {
    ...typography.small,
    marginTop: 2,
  },
});
