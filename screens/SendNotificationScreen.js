// SendNotificationScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import axios from 'axios';

export default function SendNotificationScreen() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [toAllBuyers, setToAllBuyers] = useState(false);
  const [toAllSellers, setToAllSellers] = useState(false);

  const handleSend = async () => {
    if (!title || !message) {
      Alert.alert('Uyarı', 'Lütfen başlık ve mesaj girin.');
      return;
    }

    try {
      await axios.post('https://imame-backend.onrender.com/api/notifications/send', {
        title,
        message,
        email,
        toAllBuyers,
        toAllSellers,
      });
      Alert.alert('Başarılı', 'Bildirim gönderildi!');
      setTitle('');
      setMessage('');
      setEmail('');
      setToAllBuyers(false);
      setToAllSellers(false);
    } catch (err) {
      Alert.alert('Hata', err.response?.data?.message || 'Bir hata oluştu.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bildirim Gönder</Text>

      <TextInput
        style={styles.input}
        placeholder="Başlık"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Mesaj"
        value={message}
        onChangeText={setMessage}
        multiline
      />

      <TextInput
        style={styles.input}
        placeholder="E-posta ile gönder (isteğe bağlı)"
        value={email}
        onChangeText={setEmail}
      />

      <View style={styles.checkboxContainer}>
        <CheckBox value={toAllBuyers} onValueChange={setToAllBuyers} />
        <Text style={styles.checkboxLabel}>Tüm Alıcılara Gönder</Text>
      </View>
      <View style={styles.checkboxContainer}>
        <CheckBox value={toAllSellers} onValueChange={setToAllSellers} />
        <Text style={styles.checkboxLabel}>Tüm Satıcılara Gönder</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSend}>
        <Text style={styles.buttonText}>Gönder</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8e1',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4e342e',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#6d4c41',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
  },
});
