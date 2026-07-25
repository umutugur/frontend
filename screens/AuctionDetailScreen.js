// screens/AuctionDetailScreen.js
// "Katalog Sayfası" (D-v2) tasarımı: açıklama baş köşede, serif katalog gövdesi,
// altta sabit teklif dock'u (artırım çipleri + koyu çubuk: fiyat · sayaç · CTA).
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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import InlineBannerAd from '../components/InlineBannerAd';

import { Screen, GradientButton, OrnamentDivider, PressableScale } from '../components/ui';
import { colors, fonts, gradients, radii, shadows, spacing, typography } from '../theme/tokens';

const screenWidth = Dimensions.get('window').width;
const POLL_INTERVAL_MS = 10000;
const IMAGE_HEIGHT = 270;
const DESC_COLLAPSED_LINES = 6;

// Minimum teklif artış kademeleri — backend (routes/bid.js) ile birebir aynı.
function getMinIncrement(currentPrice) {
  if (currentPrice < 500) return 25;
  if (currentPrice < 2000) return 50;
  if (currentPrice < 5000) return 100;
  return 250;
}

// endsAt'e kalan süreyi SS:DD:sn olarak verir; geçtiyse null.
function formatRemaining(endsAt) {
  if (!endsAt) return null;
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return null;
  const total = Math.floor(diff / 1000);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(Math.floor(total / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`;
}

export default function AuctionDetailScreen({ route }) {
  const { auctionId } = route.params;
  const { user } = useContext(AuthContext);
  const { showAlert } = useAlert();
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [auction, setAuction] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [selectedChip, setSelectedChip] = useState(0);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBidding, setIsBidding] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [descExpanded, setDescExpanded] = useState(false);
  const [remaining, setRemaining] = useState(null);
  // Bir teklif yanıtı geldiğinde sunucunun bildirdiği minNextBid, bir sonraki
  // auction fetch'ine kadar client tarafı hesaplamanın önüne geçer.
  const [serverMinNextBid, setServerMinNextBid] = useState(null);

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

  // Kapanış sayacı — saniyede bir.
  useEffect(() => {
    if (!auction?.endsAt) return undefined;
    setRemaining(formatRemaining(auction.endsAt));
    const t = setInterval(() => setRemaining(formatRemaining(auction.endsAt)), 1000);
    return () => clearInterval(t);
  }, [auction?.endsAt]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchAuction({ silent: true }), fetchBids({ silent: true })]);
    setRefreshing(false);
  };

  // Artırım çipleri: kademe × 1..4 (fiyata ölçekli).
  const tier = getMinIncrement(currentPrice);
  const chipIncrements = [tier, tier * 2, tier * 3, tier * 4];
  const selectedIncrement = chipIncrements[selectedChip] ?? tier;
  const minNextBid = serverMinNextBid ?? currentPrice + tier;
  const bidAmount = Math.max(currentPrice + selectedIncrement, minNextBid);
  const tl = (n) => `${Number(n).toLocaleString('tr-TR')}₺`;

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
      showAlert({ title: 'Tebrikler', message: `Yeni teklif verdiniz: ${tl(confirmedAmount)}` });
      setCurrentPrice(confirmedAmount);
      if (typeof data?.minNextBid === 'number') setServerMinNextBid(data.minNextBid);
      setSelectedChip(0);
      fetchBids({ silent: true });
    } catch (err) {
      const respData = err.response?.data;
      if (respData && typeof respData.minNextBid === 'number') {
        setServerMinNextBid(respData.minNextBid);
        showAlert({
          title: 'Teklif Yetersiz',
          message: respData.message || `Teklif en az ${tl(respData.minNextBid)} olmalı`,
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
    const idx = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
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

  const canBid = user && user.role === 'buyer' && auction && !auction.isEnded;

  // Katalog açıklaması — ilk harf büyük inisyal (drop-cap hissi).
  const renderDescription = () => {
    const text = (auction.description || '').trim();
    if (!text) return null;
    const initial = text.charAt(0);
    const rest = text.slice(1);
    const isLong = text.length > 280;
    return (
      <View style={styles.descWrap}>
        <Text
          style={styles.desc}
          numberOfLines={descExpanded || !isLong ? undefined : DESC_COLLAPSED_LINES}
        >
          <Text style={styles.dropCap}>{initial}</Text>
          {rest}
        </Text>
        {isLong && (
          <PressableScale onPress={() => setDescExpanded((v) => !v)}>
            <Text style={styles.more}>
              {descExpanded ? 'Daha az göster ↑' : 'Devamını oku ↓'}
            </Text>
          </PressableScale>
        )}
      </View>
    );
  };

  // ---- Liste başlığı: görsel + katalog gövdesi ----
  const renderHeader = () => {
    if (!auction) return null;
    const images = auction.images || [];
    return (
      <View>
        {/* Tam genişlik galeri — alta doğru kreme karışır */}
        <View style={styles.galleryWrap}>
          <FlatList
            data={images.length ? images : [null]}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Image
                source={item ? { uri: item } : undefined}
                style={styles.sliderImage}
              />
            )}
            onMomentumScrollEnd={handleGalleryScroll}
          />
          <LinearGradient
            colors={['transparent', colors.creamDeep]}
            style={styles.imageFade}
            pointerEvents="none"
          />
          {images.length > 1 && (
            <View style={styles.dotsRow} pointerEvents="none">
              {images.map((_, idx) => (
                <View key={idx} style={[styles.dot, idx === galleryIndex && styles.dotActive]} />
              ))}
            </View>
          )}
        </View>

        <View style={styles.body}>
          {/* Lot satırı */}
          <View style={styles.lotLine}>
            <Text style={styles.lotText}>
              {auction.isEnded ? 'SONA ERDİ' : 'AÇIK ARTIRMA'}
            </Text>
            <View style={styles.lotRule} />
            {auction.isSigned ? (
              <Text style={styles.lotText}>✒ USTA İMZALI</Text>
            ) : (
              <Text style={styles.lotText}>{bids.length} TEKLİF</Text>
            )}
          </View>

          {/* Başlık + satıcı */}
          <Text style={styles.title}>{auction.title}</Text>
          <PressableScale onPress={handleSellerPress}>
            <Text style={styles.sellerLine}>
              <Text style={styles.sellerName}>
                {auction.seller?.companyName || 'Bilinmiyor'}
              </Text>
              {'  ›'}
            </Text>
          </PressableScale>

          {/* İlgi göstergeleri — görüntülenme ve teklif sayısı */}
          <View style={styles.metaRow}>
            <Ionicons name="eye-outline" size={14} color={colors.muted} />
            <Text style={styles.metaText}>
              {(auction.impressionCount || 0).toLocaleString('tr-TR')} görüntülenme
            </Text>
            <View style={styles.metaDot} />
            <MaterialCommunityIcons name="gavel" size={13} color={colors.muted} />
            <Text style={styles.metaText}>{bids.length} teklif</Text>
          </View>

          {/* Katalog açıklaması */}
          {renderDescription()}

          {/* Bitmiş mezat: mesajlaşma aksiyonları gövdede */}
          {isBuyerWinner && auction.isEnded && (
            <GradientButton
              title="Satıcıyla Mesajlaş"
              icon="chatbubble-ellipses-outline"
              variant="secondary"
              onPress={handleStartChat}
              style={styles.chatButton}
            />
          )}
          {isSellerOfEnded && (
            <GradientButton
              title="Kazanan Alıcıyla Mesajlaş"
              icon="chatbubble-ellipses-outline"
              variant="secondary"
              onPress={handleStartChat}
              style={styles.chatButton}
            />
          )}

          <OrnamentDivider />
          <Text style={styles.bidsTitle}>Önceki Teklifler</Text>
        </View>
      </View>
    );
  };

  if (loading || !auction) {
    return (
      <Screen>
        <PressableScale style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color={colors.brownDark} />
        </PressableScale>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.brown} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
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
          <View style={styles.bidRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.user?.name?.[0]?.toUpperCase() || '?'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bidUser}>{item.user?.name || 'Anonim'}</Text>
              <Text style={styles.bidDate}>
                {item.createdAt ? new Date(item.createdAt).toLocaleString('tr-TR') : ''}
              </Text>
            </View>
            <Text style={styles.bidAmount}>{tl(item.amount)}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyBids}>Henüz teklif yok.</Text>}
        ListFooterComponent={
          <View style={styles.adContainer}>
            <InlineBannerAd />
          </View>
        }
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustContentInsets={false}
        contentContainerStyle={[styles.listContent, canBid && styles.listContentDock]}
      />

      {/* Yüzen geri butonu */}
      <PressableScale style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={20} color={colors.brownDark} />
      </PressableScale>

      {/* ── Teklif dock'u: çipler + koyu çubuk ── */}
      <View style={styles.dock} pointerEvents="box-none">
        <LinearGradient
          colors={['rgba(253,246,227,0)', colors.creamDeep]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        {canBid && (
          <View style={styles.chipRow}>
            {chipIncrements.map((inc, idx) => {
              const on = selectedChip === idx;
              return (
                <PressableScale
                  key={inc}
                  style={[styles.chip, on && styles.chipOn]}
                  onPress={() => setSelectedChip(idx)}
                >
                  {on ? (
                    <LinearGradient
                      colors={gradients.gold}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFill}
                    />
                  ) : null}
                  <Text style={[styles.chipText, on && styles.chipTextOn]}>+{tl(inc)}</Text>
                </PressableScale>
              );
            })}
          </View>
        )}
        <View style={styles.bar}>
          <View>
            <Text style={styles.barLabel}>GÜNCEL</Text>
            <Text style={styles.barPrice}>{tl(currentPrice)}</Text>
          </View>
          <View style={styles.barCenter}>
            <Text style={styles.barLabel}>KAPANIŞ</Text>
            <Text style={styles.barTimer}>
              {auction.isEnded || !remaining ? 'Sona erdi' : remaining}
            </Text>
          </View>
          {canBid ? (
            <PressableScale onPress={handleBid} disabled={isBidding} style={styles.bidBtnWrap}>
              <LinearGradient
                colors={gradients.gold}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.bidBtn}
              >
                {isBidding ? (
                  <ActivityIndicator color={colors.espresso} size="small" />
                ) : (
                  <Text style={styles.bidBtnText}>Teklif Ver — {tl(bidAmount)}</Text>
                )}
              </LinearGradient>
            </PressableScale>
          ) : (
            <MaterialCommunityIcons name="gavel" size={22} color={colors.goldLight} />
          )}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingBottom: spacing.xxl },
  listContentDock: { paddingBottom: 170 },

  backBtn: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.lg,
    width: 38,
    height: 38,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,253,247,0.9)',
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    ...shadows.soft,
  },

  galleryWrap: { height: IMAGE_HEIGHT, position: 'relative', backgroundColor: '#efe3cd' },
  sliderImage: { width: screenWidth, height: IMAGE_HEIGHT },
  imageFade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 70 },
  dotsRow: {
    position: 'absolute',
    bottom: spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,253,247,0.6)',
    marginHorizontal: 3,
  },
  dotActive: { backgroundColor: colors.goldLight, width: 16 },

  body: { paddingHorizontal: spacing.xl },
  lotLine: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
  lotText: {
    fontFamily: fonts.displayItalic,
    fontSize: 12,
    letterSpacing: 1,
    color: colors.gold,
  },
  lotRule: { flex: 1, height: 1, backgroundColor: 'rgba(161,116,59,0.35)', marginHorizontal: spacing.md },
  title: { ...typography.h1, fontSize: 27, marginTop: spacing.sm },
  sellerLine: { ...typography.small, fontSize: 12.5, marginTop: spacing.xs },
  sellerName: { fontFamily: fonts.bold, color: colors.brownDark },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: spacing.sm,
  },
  metaText: { ...typography.small, fontSize: 12 },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.lineStrong,
    marginHorizontal: 3,
  },

  descWrap: { marginTop: spacing.md },
  desc: { ...typography.catalog },
  // RN, satır kutusundan (typography.catalog.lineHeight = 30) taşan harfi üstten
  // kırpar; bu yüzden baş harf o kutuya sığacak boyutta tutulur.
  dropCap: {
    fontFamily: fonts.displayBlack,
    fontSize: 25,
    color: colors.gold,
  },
  more: {
    fontFamily: fonts.extrabold,
    fontSize: 12,
    letterSpacing: 0.5,
    color: colors.gold,
    marginTop: spacing.sm,
  },

  chatButton: { marginTop: spacing.lg },

  bidsTitle: { ...typography.h2, marginBottom: spacing.sm },
  emptyBids: {
    ...typography.catalogItalic,
    paddingHorizontal: spacing.xl,
  },

  bidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    marginHorizontal: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(161,116,59,0.16)',
  },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.brown, alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: { ...typography.h3, color: colors.white, fontSize: 16 },
  bidUser: { ...typography.bodyStrong, fontSize: 14 },
  bidDate: { ...typography.small, fontSize: 11 },
  bidAmount: { fontFamily: fonts.display, fontSize: 17, color: colors.brownDark },

  // Reklam gövdeyle aynı kenar boşluğunda; InlineBannerAd kendi krem kartını
  // ve "REKLAM" etiketini taşır, böylece akışta yabancı bir beyaz kutu durmaz.
  adContainer: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
  },

  // ── Dock ──
  dock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  chipRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm + 2 },
  chip: {
    flex: 1,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.creamHi,
    borderWidth: 1.5,
    borderColor: 'rgba(161,116,59,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  chipOn: { borderColor: colors.gold, ...shadows.gold },
  chipText: { fontFamily: fonts.extrabold, fontSize: 13.5, color: colors.brownDark },
  chipTextOn: { color: colors.espresso },

  bar: {
    backgroundColor: '#241609',
    borderRadius: radii.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    ...shadows.raised,
  },
  barLabel: {
    fontFamily: fonts.bold,
    fontSize: 9,
    letterSpacing: 2,
    color: '#a08663',
  },
  barCenter: { alignItems: 'center' },
  barPrice: {
    fontFamily: fonts.display,
    fontSize: 21,
    color: '#f0dfb7',
    marginTop: 2,
  },
  barTimer: {
    fontFamily: fonts.extrabold,
    fontSize: 14,
    color: '#f0dfb7',
    marginTop: 3,
    fontVariant: ['tabular-nums'],
  },
  bidBtnWrap: { borderRadius: radii.md, ...shadows.gold },
  bidBtn: {
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 132,
  },
  bidBtnText: { fontFamily: fonts.extrabold, fontSize: 13.5, color: colors.espresso },
});
