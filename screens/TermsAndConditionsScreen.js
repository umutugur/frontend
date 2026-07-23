import React from 'react';
import { Text, ScrollView, StyleSheet } from 'react-native';
import { Screen, ScreenHeader, OrnamentDivider } from '../components/ui';
import { colors, spacing, typography } from '../theme/tokens';

const TermsScreen = () => {
  return (
    <Screen>
      <ScreenHeader variant="plain" title="Kullanım Koşulları" />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          İmame uygulamasını kullanarak aşağıdaki şartları kabul etmiş olursunuz.
        </Text>

        <OrnamentDivider style={styles.divider} />

        <Text style={styles.subheader}>1. Genel Şartlar</Text>
        <Text style={styles.paragraph}>
          Uygulamaya kayıt olan her kullanıcı, bilgilerini doğru ve eksiksiz vermekle yükümlüdür.
          Sahte teklifler, spam mesajlar ve kötüye kullanım durumunda hesap askıya alınabilir.
        </Text>

        <OrnamentDivider style={styles.divider} />

        <Text style={styles.subheader}>2. Mezat Kuralları</Text>
        <Text style={styles.paragraph}>
          Alıcılar yalnızca aktif mezatlara teklif verebilir. Her gece 23:00’te biten mezatları kazanan kullanıcılar, 48 saat içinde ödeme dekontunu yüklemelidir.
          Aksi takdirde geçici ban uygulanır.
        </Text>

        <OrnamentDivider style={styles.divider} />

        <Text style={styles.subheader}>3. Gizlilik</Text>
        <Text style={styles.paragraph}>
          Kullanıcı bilgileriniz, KVKK kapsamında korunur ve üçüncü şahıslarla paylaşılmaz.
        </Text>

        <OrnamentDivider style={styles.divider} />

        <Text style={styles.subheader}>4. Satıcı Sorumluluğu</Text>
        <Text style={styles.paragraph}>
          Mezata çıkan ürünlerin açıklamaları ve fotoğrafları satıcının sorumluluğundadır. Uygulama yalnızca aracı platform olarak görev yapar.
        </Text>

        <OrnamentDivider style={styles.divider} />

        <Text style={styles.paragraph}>
          Herhangi bir sorunuz varsa bizimle iletişime geçebilirsiniz: destek@imame.app
        </Text>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  intro: {
    ...typography.body,
    fontSize: 15,
    color: colors.brownDark,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  divider: {
    marginVertical: spacing.lg,
  },
  subheader: {
    ...typography.h2,
    color: colors.brownDark,
    marginBottom: spacing.md,
  },
  paragraph: {
    ...typography.body,
    fontSize: 15,
    color: colors.brown,
    lineHeight: 23,
    marginBottom: spacing.sm,
  },
});

export default TermsScreen;
