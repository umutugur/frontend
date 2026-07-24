import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import axios from 'axios';

import { Screen, AuctionCard, CountdownHero, EmptyState } from '../components/ui';
import InlineBannerAd from '../components/InlineBannerAd';
import { colors, spacing } from '../theme/tokens';

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

  const fetchAuctions = async () => {
    try {
      const res = await axios.get('https://imame-backend.onrender.com/api/auctions/all');
      setAuctions(res.data);
    } catch (err) {
      console.log('Mezatlar alınamadı:', err.message);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchAuctions();
    }
  }, [isFocused]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAuctions();
    setRefreshing(false);
  }, []);

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
        {/* tek kalan kart solda hizalı dursun */}
        {item.items.length < COLUMNS ? <View style={styles.cardCol} /> : null}
      </View>
    );
  };

  return (
    <Screen>
      <FlatList
        data={feed}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.gold} colors={[colors.gold]} />
        }
        ListHeaderComponent={<CountdownHero />}
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
});
