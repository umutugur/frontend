import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '../context/AuthContext';

import iller from '../assets/data/sehirler.json';
import ilceler from '../assets/data/ilceler.json';
import mahalleler1 from '../assets/data/mahalleler-1.json';
import mahalleler2 from '../assets/data/mahalleler-2.json';
import mahalleler3 from '../assets/data/mahalleler-3.json';
import mahalleler4 from '../assets/data/mahalleler-4.json';
import { useNavigation } from '@react-navigation/native';

const mahalleler = [...mahalleler1, ...mahalleler2, ...mahalleler3, ...mahalleler4];

const RegisterScreen = () => {
  const { login } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [selectedIlId, setSelectedIlId] = useState(null);
  const [selectedIlceId, setSelectedIlceId] = useState(null);
  const [selectedMahalleId, setSelectedMahalleId] = useState(null);
  const [filteredIlceler, setFilteredIlceler] = useState([]);
  const [filteredMahalleler, setFilteredMahalleler] = useState([]);
  const [sokak, setSokak] = useState('');
  const [apartmanNo, setApartmanNo] = useState('');
  const [daireNo, setDaireNo] = useState('');

  useEffect(() => {
    if (selectedIlId) {
      const ilceList = ilceler.filter(ilce => ilce.sehir_id === selectedIlId);
      setFilteredIlceler(ilceList);
      setSelectedIlceId(null);
      setSelectedMahalleId(null);
      setFilteredMahalleler([]);
    }
  }, [selectedIlId]);

  useEffect(() => {
    if (selectedIlceId) {
      const mahalleList = mahalleler.filter(m => m.ilce_id === selectedIlceId);
      setFilteredMahalleler(mahalleList);
      setSelectedMahalleId(null);
    }
  }, [selectedIlceId]);
  const navigation = useNavigation();
  const handleRegister = async () => {
      console.log("İl ID:", selectedIlId);
      console.log("İlçe ID:", selectedIlceId);
      console.log("Mahalle ID:", selectedMahalleId);
  if (!name || !email || !password || !selectedIlId || !selectedIlceId || !selectedMahalleId || !sokak) {
    setError('Tüm zorunlu alanları doldurun.');
    return;
  }

  setLoading(true);
  setError('');

  const address = {
    ilId: selectedIlId,
    ilceId: selectedIlceId,
    mahalleId: selectedMahalleId,
    sokak,
    apartmanNo,
    daireNo
  };

  try {
    const res = await fetch('https://imame-backend.onrender.com/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, address })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Kayıt başarısız');

    // Otomatik login kaldırıldı
    Alert.alert(
      'Kayıt Başarılı',
      'Hesabınız oluşturuldu. Giriş yapabilirsiniz.',
      [
        {
          text: 'Tamam',
          onPress: () => navigation.navigate('Login')
        }
      ]
    );
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Kayıt Ol</Text>

      <TextInput
        style={styles.input}
        placeholder="Ad Soyad"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="E-posta"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Şifre"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Text style={styles.label}>İl</Text>
      <Picker
        selectedValue={selectedIlId}
        onValueChange={setSelectedIlId}
        style={styles.picker}
      >
        <Picker.Item label="İl seçiniz" value={null} />
        {iller.map(il => (
          <Picker.Item key={il.sehir_id} label={il.sehir_adi} value={il.sehir_id} />
        ))}
      </Picker>

      <Text style={styles.label}>İlçe</Text>
      <Picker
        selectedValue={selectedIlceId}
        onValueChange={setSelectedIlceId}
        enabled={filteredIlceler.length > 0}
        style={styles.picker}
      >
        <Picker.Item label="İlçe seçiniz" value={null} />
        {filteredIlceler.map(ilce => (
          <Picker.Item key={ilce.ilce_id} label={ilce.ilce_adi} value={ilce.ilce_id} />
        ))}
      </Picker>

      <Text style={styles.label}>Mahalle</Text>
      <Picker
        selectedValue={selectedMahalleId}
        onValueChange={setSelectedMahalleId}
        enabled={filteredMahalleler.length > 0}
        style={styles.picker}
      >
        <Picker.Item label="Mahalle seçiniz" value={null} />
        {filteredMahalleler.map(mahalle => (
          <Picker.Item key={mahalle.mahalle_id} label={mahalle.mahalle_adi} value={mahalle.mahalle_id} />
        ))}
      </Picker>

      <TextInput
        style={styles.input}
        placeholder="Sokak"
        value={sokak}
        onChangeText={setSokak}
      />
      <TextInput
        style={styles.input}
        placeholder="Apartman No"
        value={apartmanNo}
        onChangeText={setApartmanNo}
      />
      <TextInput
        style={styles.input}
        placeholder="Daire No"
        value={daireNo}
        onChangeText={setDaireNo}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Kayıt olunuyor...' : 'Kayıt Ol'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#fff8e1', flexGrow: 1 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#4e342e', marginBottom: 32, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    color: '#000'
  },
  picker: {
    backgroundColor: '#fff',
    marginBottom: 16,
    borderRadius: 12,
  },
  label: { color: '#4e342e', fontWeight: 'bold', marginBottom: 6 },
  button: {
    backgroundColor: '#6d4c41',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  error: { color: 'red', textAlign: 'center', marginBottom: 10 }
});

export default RegisterScreen;
