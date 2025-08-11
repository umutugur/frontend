// screens/ViewReportsScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';

export default function ViewReportsScreen() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get('https://imame-backend.onrender.com/api/reports');
        setReports(res.data);
      } catch (err) {
        Alert.alert('Hata', err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.label}>Şikayet Eden:</Text>
      <Text style={styles.text}>{item.reporter?.email || item.reporter?.name}</Text>
      <Text style={styles.label}>Şikayet Edilen:</Text>
      <Text style={styles.text}>{item.reportedSeller?.email || item.reportedSeller?.name}</Text>
      <Text style={styles.label}>Açıklama:</Text>
      <Text style={styles.reason}>{item.message}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Gelen Şikayetler</Text>
      <FlatList
        data={reports}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListEmptyComponent={<Text>Hiç şikayet bulunamadı.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff8e1', padding: 20 },
  header: { fontSize: 22, fontWeight: 'bold', color: '#4e342e', marginBottom: 15 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 15, borderColor: '#ccc', borderWidth: 1 },
  label: { fontWeight: 'bold', color: '#6d4c41' },
  text: { marginBottom: 5, color: '#333' },
  reason: { color: '#555', marginTop: 5, fontStyle: 'italic' },
});
