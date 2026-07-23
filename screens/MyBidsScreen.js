import React, { useEffect, useState, useContext } from 'react';
import {
  View, Text, FlatList, StyleSheet, Image, ActivityIndicator
} from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { Screen, Card, Badge, EmptyState } from '../components/ui';
import { colors, spacing, radii, typography } from '../theme/tokens';

export default function MyBidsScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const { showAlert } = useAlert();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?._id) {
      fetchBids();
    }
  }, [user]);

  const fetchBids = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`https://imame-backend.onrender.com/api/bids/user/${user._id}`);
      setBids(res.data || []);
    } catch (err) {
      showAlert({
        title: 'Teklifler alınamadı',
        message: err?.response?.data?.message || err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    if (!item || !item.auction) return null; // NULL CHECK!
    const auctionImage =
      item.auction.images && item.auction.images.length > 0
        ? item.auction.images[0]
        : null;
    const showRed = item.statusText === 'Sizden sonra teklif verildi';

    return (
      <Card
        style={styles.bidItem}
        onPress={() =>
          navigation.navigate('AuctionDetail', { auctionId: item.auction._id })
        }
      >
        <View style={styles.row}>
          {auctionImage && (
            <Image source={{ uri: auctionImage }} style={styles.auctionImage} />
          )}
          <View style={styles.rightContainer}>
            <Text style={styles.title} numberOfLines={2}>
              {item.auction.title}
            </Text>
            <Text style={styles.amount}>
              {showRed ? item.auctionCurrentPrice : item.amount} TL
            </Text>
            <View style={styles.badgeRow}>
              <Badge
                label={item.statusText}
                tone={showRed ? 'rejected' : 'approved'}
              />
            </View>
            {showRed && (
              <Text style={styles.redWarning}>
                Dikkat: Sizden sonra teklif verildi!
              </Text>
            )}
          </View>
        </View>
      </Card>
    );
  };

  if (loading) {
    return (
      <Screen>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.brown} />
          <Text style={styles.loadingText}>Teklifler yükleniyor...</Text>
        </View>
      </Screen>
    );
  }

  if (bids.length === 0) {
    return (
      <Screen>
        <Text style={styles.header}>Tekliflerim</Text>
        <EmptyState
          icon="gavel"
          title="Henüz teklif vermediniz"
          message="Verdiğiniz teklifler burada görünecek."
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.header}>Tekliflerim</Text>
      <FlatList
        data={bids}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    ...typography.h2,
    color: colors.brownDark,
    marginBottom: spacing.md,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  bidItem: {
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  auctionImage: {
    width: 100,
    height: 70,
    borderRadius: radii.md,
    marginRight: spacing.md,
    backgroundColor: colors.line,
  },
  rightContainer: {
    flex: 1,
  },
  title: { ...typography.h3, color: colors.brownDark },
  amount: {
    ...typography.body,
    color: colors.brown,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
  },
  redWarning: {
    color: colors.danger,
    fontWeight: 'bold',
    marginTop: spacing.xs,
    fontSize: 13,
  },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: colors.brown, marginTop: spacing.sm },
});
