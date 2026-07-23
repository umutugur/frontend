// screens/EditProfileScreen.js
import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { Screen, ScreenHeader, Input, GradientButton } from '../components/ui';
import { useAlert } from '../context/AlertContext';
import { colors, radii, spacing, typography } from '../theme/tokens';

import iller from '../assets/data/sehirler.json';
import ilceler from '../assets/data/ilceler.json';
import mahalleler1 from '../assets/data/mahalleler-1.json';
import mahalleler2 from '../assets/data/mahalleler-2.json';
import mahalleler3 from '../assets/data/mahalleler-3.json';
import mahalleler4 from '../assets/data/mahalleler-4.json';

const mahalleler = [...mahalleler1, ...mahalleler2, ...mahalleler3, ...mahalleler4];

const EditProfileScreen = () => {
  const { user, updateUser } = useContext(AuthContext);
  const { showAlert } = useAlert();

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
      const ilceList = ilceler.filter((ilce) => ilce.sehir_id === selectedIlId);
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
      const mahalleList = mahalleler.filter((m) => m.ilce_id === selectedIlceId);
      setFilteredMahalleler(mahalleList);
      setSelectedMahalleId(null);
    } else {
      setFilteredMahalleler([]);
      setSelectedMahalleId(null);
    }
  }, [selectedIlceId]);

  const handleSave = () => {
    if (!fullName || !phone || !selectedIlId || !selectedIlceId || !selectedMahalleId || !sokak) {
      showAlert({ title: 'Hata', message: 'Lütfen tüm zorunlu alanları doldurun.' });
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
    showAlert({ title: 'Başarılı', message: 'Profil bilgileriniz güncellendi.' });
  };

  return (
    <Screen keyboardOffset={Platform.OS === 'ios' ? 64 : 0}>
      <ScreenHeader variant="plain" title="Profili Düzenle" />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View>
            <Text style={styles.sectionLabel}>Kişisel Bilgiler</Text>

            <Input
              variant="underline"
              leftIcon="person-outline"
              placeholder="Ad Soyad"
              value={fullName}
              onChangeText={setFullName}
              returnKeyType="next"
            />

            <Input
              variant="underline"
              leftIcon="call-outline"
              placeholder="Telefon"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              returnKeyType="next"
            />

            <Text style={styles.sectionLabel}>Adres</Text>

            <View style={styles.pickerRow}>
              <Ionicons name="map-outline" size={19} color={colors.muted} style={styles.pickerIcon} />
              <Text style={styles.label}>İl</Text>
            </View>
            <View style={styles.pickerWrap}>
              <Picker
                selectedValue={selectedIlId}
                onValueChange={setSelectedIlId}
                style={styles.picker}
              >
                <Picker.Item label="İl seçiniz" value={null} />
                {iller.map((il) => (
                  <Picker.Item key={il.sehir_id} label={il.sehir_adi} value={il.sehir_id} />
                ))}
              </Picker>
            </View>

            <View style={styles.pickerRow}>
              <Ionicons name="location-outline" size={19} color={colors.muted} style={styles.pickerIcon} />
              <Text style={styles.label}>İlçe</Text>
            </View>
            <View style={styles.pickerWrap}>
              <Picker
                selectedValue={selectedIlceId}
                onValueChange={setSelectedIlceId}
                enabled={filteredIlceler.length > 0}
                style={styles.picker}
              >
                <Picker.Item label="İlçe seçiniz" value={null} />
                {filteredIlceler.map((ilce) => (
                  <Picker.Item key={ilce.ilce_id} label={ilce.ilce_adi} value={ilce.ilce_id} />
                ))}
              </Picker>
            </View>

            <View style={styles.pickerRow}>
              <Ionicons name="home-outline" size={19} color={colors.muted} style={styles.pickerIcon} />
              <Text style={styles.label}>Mahalle</Text>
            </View>
            <View style={styles.pickerWrap}>
              <Picker
                selectedValue={selectedMahalleId}
                onValueChange={setSelectedMahalleId}
                enabled={filteredMahalleler.length > 0}
                style={styles.picker}
              >
                <Picker.Item label="Mahalle seçiniz" value={null} />
                {filteredMahalleler.map((mahalle) => (
                  <Picker.Item
                    key={mahalle.mahalle_id}
                    label={mahalle.mahalle_adi}
                    value={mahalle.mahalle_id}
                  />
                ))}
              </Picker>
            </View>

            <Input
              variant="underline"
              leftIcon="navigate-outline"
              placeholder="Sokak"
              value={sokak}
              onChangeText={setSokak}
              returnKeyType="next"
            />
            <Input
              variant="underline"
              leftIcon="business-outline"
              placeholder="Apartman No"
              value={apartmanNo}
              onChangeText={setApartmanNo}
              returnKeyType="next"
            />
            <Input
              variant="underline"
              leftIcon="keypad-outline"
              placeholder="Daire No"
              value={daireNo}
              onChangeText={setDaireNo}
              returnKeyType="done"
            />

            <GradientButton
              title="Kaydet"
              icon="save-outline"
              variant="gold"
              onPress={handleSave}
              style={styles.button}
            />

            {/* Klavye açıldığında son elemanın görünmesi için ekstra alt boşluk */}
            <View style={{ height: 24 }} />
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, flexGrow: 1 },
  sectionLabel: {
    ...typography.label,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  pickerIcon: {
    marginRight: spacing.sm,
  },
  pickerWrap: {
    backgroundColor: colors.creamHi,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  picker: {
    color: colors.brownDark,
  },
  label: {
    ...typography.title,
    color: colors.brownDark,
  },
  button: {
    marginTop: spacing.lg,
  },
});

export default EditProfileScreen;
