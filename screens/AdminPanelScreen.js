import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Card, PressableScale } from '../components/ui';
import { colors, gradients, radii, spacing, typography } from '../theme/tokens';

export default function AdminPanelScreen({ navigation }) {
  const adminSections = [
    { title: 'Kullanıcıları Görüntüle', route: 'UserList', icon: 'people-outline' },
    { title: 'Yeni Satıcı Ekle', route: 'AddSeller', icon: 'person-add-outline' },
    { title: 'Mezatları Yönet', route: 'ManageAuctions', icon: 'hammer-outline' },
    { title: 'Dekont Onayla', route: 'ReceiptApproval', icon: 'receipt-outline' },
    { title: 'Şikayetleri Görüntüle', route: 'ViewReports', icon: 'flag-outline' },
    { title: 'Kullanıcı Banla', route: 'BanUser', icon: 'ban-outline' },
    { title: 'Bildirim Gönder', route: 'SendNotification', icon: 'notifications-outline' },
  ];

  return (
    <Screen scroll contentContainerStyle={styles.content}>
      <LinearGradient
        colors={gradients.goldToBrown}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerIcon}>
          <Ionicons name="shield-checkmark" size={26} color={colors.white} />
        </View>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <Text style={styles.headerSubtitle}>Yönetim araçları</Text>
      </LinearGradient>

      <View style={styles.grid}>
        {adminSections.map((section) => (
          <PressableScale
            key={section.route}
            onPress={() => navigation.navigate(section.route)}
            style={styles.gridItem}
          >
            <Card style={styles.card}>
              <View style={styles.cardIconWrap}>
                <Ionicons name={section.icon} size={24} color={colors.brown} />
              </View>
              <Text style={styles.cardTitle}>{section.title}</Text>
            </Card>
          </PressableScale>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.xl,
  },
  header: {
    borderRadius: radii.xl,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.white,
  },
  headerSubtitle: {
    ...typography.body,
    color: 'rgba(255,255,255,0.85)',
    marginTop: spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    marginBottom: spacing.md,
  },
  card: {
    alignItems: 'center',
    minHeight: 130,
    justifyContent: 'center',
  },
  cardIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(78,52,46,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.brownDark,
    textAlign: 'center',
  },
});
