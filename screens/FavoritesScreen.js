import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import * as AppleAuthentication from 'expo-apple-authentication';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

import { Screen, AuctionCard, EmptyState, GradientButton } from '../components/ui';
import { colors, spacing, typography } from '../theme/tokens';

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
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.brown} />
          <Text style={styles.loadingText}>
            Favori satıcıların mezatları yükleniyor...
          </Text>
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
        <>
          <FlatList
            data={auctions}
            renderItem={({ item }) => (
              <View style={styles.cardCol}>
                <AuctionCard
                  item={item}
                  onPress={() =>
                    navigation.navigate('AuctionDetail', { auctionId: item._id })
                  }
                />
              </View>
            )}
            keyExtractor={(item) => item._id}
            numColumns={2}
            columnWrapperStyle={styles.column}
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
          <View style={styles.adContainer}>
            <BannerAd
              unitId={adUnitId}
              size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
              requestOptions={{ requestNonPersonalizedAdsOnly: true }}
            />
          </View>
        </>
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
  column: {
    justifyContent: 'space-between',
  },
  cardCol: {
    width: '48%',
    marginBottom: spacing.lg,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  loadingText: {
    ...typography.body,
    color: colors.brown,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
