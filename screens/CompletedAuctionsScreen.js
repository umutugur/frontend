import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function CompletedAuctionsScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWonAuctions();
  }, []);

  const fetchWonAuctions = async () => {
    try {
      const res = await axios.get(`https://imame-backend.onrender.com/api/auctions/won/${user._id}`);
      setAuctions(res.data);
    } catch (err) {
      console.error('Mezatlar alınamadı:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCountdown = (deadline) => {
    const diff = new Date(deadline) - new Date();
    if (diff <= 0) return 'Süre doldu';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    return `${hours} saat ${minutes} dakika kaldı`;
  };

  const handleUploadReceipt = (auctionId) => {
    navigation.navigate('UploadReceipt', { auctionId });
  };

  const renderItem = ({ item }) => {
  const rejected = item.receiptStatus === 'rejected';

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('AuctionDetail', { auctionId: item._id })}
      style={styles.auctionItem}
      activeOpacity={0.9}
    >
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.price}>Kazandığınız Fiyat: {item.currentPrice} TL</Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>🏦 Satıcı Ödeme Bilgileri</Text>
        <Text>IBAN: {item.seller?.iban || '-'}</Text>
        <Text>IBAN İsmi: {item.seller?.ibanName || '-'}</Text>
        <Text>Banka: {item.seller?.bankName || '-'}</Text>
        <Text style={styles.countdown}>⏳ {formatCountdown(item.paymentDeadline)}</Text>
      </View>

      {/* Dekont durumu */}
      {item.receiptUploaded && (
        <Text style={[
          styles.statusLabel,
          item.receiptStatus === 'approved' ? styles.statusApproved :
          item.receiptStatus === 'rejected' ? styles.statusRejected :
          styles.statusPending
        ]}>
          {item.receiptStatus === 'approved' ? 'Onaylandı' :
           item.receiptStatus === 'rejected' ? 'Reddedildi' : 'Bekliyor'}
        </Text>
      )}

      {/* Dekont yükleme seçenekleri */}
      {rejected ? (
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => handleUploadReceipt(item._id)}
        >
          <Text style={styles.uploadButtonText}>Tekrar Dekont Yükle</Text>
        </TouchableOpacity>
      ) : item.receiptUploaded ? (
        <Text style={styles.uploadedLabel}>📄 Dekont yüklendi</Text>
      ) : (
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => handleUploadReceipt(item._id)}
        >
          <Text style={styles.uploadButtonText}>Dekont Yükle</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};


  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#6d4c41" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Kazandığınız Mezatlar</Text>
      <FlatList
        data={auctions}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={<Text style={styles.empty}>Henüz kazandığınız mezat yok.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff8e1', padding: 16 },
  header: { fontSize: 22, fontWeight: 'bold', color: '#4e342e', marginBottom: 10 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  auctionItem: {
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  title: { fontSize: 16, fontWeight: 'bold', color: '#3e2723' },
  price: { fontSize: 14, color: '#5d4037', marginVertical: 4 },
  infoBox: {
    backgroundColor: '#fce4ec',
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#880e4f',
    marginBottom: 4,
  },
  countdown: {
    marginTop: 6,
    color: '#b71c1c',
    fontWeight: 'bold',
  },
  uploadButton: {
    backgroundColor: '#6d4c41',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  uploadedLabel: {
    textAlign: 'center',
    marginTop: 10,
    color: '#4caf50',
    fontWeight: 'bold',
  },
  statusLabel: {
    marginTop: 6,
    padding: 6,
    borderRadius: 6,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  statusPending: { backgroundColor: '#ffeb3b', color: '#333' },
  statusApproved: { backgroundColor: '#c8e6c9', color: '#2e7d32' },
  statusRejected: { backgroundColor: '#ffcdd2', color: '#c62828' },
  empty: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
});
