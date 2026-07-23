import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Screen } from '../components/ui';
import { colors, spacing, typography } from '../theme/tokens';

const TermsScreen = () => {
  return (
    <Screen scroll contentContainerStyle={styles.container}>
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
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    flexGrow: 1,
  },
  header: {
    marginTop: spacing.xxxl,
    ...typography.h1,
    color: colors.brownDark,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  subheader: {
    ...typography.h3,
    fontSize: 18,
    color: colors.brown,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  paragraph: {
    ...typography.body,
    color: '#3e2723',
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
});

export default TermsScreen;
