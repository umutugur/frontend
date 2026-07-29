// screens/SendNotificationScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import axios from 'axios';
import { Screen, ScreenHeader, Input, GradientButton, Checkbox } from '../components/ui';
import { useAlert } from '../context/AlertContext';
import { colors, spacing, typography } from '../theme/tokens';

export default function SendNotificationScreen() {
  const { showAlert } = useAlert();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [toAllBuyers, setToAllBuyers] = useState(false);
  const [toAllSellers, setToAllSellers] = useState(false);
  const [includeGuests, setIncludeGuests] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSend = async () => {
    if (!title || !message) {
      showAlert({ title: 'Uyarı', message: 'Lütfen başlık ve mesaj girin.' });
      return;
    }

    // Alıcı seçimi kontrolü
    const noTargetsSelected = !email.trim() && !toAllBuyers && !toAllSellers && !includeGuests;
    if (noTargetsSelected) {
      showAlert({ title: 'Uyarı', message: 'Lütfen e-posta yazın ya da alıcı grubu seçin (misafir dahil).' });
      return;
    }

    try {
      setBusy(true);
      await axios.post('https://imame-backend.onrender.com/api/notifications/send', {
        title,
        message,
        email: email.trim() || undefined,
        toAllBuyers,
        toAllSellers,
        includeGuests, // 👈 backend’e yeni alan
      });

      showAlert({ title: 'Başarılı', message: 'Bildirim gönderildi!' });
      setTitle('');
      setMessage('');
      setEmail('');
      setToAllBuyers(false);
      setToAllSellers(false);
      setIncludeGuests(false);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      showAlert({ title: 'Hata', message: msg });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen scroll contentContainerStyle={styles.container}>
      <ScreenHeader title="Bildirim Gönder" subtitle="Toplu push bildirimi" />

      <View style={styles.body}>
      <Input
        variant="underline"
        leftIcon="text-outline"
        placeholder="Başlık"
        value={title}
        onChangeText={setTitle}
      />

      <Input
        variant="underline"
        leftIcon="chatbox-ellipses-outline"
        placeholder="Mesaj"
        value={message}
        onChangeText={setMessage}
      />

      <Input
        variant="underline"
        leftIcon="mail-outline"
        placeholder="Tek bir kullanıcıya göndermek için e-posta"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Text style={styles.groupLabel}>Alıcı Grupları</Text>

      <Checkbox value={toAllBuyers} onValueChange={setToAllBuyers} label="Tüm Alıcılara Gönder" />

      <Checkbox value={toAllSellers} onValueChange={setToAllSellers} label="Tüm Satıcılara Gönder" />

      <Checkbox value={includeGuests} onValueChange={setIncludeGuests} label="Misafir Cihazlara da Gönder" />

      <GradientButton
        title="Gönder"
        variant="gold"
        icon="send-outline"
        onPress={handleSend}
        loading={busy}
        disabled={busy}
        style={styles.button}
      />
      </View>
    </Screen>
  );
}

// stiller
const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.xxxl,
  },
  body: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  groupLabel: {
    ...typography.label,
    color: colors.gold,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  checkboxLabel: {
    marginLeft: spacing.sm,
    ...typography.body,
    fontSize: 16,
    color: colors.brownDark,
  },
  button: {
    marginTop: spacing.sm,
  },
});
