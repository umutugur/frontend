import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import * as Clipboard from 'expo-clipboard';
import Toast from 'react-native-toast-message';
import { Screen, Card, Badge, GradientButton, PressableScale, EmptyState } from '../components/ui';
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
        <Text style={styles.price}>Kazandığınız Fiyat: {item.currentPrice} TL</Text>

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
          <Text style={styles.countdown}>⏳ {formatCountdown(item.paymentDeadline)}</Text>
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
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.brown} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.header}>Kazandığınız Mezatlar</Text>
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
  header: {
    ...typography.h2,
    color: colors.brownDark,
    marginBottom: spacing.md,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
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
  price: { ...typography.body, color: colors.brown, marginVertical: spacing.xs },
  infoBox: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginVertical: spacing.sm,
  },
  infoLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  infoLabel: {
    fontWeight: 'bold',
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
  countdown: {
    marginTop: spacing.sm,
    color: colors.danger,
    fontWeight: 'bold',
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
    marginTop: spacing.md,
  },
  uploadedLabel: {
    color: colors.priceGreen,
    fontWeight: 'bold',
    marginLeft: spacing.xs,
  },
  copyButton: {
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: '#e0c9a6',
    borderRadius: radii.sm,
  },
  copyButtonText: {
    color: colors.brownDark,
    fontWeight: 'bold',
    fontSize: 12,
  },
});
