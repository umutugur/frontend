import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Switch } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Screen, ScreenHeader, Card, Badge, EmptyState } from '../components/ui';
import { colors, spacing, typography } from '../theme/tokens';

export default function MyAuctionsScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Checkbox state
  const [showOngoing, setShowOngoing] = useState(true);
  const [showEnded, setShowEnded] = useState(true);

  useEffect(() => {
    fetchMyAuctions();
  }, []);

  const fetchMyAuctions = async () => {
    try {
      const res = await axios.get(`https://imame-backend.onrender.com/api/auctions/mine/${user._id}`);
      setAuctions(res.data);
    } catch (err) {
      console.error('Mezatlar alınamadı:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrelenmiş mezatlar
  const filteredAuctions = auctions.filter(item => {
    if (item.isEnded && showEnded) return true;
    if (!item.isEnded && showOngoing) return true;
    return false;
  });

  // Önce devam eden, sonra bitenler sıralanır
  filteredAuctions.sort((a, b) => {
    if (a.isEnded === b.isEnded) return 0;
    return a.isEnded ? 1 : -1;
  });

  const renderStatusBadge = (item) => {
    if (!item.isEnded) {
      return <Badge label="Devam Ediyor" tone="pending" icon="progress-clock" />;
    }
    const isApproved = item.receiptStatus === 'approved';
    return (
      <Badge
        label={isApproved ? 'Onaylandı' : 'Bitti'}
        tone={isApproved ? 'approved' : 'rejected'}
      />
    );
  };

  const renderItem = ({ item }) => (
    <Card
      style={styles.card}
      onPress={() => navigation.navigate('AuctionDetail', { auctionId: item._id })}
    >
      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        {renderStatusBadge(item)}
      </View>
      <View style={styles.pricePill}>
        <Text style={styles.priceText}>Başlangıç: {item.startingPrice} TL</Text>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <Screen>
        <ScreenHeader variant="plain" title="Mezatlarım" />
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.brown} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader variant="plain" title="Mezatlarım" />
      <View style={styles.checkboxRow}>
        <View style={styles.checkboxContainer}>
          <Switch
            value={showOngoing}
            onValueChange={setShowOngoing}
            trackColor={{ true: colors.priceGreen, false: colors.line }}
            thumbColor={colors.white}
          />
          <Text style={styles.checkboxLabel}>Devam Edenler</Text>
        </View>
        <View style={styles.checkboxContainer}>
          <Switch
            value={showEnded}
            onValueChange={setShowEnded}
            trackColor={{ true: colors.danger, false: colors.line }}
            thumbColor={colors.white}
          />
          <Text style={styles.checkboxLabel}>Bitenler</Text>
        </View>
      </View>
      <FlatList
        data={filteredAuctions}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="gavel"
            title="Mezat bulunamadı"
            message="Kriterlere uygun mezat bulunamadı."
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  checkboxRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: spacing.sm, marginTop: spacing.xs },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.lg },
  checkboxLabel: { ...typography.bodyStrong, marginLeft: spacing.xs, color: colors.brown },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, flexGrow: 1 },
  card: {
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: { ...typography.h3, color: colors.brownDark, flex: 1, marginRight: spacing.sm },
  pricePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(46,125,50,0.12)',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
  },
  priceText: { ...typography.price },
});
