import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Switch } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

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

  // Dekont durumu için renkli işaret
  const renderStatusDot = (item) => {
    if (!item.isEnded) return null;
    // Biten mezat: dekontu onaylandıysa yeşil, aksi halde kırmızı
    const isApproved = item.receiptStatus === 'approved';
    return (
      <View style={[
        styles.statusDot,
        { backgroundColor: isApproved ? '#4caf50' : '#c62828' }
      ]} />
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('AuctionDetail', { auctionId: item._id })}
      style={styles.card}
      activeOpacity={0.95}
    >
      <View style={styles.headerRow}>
        <Text style={styles.title}>{item.title}</Text>
        {renderStatusDot(item)}
      </View>
      <Text style={styles.price}>Başlangıç Fiyatı: {item.startingPrice} TL</Text>
      <Text style={styles.statusText}>{item.isEnded ? "Bitti" : "Devam Ediyor"}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#6d4c41" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mezatlarım</Text>
      <View style={styles.checkboxRow}>
        <View style={styles.checkboxContainer}>
          <Switch
            value={showOngoing}
            onValueChange={setShowOngoing}
            thumbColor={showOngoing ? '#4caf50' : '#ccc'}
          />
          <Text style={styles.checkboxLabel}>Devam Edenler</Text>
        </View>
        <View style={styles.checkboxContainer}>
          <Switch
            value={showEnded}
            onValueChange={setShowEnded}
            thumbColor={showEnded ? '#e53935' : '#ccc'}
          />
          <Text style={styles.checkboxLabel}>Bitenler</Text>
        </View>
      </View>
      <FlatList
        data={filteredAuctions}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Kriterlere uygun mezat bulunamadı.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff8e1', padding: 16 },
  header: { fontSize: 22, fontWeight: 'bold', color: '#4e342e', marginBottom: 12 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  checkboxRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 8 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16 },
  checkboxLabel: { marginLeft: 4, color: '#6d4c41', fontWeight: 'bold' },
  list: { paddingBottom: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e0c9a6',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 16, fontWeight: 'bold', color: '#3e2723', flex: 1 },
  price: { fontSize: 14, color: '#5d4037', marginVertical: 3 },
  statusText: { fontSize: 13, color: '#8d6e63', marginTop: 2 },
  statusDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginLeft: 8,
    marginRight: 2,
    borderWidth: 1,
    borderColor: '#fff'
  },
  empty: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
});
