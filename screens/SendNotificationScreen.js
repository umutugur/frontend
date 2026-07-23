// screens/SendNotificationScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import axios from 'axios';
import { Screen, Input, GradientButton } from '../components/ui';
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
      <Text style={styles.title}>Bildirim Gönder</Text>

      <Input
        placeholder="Başlık"
        value={title}
        onChangeText={setTitle}
      />

      <Input
        placeholder="Mesaj"
        value={message}
        onChangeText={setMessage}
      />

      <Input
        placeholder="Tek bir kullanıcıya göndermek için e-posta"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <View style={styles.checkboxRow}>
        <CheckBox value={toAllBuyers} onValueChange={setToAllBuyers} />
        <Text style={styles.checkboxLabel}>Tüm Alıcılara Gönder</Text>
      </View>

      <View style={styles.checkboxRow}>
        <CheckBox value={toAllSellers} onValueChange={setToAllSellers} />
        <Text style={styles.checkboxLabel}>Tüm Satıcılara Gönder</Text>
      </View>

      <View style={styles.checkboxRow}>
        <CheckBox value={includeGuests} onValueChange={setIncludeGuests} />
        <Text style={styles.checkboxLabel}>Misafir Cihazlara da Gönder</Text>
      </View>

      <GradientButton
        title="Gönder"
        icon="send-outline"
        onPress={handleSend}
        loading={busy}
        disabled={busy}
        style={styles.button}
      />
    </Screen>
  );
}

// stiller
const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.brownDark,
    marginBottom: spacing.xl,
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
