import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const TermsScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Kullanım Koşulları</Text>

      <Text style={styles.paragraph}>
        İmame uygulamasını kullanarak aşağıdaki şartları kabul etmiş olursunuz.
      </Text>

      <Text style={styles.subheader}>1. Genel Şartlar</Text>
      <Text style={styles.paragraph}>
        Uygulamaya kayıt olan her kullanıcı, bilgilerini doğru ve eksiksiz vermekle yükümlüdür.
        Sahte teklifler, spam mesajlar ve kötüye kullanım durumunda hesap askıya alınabilir.
      </Text>

      <Text style={styles.subheader}>2. Mezat Kuralları</Text>
      <Text style={styles.paragraph}>
        Alıcılar yalnızca aktif mezatlara teklif verebilir. Her gece 23:00’te biten mezatları kazanan kullanıcılar, 48 saat içinde ödeme dekontunu yüklemelidir.
        Aksi takdirde geçici ban uygulanır.
      </Text>

      <Text style={styles.subheader}>3. Gizlilik</Text>
      <Text style={styles.paragraph}>
        Kullanıcı bilgileriniz, KVKK kapsamında korunur ve üçüncü şahıslarla paylaşılmaz.
      </Text>

      <Text style={styles.subheader}>4. Satıcı Sorumluluğu</Text>
      <Text style={styles.paragraph}>
        Mezata çıkan ürünlerin açıklamaları ve fotoğrafları satıcının sorumluluğundadır. Uygulama yalnızca aracı platform olarak görev yapar.
      </Text>

      <Text style={styles.paragraph}>
        Herhangi bir sorunuz varsa bizimle iletişime geçebilirsiniz: destek@imame.app
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff8e1',
    flexGrow: 1,
  },
  header: {
      marginTop:30,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4e342e',
    marginBottom: 16,
    textAlign: 'center',
  },
  subheader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6d4c41',
    marginTop: 16,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 14,
    color: '#3e2723',
    lineHeight: 22,
    marginBottom: 10,
  },
});

export default TermsScreen;
