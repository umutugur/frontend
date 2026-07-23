import React, { useState, useEffect, useMemo } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import axios from 'axios';

import { Screen, AuctionCard, CountdownHero, EmptyState } from '../components/ui';
import NativeAdCard, { useNativeAds, interleaveAds } from '../components/NativeAdCard';
import { spacing } from '../theme/tokens';

const ADS_PRELOAD = 3; // kaç native reklam ön-yüklensin

export default function HomeScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [auctions, setAuctions] = useState([]);
  const ads = useNativeAds(ADS_PRELOAD);

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

  const data = useMemo(() => interleaveAds(auctions, ads, 6), [auctions, ads]);

  const renderItem = ({ item }) => (
    <View style={styles.cardCol}>
      {item.type === 'ad' ? (
        <NativeAdCard nativeAd={item.nativeAd} />
      ) : (
        <AuctionCard
          item={item}
          onPress={() => navigation.navigate('AuctionDetail', { auctionId: item._id })}
        />
      )}
    </View>
  );

  return (
    <Screen>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
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
  cardCol: {
    width: '100%',
    marginBottom: spacing.lg,
  },
});
