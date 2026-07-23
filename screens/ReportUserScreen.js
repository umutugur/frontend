import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Card, Input, GradientButton } from '../components/ui';
import { useAlert } from '../context/AlertContext';
import { colors, spacing, typography } from '../theme/tokens';

export default function ReportUserScreen() {
  const { showAlert } = useAlert();
  const [reportText, setReportText] = useState('');

  const handleSubmit = () => {
    if (reportText.trim() === '') {
      showAlert({ title: 'Uyarı', message: 'Lütfen bir açıklama girin.' });
      return;
    }

    // Burada backend'e gönderilecek (şimdilik alert simülasyonu)
    showAlert({ title: 'Teşekkürler', message: 'Şikayetiniz alınmıştır.' });
    setReportText('');
  };

  return (
    <Screen scroll contentContainerStyle={styles.container}>
      <Card>
        <View style={styles.iconWrap}>
          <Ionicons name="flag-outline" size={30} color={colors.brown} />
        </View>
        <Text style={styles.title}>Kullanıcı Şikayet Et</Text>
        <Input
          placeholder="Şikayetinizi buraya yazın..."
          value={reportText}
          onChangeText={setReportText}
          multiline
          numberOfLines={6}
          style={styles.multiline}
        />
        <GradientButton
          title="Gönder"
          icon="send-outline"
          onPress={handleSubmit}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(78,52,46,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.brownDark,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  multiline: {
    minHeight: 130,
    textAlignVertical: 'top',
  },
});
