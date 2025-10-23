// screens/SendNotificationScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import axios from 'axios';

export default function SendNotificationScreen() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [toAllBuyers, setToAllBuyers] = useState(false);
  const [toAllSellers, setToAllSellers] = useState(false);
  const [includeGuests, setIncludeGuests] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSend = async () => {
    if (!title || !message) {
      Alert.alert('Uyarı', 'Lütfen başlık ve mesaj girin.');
      return;
    }

    // Alıcı seçimi kontrolü
    const noTargetsSelected = !email.trim() && !toAllBuyers && !toAllSellers && !includeGuests;
    if (noTargetsSelected) {
      Alert.alert('Uyarı', 'Lütfen e-posta yazın ya da alıcı grubu seçin (misafir dahil).');
      return;
    }

    try {
      setBusy(true);
      await axios.post('https://imame-backend.onrender.com/api/notifications/send', {
        title,
        message,
        email: email.trim() || undefined,
        toAllBuyers,
        toAllSellers,
        includeGuests, // 👈 backend’e yeni alan
      });

      Alert.alert('Başarılı', 'Bildirim gönderildi!');
      setTitle('');
      setMessage('');
      setEmail('');
      setToAllBuyers(false);
      setToAllSellers(false);
      setIncludeGuests(false);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      Alert.alert('Hata', msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bildirim Gönder</Text>

      <TextInput
        style={styles.input}
        placeholder="Başlık"
        placeholderTextColor="#8d6e63"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={styles.input}
        placeholder="Mesaj"
        placeholderTextColor="#8d6e63"
        value={message}
        onChangeText={setMessage}
      />

      <TextInput
        style={styles.input}
        placeholder="Tek bir kullanıcıya göndermek için e-posta"
        placeholderTextColor="#8d6e63"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <View style={styles.checkboxRow}>
        <CheckBox value={toAllBuyers} onValueChange={setToAllBuyers} />
        <Text style={styles.checkboxLabel}>Tüm Alıcılara Gönder</Text>
      </View>

      <View style={styles.checkboxRow}>
        <CheckBox value={toAllSellers} onValueChange={setToAllSellers} />
        <Text style={styles.checkboxLabel}>Tüm Satıcılara Gönder</Text>
      </View>

      <View style={styles.checkboxRow}>
        <CheckBox value={includeGuests} onValueChange={setIncludeGuests} />
        <Text style={styles.checkboxLabel}>Misafir Cihazlara da Gönder</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, busy && { opacity: 0.7 }]}
        onPress={handleSend}
        disabled={busy}
      >
        <Text style={styles.buttonText}>{busy ? 'Gönderiliyor…' : 'Gönder'}</Text>
      </TouchableOpacity>
    </View>
  );
}

// stiller
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
    borderColor: '#b5a16b',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    color: '#4e342e',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: '#4e342e',
  },
  button: {
    backgroundColor: '#6d4c41',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});