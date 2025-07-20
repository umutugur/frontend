// screens/AuctionManagementScreen.js
import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

const dummyAuctions = [
  { id: '1', title: 'Kuka Tesbih', status: 'Devam Ediyor' },
  { id: '2', title: 'Sıkma Kehribar', status: 'Bitti' },
  { id: '3', title: 'Usta İşçilikli Oltu', status: 'Devam Ediyor' },
];

const AuctionManagementScreen = ({ navigation }) => {
  const handleEdit = (id) => {
    alert(`Mezat #${id} düzenleme ekranına yönlendirilecek.`);
  };

  const handleDelete = (id) => {
    alert(`Mezat #${id} silinecek.`);
  };

  const renderItem = ({ item }) => (
    <View style={styles.auctionItem}>
      <View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.status}>{item.status}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.button} onPress={() => handleEdit(item.id)}>
          <Text style={styles.buttonText}>Düzenle</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.delete]} onPress={() => handleDelete(item.id)}>
          <Text style={styles.buttonText}>Sil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mezat Yönetimi</Text>
      <FlatList
        data={dummyAuctions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff8e1',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4e342e',
    marginBottom: 16,
  },
  auctionItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3e2723',
  },
  status: {
    fontSize: 14,
    color: 'gray',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    backgroundColor: '#6d4c41',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  delete: {
    backgroundColor: '#c62828',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default AuctionManagementScreen;
