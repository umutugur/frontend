import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Screen, Input, GradientButton } from '../components/ui';
import { useAlert } from '../context/AlertContext';
import { colors, radii, spacing, typography } from '../theme/tokens';

// JSON veri importları
import iller from '../assets/data/sehirler.json';
import ilceler from '../assets/data/ilceler.json';
import mahalleler1 from '../assets/data/mahalleler-1.json';
import mahalleler2 from '../assets/data/mahalleler-2.json';
import mahalleler3 from '../assets/data/mahalleler-3.json';
import mahalleler4 from '../assets/data/mahalleler-4.json';

const mahalleler = [...mahalleler1, ...mahalleler2, ...mahalleler3, ...mahalleler4];

export default function AddSellerScreen() {
  const { showAlert } = useAlert();
  const [seller, setSeller] = useState({
    companyName: '',
    name: '',
    email: '',
    password: '',
    phone: '',
    address: null,
    iban: '',
    ibanName: '',
    bankName: '',
  });

  // Adres için alt state
  const [selectedIlId, setSelectedIlId] = useState(null);
  const [selectedIlceId, setSelectedIlceId] = useState(null);
  const [selectedMahalleId, setSelectedMahalleId] = useState(null);
  const [sokak, setSokak] = useState('');
  const [apartmanNo, setApartmanNo] = useState('');
  const [daireNo, setDaireNo] = useState('');

  const [filteredIlceler, setFilteredIlceler] = useState([]);
  const [filteredMahalleler, setFilteredMahalleler] = useState([]);

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

  const handleChange = (key, value) => {
    setSeller((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!seller.companyName || !seller.email || !seller.password) {
      return showAlert({ title: 'Hata', message: 'Firma adı, e-posta ve şifre zorunludur.' });
    }

    if (!selectedIlId || !selectedIlceId || !selectedMahalleId || !sokak) {
      return showAlert({ title: 'Hata', message: 'Adres bilgileri eksik.' });
    }

    const addressObj = {
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
        body: JSON.stringify({
          ...seller,
          role: 'seller',
          address: addressObj,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Satıcı kaydı başarısız');

      showAlert({ title: 'Başarılı', message: 'Satıcı başarıyla eklendi.' });
      setSeller({
        companyName: '',
        name: '',
        email: '',
        password: '',
        phone: '',
        address: null,
        iban: '',
        ibanName: '',
        bankName: '',
      });
      setSelectedIlId(null);
      setSelectedIlceId(null);
      setSelectedMahalleId(null);
      setSokak('');
      setApartmanNo('');
      setDaireNo('');
    } catch (err) {
      showAlert({ title: 'Hata', message: err.message });
    }
  };

  return (
    <Screen scroll contentContainerStyle={styles.container}>
      <Text style={styles.title}>Yeni Satıcı Ekle</Text>

      {[
        { label: 'Firma Adı', key: 'companyName' },
        { label: 'Yetkili Adı Soyadı', key: 'name' },
        { label: 'E-posta', key: 'email' },
        { label: 'Şifre', key: 'password' },
        { label: 'Telefon Numarası', key: 'phone' },
        { label: 'IBAN', key: 'iban' },
        { label: 'IBAN Sahibi', key: 'ibanName' },
        { label: 'Banka Adı', key: 'bankName' },
      ].map(({ label, key }) => (
        <Input
          key={key}
          placeholder={label}
          value={seller[key]}
          onChangeText={(text) => handleChange(key, text)}
          secureTextEntry={key === 'password'}
        />
      ))}

      <Text style={styles.addressLabel}>İl</Text>
      <View style={styles.pickerWrap}>
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
      </View>

      <Text style={styles.addressLabel}>İlçe</Text>
      <View style={styles.pickerWrap}>
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
      </View>

      <Text style={styles.addressLabel}>Mahalle</Text>
      <View style={styles.pickerWrap}>
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
      </View>

      <Input placeholder="Sokak" value={sokak} onChangeText={setSokak} />
      <Input placeholder="Apartman No" value={apartmanNo} onChangeText={setApartmanNo} />
      <Input placeholder="Daire No" value={daireNo} onChangeText={setDaireNo} />

      <GradientButton
        title="Satıcıyı Kaydet"
        icon="checkmark-circle-outline"
        onPress={handleSubmit}
        style={styles.button}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.brownDark,
    marginBottom: spacing.xl,
    alignSelf: 'center',
  },
  addressLabel: {
    ...typography.h3,
    color: colors.brownDark,
    marginBottom: spacing.sm,
  },
  pickerWrap: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radii.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  picker: {
    color: colors.brownDark,
  },
  button: {
    marginTop: spacing.md,
  },
});
