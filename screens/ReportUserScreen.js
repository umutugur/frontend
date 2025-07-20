import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export default function ReportUserScreen() {
  const [reportText, setReportText] = useState('');

  const handleSubmit = () => {
    if (reportText.trim() === '') {
      Alert.alert('Uyarı', 'Lütfen bir açıklama girin.');
      return;
    }

    // Burada backend'e gönderilecek (şimdilik alert simülasyonu)
    Alert.alert('Teşekkürler', 'Şikayetiniz alınmıştır.');
    setReportText('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kullanıcı Şikayet Et</Text>
      <TextInput
        placeholder="Şikayetinizi buraya yazın..."
        value={reportText}
        onChangeText={setReportText}
        multiline
        numberOfLines={6}
        style={styles.input}
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
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
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4e342e',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    textAlignVertical: 'top',
    marginBottom: 20,
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
});
