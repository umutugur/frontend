import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Card, Input, GradientButton } from '../components/ui';
import { useAlert } from '../context/AlertContext';
import { colors, spacing, typography } from '../theme/tokens';

export default function BanUserScreen() {
  const { showAlert } = useAlert();
  const [email, setEmail] = useState('');

  const handleBan = () => {
    if (!email.trim()) {
      showAlert({ title: 'Hata', message: 'Lütfen bir email adresi girin.' });
      return;
    }

    // Burada backend’e gönderilecek (şu anda sadece simülasyon)
    showAlert({
      title: 'Kullanıcı Engellendi',
      message: `${email} adresli kullanıcı sistemden engellendi.`,
    });
    setEmail('');
  };

  return (
    <Screen>
      <View style={styles.container}>
        <Card style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="ban-outline" size={30} color={colors.danger} />
          </View>
          <Text style={styles.title}>Kullanıcı Engelle</Text>
          <Input
            placeholder="Kullanıcının e-posta adresi"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <GradientButton
            title="Engelle"
            variant="danger"
            icon="ban-outline"
            onPress={handleBan}
          />
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  card: {
    alignItems: 'stretch',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(198,40,40,0.10)',
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
});
