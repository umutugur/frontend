// screens/AuctionDetailScreen.js
import React, { useState, useEffect, useContext, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { useNavigation } from '@react-navigation/native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

import { Screen, ScreenHeader, Card, Badge, GradientButton, OrnamentDivider, PressableScale } from '../components/ui';
import { colors, gradients, radii, shadows, spacing, typography } from '../theme/tokens';

const screenWidth = Dimensions.get('window').width;

export default function AuctionDetailScreen({ route }) {
  const { auctionId } = route.params;
  const { user } = useContext(AuthContext);
  const { showAlert } = useAlert();
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
      showAlert({ title: 'Hata', message: 'Mezat bilgisi alınamadı' });
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
      showAlert({ title: 'Hata', message: 'Teklifler yüklenemedi' });
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
      showAlert({ title: 'Yetki Hatası', message: 'Sadece alıcılar teklif verebilir.' });
      return;
    }
    if (!auction || auction.isEnded) {
      showAlert({ title: 'Uyarı', message: 'Bu mezat sona ermiş.' });
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
      showAlert({
        title: 'Adres Gerekli',
        message: 'Teklif verebilmek için profilinize adres bilgisi eklemelisiniz.',
        buttons: [
          { text: 'Profili Düzenle', onPress: () => navigation.navigate('EditProfile') },
          { text: 'İptal', style: 'cancel' },
        ],
      });
      return;
    }

    // Son teklifi veren kontrolü
    if (bids.length > 0) {
      const lastBidUserId = bids[0].user?._id;
      if (lastBidUserId === user._id) {
        showAlert({ title: 'Hatalı İşlem', message: 'Son teklifi zaten siz verdiniz.' });
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

      showAlert({ title: 'Tebrikler', message: `Yeni teklif verdiniz: ${newAmount}₺` });
      setCurrentPrice(newAmount);
      fetchBids();
    } catch (err) {
      showAlert({ title: 'Hata', message: err.message });
    } finally {
      setIsBidding(false);
    }
  };

  // Chat başlatma
  const handleStartChat = async () => {
    if (!user || !user._id) {
      showAlert({ title: 'Giriş gerekli', message: 'Mesajlaşmak için giriş yapın.' });
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
      showAlert({ title: 'Hata', message: err.message });
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
        {/* Görsel Galerisi - yatay FlatList + gradient scrim başlık */}
        <View style={styles.galleryWrap}>
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
          <LinearGradient
            colors={gradients.scrim}
            style={styles.galleryScrim}
            pointerEvents="none"
          />
          <View style={styles.galleryTitleWrap} pointerEvents="none">
            <Text style={styles.galleryTitle} numberOfLines={2}>
              {auction.title}
            </Text>
          </View>
          {auction.isSigned && (
            <View style={styles.galleryBadge}>
              <Badge label="Usta İmzalı" tone="signed" />
            </View>
          )}
        </View>

        {/* Bilgi kartı */}
        <Card style={styles.infoCard}>
          <PressableScale onPress={handleSellerPress}>
            <View style={styles.sellerRow}>
              <MaterialCommunityIcons name="store-outline" size={18} color={colors.brown} />
              <Text style={styles.sellerBtn}>
                {auction.seller?.companyName || 'Bilinmiyor'}
              </Text>
              <MaterialCommunityIcons name="chevron-right" size={18} color={colors.muted} />
            </View>
          </PressableScale>
          <View style={styles.statusRow}>
            <Badge
              label={auction.isEnded ? 'Sona Erdi' : 'Aktif Mezat'}
              tone={auction.isEnded ? 'rejected' : 'approved'}
            />
            {auction.isSigned ? <Badge label="Usta İmzalı" tone="signed" /> : null}
          </View>
          <Text style={styles.description}>{auction.description}</Text>
        </Card>

        {/* Fiyat — gradient kart */}
        <LinearGradient
          colors={gradients.goldToBrown}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.priceBox}
        >
          <View style={styles.priceRow}>
            <MaterialCommunityIcons name="gavel" size={22} color={colors.cream} />
            <Text style={styles.priceLabel}>Güncel Fiyat</Text>
          </View>
          <Text style={styles.price}>{String(currentPrice)}₺</Text>
        </LinearGradient>

        {/* Artış butonları (sadece buyer ve açıkken) */}
        {user && user.role === 'buyer' && !auction.isEnded && (
          <View style={styles.incrementContainer}>
            {[10, 20, 30, 40, 50].map((amount) => {
              const selected = selectedIncrement === amount;
              return (
                <PressableScale
                  key={amount}
                  style={[styles.incrementButton, selected && styles.selectedIncrement]}
                  onPress={() => setSelectedIncrement(amount)}
                >
                  <Text style={[styles.incrementText, selected && styles.incrementTextSelected]}>
                    +{amount}₺
                  </Text>
                </PressableScale>
              );
            })}
          </View>
        )}

        {/* Teklif Ver */}
        {user && user.role === 'buyer' && !auction.isEnded && (
          <GradientButton
            title={isBidding ? 'Gönderiliyor...' : 'Teklif Ver'}
            icon="hammer"
            variant="gold"
            onPress={handleBid}
            loading={isBidding}
            disabled={isBidding}
            style={styles.bidButton}
          />
        )}

        {/* Chat */}
        {isBuyerWinner && auction.isEnded && (
          <GradientButton
            title="Satıcıyla Mesajlaş"
            icon="chatbubble-ellipses-outline"
            variant="secondary"
            onPress={handleStartChat}
            style={styles.bidButton}
          />
        )}
        {isSellerOfEnded && (
          <GradientButton
            title="Kazanan Alıcıyla Mesajlaş"
            icon="chatbubble-ellipses-outline"
            variant="secondary"
            onPress={handleStartChat}
            style={styles.bidButton}
          />
        )}

        {/* Liste başlığı */}
        <OrnamentDivider />
        <Text style={styles.bidsTitle}>Önceki Teklifler</Text>
      </View>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auction, currentPrice, selectedIncrement, isBidding, user]);

  if (loading || !auction) {
    return (
      <Screen>
        <ScreenHeader variant="hero" title="Mezat" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.brown} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader
        variant="hero"
        title={auction.title || 'Mezat'}
        subtitle={auction.seller?.companyName || undefined}
      />
      <FlatList
        data={bids}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={Header}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.modernBidItem}>
            <View style={styles.avatar}>
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
          <Text style={styles.emptyBids}>Henüz teklif yok.</Text>
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
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustContentInsets={false}
        contentContainerStyle={styles.listContent}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingBottom: spacing.sm },
  headerWrap: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },

  galleryWrap: {
    borderRadius: radii.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.card,
  },
  sliderContainer: {},
  sliderImage: {
    width: screenWidth - spacing.lg * 2,
    height: 260,
    backgroundColor: colors.line,
  },
  galleryScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '55%',
  },
  galleryTitleWrap: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.md,
  },
  galleryTitle: {
    ...typography.h1,
    fontSize: 22,
    color: colors.white,
  },
  galleryBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },

  infoCard: {
    marginBottom: spacing.md,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  sellerBtn: {
    ...typography.h3,
    color: colors.brown,
    flex: 1,
    marginLeft: spacing.sm,
  },
  description: {
    ...typography.body,
    fontSize: 15,
    color: colors.brownDark,
    lineHeight: 22,
  },

  priceBox: {
    borderRadius: radii.lg,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  priceLabel: {
    ...typography.label,
    color: colors.cream,
    marginLeft: spacing.sm,
    textTransform: 'uppercase',
  },
  price: { ...typography.hero, fontSize: 30, color: colors.white },

  incrementContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  incrementButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.line,
    ...shadows.soft,
  },
  selectedIncrement: {
    backgroundColor: colors.brown,
    borderColor: colors.brown,
  },
  incrementText: { ...typography.bodyStrong, color: colors.brown },
  incrementTextSelected: { color: colors.white },

  bidButton: {
    marginBottom: spacing.md,
  },

  bidsTitle: {
    ...typography.h2,
    color: colors.brownDark,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  emptyBids: {
    color: colors.brownDark,
    fontStyle: 'italic',
    paddingHorizontal: spacing.lg,
  },

  modernBidItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radii.md,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    ...shadows.soft,
  },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.brown, alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: { ...typography.h3, color: colors.white, fontSize: 18 },
  bidUserModern: { ...typography.bodyStrong, color: colors.brownDark, fontSize: 15 },
  bidDate: { ...typography.label, color: colors.muted },
  amountBadge: {
    backgroundColor: colors.brownDark,
    borderRadius: radii.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  amountBadgeText: { ...typography.button, color: colors.white, fontSize: 15 },

  adContainer: {
    marginTop: spacing.lg,
    alignItems: 'center',
    width: '100%',
    backgroundColor: colors.white,
    paddingBottom: spacing.md,
  },
});
