import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function AdminPanelScreen({ navigation }) {
  const adminSections = [
    { title: 'Kullanıcıları Görüntüle', route: 'UserList' },
    { title: 'Yeni Satıcı Ekle', route: 'AddSeller' },
    { title: 'Mezatları Yönet', route: 'ManageAuctions' },
    { title: 'Dekont Onayla', route: 'ReceiptApproval' },
    { title: 'Şikayetleri Görüntüle', route: 'ViewReports' },
    { title: 'Kullanıcı Banla', route: 'BanUser' },
    { title: 'Bildirim Gönder', route: 'SendNotification' }, 
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Admin Panel</Text>
      {adminSections.map((section, index) => (
        <TouchableOpacity
          key={index}
          style={styles.button}
          onPress={() => navigation.navigate(section.route)}
        >
          <Text style={styles.buttonText}>{section.title}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff8e1',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4e342e',
    marginBottom: 30,
  },
  button: {
    width: '100%',
    backgroundColor: '#6d4c41',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
