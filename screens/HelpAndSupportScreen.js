import React from 'react';
import { View, Text, ScrollView, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, ScreenHeader, Card, GradientButton, OrnamentDivider } from '../components/ui';
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
    <Screen>
      <ScreenHeader variant="plain" title="Yardım & Destek" />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.contactCard}>
          <View style={styles.contactHeadRow}>
            <View style={styles.contactIcon}>
              <Ionicons name="chatbubbles-outline" size={20} color={colors.gold} />
            </View>
            <Text style={styles.contactTitle}>Bize Ulaşın</Text>
          </View>
          <Text style={styles.text}>
            Sorularınız, önerileriniz veya yaşadığınız herhangi bir sorun için bize aşağıdaki e-posta adresinden ulaşabilirsiniz:
          </Text>
          <GradientButton
            title="imameapp@gmail.com"
            icon="mail-outline"
            variant="gold"
            onPress={() => Linking.openURL('mailto:imameapp@gmail.com')}
            style={styles.emailButton}
          />
        </Card>

        <OrnamentDivider />

        <Text style={styles.faqTitle}>Sıkça Sorulan Sorular</Text>

        {FAQ.map((item, i) => (
          <Card key={i} style={styles.qaContainer}>
            <View style={styles.questionRow}>
              <Ionicons name="help-circle-outline" size={18} color={colors.gold} style={styles.qIcon} />
              <Text style={styles.question}>{item.q}</Text>
            </View>
            <Text style={styles.answer}>{item.a}</Text>
          </Card>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  contactCard: {
    marginTop: spacing.sm,
  },
  contactHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  contactIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(201,162,75,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  contactTitle: {
    ...typography.h3,
    color: colors.brownDark,
  },
  text: {
    ...typography.body,
    fontSize: 15,
    color: colors.brown,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  emailButton: {
    alignSelf: 'flex-start',
  },
  faqTitle: {
    ...typography.h2,
    color: colors.brownDark,
    marginBottom: spacing.lg,
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
