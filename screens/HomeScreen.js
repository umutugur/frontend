import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, ActivityIndicator, Text } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import axios from 'axios';

import { Screen, AuctionCard, CountdownHero, EmptyState } from '../components/ui';
import InlineBannerAd from '../components/InlineBannerAd';
import { getFeedSeed } from '../utils/feedSeed';
import { colors, spacing, typography } from '../theme/tokens';

const API = 'https://imame-backend.onrender.com';
const PAGE_SIZE = 20;

const COLUMNS = 2;
const ROWS_BETWEEN_ADS = 3; // her 3 mezat satırından sonra bir banner

/**
 * Mezatları 2'şerli satırlara böler ve her ROWS_BETWEEN_ADS satırdan sonra
 * tam genişlik bir reklam satırı ekler. (numColumns ile tam genişlik öğe
 * karıştırılamadığı için satırları elle kuruyoruz.)
 */
export function buildFeed(auctions) {
  const rows = [];
  for (let i = 0; i < auctions.length; i += COLUMNS) {
    rows.push(auctions.slice(i, i + COLUMNS));
  }
  const out = [];
  rows.forEach((items, idx) => {
    out.push({ type: 'row', _id: `row-${idx}`, items });
    if ((idx + 1) % ROWS_BETWEEN_ADS === 0) {
      out.push({ type: 'ad', _id: `ad-${idx}` });
    }
  });
  return out;
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [auctions, setAuctions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [phase, setPhase] = useState('unseen');

  const offsetRef = useRef(0);          // yalnızca 'seen' fazında kullanılır
  const loadedIds = useRef(new Set());  // liste içi tekrarları önler
  const reported = useRef(new Set());   // oturum içinde bildirilmiş ID'ler
  const pending = useRef(new Set());    // gönderilmeyi bekleyenler
  const flushTimer = useRef(null);

  // Görülen kartları toplu bildir (best-effort; hata sessizce yutulur)
  const flush = useCallback(() => {
    const ids = [...pending.current];
    pending.current.clear();
    if (!ids.length) return;
    axios.post(`${API}/api/auctions/impressions`, { auctionIds: ids }).catch(() => {});
  }, []);

  const fetchPage = useCallback(
    async ({ reset = false } = {}) => {
      try {
        const seed = await getFeedSeed();
        const params = { limit: PAGE_SIZE, seed };
        if (!reset && phase === 'seen') params.offset = offsetRef.current;

        const res = await axios.get(`${API}/api/auctions/feed`, { params });
        const { items = [], hasMore: more = false, phase: nextPhase = 'unseen' } = res.data || {};

        if (reset) {
          loadedIds.current = new Set(items.map((a) => a._id));
          offsetRef.current = nextPhase === 'seen' ? items.length : 0;
          setAuctions(items);
        } else {
          const fresh = items.filter((a) => !loadedIds.current.has(a._id));
          fresh.forEach((a) => loadedIds.current.add(a._id));
          if (nextPhase === 'seen') offsetRef.current += items.length;
          setAuctions((prev) => [...prev, ...fresh]);
        }
        setPhase(nextPhase);
        setHasMore(more);
      } catch (err) {
        console.log('Mezatlar alınamadı:', err.message);
        setHasMore(false);
      }
    },
    [phase]
  );

  useEffect(() => {
    if (isFocused && auctions.length === 0) fetchPage({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused]);

  // Ekrandan ayrılırken bekleyen bildirimleri gönder
  useEffect(() => {
    return () => {
      if (flushTimer.current) clearTimeout(flushTimer.current);
      flush();
    };
  }, [flush]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    offsetRef.current = 0;
    setPhase('unseen');
    setHasMore(true);
    await fetchPage({ reset: true });
    setRefreshing(false);
  }, [fetchPage]);

  const handleEndReached = useCallback(async () => {
    if (loadingMore || refreshing || !hasMore) return;
    setLoadingMore(true);
    await fetchPage();
    setLoadingMore(false);
  }, [loadingMore, refreshing, hasMore, fetchPage]);

  // Görünürlük: kart %50 görünür ve >=1sn kalırsa "görüldü" sayılır.
  // onViewableItemsChanged referansı SABİT olmalı (RN aksi halde hata verir).
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50, minimumViewTime: 1000 }).current;
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    viewableItems.forEach((v) => {
      const row = v.item;
      if (!row || row.type === 'ad' || !Array.isArray(row.items)) return;
      row.items.forEach((a) => {
        if (a && a._id && !reported.current.has(a._id)) {
          reported.current.add(a._id);
          pending.current.add(a._id);
        }
      });
    });
    if (pending.current.size === 0) return;
    if (flushTimer.current) clearTimeout(flushTimer.current);
    flushTimer.current = setTimeout(() => {
      const ids = [...pending.current];
      pending.current.clear();
      if (ids.length) {
        axios.post(`${API}/api/auctions/impressions`, { auctionIds: ids }).catch(() => {});
      }
    }, 2000);
  }).current;

  const feed = useMemo(() => buildFeed(auctions), [auctions]);

  const renderItem = ({ item }) => {
    if (item.type === 'ad') return <InlineBannerAd />;

    return (
      <View style={styles.row}>
        {item.items.map((auction) => (
          <View key={auction._id} style={styles.cardCol}>
            <AuctionCard
              item={auction}
              onPress={() => navigation.navigate('AuctionDetail', { auctionId: auction._id })}
            />
          </View>
        ))}
        {item.items.length < COLUMNS ? <View style={styles.cardCol} /> : null}
      </View>
    );
  };

  return (
    <Screen edges={['left', 'right']}>
      <FlatList
        data={feed}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.gold}
            colors={[colors.gold]}
          />
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        ListHeaderComponent={
          <>
            <CountdownHero />
            {phase === 'seen' && auctions.length > 0 ? (
              <Text style={styles.phaseNote}>Tüm mezatları gördünüz — baştan gösteriliyor</Text>
            ) : null}
          </>
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footer}>
              <ActivityIndicator color={colors.gold} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            icon="gavel"
            title="Henüz mezat yok"
            message="Şu anda aktif mezat bulunmuyor. Daha sonra tekrar göz atın."
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
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
  footer: { paddingVertical: spacing.lg, alignItems: 'center' },
  phaseNote: {
    ...typography.small,
    color: colors.gold,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
});
