import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

const dummyFavorites = [
  { id: '1', name: 'Tesbihci Ahmet' },
  { id: '2', name: 'El İşi Tesbihler' },
  { id: '3', name: 'Osmanlı Tesbih' },
];

export default function FavoritesScreen() {
  const handlePress = (sellerId) => {
    alert(`Satıcı profiline git: ${sellerId}`);
    // İleride seller profile screen varsa navigate edilecek
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favori Satıcılar</Text>
      <FlatList
        data={dummyFavorites}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handlePress(item.id)} style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Henüz favori satıcınız yok.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8e1',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4e342e',
    marginBottom: 10,
  },
  card: {
    padding: 16,
    backgroundColor: '#ffe0b2',
    borderRadius: 10,
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    color: '#4e342e',
  },
  empty: {
    marginTop: 50,
    textAlign: 'center',
    color: '#888',
  },
});
