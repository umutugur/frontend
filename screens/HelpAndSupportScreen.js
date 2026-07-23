import React from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Card, GradientButton, SectionHeader } from '../components/ui';
import { colors, spacing, typography } from '../theme/tokens';

const FAQ = [
  {
    q: 'Mezat nedir?',
    a: 'Mezat, ürünlerin açık artırma yoluyla satıldığı dijital bir pazar ortamıdır. İmame uygulamasında, satıcılar tesbihlerini mezata çıkarır, alıcılar ise teklif vererek satın almaya çalışır.',
  },
  {
    q: 'Nasıl teklif verebilirim?',
    a: 'Giriş yaptıktan sonra ana ekranda yer alan aktif mezatlara tıklayabilir ve teklif verme butonunu kullanarak istediğiniz miktarda teklif verebilirsiniz. ',
  },
  {
    q: 'Kazandığım mezatı nasıl öderim?',
    a: 'Bir mezatı kazandıktan sonra, ilgili mezat detayında “Dekont Yükle” alanını kullanarak ödemenizi yaptıktan sonra aldığınız banka dekontunu yükleyebilirsiniz.',
  },
  {
    q: 'Dekont yüklemezsem ne olur?',
    a: 'Kazandığınız mezat için 48 saat içinde dekont yüklemezseniz, hesabınız geçici olarak askıya alınır ve bir süre teklif veremezsiniz.',
  },
  {
    q: 'Satıcı olmak için ne yapmalıyım?',
    a: 'Satıcı başvuruları yönetici onayıyla yapılır. Profilinizde yer alan ilgili bölümden başvuru yapabilir veya bize e-posta gönderebilirsiniz.',
  },
  {
    q: 'Uygulama ile ilgili başka bir sorum var, ne yapmalıyım?',
    a: 'İstediğiniz zaman bize imameapp@gmail.com adresinden ulaşabilirsiniz. Destek ekibimiz en kısa sürede size yardımcı olacaktır.',
  },
];

export default function HelpAndSupportScreen() {
  return (
    <Screen scroll contentContainerStyle={styles.container}>
      <Text style={styles.title}>Yardım & Destek</Text>
      <Text style={styles.text}>
        Sorularınız, önerileriniz veya yaşadığınız herhangi bir sorun için bize aşağıdaki e-posta adresinden ulaşabilirsiniz:
      </Text>
      <GradientButton
        title="imameapp@gmail.com"
        icon="mail-outline"
        onPress={() => Linking.openURL('mailto:imameapp@gmail.com')}
        style={styles.emailButton}
      />

      <SectionHeader title="Sıkça Sorulan Sorular (SSS)" />

      {FAQ.map((item, i) => (
        <Card key={i} style={styles.qaContainer}>
          <View style={styles.questionRow}>
            <Ionicons name="help-circle-outline" size={18} color={colors.brown} style={styles.qIcon} />
            <Text style={styles.question}>{item.q}</Text>
          </View>
          <Text style={styles.answer}>{item.a}</Text>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xxl,
    paddingBottom: spacing.xxxl,
  },
  title: {
    ...typography.h1,
    color: colors.brownDark,
    marginBottom: spacing.lg,
  },
  text: {
    ...typography.body,
    fontSize: 16,
    color: colors.brownDark,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  emailButton: {
    alignSelf: 'flex-start',
    marginBottom: spacing.xxl,
  },
  qaContainer: {
    marginBottom: spacing.md,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  qIcon: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  question: {
    ...typography.h3,
    color: colors.brownDark,
    flexShrink: 1,
  },
  answer: {
    ...typography.body,
    fontSize: 15,
    color: colors.brown,
    lineHeight: 21,
  },
});
