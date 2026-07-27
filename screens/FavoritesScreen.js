import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import * as AppleAuthentication from 'expo-apple-authentication';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

import { Screen, AuctionCard, EmptyState, GradientButton, Skeleton } from '../components/ui';
import InlineBannerAd from '../components/InlineBannerAd';
import { buildFeed } from './HomeScreen';
import { colors, spacing, radii, shadows } from '../theme/tokens';

// Yükleniyor durumunda AuctionCard boyutlarını taklit eden iskelet kart.
function AuctionCardSkeleton() {
  return (
    <View style={styles.skeletonCard}>
      <Skeleton height={158} radius={0} style={styles.skeletonImage} />
      <View style={styles.skeletonInfo}>
        <Skeleton height={14} width="80%" style={styles.skeletonLine} />
        <Skeleton height={11} width="55%" style={styles.skeletonLine} />
        <Skeleton height={14} width="40%" />
      </View>
    </View>
  );
}

export default function FavoritesScreen() {
  const navigation = useNavigation();
  const { user, promptGoogle, loginWithApple, logout } = useContext(AuthContext);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appleAvail, setAppleAvail] = useState(false);

  const adUnitId = __DEV__
    ? TestIds.BANNER
    : 'ca-app-pub-4306778139267554/1985701713';

  useEffect(() => {
    if (Platform.OS === 'ios') {
      AppleAuthentication.isAvailableAsync()
        .then(setAppleAvail)
        .catch(() => setAppleAvail(false));
    }
  }, []);

  useEffect(() => {
    if (user?._id) fetchFavoriteAuctions();
    else {
      setAuctions([]);
      setLoading(false);
    }
  }, [user]);

  const fetchFavoriteAuctions = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `https://imame-backend.onrender.com/api/auctions/favorites/${user._id}`
      );
      setAuctions(res.data);
    } catch {
      setAuctions([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Screen>
        <View style={styles.list}>
          {[0, 1, 2].map((row) => (
            <View key={row} style={styles.row}>
              <View style={styles.cardCol}>
                <AuctionCardSkeleton />
              </View>
              <View style={styles.cardCol}>
                <AuctionCardSkeleton />
              </View>
            </View>
          ))}
        </View>
      </Screen>
    );
  }

  const isGuest = !user?._id || user?.role === 'guest';

  return (
    <Screen>
      {/* Misafir görünümü */}
      {isGuest ? (
        <View style={styles.centeredWrapper}>
          <View style={styles.ctaContainer}>
            <EmptyState
              icon="heart-outline"
              title="Favori mezatlar"
              message="Favori satıcıların mezatlarını görmek için giriş yapın."
            />

            <View style={styles.ctaButtons}>
              <GradientButton
                title="Giriş / Kayıt"
                icon="log-in-outline"
                onPress={logout}
                style={styles.ctaButton}
              />
              <GradientButton
                title="Google ile Giriş Yap"
                icon="logo-google"
                variant="secondary"
                onPress={() => promptGoogle?.()}
                style={styles.ctaButton}
              />
              {appleAvail && (
                <GradientButton
                  title="Apple ile Giriş Yap"
                  icon="logo-apple"
                  variant="secondary"
                  onPress={() => loginWithApple?.()}
                  style={styles.ctaButton}
                />
              )}
            </View>
          </View>

          {/* Reklam en altta */}
          <View style={styles.adContainer}>
            <BannerAd
              unitId={adUnitId}
              size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
              requestOptions={{ requestNonPersonalizedAdsOnly: true }}
            />
          </View>
        </View>
      ) : (
        <FlatList
          data={buildFeed(auctions)}
          renderItem={({ item }) => {
            if (item.type === 'ad') return <InlineBannerAd />;
            return (
              <View style={styles.row}>
                {item.items.map((auction) => (
                  <View key={auction._id} style={styles.cardCol}>
                    <AuctionCard
                      item={auction}
                      onPress={() =>
                        navigation.navigate('AuctionDetail', { auctionId: auction._id })
                      }
                    />
                  </View>
                ))}
                {item.items.length < 2 ? <View style={styles.cardCol} /> : null}
              </View>
            );
          }}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="heart-off-outline"
              title="Favori mezat yok"
              message="Favori satıcıların şu an aktif mezatı bulunmuyor."
            />
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  centeredWrapper: {
    flex: 1,
    justifyContent: 'space-between',
  },
  ctaContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  ctaButtons: {
    marginTop: spacing.lg,
  },
  ctaButton: {
    marginBottom: spacing.md,
  },
  adContainer: {
    alignItems: 'center',
    width: '100%',
    backgroundColor: colors.white,
    paddingVertical: spacing.sm,
  },
  list: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl * 2.5,
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardCol: {
    width: '48%',
    marginBottom: spacing.lg,
  },
  skeletonCard: {
    backgroundColor: colors.creamHi,
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.line,
    ...shadows.card,
  },
  skeletonImage: {
    width: '100%',
  },
  skeletonInfo: {
    padding: spacing.md,
  },
  skeletonLine: {
    marginBottom: spacing.sm,
  },
});
