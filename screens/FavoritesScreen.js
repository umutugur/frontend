import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import * as AppleAuthentication from 'expo-apple-authentication';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

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
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#6d4c41" />
        <Text>Favori satıcıların mezatları yükleniyor...</Text>
      </View>
    );
  }

  const isGuest = !user?._id || user?.role === 'guest';

  return (
    <View style={styles.container}>
      {/* Misafir görünümü */}
      {isGuest ? (
        <View style={styles.centeredWrapper}>
          <View style={styles.ctaContainer}>
            <Text style={styles.helperText}>
              Favori satıcıların mezatlarını görmek için giriş yapın.
            </Text>

            <TouchableOpacity style={styles.primaryBtn} onPress={logout}>
              <Text style={styles.primaryBtnText}>Giriş / Kayıt</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.outlineBtn}
              onPress={() => promptGoogle?.()}
            >
              <Text style={styles.outlineBtnText}>Google ile Giriş Yap</Text>
            </TouchableOpacity>

            {appleAvail && (
              <TouchableOpacity
                style={styles.appleBtn}
                onPress={() => loginWithApple?.()}
              >
                <Text style={styles.appleBtnText}>Apple ile Giriş Yap</Text>
              </TouchableOpacity>
            )}
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
              <TouchableOpacity
                style={styles.card}
                onPress={() =>
                  navigation.navigate('AuctionDetail', { auctionId: item._id })
                }
              >
                <View style={styles.imageWrapper}>
                  <Image
                    source={{
                      uri: item.images?.[0] || 'https://via.placeholder.com/200',
                    }}
                    style={styles.image}
                  />
                  {item.isSigned && (
                    <View style={styles.ribbon}>
                      <Text style={styles.ribbonText}>✒️ Usta İmzalı</Text>
                    </View>
                  )}
                </View>
                <View style={styles.info}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.price}>
                    {item.currentPrice || item.startingPrice}₺
                  </Text>
                  <Text style={styles.seller}>
                    {item.seller?.companyName ||
                      item.seller?.name ||
                      'Firma Bilinmiyor'}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item._id}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <Text style={styles.empty}>Favori satıcıların aktif mezatı yok.</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff8e1' },

  centeredWrapper: {
    flex: 1,
    justifyContent: 'space-between', // ortadaki butonlar ortalanır, reklam alta gider
  },
  ctaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  helperText: {
    color: '#6d4c41',
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 15,
  },
  primaryBtn: {
    width: '100%',
    height: 50,
    borderRadius: 10,
    backgroundColor: '#6d4c41',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  outlineBtn: {
    width: '100%',
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#b5a16b',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  outlineBtnText: { color: '#4e342e', fontWeight: '700', fontSize: 16 },
  appleBtn: {
    width: '100%',
    height: 50,
    borderRadius: 10,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appleBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  adContainer: {
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#fff',
    paddingVertical: 8,
  },

  list: { padding: 12, paddingBottom: 80 },
  card: {
    backgroundColor: '#fff',
    width: '48%',
    borderRadius: 10,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
  },
  imageWrapper: { position: 'relative', width: '100%', height: 140 },
  image: { width: '100%', height: '100%' },
  ribbon: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#4e342e',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    maxWidth: '90%',
  },
  ribbonText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  info: { padding: 8 },
  price: { fontSize: 13, color: '#2e7d32', marginTop: 4, fontWeight: 'bold' },
  title: { fontSize: 14, fontWeight: 'bold', color: '#4e342e' },
  seller: { fontSize: 12, color: '#6d4c41', marginTop: 2 },
  empty: { marginTop: 50, textAlign: 'center', color: '#888' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});