import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { Screen, ScreenHeader, Card, Input, Badge, GradientButton, PressableScale } from '../components/ui';
import { useAlert } from '../context/AlertContext';
import { colors, gradients, radii, shadows, spacing, fonts, typography } from '../theme/tokens';

const DURATIONS = [
  { label: 'Süresiz', value: null },
  { label: '7 gün', value: 7 },
  { label: '30 gün', value: 30 },
];

export default function BanUserScreen() {
  const { showAlert } = useAlert();
  const [email, setEmail] = useState('');
  const [searching, setSearching] = useState(false);
  const [found, setFound] = useState(null);
  const [duration, setDuration] = useState(null);
  const [reason, setReason] = useState('');
  const [banning, setBanning] = useState(false);

  const resetForm = () => {
    setEmail('');
    setFound(null);
    setDuration(null);
    setReason('');
  };

  const handleSearch = async () => {
    if (!email.trim()) {
      showAlert({ title: 'Hata', message: 'Lütfen bir email adresi girin.' });
      return;
    }

    setSearching(true);
    setFound(null);
    try {
      const res = await axios.get('https://imame-backend.onrender.com/api/users/all', {
        params: { q: email.trim(), limit: 5 },
      });
      const items = res.data?.items || [];
      if (!items.length) {
        showAlert({ title: 'Bulunamadı', message: 'Bu e-posta ile kayıtlı kullanıcı bulunamadı.' });
        return;
      }
      setFound(items[0]);
    } catch (err) {
      showAlert({ title: 'Hata', message: 'Kullanıcı aranırken bir sorun oluştu.' });
    } finally {
      setSearching(false);
    }
  };

  const handleBan = async () => {
    if (!found) return;

    setBanning(true);
    try {
      const body = { reason: reason.trim() || undefined };
      if (duration != null) body.durationDays = duration;

      await axios.patch(`https://imame-backend.onrender.com/api/users/ban/${found._id}`, body);
      showAlert({
        title: 'Kullanıcı Engellendi',
        message: `${found.email} adresli kullanıcı sistemden engellendi.`,
      });
      resetForm();
    } catch (err) {
      showAlert({ title: 'Hata', message: 'Ban işlemi başarısız oldu.' });
    } finally {
      setBanning(false);
    }
  };

  return (
    <Screen scroll>
      <ScreenHeader title="Kullanıcı Banla" subtitle="Hesap askıya alma" />
      <View style={styles.container}>
        <Card style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="ban-outline" size={30} color={colors.danger} />
          </View>
          <Text style={styles.title}>Kullanıcı Engelle</Text>
          <Text style={styles.hint}>
            Engellenecek kullanıcının e-posta adresini girin. Bu işlem hesabı askıya alır.
          </Text>
          <Input
            leftIcon="mail-outline"
            placeholder="Kullanıcının e-posta adresi"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <GradientButton
            title="Ara"
            variant="secondary"
            icon="search-outline"
            onPress={handleSearch}
            loading={searching}
          />
        </Card>

        {found ? (
          <Card style={styles.card}>
            <View style={styles.foundHeader}>
              <Text style={styles.foundName}>{found.name || found.email}</Text>
              <Badge
                label={found.isBanned ? 'Banlı' : found.role}
                tone={found.isBanned ? 'rejected' : 'neutral'}
                icon={found.isBanned ? 'account-cancel-outline' : 'account-outline'}
              />
            </View>
            <Text style={styles.foundEmail}>{found.email}</Text>

            <Text style={styles.sectionLabel}>Süre</Text>
            <View style={styles.chipRow}>
              {DURATIONS.map((d) => {
                const on = duration === d.value;
                return (
                  <PressableScale
                    key={d.label}
                    style={[styles.chip, on && styles.chipOn]}
                    onPress={() => setDuration(d.value)}
                  >
                    {on ? (
                      <LinearGradient
                        colors={gradients.gold}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFill}
                      />
                    ) : null}
                    <Text style={[styles.chipText, on && styles.chipTextOn]}>{d.label}</Text>
                  </PressableScale>
                );
              })}
            </View>

            <Text style={styles.sectionLabel}>Sebep</Text>
            <Input
              variant="underline"
              leftIcon="create-outline"
              placeholder="Örn: tekrarlayan ödeme kaçağı"
              value={reason}
              onChangeText={setReason}
            />

            <GradientButton
              title={banning ? 'Banlanıyor…' : 'Banla'}
              variant="danger"
              icon="ban-outline"
              onPress={handleBan}
              loading={banning}
              style={styles.banButton}
            />
          </Card>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
  },
  card: {
    alignItems: 'stretch',
    marginBottom: spacing.lg,
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
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  hint: {
    ...typography.body,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  foundHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  foundName: {
    ...typography.h3,
    color: colors.brownDark,
    flexShrink: 1,
    marginRight: spacing.sm,
  },
  foundEmail: {
    ...typography.body,
    color: colors.muted,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    ...typography.label,
    color: colors.gold,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    flex: 1,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.creamHi,
    borderWidth: 1.5,
    borderColor: 'rgba(161,116,59,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  chipOn: { borderColor: colors.gold, ...shadows.gold },
  chipText: { fontFamily: fonts.extrabold, fontSize: 13.5, color: colors.brownDark },
  chipTextOn: { color: colors.espresso },
  banButton: {
    marginTop: spacing.sm,
  },
});
