import React, { useContext, useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '../context/AuthContext';

import iller from '../assets/data/sehirler.json';
import ilceler from '../assets/data/ilceler.json';
import mahalleler1 from '../assets/data/mahalleler-1.json';
import mahalleler2 from '../assets/data/mahalleler-2.json';
import mahalleler3 from '../assets/data/mahalleler-3.json';
import mahalleler4 from '../assets/data/mahalleler-4.json';

const mahalleler = [...mahalleler1, ...mahalleler2, ...mahalleler3, ...mahalleler4];

const EditProfileScreen = () => {
  const { user, updateUser } = useContext(AuthContext);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedIlId, setSelectedIlId] = useState(null);
  const [selectedIlceId, setSelectedIlceId] = useState(null);
  const [selectedMahalleId, setSelectedMahalleId] = useState(null);
  const [filteredIlceler, setFilteredIlceler] = useState([]);
  const [filteredMahalleler, setFilteredMahalleler] = useState([]);
  const [sokak, setSokak] = useState('');
  const [apartmanNo, setApartmanNo] = useState('');
  const [daireNo, setDaireNo] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.name || '');
      setPhone(user.phone || '');
      if (user.address && typeof user.address === 'object') {
        setSelectedIlId(user.address.ilId || null);
        setSelectedIlceId(user.address.ilceId || null);
        setSelectedMahalleId(user.address.mahalleId || null);
        setSokak(user.address.sokak || '');
        setApartmanNo(user.address.apartmanNo || '');
        setDaireNo(user.address.daireNo || '');
      }
    }
  }, [user]);

  useEffect(() => {
    if (selectedIlId) {
      const ilceList = ilceler.filter(ilce => ilce.sehir_id === selectedIlId);
      setFilteredIlceler(ilceList);
      setSelectedIlceId(null);
      setSelectedMahalleId(null);
      setFilteredMahalleler([]);
    } else {
      setFilteredIlceler([]);
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
    } else {
      setFilteredMahalleler([]);
      setSelectedMahalleId(null);
    }
  }, [selectedIlceId]);

  const handleSave = () => {
    if (!fullName || !phone || !selectedIlId || !selectedIlceId || !selectedMahalleId || !sokak) {
      Alert.alert('Hata', 'Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    const updatedUser = {
      _id: user._id,
      name: fullName,
      phone,
      address: {
        ilId: selectedIlId,
        ilceId: selectedIlceId,
        mahalleId: selectedMahalleId,
        sokak,
        apartmanNo,
        daireNo,
      },
    };

    updateUser(updatedUser);
    Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi.');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Profili Düzenle</Text>

      <TextInput
        style={styles.input}
        placeholder="Ad Soyad"
        placeholderTextColor="#888"
        value={fullName}
        onChangeText={setFullName}
      />

      <TextInput
        style={styles.input}
        placeholder="Telefon"
        placeholderTextColor="#888"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
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
        placeholderTextColor="#888"
        value={sokak}
        onChangeText={setSokak}
      />
      <TextInput
        style={styles.input}
        placeholder="Apartman No"
        placeholderTextColor="#888"
        value={apartmanNo}
        onChangeText={setApartmanNo}
      />
      <TextInput
        style={styles.input}
        placeholder="Daire No"
        placeholderTextColor="#888"
        value={daireNo}
        onChangeText={setDaireNo}
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Kaydet</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff8e1', flexGrow: 1 },
  title: { fontSize: 24, color: '#4e342e', marginBottom: 20, fontWeight: 'bold', alignSelf: 'center' },
  input: {
    backgroundColor: '#fff',
    color: '#000',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  picker: {
    backgroundColor: '#fff',
    color: '#000',
    borderRadius: 10,
    marginBottom: 16,
  },
  label: { color: '#4e342e', marginBottom: 6, fontWeight: 'bold' },
  button: {
    backgroundColor: '#6d4c41',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default EditProfileScreen;
