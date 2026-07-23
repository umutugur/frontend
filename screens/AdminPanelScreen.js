import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Screen, MenuTile } from '../components/ui';
import { colors, gradients, radii, spacing, typography, shadows } from '../theme/tokens';

export default function AdminPanelScreen({ navigation }) {
  const adminSections = [
    { title: 'Kullanıcıları Görüntüle', subtitle: 'Tüm kayıtlı kullanıcılar', route: 'UserList', icon: 'people-outline' },
    { title: 'Yeni Satıcı Ekle', subtitle: 'Satıcı hesabı oluştur', route: 'AddSeller', icon: 'person-add-outline' },
    { title: 'Mezatları Yönet', subtitle: 'Aktif ve biten mezatlar', route: 'ManageAuctions', icon: 'hammer-outline' },
    { title: 'Dekont Onayla', subtitle: 'Bekleyen ödeme dekontları', route: 'ReceiptApproval', icon: 'receipt-outline' },
    { title: 'Şikayetleri Görüntüle', subtitle: 'Kullanıcı şikayetleri', route: 'ViewReports', icon: 'flag-outline' },
    { title: 'Kullanıcı Banla', subtitle: 'Hesap askıya alma', route: 'BanUser', icon: 'ban-outline' },
    { title: 'Bildirim Gönder', subtitle: 'Toplu push bildirimi', route: 'SendNotification', icon: 'notifications-outline' },
  ];

  return (
    <Screen scroll contentContainerStyle={styles.content}>
      <LinearGradient
        colors={gradients.heroDark}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, shadows.raised]}
      >
        <LinearGradient colors={gradients.sheen} style={styles.headerSheen} pointerEvents="none" />
        <View style={styles.headerIcon}>
          <Ionicons name="shield-checkmark" size={24} color={colors.goldLight} />
        </View>
        <Text style={styles.kicker}>YÖNETİM</Text>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <Text style={styles.headerSubtitle}>İmame yönetim araçları</Text>
      </LinearGradient>

      <View style={styles.list}>
        {adminSections.map((section) => (
          <MenuTile
            key={section.route}
            icon={section.icon}
            title={section.title}
            subtitle={section.subtitle}
            tone={section.route === 'BanUser' ? 'danger' : 'default'}
            onPress={() => navigation.navigate(section.route)}
          />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  header: {
    borderRadius: radii.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    marginBottom: spacing.xl,
    overflow: 'hidden',
  },
  headerSheen: { position: 'absolute', top: 0, left: 0, right: 0, height: '55%' },
  headerIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(201,162,75,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(201,162,75,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  kicker: {
    ...typography.label,
    color: colors.goldLight,
    marginBottom: 2,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.white,
  },
  headerSubtitle: {
    ...typography.body,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  list: { marginTop: spacing.xs },
});
