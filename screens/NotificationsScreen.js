import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const mockNotifications = [
  { id: '1', title: 'Yeni mezat eklendi!', time: '5 dakika önce' },
  { id: '2', title: 'Teklifiniz kabul edildi.', time: '1 saat önce' },
  { id: '3', title: 'Mezat kazandınız! Dekont yüklemeyi unutmayın.', time: 'Dün' },
];

export default function NotificationsScreen() {
  const renderItem = ({ item }) => (
    <View style={styles.notification}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.time}>{item.time}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={mockNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
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
  notification: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4e342e',
  },
  time: {
    fontSize: 12,
    color: 'gray',
    marginTop: 4,
  },
});
