// components/ui/AuctionCard.js
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import PressableScale from './PressableScale';
import Badge from './Badge';
import { colors, gradients, radii, shadows, spacing, typography } from '../../theme/tokens';

/**
 * AuctionCard — ana grid kartı.
 * Props: { item, onPress }
 *   item: { _id, images[], isSigned, title, currentPrice, startingPrice, seller:{companyName} }
 * Görsel + "Usta İmzalı" Badge + başlık + yeşil fiyat pill + satıcı firması.
 */
export default function AuctionCard({ item, onPress }) {
  const imageUri = item?.images?.[0] || 'https://via.placeholder.com/300';
  const price = item?.currentPrice ?? item?.startingPrice ?? 0;
  const seller = item?.seller?.companyName || 'Firma Bilinmiyor';

  return (
    <PressableScale onPress={onPress} style={styles.shadow}>
      <View style={styles.card}>
        <View style={styles.imageWrapper}>
          <Image source={{ uri: imageUri }} style={styles.image} />
          {/* Alt gradient scrim — başlık okunurluğu için */}
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

          <View style={styles.pricePill}>
            <Text style={styles.priceText}>{price}₺</Text>
          </View>

          <Text style={styles.seller} numberOfLines={1}>
            {seller}
          </Text>
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  shadow: {
    ...shadows.card,
    borderRadius: radii.lg,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  imageWrapper: {
    width: '100%',
    height: 150,
    position: 'relative',
    backgroundColor: colors.line,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '45%',
  },
  badgeWrap: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  info: {
    padding: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.brownDark,
    marginBottom: spacing.sm,
  },
  pricePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(46,125,50,0.12)',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.pill,
    marginBottom: spacing.xs,
  },
  priceText: {
    ...typography.price,
  },
  seller: {
    ...typography.label,
    color: colors.brown,
  },
});
