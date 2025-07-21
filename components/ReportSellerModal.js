import React, { useState } from 'react';
import { View, Text, TextInput, Button, Modal, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

export default function ReportSellerModal({ visible, onClose, sellerId, reporterId }) {
  const [message, setMessage] = useState('');

  const submitReport = async () => {
    try {
      await axios.post('https://imame-backend.onrender.com/api/reports', {
        reportedSeller: sellerId,
        reporter: reporterId,
        message,
      });
      Alert.alert('Teşekkürler', 'Şikayetiniz alındı');
      onClose();
    } catch (err) {
      Alert.alert('Hata', err.response?.data?.message || err.message);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.modalBackground}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Satıcıyı Şikayet Et</Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            style={[styles.input, { height: 80 }]}
            multiline
            placeholder="Şikayet sebebinizi yazabilirsiniz (isteğe bağlı)"
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Button title="İptal" onPress={onClose} color="#a1887f" />
            <Button title="Gönder" onPress={submitReport} color="#d32f2f" />
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
