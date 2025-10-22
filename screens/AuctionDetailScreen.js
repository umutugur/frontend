// screens/AuctionDetailScreen.js
import React, { useState, useEffect, useContext, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

const screenWidth = Dimensions.get('window').width;

export default function AuctionDetailScreen({ route }) {
  const { auctionId } = route.params;
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();

  const [auction, setAuction] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [selectedIncrement, setSelectedIncrement] = useState(10);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBidding, setIsBidding] = useState(false);

  const adUnitId = __DEV__
    ? TestIds.BANNER
    : 'ca-app-pub-4306778139267554/1985701713';

  // Auction bilgisi yükle
  const fetchAuction = async () => {
    try {
      const res = await fetch(`https://imame-backend.onrender.com/api/auctions/${auctionId}`);
      const data = await res.json();
      setAuction(data);
      setCurrentPrice(data.currentPrice || data.startingPrice);
    } catch (err) {
      Alert.alert('Hata', 'Mezat bilgisi alınamadı');
    } finally {
      setLoading(false);
    }
  };

  // Teklifler yükle
  const fetchBids = async () => {
    try {
      const res = await fetch(`https://imame-backend.onrender.com/api/bids/${auctionId}`);
      const data = await res.json();
      setBids(data);
    } catch (err) {
      Alert.alert('Hata', 'Teklifler yüklenemedi');
    }
  };

  useEffect(() => {
    fetchAuction();
    fetchBids();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Teklif verme
  const handleBid = async () => {
    if (!user || user.role !== 'buyer') {
      Alert.alert('Yetki Hatası', 'Sadece alıcılar teklif verebilir.');
      return;
    }
    if (!auction || auction.isEnded) {
      Alert.alert('Uyarı', 'Bu mezat sona ermiş.');
      return;
    }

    // Adres kontrolü
    if (
      !user.address ||
      !user.address.ilId ||
      !user.address.ilceId ||
      !user.address.mahalleId ||
      !user.address.sokak ||
      !user.address.apartmanNo ||
      !user.address.daireNo
    ) {
      Alert.alert(
        'Adres Gerekli',
        'Teklif verebilmek için profilinize adres bilgisi eklemelisiniz.',
        [
          { text: 'Profili Düzenle', onPress: () => navigation.navigate('EditProfile') },
          { text: 'İptal', style: 'cancel' },
        ]
      );
      return;
    }

    // Son teklifi veren kontrolü
    if (bids.length > 0) {
      const lastBidUserId = bids[0].user?._id;
      if (lastBidUserId === user._id) {
        Alert.alert('Hatalı İşlem', 'Son teklifi zaten siz verdiniz.');
        return;
      }
    }

    setIsBidding(true);
    try {
      const newAmount = currentPrice + selectedIncrement;
      const res = await fetch(`https://imame-backend.onrender.com/api/bids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auctionId, userId: user._id, amount: newAmount }),
      });

      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { throw new Error(text || 'Teklif yanıtı okunamadı'); }
      if (!res.ok) throw new Error(data.message || 'Teklif başarısız');

      Alert.alert('Tebrikler', `Yeni teklif verdiniz: ${newAmount}₺`);
      setCurrentPrice(newAmount);
      fetchBids();
    } catch (err) {
      Alert.alert('Hata', err.message);
    } finally {
      setIsBidding(false);
    }
  };

  // Chat başlatma
  const handleStartChat = async () => {
    if (!user || !user._id) {
      Alert.alert('Giriş gerekli', 'Mesajlaşmak için giriş yapın.');
      return;
    }
    try {
      const res = await fetch('https://imame-backend.onrender.com/api/chats/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auctionId, buyerId: user._id }),
      });

      const responseText = await res.text();
      let data;
      try { data = JSON.parse(responseText); } catch (e) { throw new Error('Yanıttan JSON okunamadı: ' + responseText); }
      if (!res.ok) throw new Error(data.message);

      navigation.navigate('Chat', { chatId: data.chat._id });
    } catch (err) {
      Alert.alert('Hata', err.message);
    }
  };

  // Satıcı profiline git
  const handleSellerPress = () => {
    const id = auction?.seller?._id || auction?.seller;
    if (!id) return;
    navigation.navigate('ProfileDetail', { userId: id });
  };

  const isBuyerWinner =
    user && user.role === 'buyer' && auction?.isEnded &&
    ((auction.winner && auction.winner._id === user._id) || auction.winner === user._id);

  const isSellerOfEnded =
    user &&
    user.role === 'seller' &&
    auction?.isEnded &&
    ((auction.seller && auction.seller._id === user._id) || auction.seller === user._id) &&
    auction.winner;

  // ---- HEADER BİLEŞENİ (ScrollView yerine ListHeaderComponent)
  const Header = useMemo(() => {
    if (!auction) return null;
    return (
      <View style={styles.headerWrap}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Görsel Galerisi - yatay FlatList */}
        <FlatList
          data={auction.images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <Image source={{ uri: item }} style={styles.sliderImage} />
          )}
          style={styles.sliderContainer}
        />

        {/* Bilgi kartı */}
        <View style={styles.infoCard}>
          <Text style={styles.title}>{auction.title}</Text>
          <TouchableOpacity onPress={handleSellerPress}>
            <Text style={styles.sellerBtn}>
              Satıcı: {auction.seller?.companyName || 'Bilinmiyor'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.description}>{auction.description}</Text>
        </View>

        {auction.isSigned && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>✒️ Usta İmzalı</Text>
          </View>
        )}

        {/* Fiyat */}
        <View style={styles.priceBox}>
          <Text style={styles.priceLabel}>Güncel Fiyat</Text>
          <Text style={styles.price}>{String(currentPrice)}₺</Text>
        </View>

        {/* Artış butonları (sadece buyer ve açıkken) */}
        {user && user.role === 'buyer' && !auction.isEnded && (
          <View style={styles.incrementContainer}>
            {[10, 20, 30, 40, 50].map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.incrementButton,
                  selectedIncrement === amount && styles.selectedIncrement,
                ]}
                onPress={() => setSelectedIncrement(amount)}
              >
                <Text style={styles.incrementText}>+{amount}₺</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Teklif Ver */}
        {user && user.role === 'buyer' && !auction.isEnded && (
          <TouchableOpacity
            style={[styles.bidButton, isBidding && { opacity: 0.7 }]}
            onPress={handleBid}
            disabled={isBidding}
          >
            <Text style={styles.bidButtonText}>
              {isBidding ? 'Gönderiliyor...' : 'Teklif Ver'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Chat */}
        {isBuyerWinner && auction.isEnded && (
          <TouchableOpacity style={styles.chatButton} onPress={handleStartChat}>
            <Text style={styles.chatButtonText}>Satıcıyla Mesajlaş</Text>
          </TouchableOpacity>
        )}
        {isSellerOfEnded && (
          <TouchableOpacity style={styles.chatButton} onPress={handleStartChat}>
            <Text style={styles.chatButtonText}>Kazanan Alıcıyla Mesajlaş</Text>
          </TouchableOpacity>
        )}

        {/* Liste başlığı */}
        <Text style={styles.bidsTitle}>Önceki Teklifler</Text>
      </View>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auction, currentPrice, selectedIncrement, isBidding, user]);

  if (loading || !auction) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6d4c41" />
      </View>
    );
  }

  return (
    <FlatList
      data={bids}
      keyExtractor={(item) => item._id}
      ListHeaderComponent={Header}
      renderItem={({ item }) => (
        <View style={styles.modernBidItem}>
          <View className="avatar" style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.user?.name?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bidUserModern}>{item.user?.name || 'Anonim'}</Text>
            <Text style={styles.bidDate}>
              {item.createdAt ? new Date(item.createdAt).toLocaleString('tr-TR') : ''}
            </Text>
          </View>
          <View style={styles.amountBadge}>
            <Text style={styles.amountBadgeText}>{item.amount}₺</Text>
          </View>
        </View>
      )}
      ListEmptyComponent={
        <Text style={{ color: '#4e342e', fontStyle: 'italic', paddingHorizontal: 16 }}>
          Henüz teklif yok.
        </Text>
      }
      ListFooterComponent={
        <View style={styles.adContainer}>
          <BannerAd
            unitId={adUnitId}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            requestOptions={{ requestNonPersonalizedAdsOnly: true }}
          />
        </View>
      }
      // iOS/Android otomatik inset davranışını kontrol et
      contentInsetAdjustmentBehavior="never"
      automaticallyAdjustContentInsets={false}
      contentContainerStyle={{ paddingBottom: Platform.select({ ios: 8, android: 8 }) }}
      style={{ backgroundColor: '#fff8e1' }}
    />
  );
}

const styles = StyleSheet.create({
  adContainer: {
    marginTop: 16,
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#fff',
    paddingBottom: 12,
  },
  headerWrap: { paddingHorizontal: 16, backgroundColor: '#fff8e1' },
  container: { padding: 16, backgroundColor: '#fff8e1' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff8e1' },
  logoContainer: { marginTop: -30, alignItems: 'center', marginBottom: 16 },
  logo: { width: 360, height: 120 },
  sliderContainer: { marginBottom: 12, marginTop: -50 },
  sliderImage: {
    width: screenWidth - 32,
    height: 240,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  infoCard: {
    backgroundColor: '#ffe0b2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#4e342e', marginBottom: 4 },
  sellerBtn: {
    fontSize: 16,
    color: '#1565c0',
    fontWeight: 'bold',
    marginBottom: 6,
    textDecorationLine: 'underline',
  },
  description: {
    fontSize: 15,
    color: '#4e342e',
    marginBottom: 4,
    marginTop: 4,
    lineHeight: 22,
  },
  badge: {
    backgroundColor: '#4e342e',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 10,
    marginLeft: 16,
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  priceBox: {
    backgroundColor: '#f5eee6',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  priceLabel: { color: '#6d4c41', fontSize: 14, fontWeight: '500', marginBottom: 3 },
  price: { fontSize: 22, fontWeight: 'bold', color: '#2e7d32' },
  incrementContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  incrementButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#d7ccc8',
    borderRadius: 8,
  },
  selectedIncrement: { backgroundColor: '#6d4c41' },
  incrementText: { color: '#fff', fontWeight: 'bold' },
  bidButton: {
    backgroundColor: '#4e342e',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  bidButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  chatButton: {
    backgroundColor: '#6d4c41',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  chatButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  bidsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4e342e',
    marginBottom: 8,
    marginTop: 8,
    paddingHorizontal: 0,
  },
  modernBidItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5eee6',
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 16,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#bca37f', alignItems: 'center', justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: { fontWeight: 'bold', color: '#fff', fontSize: 18 },
  bidUserModern: { fontWeight: 'bold', color: '#5d4037', fontSize: 15 },
  bidDate: { fontSize: 11, color: '#8d6e63' },
  amountBadge: {
    backgroundColor: '#4e342e',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  amountBadgeText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});