import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

export default function ViewReportsScreen() {
  const [reports, setReports] = useState([
    {
      id: '1',
      reporter: 'ali@example.com',
      reportedUser: 'mehmet@example.com',
      reason: 'Kaba davranış ve hakaret içerikli mesajlar.',
    },
    {
      id: '2',
      reporter: 'ayse@example.com',
      reportedUser: 'ahmet@example.com',
      reason: 'Mezat kazandım ama ürün gönderilmedi.',
    },
  ]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.label}>Şikayet Eden:</Text>
      <Text style={styles.text}>{item.reporter}</Text>

      <Text style={styles.label}>Şikayet Edilen:</Text>
      <Text style={styles.text}>{item.reportedUser}</Text>

      <Text style={styles.label}>Açıklama:</Text>
      <Text style={styles.reason}>{item.reason}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Gelen Şikayetler</Text>
      <FlatList
        data={reports}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text>Hiç şikayet bulunamadı.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8e1',
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4e342e',
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  label: {
    fontWeight: 'bold',
    color: '#6d4c41',
  },
  text: {
    marginBottom: 5,
    color: '#333',
  },
  reason: {
    color: '#555',
    marginTop: 5,
    fontStyle: 'italic',
  },
});
