import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';
import { Screen, ScreenHeader, Card, Badge, GradientButton, PressableScale, EmptyState } from '../components/ui';
import { colors, spacing, radii, typography } from '../theme/tokens';

export default function CompletedAuctionsScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWonAuctions();
  }, []);

  const fetchWonAuctions = async () => {
    try {
      const res = await axios.get(`https://imame-backend.onrender.com/api/auctions/won/${user._id}`);
      setAuctions(res.data);
    } catch (err) {
      console.error('Mezatlar alınamadı:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCountdown = (deadline) => {
    const diff = new Date(deadline) - new Date();
    if (diff <= 0) return 'Süre doldu';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    return `${hours} saat ${minutes} dakika kaldı`;
  };

  const handleUploadReceipt = (auctionId) => {
    navigation.navigate('UploadReceipt', { auctionId });
  };

  // IBAN kopyalama fonksiyonu
  const copyIban = async (iban) => {
    if (!iban) return;
    await Clipboard.setStringAsync(iban);
    Toast.show({
      type: 'success',
      text1: 'IBAN kopyalandı',
      position: 'bottom',
      visibilityTime: 2000,
    });
  };

  const renderItem = ({ item }) => {
    const rejected = item.receiptStatus === 'rejected';
    const statusTone =
      item.receiptStatus === 'approved'
        ? 'approved'
        : item.receiptStatus === 'rejected'
        ? 'rejected'
        : 'pending';
    const statusLabel =
      item.receiptStatus === 'approved'
        ? 'Onaylandı'
        : item.receiptStatus === 'rejected'
        ? 'Reddedildi'
        : 'Bekliyor';

    return (
      <Card
        style={styles.auctionItem}
        onPress={() => navigation.navigate('AuctionDetail', { auctionId: item._id })}
      >
        <Text style={styles.title}>{item.title}</Text>
        <View style={styles.wonRow}>
          <MaterialCommunityIcons name="trophy-outline" size={16} color={colors.gold} />
          <Text style={styles.price}>
            Kazandığınız Fiyat: {Number(item.currentPrice).toLocaleString('tr-TR')} TL
          </Text>
        </View>

        <View style={styles.infoBox}>
          <View style={styles.infoLabelRow}>
            <MaterialCommunityIcons name="bank-outline" size={16} color={colors.brownDark} />
            <Text style={styles.infoLabel}>Satıcı Ödeme Bilgileri</Text>
          </View>
          {/* IBAN ve kopyala butonu */}
          <View style={styles.ibanRow}>
            <Text style={styles.infoText}>IBAN: {item.seller?.iban || '-'}</Text>
            {item.seller?.iban && (
              <PressableScale
                onPress={() => copyIban(item.seller.iban)}
                style={styles.copyButton}
              >
                <Text style={styles.copyButtonText}>Kopyala</Text>
              </PressableScale>
            )}
          </View>
          <Text style={styles.infoText}>IBAN İsmi: {item.seller?.ibanName || '-'}</Text>
          <Text style={styles.infoText}>Banka: {item.seller?.bankName || '-'}</Text>
          <View style={styles.countdownRow}>
            <MaterialCommunityIcons name="timer-sand" size={15} color={colors.danger} />
            <Text style={styles.countdown}>{formatCountdown(item.paymentDeadline)}</Text>
          </View>
        </View>

        {/* Dekont durumu */}
        {item.receiptUploaded && (
          <View style={styles.statusRow}>
            <Badge label={statusLabel} tone={statusTone} />
          </View>
        )}

        {/* Dekont yükleme seçenekleri */}
        {rejected ? (
          <GradientButton
            title="Tekrar Dekont Yükle"
            icon="cloud-upload-outline"
            variant="danger"
            onPress={() => handleUploadReceipt(item._id)}
            style={styles.uploadButton}
          />
        ) : item.receiptUploaded ? (
          <View style={styles.uploadedRow}>
            <MaterialCommunityIcons name="file-check-outline" size={18} color={colors.priceGreen} />
            <Text style={styles.uploadedLabel}>Dekont yüklendi</Text>
          </View>
        ) : (
          <GradientButton
            title="Dekont Yükle"
            icon="cloud-upload-outline"
            variant="gold"
            onPress={() => handleUploadReceipt(item._id)}
            style={styles.uploadButton}
          />
        )}
      </Card>
    );
  };

  if (loading) {
    return (
      <Screen>
        <ScreenHeader variant="plain" title="Kazandığınız Mezatlar" />
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.brown} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader variant="plain" title="Kazandığınız Mezatlar" />
      <FlatList
        data={auctions}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="trophy-outline"
            title="Henüz kazandığınız mezat yok"
            message="Kazandığınız mezatlar burada listelenecek."
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },
  auctionItem: {
    marginBottom: spacing.md,
  },
  title: { ...typography.h3, color: colors.brownDark },
  wonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginVertical: spacing.xs,
  },
  price: { ...typography.bodyStrong, color: colors.brown },
  infoBox: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.md,
    marginVertical: spacing.sm,
  },
  infoLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  infoLabel: {
    ...typography.bodyStrong,
    color: colors.brownDark,
    marginLeft: spacing.xs,
  },
  infoText: {
    ...typography.body,
    color: colors.brown,
    marginBottom: 2,
  },
  ibanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  countdown: {
    ...typography.bodyStrong,
    color: colors.danger,
  },
  statusRow: {
    marginTop: spacing.sm,
  },
  uploadButton: {
    marginTop: spacing.md,
  },
  uploadedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  uploadedLabel: {
    ...typography.bodyStrong,
    color: colors.priceGreen,
  },
  copyButton: {
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(201,162,75,0.18)',
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: radii.pill,
  },
  copyButtonText: {
    ...typography.label,
    color: colors.gold,
    fontSize: 11,
    letterSpacing: 0.4,
  },
});
