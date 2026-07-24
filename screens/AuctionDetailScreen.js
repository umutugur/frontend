// screens/AuctionDetailScreen.js
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from 'react-native';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

import { Screen, ScreenHeader, Card, Badge, GradientButton, OrnamentDivider, PressableScale } from '../components/ui';
import { colors, gradients, radii, shadows, spacing, typography } from '../theme/tokens';

const screenWidth = Dimensions.get('window').width;
const GALLERY_ITEM_WIDTH = screenWidth - spacing.lg * 2;
const POLL_INTERVAL_MS = 10000;

// Minimum teklif artış kademeleri — backend (routes/bid.js) ile birebir aynı.
function getMinIncrement(currentPrice) {
  if (currentPrice < 500) return 25;
  if (currentPrice < 2000) return 50;
  if (currentPrice < 5000) return 100;
  return 250;
}

export default function AuctionDetailScreen({ route }) {
  const { auctionId } = route.params;
  const { user } = useContext(AuthContext);
  const { showAlert } = useAlert();
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [auction, setAuction] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [selectedTierIndex, setSelectedTierIndex] = useState(0);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBidding, setIsBidding] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  // Bir teklif yanıtı geldiğinde sunucunun bildirdiği minNextBid, bir sonraki
  // auction fetch'ine kadar client tarafı hesaplamanın önüne geçer.
  const [serverMinNextBid, setServerMinNextBid] = useState(null);

  const adUnitId = __DEV__
    ? TestIds.BANNER
    : 'ca-app-pub-4306778139267554/1985701713';

  // Auction bilgisi yükle
  const fetchAuction = async ({ silent = false } = {}) => {
    try {
      const res = await axios.get(`https://imame-backend.onrender.com/api/auctions/${auctionId}`);
      const data = res.data;
      setAuction(data);
      setCurrentPrice(data.currentPrice || data.startingPrice);
      // Fiyat sunucudan taze geldi; client tarafı hesaplama tekrar geçerli olsun.
      setServerMinNextBid(null);
    } catch (err) {
      if (!silent) showAlert({ title: 'Hata', message: 'Mezat bilgisi alınamadı' });
    } finally {
      setLoading(false);
    }
  };

  // Teklifler yükle
  const fetchBids = async ({ silent = false } = {}) => {
    try {
      const res = await axios.get(`https://imame-backend.onrender.com/api/bids/${auctionId}`);
      setBids(res.data);
    } catch (err) {
      if (!silent) showAlert({ title: 'Hata', message: 'Teklifler yüklenemedi' });
    }
  };

  useEffect(() => {
    fetchAuction();
    fetchBids();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ekran odaktayken 10sn'de bir sessizce (loading göstermeden) güncelle.
  useEffect(() => {
    if (!isFocused) return undefined;
    const interval = setInterval(() => {
      fetchAuction({ silent: true });
      fetchBids({ silent: true });
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused, auctionId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchAuction({ silent: true }), fetchBids({ silent: true })]);
    setRefreshing(false);
  };

  // Kademeye göre önerilen 3 hızlı teklif tutarı
  const tierIncrement = getMinIncrement(currentPrice);
  const computedMinNext = currentPrice + tierIncrement;
  const minNextBid = serverMinNextBid ?? computedMinNext;
  const quickBidOptions = [minNextBid, minNextBid + tierIncrement, minNextBid + tierIncrement * 2];
  const bidAmount = quickBidOptions[selectedTierIndex] ?? minNextBid;

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
      const res = await axios.post('https://imame-backend.onrender.com/api/bids', {
        auctionId,
        amount: bidAmount,
      });

      const data = res.data;
      const confirmedAmount = data?.bid?.amount ?? bidAmount;
      showAlert({ title: 'Tebrikler', message: `Yeni teklif verdiniz: ${confirmedAmount}₺` });
      setCurrentPrice(confirmedAmount);
      if (typeof data?.minNextBid === 'number') setServerMinNextBid(data.minNextBid);
      setSelectedTierIndex(0);
      fetchBids({ silent: true });
    } catch (err) {
      const respData = err.response?.data;
      if (respData && typeof respData.minNextBid === 'number') {
        setServerMinNextBid(respData.minNextBid);
        showAlert({
          title: 'Teklif Yetersiz',
          message: respData.message || `Teklif en az ${respData.minNextBid}₺ olmalı`,
        });
        fetchAuction({ silent: true });
      } else {
        showAlert({ title: 'Hata', message: respData?.message || err.message });
      }
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
      const res = await axios.post('https://imame-backend.onrender.com/api/chats/start', {
        auctionId,
        buyerId: user._id,
      });
      navigation.navigate('Chat', { chatId: res.data.chat._id });
    } catch (err) {
      showAlert({ title: 'Hata', message: err.response?.data?.message || err.message });
    }
  };

  // Satıcı profiline git
  const handleSellerPress = () => {
    const id = auction?.seller?._id || auction?.seller;
    if (!id) return;
    navigation.navigate('ProfileDetail', { userId: id });
  };

  const handleGalleryScroll = (e) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / GALLERY_ITEM_WIDTH);
    if (idx !== galleryIndex) setGalleryIndex(idx);
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

  // ---- HEADER (ScrollView yerine ListHeaderComponent) ----
  const renderHeader = () => {
    if (!auction) return null;
    const images = auction.images || [];
    return (
      <View style={styles.headerWrap}>
        {/* Görsel Galerisi - yatay FlatList + gradient scrim başlık + nokta göstergeler */}
        <View style={styles.galleryWrap}>
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.sliderImage} />
            )}
            style={styles.sliderContainer}
            onMomentumScrollEnd={handleGalleryScroll}
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
          {images.length > 1 && (
            <View style={styles.dotsRow} pointerEvents="none">
              {images.map((_, idx) => (
                <View
                  key={idx}
                  style={[styles.dot, idx === galleryIndex && styles.dotActive]}
                />
              ))}
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

        {/* Minimum teklif bilgisi + hızlı teklif çipleri (sadece buyer ve açıkken) */}
        {user && user.role === 'buyer' && !auction.isEnded && (
          <>
            <Text style={styles.minBidLabel}>
              Min. sonraki teklif: {minNextBid}₺
            </Text>
            <View style={styles.incrementContainer}>
              {quickBidOptions.map((option, idx) => {
                const selected = selectedTierIndex === idx;
                return (
                  <PressableScale
                    key={option}
                    style={[styles.incrementButton, selected && styles.selectedIncrement]}
                    onPress={() => setSelectedTierIndex(idx)}
                  >
                    <Text style={[styles.incrementText, selected && styles.incrementTextSelected]}>
                      {option}₺
                    </Text>
                  </PressableScale>
                );
              })}
            </View>
          </>
        )}

        {/* Teklif Ver */}
        {user && user.role === 'buyer' && !auction.isEnded && (
          <GradientButton
            title={isBidding ? 'Gönderiliyor...' : `Teklif Ver — ${bidAmount}₺`}
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
  };

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
        ListHeaderComponent={renderHeader()}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.gold}
            colors={[colors.gold]}
          />
        }
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
  dotsRow: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.45)',
    marginRight: 5,
  },
  dotActive: {
    backgroundColor: colors.goldLight,
    width: 16,
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

  minBidLabel: {
    ...typography.label,
    color: colors.gold,
    textTransform: 'none',
    marginBottom: spacing.sm,
  },

  incrementContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  incrementButton: {
    flex: 1,
    marginHorizontal: spacing.xs / 2,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
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
