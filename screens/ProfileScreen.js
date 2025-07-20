import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';

// Adres JSON verileri
import iller from '../assets/data/sehirler.json';
import ilceler from '../assets/data/ilceler.json';
import mahalleler1 from '../assets/data/mahalleler-1.json';
import mahalleler2 from '../assets/data/mahalleler-2.json';
import mahalleler3 from '../assets/data/mahalleler-3.json';
import mahalleler4 from '../assets/data/mahalleler-4.json';

const mahalleler = [...mahalleler1, ...mahalleler2, ...mahalleler3, ...mahalleler4];

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, logout } = useContext(AuthContext);

  const handleNavigate = (screen) => {
    navigation.navigate(screen);
  };

  const handleLogout = async () => {
    await logout();
    navigation.replace('Login');
  };

  const renderBuyerOptions = () => (
    <>
      <TouchableOpacity style={styles.card} onPress={() => handleNavigate('MyBids')}>
        <Text style={styles.link}>📌 Tekliflerim</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => handleNavigate('CompletedAuctions')}>
        <Text style={styles.link}>✅ Biten Mezatlar</Text>
      </TouchableOpacity>
    </>
  );

  const renderSellerOptions = () => (
    <>
      <TouchableOpacity style={styles.card} onPress={() => handleNavigate('AddAuction')}>
        <Text style={styles.link}>➕ Mezat Ekle</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => handleNavigate('ReceiptApproval')}>
        <Text style={styles.link}>🧾 Dekont Onayla</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => handleNavigate('MyAuctions')}>
        <Text style={styles.link}>📦 Mezatlarım</Text>
      </TouchableOpacity>
    </>
  );

  const renderAdminOptions = () => (
    <TouchableOpacity onPress={() => navigation.navigate('AdminPanel')}>
      <Text style={{ color: 'blue', marginTop: 20, fontWeight: 'bold' }}>🔐 Admin Panel</Text>
    </TouchableOpacity>
  );

 const renderAddress = () => {
  if (!user?.address) return null;

  const { ilId, ilceId, mahalleId, sokak, apartmanNo, daireNo } = user.address;

  const ilAdi = iller.find(il => il.sehir_id === String(ilId))?.sehir_adi || '-';
  const ilceAdi = ilceler.find(ilce => ilce.ilce_id === String(ilceId))?.ilce_adi || '-';
  const mahalleAdi = mahalleler.find(m => m.mahalle_id === String(mahalleId))?.mahalle_adi || '-';

  return (
    <View>
      <Text style={styles.label}>Adres Bilgileri:</Text>
      <Text style={styles.value}>İl : {ilAdi}</Text>
      <Text style={styles.value}>İlçe : {ilceAdi}</Text>
      <Text style={styles.value}>Mahalle : {mahalleAdi}</Text>
      <Text style={styles.value}>Sokak : {sokak || '-'}</Text>
      <Text style={styles.value}>Apartman No : {apartmanNo || '-'}</Text>
      <Text style={styles.value}>Daire No : {daireNo || '-'}</Text>
    </View>
  );
};



  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Profilim</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Ad Soyad:</Text>
        <Text style={styles.value}>{user?.name || '-'}</Text>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{user?.email || '-'}</Text>
        <Text style={styles.label}>Telefon:</Text>
        <Text style={styles.value}>{user?.phone || '-'}</Text>
        {renderAddress()}
      </View>

      {user?.role === 'buyer' && (
        <TouchableOpacity
          style={[styles.card, { backgroundColor: '#d7ccc8' }]}
          onPress={() => handleNavigate('EditProfile')}
        >
          <Text style={[styles.link, { color: '#4e342e', fontWeight: 'bold' }]}>✏️ Profili Düzenle</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.card} onPress={() => handleNavigate('Terms')}>
        <Text style={styles.link}>📃 Kullanım Koşulları</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => handleNavigate('Notifications')}>
        <Text style={styles.link}>🔔 Bildirimler</Text>
      </TouchableOpacity>

      {user?.role === 'buyer' && renderBuyerOptions()}
      {user?.role === 'seller' && renderSellerOptions()}
      {user?.role === 'admin' && renderAdminOptions()}

      <TouchableOpacity onPress={handleLogout} style={[styles.card, { backgroundColor: '#fce4ec' }]}>
        <Text style={[styles.link, { color: '#d32f2f' }]}>🚪 Çıkış Yap</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff8e1',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#4e342e',
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  label: {
    color: '#6d4c41',
    fontWeight: 'bold',
    fontSize: 16,
  },
  value: {
    fontSize: 16,
    marginBottom: 5,
  },
  link: {
    fontSize: 18,
    fontWeight: '500',
    color: '#6d4c41',
  },
});
