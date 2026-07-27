import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { Screen, ScreenHeader, Input, GradientButton, OrnamentDivider } from '../components/ui';
import { colors, spacing, radii, typography } from '../theme/tokens';

import iller from '../assets/data/sehirler.json';
import ilceler from '../assets/data/ilceler.json';
import mahalleler1 from '../assets/data/mahalleler-1.json';
import mahalleler2 from '../assets/data/mahalleler-2.json';
import mahalleler3 from '../assets/data/mahalleler-3.json';
import mahalleler4 from '../assets/data/mahalleler-4.json';
import { useNavigation } from '@react-navigation/native';

const mahalleler = [
  ...mahalleler1,
  ...mahalleler2,
  ...mahalleler3,
  ...mahalleler4,
];

const RegisterScreen = () => {
  const { login } = useContext(AuthContext);
  const { showAlert } = useAlert();
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
    if (
      !name ||
      !email ||
      !password ||
      !selectedIlId ||
      !selectedIlceId ||
      !selectedMahalleId ||
      !sokak
    ) {
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
      daireNo,
    };

    try {
      const res = await fetch('https://imame-backend.onrender.com/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, address }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Kayıt başarısız');

      // Otomatik login kaldırıldı
      showAlert({
        title: 'Kayıt Başarılı',
        message: 'Hesabınız oluşturuldu. Giriş yapabilirsiniz.',
        buttons: [
          {
            text: 'Tamam',
            onPress: () => navigation.navigate('Login'),
          },
        ],
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <ScreenHeader
        variant="plain"
        title="Kayıt Ol"
        subtitle="Yeni bir hesap oluşturun"
      />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Input
          variant="underline"
          leftIcon="person-outline"
          placeholder="Ad Soyad"
          value={name}
          onChangeText={setName}
        />

        <Input
          variant="underline"
          leftIcon="mail-outline"
          placeholder="E-posta"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Input
          variant="underline"
          leftIcon="lock-closed-outline"
          placeholder="Şifre"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <View style={styles.sectionRow}>
          <Ionicons name="location-outline" size={16} color={colors.gold} />
          <Text style={styles.sectionLabel}>Adres Bilgileri</Text>
        </View>

        <Text style={styles.label}>İl</Text>
        <View style={styles.pickerWrapper}>
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

        <Text style={styles.label}>İlçe</Text>
        <View style={styles.pickerWrapper}>
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

        <Text style={styles.label}>Mahalle</Text>
        <View style={styles.pickerWrapper}>
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

        <Input
          variant="underline"
          leftIcon="trail-sign-outline"
          placeholder="Sokak"
          value={sokak}
          onChangeText={setSokak}
        />
        <Input
          variant="underline"
          leftIcon="business-outline"
          placeholder="Apartman No"
          value={apartmanNo}
          onChangeText={setApartmanNo}
        />
        <Input
          variant="underline"
          leftIcon="home-outline"
          placeholder="Daire No"
          value={daireNo}
          onChangeText={setDaireNo}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <OrnamentDivider />

        <GradientButton
          title={loading ? 'Kayıt olunuyor...' : 'Kayıt Ol'}
          icon="person-add-outline"
          variant="gold"
          onPress={handleRegister}
          loading={loading}
          disabled={loading}
          style={styles.button}
        />
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.huge,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionLabel: {
    ...typography.label,
  },
  pickerWrapper: {
    backgroundColor: colors.creamHi,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radii.md,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  picker: {
    color: colors.brownDark,
  },
  label: {
    ...typography.bodyStrong,
    color: colors.brown,
    marginBottom: spacing.xs,
    marginLeft: 2,
  },
  button: {
    marginTop: spacing.xs,
  },
  error: {
    ...typography.bodyStrong,
    color: colors.danger,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});

export default RegisterScreen;
