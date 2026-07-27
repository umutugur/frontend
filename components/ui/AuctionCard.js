// components/ui/AuctionCard.js
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import PressableScale from './PressableScale';
import Badge from './Badge';
import { sizedImageUrl } from '../../utils/imageUrl';
import { colors, gradients, radii, shadows, spacing, typography } from '../../theme/tokens';

/**
 * AuctionCard — ana grid kartı.
 * Props: { item, onPress }
 *   item: { _id, images[], isSigned, title, currentPrice, startingPrice, seller:{companyName} }
 */
export default function AuctionCard({ item, onPress }) {
  // Kart ~173pt genişlikte → 400px retina için yeterli, 800px gereksiz veri.
  const imageUri = sizedImageUrl(item?.images?.[0], 400) || 'https://via.placeholder.com/300';
  const price = item?.currentPrice ?? item?.startingPrice ?? 0;
  const seller = item?.seller?.companyName || 'Firma Bilinmiyor';

  return (
    <PressableScale onPress={onPress} style={styles.shadow}>
      <View style={styles.card}>
        <View style={styles.imageWrapper}>
          <Image source={{ uri: imageUri }} style={styles.image} />
          <LinearGradient colors={gradients.scrim} style={styles.scrim} />
          {item?.isSigned ? (
            <View style={styles.badgeWrap}>
              <Badge label="Usta İmzalı" tone="signed" />
            </View>
          ) : null}
        </View>

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {item?.title}
          </Text>
          <Text style={styles.seller} numberOfLines={1}>
            {seller}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>GÜNCEL</Text>
            <Text style={styles.priceText}>
              {Number(price).toLocaleString('tr-TR')}₺
            </Text>
          </View>
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  shadow: { ...shadows.card, borderRadius: radii.lg },
  card: {
    backgroundColor: colors.creamHi,
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.line,
  },
  imageWrapper: {
    width: '100%',
    height: 158,
    position: 'relative',
    backgroundColor: '#efe3cd',
  },
  image: { width: '100%', height: '100%' },
  scrim: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '45%' },
  badgeWrap: { position: 'absolute', top: spacing.sm, left: spacing.sm },
  info: { padding: spacing.md },
  title: { ...typography.title, fontSize: 15, marginBottom: 2 },
  seller: { ...typography.small, marginBottom: spacing.sm },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  priceLabel: {
    ...typography.label,
    color: colors.muted,
    fontSize: 9,
  },
  priceText: { ...typography.price },
});
