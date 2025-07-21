import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Modal, TextInput, Button } from 'react-native';
import axios from 'axios';

export default function ManageAuctionsScreen() {
  const [auctions, setAuctions] = useState([]);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [reason, setReason] = useState('');

  const fetchAuctions = async () => {
    try {
      const res = await axios.get('https://imame-backend.onrender.com/api/auctions/all');
      setAuctions(res.data);
    } catch (err) {
      Alert.alert('Mezatlar alınamadı', err.message);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  const handleDeleteAuction = async () => {
    if (!reason.trim()) {
      Alert.alert('Sebep zorunlu', 'Lütfen bir silme sebebi girin.');
      return;
    }
    try {
      await axios.post(`https://imame-backend.onrender.com/api/auctions/delete/${selectedAuction._id}`, { reason });
      setAuctions((prev) => prev.filter(a => a._id !== selectedAuction._id));
      setModalVisible(false);
      setReason('');
      Alert.alert('Başarılı', 'Mezat silindi ve satıcıya bildirildi.');
    } catch (err) {
      Alert.alert('Silme hatası', err.message);
    }
  };

  const openDeleteModal = (auction) => {
    setSelectedAuction(auction);
    setModalVisible(true);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.desc}>{item.description}</Text>
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => openDeleteModal(item)}
      >
        <Text style={styles.deleteText}>Sil</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={auctions}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
      />

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Silme Sebebi</Text>
            <TextInput
              value={reason}
              onChangeText={setReason}
              placeholder="Sebep giriniz..."
              style={styles.input}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Button title="Vazgeç" onPress={() => setModalVisible(false)} />
              <Button title="Sil" color="#d32f2f" onPress={handleDeleteAuction} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff8e1', padding: 12 },
  card: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 10, elevation: 2 },
  title: { fontWeight: 'bold', fontSize: 17, color: '#4e342e' },
  desc: { color: '#555', marginVertical: 4 },
  deleteBtn: { marginTop: 8, backgroundColor: '#ffcdd2', borderRadius: 6, alignSelf: 'flex-end', padding: 6 },
  deleteText: { color: '#d32f2f', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: '#0008', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: 320, backgroundColor: '#fff', borderRadius: 12, padding: 18, alignItems: 'stretch' },
  modalTitle: { fontWeight: 'bold', fontSize: 18, marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginBottom: 10 }
});
