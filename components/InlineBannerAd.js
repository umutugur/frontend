// components/InlineBannerAd.js
// Feed içinde, mezat satırları arasına giren tam genişlik banner reklam.
// Yüklenemezse KENDİNİ GİZLER → listede boş bir satır/boşluk kalmaz.
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { colors, radii, spacing, fonts } from '../theme/tokens';

const AD_UNIT_ID = __DEV__ ? TestIds.BANNER : 'ca-app-pub-4306778139267554/1985701713';

export default function InlineBannerAd() {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>REKLAM</Text>
      <BannerAd
        unitId={AD_UNIT_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        onAdFailedToLoad={() => setFailed(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: colors.creamHi,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 9,
    letterSpacing: 1.2,
    color: colors.muted,
    marginBottom: spacing.xs,
  },
});
