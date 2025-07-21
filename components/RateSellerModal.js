import React, { useState } from 'react';
import { View, Text, TextInput, Button, Modal, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';

export default function RateSellerModal({ visible, onClose, sellerId, auctionId, buyerId }) {
  const [score, setScore] = useState('');
  const [comment, setComment] = useState('');

  const submitRating = async () => {
    try {
      await axios.post('https://imame-backend.onrender.com/api/ratings', {
        sellerId,
        buyerId,
        auctionId,
        score: parseInt(score),
        comment
      });
      Alert.alert('Teşekkürler', 'Puanınız kaydedildi');
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
          <TextInput
            value={score}
            onChangeText={setScore}
            keyboardType="number-pad"
            style={styles.input}
            maxLength={1}
            placeholder="1-5"
          />
          <TextInput
            value={comment}
            onChangeText={setComment}
            style={[styles.input, { height: 80 }]}
            multiline
            placeholder="Yorum (opsiyonel)"
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Button title="İptal" onPress={onClose} color="#a1887f" />
            <Button title="Puanla" onPress={submitRating} color="#388e3c" />
          </View>
        </View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  modalBackground: { flex:1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent:'center', alignItems:'center' },
  modalContent: { backgroundColor:'#fff', borderRadius:12, padding:24, width:'90%' },
  title: { fontWeight:'bold', fontSize:18, marginBottom:12, color:'#4e342e' },
  input: { backgroundColor:'#f5f5f5', borderRadius:8, padding:12, marginBottom:12 },
});
