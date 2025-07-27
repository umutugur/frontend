import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
// ✅ AdMob bileşenleri eklendi
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

export default function FavoritesScreen() {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const adUnitId = __DEV__
    ? TestIds.BANNER
    : 'ca-app-pub-4306778139267554/1985701713';

  useEffect(() => {
    if (user?._id) {
      fetchFavoriteAuctions();
    }
  }, [user]);

  const fetchFavoriteAuctions = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`https://imame-backend.onrender.com/api/auctions/favorites/${user._id}`);
      setAuctions(res.data);
    } catch (err) {
      setAuctions([]);
    }
    setLoading(false);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('AuctionDetail', { auctionId: item._id })}
    >
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: item.images?.[0] || 'https://via.placeholder.com/200' }}
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
        <Text style={styles.price}>{item.currentPrice || item.startingPrice}₺</Text>
        <Text style={styles.seller}>
          {item.seller?.companyName || item.seller?.name || 'Firma Bilinmiyor'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#6d4c41" />
        <Text>Favori satıcıların mezatları yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={auctions}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Favori satıcıların aktif mezatı yok.</Text>}
      />
      {/* REKLAM */}
        <View style={styles.adContainer}>
          <BannerAd
            unitId={adUnitId}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            requestOptions={{ requestNonPersonalizedAdsOnly: true }}
          />
        </View>
    </View>   
  );
  
}

const styles = StyleSheet.create({
   adContainer: {
    marginTop: 16,
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#fff',
    // Eğer hala kenarlardan taşıyorsa:
    paddingHorizontal: 0,
    paddingBottom: 12,
  },
  container: { flex: 1, backgroundColor: '#fff8e1' },
  list: { padding: 12, paddingBottom: 80 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#4e342e', marginBottom: 10 },
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
    position: 'absolute', top: 6, right: 6, backgroundColor: '#4e342e',
    paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, maxWidth: '90%',
  },
  ribbonText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  info: { padding: 8 },
  price: { fontSize: 13, color: '#2e7d32', marginTop: 4, fontWeight: 'bold' },
  title: { fontSize: 14, fontWeight: 'bold', color: '#4e342e' },
  seller: { fontSize: 12, color: '#6d4c41', marginTop: 2 },
  empty: { marginTop: 50, textAlign: 'center', color: '#888' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
