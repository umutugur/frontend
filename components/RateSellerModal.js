import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  StyleSheet,
  Button,
  Alert,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import { FontAwesome } from '@expo/vector-icons';

export default function RateSellerModal({ visible, onClose, sellerId, auctionId, buyerId }) {
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState('');

  const handleStarPress = (value) => setScore(value);

  const submitRating = async () => {
    if (score === 0) {
      Alert.alert('Hata', 'Lütfen 1-5 arası bir puan verin.');
      return;
    }

    try {
      await axios.post('https://imame-backend.onrender.com/api/ratings', {
        sellerId,
        buyerId,
        auctionId,
        score,
        comment,
      });

      Alert.alert('Teşekkürler', 'Puanınız kaydedildi');
      setScore(0);
      setComment('');
      onClose();
    } catch (err) {
      Alert.alert('Hata', err.response?.data?.message || err.message);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackground}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Satıcıyı Puanla</Text>

          <View style={styles.starContainer}>
            {[1, 2, 3, 4, 5].map((value) => (
              <TouchableOpacity key={value} onPress={() => handleStarPress(value)}>
                <FontAwesome
                  name={value <= score ? 'star' : 'star-o'}
                  size={32}
                  color="#fbc02d"
                  style={{ marginHorizontal: 4 }}
                />
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            value={comment}
            onChangeText={setComment}
            style={[styles.input, { height: 80 }]}
            multiline
            placeholder="Yorum (opsiyonel)"
            placeholderTextColor="#8e8e8e"
          />

          <View style={styles.buttonRow}>
            <Button title="İptal" onPress={onClose} color="#a1887f" />
            <Button title="Puanla" onPress={submitRating} color="#388e3c" />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '90%',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 12,
    color: '#4e342e',
    textAlign: 'center',
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
