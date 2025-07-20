import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, Alert, Modal, Pressable, ScrollView
} from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function ReceiptApprovalScreen() {
  const { user } = useContext(AuthContext); // Satıcı bilgisi
  const [receipts, setReceipts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (user?.role === 'seller') {
      fetchReceipts();
    }
  }, [user]);

  const fetchReceipts = async () => {
    try {
      const res = await axios.get(`https://imame-backend.onrender.com/api/receipts/mine/${user._id}`);
      setReceipts(res.data);
    } catch (err) {
      console.error('Dekontlar alınamadı:', err);
    }
  };

  const handleApproval = async (id, approved) => {
    try {
      const url = `https://imame-backend.onrender.com/api/receipts/${id}/${approved ? 'approve' : 'reject'}`;
      await axios.patch(url);
      Alert.alert('Başarılı', `Dekont ${approved ? 'onaylandı' : 'reddedildi'}.`);
      fetchReceipts();
    } catch (err) {
      console.error('Dekont işlem hatası:', err);
      Alert.alert('Hata', 'İşlem sırasında hata oluştu.');
    }
  };

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setModalVisible(true);
  };

  const closeImageModal = () => {
    setModalVisible(false);
    setSelectedImage(null);
  };

  const renderItem = ({ item }) => {
    const address = item.buyer?.address || {};
    return (
      <View style={styles.card}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>Kazanan: {item.buyer?.name || 'Bilinmiyor'}</Text>

        <TouchableOpacity onPress={() => openImageModal(item.receiptUrl)}>
          <Image source={{ uri: item.receiptUrl }} style={styles.image} />
        </TouchableOpacity>

        <Text style={styles.subtitle}>Durum: {item.receiptStatus}</Text>

        {item.receiptStatus === 'pending' ? (
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.approveButton} onPress={() => handleApproval(item._id, true)}>
              <Text style={styles.buttonText}>Onayla</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rejectButton} onPress={() => handleApproval(item._id, false)}>
              <Text style={styles.buttonText}>Reddet</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.buyerInfo}>
  <Text style={styles.infoText}><Text style={styles.bold}>Ad Soyad:</Text> {item.buyer?.name || '-'}</Text>
  <Text style={styles.infoText}><Text style={styles.bold}>Telefon:</Text> {item.buyer?.phone || '-'}</Text>
  <Text style={styles.infoText}><Text style={styles.bold}>Adres:</Text></Text>
  <ScrollView style={styles.addressBox}>
    <Text>
      {address.mahalle || ''} {address.sokak || ''} Apartman no: {address.apartmanNo || '-'} Daire: {address.daireNo || '-'}
    </Text>
    <Text>
      {address.ilce || ''} / {address.il || ''}
    </Text>
  </ScrollView>
</View>

        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Bekleyen Dekontlar</Text>
      <FlatList
        data={receipts}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListEmptyComponent={<Text>Onay bekleyen dekont bulunamadı.</Text>}
      />

      {/* Modal - Tam boy görsel */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageModal}
      >
        <View style={styles.modalBackground}>
          <Pressable style={styles.modalCloseArea} onPress={closeImageModal} />
          <View style={styles.modalContent}>
            {selectedImage && (
              <Image
                source={{ uri: selectedImage }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            )}
          </View>
          <Pressable style={styles.modalCloseArea} onPress={closeImageModal} />
        </View>
      </Modal>
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4e342e',
  },
  subtitle: {
    fontSize: 14,
    marginVertical: 4,
    color: '#6d4c41',
  },
  image: {
    width: '100%',
    height: 150,
    marginBottom: 10,
    borderRadius: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  approveButton: {
    backgroundColor: '#388e3c',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: '#d32f2f',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  buyerInfo: {
    marginTop: 10,
    backgroundColor: '#f5f5dc',
    padding: 12,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#3e2723',
  },
  bold: {
    fontWeight: 'bold',
  },
  addressBox: {
    maxHeight: 100,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: '70%',
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  fullImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  modalCloseArea: {
    flex: 1,
    width: '100%',
  },
});
