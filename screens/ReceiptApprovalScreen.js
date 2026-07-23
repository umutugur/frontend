import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, Modal, Pressable, ScrollView
} from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { Screen, ScreenHeader, Card, Badge, GradientButton, EmptyState } from '../components/ui';
import { colors, fonts, radii, spacing, typography } from '../theme/tokens';
import iller from '../assets/data/sehirler.json';
import ilceler from '../assets/data/ilceler.json';
import mahalleler1 from '../assets/data/mahalleler-1.json';
import mahalleler2 from '../assets/data/mahalleler-2.json';
import mahalleler3 from '../assets/data/mahalleler-3.json';
import mahalleler4 from '../assets/data/mahalleler-4.json';
const mahalleler = [...mahalleler1, ...mahalleler2, ...mahalleler3, ...mahalleler4];

export default function ReceiptApprovalScreen() {
  const { user } = useContext(AuthContext); // Satıcı bilgisi
  const { showAlert } = useAlert();
  const [receipts, setReceipts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const getIlName = (id) => iller.find(il => il.sehir_id === String(id))?.sehir_adi;
const getIlceName = (id) => ilceler.find(ilce => ilce.ilce_id === String(id))?.ilce_adi;
const getMahalleName = (id) => mahalleler.find(m => m.mahalle_id === String(id))?.mahalle_adi;

  useEffect(() => {
    if (user?.role === 'seller') {
      fetchReceipts();
    }
  }, [user]);

  const fetchReceipts = async () => {
    try {
      const res = await axios.get(`https://imame-backend.onrender.com/api/receipts/mine/${user._id}`);
      setReceipts(res.data);
    } catch (err) {
      console.error('Dekontlar alınamadı:', err);
    }
  };

  const handleApproval = async (id, approved) => {
    try {
      const url = `https://imame-backend.onrender.com/api/receipts/${id}/${approved ? 'approve' : 'reject'}`;
      await axios.patch(url);
      showAlert({ title: 'Başarılı', message: `Dekont ${approved ? 'onaylandı' : 'reddedildi'}.` });
      fetchReceipts();
    } catch (err) {
      console.error('Dekont işlem hatası:', err);
      showAlert({ title: 'Hata', message: 'İşlem sırasında hata oluştu.' });
    }
  };

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setModalVisible(true);
  };

  const closeImageModal = () => {
    setModalVisible(false);
    setSelectedImage(null);
  };

  const statusMeta = (status) => {
    if (status === 'approved') return { tone: 'approved', label: 'Onaylandı' };
    if (status === 'rejected') return { tone: 'rejected', label: 'Reddedildi' };
    return { tone: 'pending', label: 'Bekliyor' };
  };

 const renderItem = ({ item }) => {
  const address = item.buyer?.address || {};
  const ilName = getIlName(address.ilId) || '';
  const ilceName = getIlceName(address.ilceId) || '';
  const mahalleName = getMahalleName(address.mahalleId) || '';
  const meta = statusMeta(item.receiptStatus);

  return (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Badge label={meta.label} tone={meta.tone} />
      </View>
      <Text style={styles.subtitle}>Kazanan: {item.buyer?.name || 'Bilinmiyor'}</Text>

      <TouchableOpacity onPress={() => openImageModal(item.receiptUrl)} activeOpacity={0.9}>
        <Image source={{ uri: item.receiptUrl }} style={styles.image} />
      </TouchableOpacity>

      {item.receiptStatus === 'pending' ? (
        <View style={styles.buttonRow}>
          <GradientButton
            title="Onayla"
            icon="checkmark-circle-outline"
            variant="gold"
            onPress={() => handleApproval(item._id, true)}
            style={styles.actionBtn}
          />
          <GradientButton
            title="Reddet"
            icon="close-circle-outline"
            variant="danger"
            onPress={() => handleApproval(item._id, false)}
            style={styles.actionBtn}
          />
        </View>
      ) : (
        <View style={styles.buyerInfo}>
          <Text style={styles.infoText}>
            <Text style={styles.bold}>Ad Soyad:</Text> {item.buyer?.name || '-'}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.bold}>Telefon:</Text> {item.buyer?.phone || '-'}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.bold}>Adres:</Text>
          </Text>
          <ScrollView style={styles.addressBox}>
            <Text style={styles.addressText}>
              {mahalleName || ''} {address.sokak || ''} Apartman no: {address.apartmanNo || '-'} Daire:{' '}
              {address.daireNo || '-'}
            </Text>
            <Text style={styles.addressText}>
              {ilceName || ''} / {ilName || ''}
            </Text>
          </ScrollView>
        </View>
      )}
    </Card>
  );
};


  return (
    <Screen>
      <ScreenHeader variant="plain" title="Bekleyen Dekontlar" />
      <FlatList
        data={receipts}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="receipt-text-outline"
            title="Dekont yok"
            message="Onay bekleyen dekont bulunamadı."
          />
        }
      />

      {/* Modal - Tam boy görsel */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageModal}
      >
        <View style={styles.modalBackground}>
          <Pressable style={styles.modalCloseArea} onPress={closeImageModal} />
          <View style={styles.modalContent}>
            {selectedImage && (
              <Image
                source={{ uri: selectedImage }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            )}
          </View>
          <Pressable style={styles.modalCloseArea} onPress={closeImageModal} />
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    flexGrow: 1,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.h3,
    color: colors.brownDark,
    flex: 1,
    marginRight: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    marginBottom: spacing.sm,
    color: colors.brown,
  },
  image: {
    width: '100%',
    height: 160,
    marginBottom: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.line,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  buyerInfo: {
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radii.md,
  },
  infoText: {
    ...typography.body,
    marginBottom: spacing.xs,
    color: colors.brownDark,
  },
  bold: {
    fontFamily: fonts.bold,
    color: colors.brownDark,
  },
  addressBox: {
    maxHeight: 100,
  },
  addressText: {
    ...typography.body,
    color: colors.brownDark,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: '70%',
    backgroundColor: colors.white,
    borderRadius: radii.md,
  },
  fullImage: {
    width: '100%',
    height: '100%',
    borderRadius: radii.md,
  },
  modalCloseArea: {
    flex: 1,
    width: '100%',
  },
});
