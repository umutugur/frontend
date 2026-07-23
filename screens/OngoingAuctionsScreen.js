import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Screen, Card, Badge } from '../components/ui';
import { colors, spacing, typography } from '../theme/tokens';

const ongoingAuctions = [
  { id: '1', title: 'Kuka Tesbih', lastBidder: 'Siz', newBidAfterYou: true },
  { id: '2', title: 'Oltu Taşı Tesbih', lastBidder: 'Siz', newBidAfterYou: false },
];

export default function OngoingAuctionsScreen() {
  const renderItem = ({ item }) => {
    const highlight = item.newBidAfterYou;

    return (
      <Card style={[styles.auctionItem, highlight && styles.highlight]}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{item.title}</Text>
          {highlight && <Badge label="Yeni Teklif" tone="rejected" />}
        </View>
        <Text style={styles.status}>Son Teklif: {item.lastBidder}</Text>
        {highlight && (
          <Text style={styles.warning}>Sizden sonra teklif verildi!</Text>
        )}
      </Card>
    );
  };

  return (
    <Screen>
      <Text style={styles.header}>Devam Eden Mezatlar</Text>
      <FlatList
        data={ongoingAuctions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
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
  auctionItem: {
    marginBottom: spacing.md,
  },
  highlight: {
    backgroundColor: '#fff3e0',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { ...typography.h3, color: colors.brownDark, flex: 1, marginRight: spacing.sm },
  status: { ...typography.body, color: colors.brown, marginTop: spacing.xs },
  warning: { fontSize: 13, color: colors.danger, marginTop: spacing.sm, fontWeight: '600' },
});
