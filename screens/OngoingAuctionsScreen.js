import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Screen, ScreenHeader, Card, Badge, EmptyState } from '../components/ui';
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
        {highlight ? <View style={styles.accent} /> : null}
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
      <ScreenHeader variant="plain" title="Devam Eden Mezatlar" />
      <FlatList
        data={ongoingAuctions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="gavel"
            title="Devam eden mezat yok"
            message="Teklif verdiğiniz mezatlar burada görünecek."
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },
  auctionItem: {
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  highlight: {
    backgroundColor: colors.cream,
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: colors.danger,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { ...typography.h3, color: colors.brownDark, flex: 1, marginRight: spacing.sm },
  status: { ...typography.body, color: colors.brown, marginTop: spacing.xs },
  warning: { ...typography.bodyStrong, color: colors.danger, marginTop: spacing.sm },
});
