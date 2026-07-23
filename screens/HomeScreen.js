import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import axios from 'axios';

// ✅ AdMob bileşenleri eklendi
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

import { Screen, AuctionCard, CountdownHero, EmptyState } from '../components/ui';
import { colors, spacing } from '../theme/tokens';

export default function HomeScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [auctions, setAuctions] = useState([]);

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

  const renderItem = ({ item }) => (
    <View style={styles.cardCol}>
      <AuctionCard
        item={item}
        onPress={() => navigation.navigate('AuctionDetail', { auctionId: item._id })}
      />
    </View>
  );

  // ✅ Banner reklam birimi
  const adUnitId = __DEV__
    ? TestIds.BANNER
    : 'ca-app-pub-4306778139267554/1985701713';

  return (
    <Screen>
      <FlatList
        data={auctions}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={styles.column}
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

      {/* ✅ Reklam en alta */}
      <View style={styles.adContainer}>
        <BannerAd
          unitId={adUnitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  adContainer: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingBottom: spacing.sm,
    minHeight: 60,
  },
});
