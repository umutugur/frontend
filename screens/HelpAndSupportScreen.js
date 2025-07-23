import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView } from 'react-native';

export default function HelpAndSupportScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Yardım & Destek</Text>
      <Text style={styles.text}>
        Sorularınız, önerileriniz veya yaşadığınız herhangi bir sorun için bize aşağıdaki e-posta adresinden ulaşabilirsiniz:
      </Text>
      <TouchableOpacity
        style={styles.emailButton}
        onPress={() => Linking.openURL('mailto:imameapp@gmail.com')}
      >
        <Text style={styles.emailText}>imameapp@gmail.com</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Sıkça Sorulan Sorular (SSS)</Text>

      <View style={styles.qaContainer}>
        <Text style={styles.question}>Mezat nedir?</Text>
        <Text style={styles.answer}>
          Mezat, ürünlerin açık artırma yoluyla satıldığı dijital bir pazar ortamıdır. İmame uygulamasında, satıcılar tesbihlerini mezata çıkarır, alıcılar ise teklif vererek satın almaya çalışır.
        </Text>
      </View>

      <View style={styles.qaContainer}>
        <Text style={styles.question}>Nasıl teklif verebilirim?</Text>
        <Text style={styles.answer}>
          Giriş yaptıktan sonra ana ekranda yer alan aktif mezatlara tıklayabilir ve teklif verme butonunu kullanarak istediğiniz miktarda teklif verebilirsiniz. 
        </Text>
      </View>

      <View style={styles.qaContainer}>
        <Text style={styles.question}>Kazandığım mezatı nasıl öderim?</Text>
        <Text style={styles.answer}>
          Bir mezatı kazandıktan sonra, ilgili mezat detayında “Dekont Yükle” alanını kullanarak ödemenizi yaptıktan sonra aldığınız banka dekontunu yükleyebilirsiniz.
        </Text>
      </View>

      <View style={styles.qaContainer}>
        <Text style={styles.question}>Dekont yüklemezsem ne olur?</Text>
        <Text style={styles.answer}>
          Kazandığınız mezat için 48 saat içinde dekont yüklemezseniz, hesabınız geçici olarak askıya alınır ve bir süre teklif veremezsiniz.
        </Text>
      </View>

      <View style={styles.qaContainer}>
        <Text style={styles.question}>Satıcı olmak için ne yapmalıyım?</Text>
        <Text style={styles.answer}>
          Satıcı başvuruları yönetici onayıyla yapılır. Profilinizde yer alan ilgili bölümden başvuru yapabilir veya bize e-posta gönderebilirsiniz.
        </Text>
      </View>

      <View style={styles.qaContainer}>
        <Text style={styles.question}>Uygulama ile ilgili başka bir sorum var, ne yapmalıyım?</Text>
        <Text style={styles.answer}>
          İstediğiniz zaman bize imameapp@gmail.com adresinden ulaşabilirsiniz. Destek ekibimiz en kısa sürede size yardımcı olacaktır.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    backgroundColor: '#F9F6F2', 
    padding: 24, 
    justifyContent: 'flex-start',
    paddingBottom: 48,
  },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#7B1421',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  text: { 
    fontSize: 16, 
    color: '#2C2C2C',
    marginBottom: 18,
    lineHeight: 22,
  },
  emailButton: {
    backgroundColor: '#B5A16B',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 24,
    alignSelf: 'flex-start',
  },
  emailText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#B5A16B',
    marginTop: 16,
    marginBottom: 8,
  },
  qaContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#333',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  question: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7B1421',
    marginBottom: 6,
  },
  answer: {
    fontSize: 15,
    color: '#2C2C2C',
    lineHeight: 21,
  },
});
