import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

const ongoingAuctions = [
  { id: '1', title: 'Kuka Tesbih', lastBidder: 'Siz', newBidAfterYou: true },
  { id: '2', title: 'Oltu Taşı Tesbih', lastBidder: 'Siz', newBidAfterYou: false },
];

export default function OngoingAuctionsScreen() {
  const renderItem = ({ item }) => {
    const highlight = item.newBidAfterYou;

    return (
      <TouchableOpacity
        style={[
          styles.auctionItem,
          highlight && { backgroundColor: '#fff3e0', borderColor: '#ff6f00' },
        ]}
      >
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.status}>
          Son Teklif: {item.lastBidder}
        </Text>
        {highlight && <Text style={styles.warning}>Sizden sonra teklif verildi!</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Devam Eden Mezatlar</Text>
      <FlatList
        data={ongoingAuctions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff8e1', padding: 16 },
  header: { fontSize: 22, fontWeight: 'bold', color: '#4e342e', marginBottom: 10 },
  auctionItem: {
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  title: { fontSize: 16, fontWeight: 'bold', color: '#3e2723' },
  status: { fontSize: 14, color: '#5d4037', marginTop: 4 },
  warning: { fontSize: 13, color: '#d84315', marginTop: 6 },
});
