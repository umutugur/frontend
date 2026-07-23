// components/NativeAdCard.js
// AdMob "Yerel gelişmiş" (Native advanced) reklamı — bir mezat kartı gibi çizilir.
// useNativeAds(): ekran başında birkaç reklamı ÖN-YÜKLER; yalnızca yüklenenler
// listeye slot olarak eklenir → feed'de asla boş hücre kalmaz.
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  NativeAd,
  NativeAdView,
  NativeAsset,
  NativeAssetType,
  NativeMediaView,
  TestIds,
} from 'react-native-google-mobile-ads';
import { colors, radii, shadows, spacing, typography, fonts } from '../theme/tokens';

// TODO: AdMob'da "Yerel gelişmiş" birimi oluşturunca gerçek ID'yi buraya yaz.
const NATIVE_AD_UNIT_ID = 'ca-app-pub-4306778139267554/XXXXXXXXXX';
const UNIT_ID = __DEV__ ? TestIds.NATIVE : NATIVE_AD_UNIT_ID;

/**
 * useNativeAds(count) — `count` kadar native reklamı ön-yükler.
 * Yalnızca başarıyla yüklenenleri döndürür (fill yoksa/geçersiz birimse boş dizi).
 */
export function useNativeAds(count = 3) {
  const [ads, setAds] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const loaded = [];

    (async () => {
      for (let i = 0; i < count; i++) {
        try {
          const ad = await NativeAd.createForAdRequest(UNIT_ID, {
            requestNonPersonalizedAdsOnly: true,
          });
          if (cancelled) {
            ad.destroy?.();
            return;
          }
          loaded.push(ad);
          setAds([...loaded]);
        } catch (e) {
          // fill yok / geçersiz birim → sessizce atla
        }
      }
    })();

    return () => {
      cancelled = true;
      loaded.forEach((a) => a.destroy?.());
    };
  }, [count]);

  return ads;
}

/**
 * interleaveAds — kart listesine yüklenen native reklamları serpiştirir (gap-free).
 * Her `gap` karttan sonra, elde reklam varsa bir { type:'ad' } öğesi ekler.
 */
export function interleaveAds(items, ads, gap = 6) {
  const out = [];
  let adIdx = 0;
  items.forEach((it, i) => {
    out.push(it);
    if ((i + 1) % gap === 0 && adIdx < ads.length) {
      out.push({ type: 'ad', _id: `ad-${adIdx}`, nativeAd: ads[adIdx] });
      adIdx += 1;
    }
  });
  return out;
}

/**
 * NativeAdCard — AuctionCard ile aynı görünümde native reklam kartı.
 * Props: { nativeAd } (useNativeAds'ten gelen yüklü reklam)
 */
export default function NativeAdCard({ nativeAd }) {
  if (!nativeAd) return null;
  const advertiser = nativeAd.advertiser || nativeAd.store || 'Sponsorlu içerik';

  return (
    <View style={styles.shadow}>
      <NativeAdView nativeAd={nativeAd} style={styles.card}>
        <View style={styles.imageWrap}>
          <NativeMediaView resizeMode="cover" style={styles.media} />
          <View style={styles.sponsor}>
            <Text style={styles.sponsorText}>SPONSORLU</Text>
          </View>
        </View>

        <View style={styles.info}>
          <NativeAsset assetType={NativeAssetType.HEADLINE}>
            <Text style={styles.title} numberOfLines={1}>
              {nativeAd.headline}
            </Text>
          </NativeAsset>

          <NativeAsset assetType={NativeAssetType.ADVERTISER}>
            <Text style={styles.advertiser} numberOfLines={1}>
              {advertiser}
            </Text>
          </NativeAsset>

          <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
            <View style={styles.cta}>
              <Text style={styles.ctaText} numberOfLines={1}>
                {nativeAd.callToAction || 'İncele'}
              </Text>
            </View>
          </NativeAsset>
        </View>
      </NativeAdView>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: { ...shadows.card, borderRadius: radii.lg },
  card: {
    backgroundColor: colors.creamHi,
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.gold,
  },
  // AuctionCard ile aynı görsel yüksekliği (grid hizası). AdMob kuralları:
  // (1) video gösteren MediaView >= 120x120 pt — hücre ~173x158, üstünde.
  // (2) tüm asset sınırları NativeAdView içinde kalmalı → overflow:'hidden' ile kırpılır.
  imageWrap: {
    width: '100%',
    height: 158,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#efe3cd',
  },
  // Açık sayısal yükseklik + tam genişlik: NativeMediaView'ın kendi aspectRatio'su
  // devreye girip taşmasın diye iki boyut da veriliyor.
  media: { width: '100%', height: 158 },
  sponsor: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: 'rgba(58,36,28,0.92)',
    borderRadius: radii.pill,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
  },
  sponsorText: { fontFamily: fonts.bold, fontSize: 9, letterSpacing: 1, color: colors.goldLight },
  info: { padding: spacing.md },
  title: { ...typography.title, fontSize: 15, marginBottom: 2 },
  advertiser: { ...typography.small, marginBottom: spacing.sm },
  cta: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(161,116,59,0.14)',
    borderRadius: radii.pill,
    paddingVertical: 5,
    paddingHorizontal: spacing.md,
  },
  ctaText: { fontFamily: fonts.extrabold, fontSize: 12, color: colors.gold },
});
