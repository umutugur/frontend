import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export default function BanUserScreen() {
  const [email, setEmail] = useState('');

  const handleBan = () => {
    if (!email.trim()) {
      Alert.alert('Hata', 'Lütfen bir email adresi girin.');
      return;
    }

    // Burada backend’e gönderilecek (şu anda sadece simülasyon)
    Alert.alert('Kullanıcı Engellendi', `${email} adresli kullanıcı sistemden engellendi.`);
    setEmail('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kullanıcı Engelle</Text>
      <TextInput
        placeholder="Kullanıcının e-posta adresi"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.button} onPress={handleBan}>
        <Text style={styles.buttonText}>Engelle</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8e1',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4e342e',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#b71c1c',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
