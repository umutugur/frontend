import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Modal } from 'react-native';
import axios from 'axios';
import { useAlert } from '../context/AlertContext';
import { Screen, ScreenHeader, Card, Input, GradientButton, EmptyState } from '../components/ui';
import { colors, radii, shadows, spacing, typography } from '../theme/tokens';

export default function ManageAuctionsScreen() {
  const { showAlert } = useAlert();
  const [auctions, setAuctions] = useState([]);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [reason, setReason] = useState('');

  const fetchAuctions = async () => {
    try {
      const res = await axios.get('https://imame-backend.onrender.com/api/auctions/all');
      setAuctions(res.data);
    } catch (err) {
      showAlert({ title: 'Mezatlar alınamadı', message: err.message });
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  const handleDeleteAuction = async () => {
    if (!reason.trim()) {
      showAlert({ title: 'Sebep zorunlu', message: 'Lütfen bir silme sebebi girin.' });
      return;
    }
    try {
      await axios.post(`https://imame-backend.onrender.com/api/auctions/delete/${selectedAuction._id}`, { reason });
      setAuctions((prev) => prev.filter(a => a._id !== selectedAuction._id));
      setModalVisible(false);
      setReason('');
      showAlert({ title: 'Başarılı', message: 'Mezat silindi ve satıcıya bildirildi.' });
    } catch (err) {
      showAlert({ title: 'Silme hatası', message: err.message });
    }
  };

  const openDeleteModal = (auction) => {
    setSelectedAuction(auction);
    setModalVisible(true);
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      {item.description ? <Text style={styles.desc}>{item.description}</Text> : null}
      <GradientButton
        title="Sil"
        icon="trash-outline"
        variant="danger"
        onPress={() => openDeleteModal(item)}
        style={styles.deleteBtn}
      />
    </Card>
  );

  return (
    <Screen>
      <ScreenHeader variant="plain" title="Mezat Yönetimi" />
      <FlatList
        data={auctions}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="gavel"
            title="Mezat yok"
            message="Gösterilecek mezat bulunamadı."
          />
        }
      />

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Silme Sebebi</Text>
            <Text style={styles.modalSub}>Bu sebep satıcıya bildirilecek.</Text>
            <Input
              variant="underline"
              leftIcon="alert-circle-outline"
              value={reason}
              onChangeText={setReason}
              placeholder="Sebep giriniz..."
            />
            <View style={styles.modalActions}>
              <GradientButton
                title="Vazgeç"
                variant="secondary"
                onPress={() => setModalVisible(false)}
                style={styles.modalBtn}
              />
              <GradientButton
                title="Sil"
                variant="danger"
                onPress={handleDeleteAuction}
                style={styles.modalBtn}
              />
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: spacing.md, paddingTop: spacing.xs, paddingBottom: spacing.lg, flexGrow: 1 },
  card: { marginBottom: spacing.md },
  title: { ...typography.h3, color: colors.brownDark },
  desc: { ...typography.body, color: colors.muted, marginVertical: spacing.xs },
  deleteBtn: { marginTop: spacing.sm, alignSelf: 'flex-end', minWidth: 120 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(46,30,25,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: spacing.xl,
    ...shadows.raised,
  },
  modalTitle: { ...typography.h2, color: colors.brownDark, marginBottom: spacing.xs },
  modalSub: { ...typography.small, color: colors.muted, marginBottom: spacing.md },
  modalActions: { flexDirection: 'row', marginTop: spacing.md },
  modalBtn: { flex: 1, marginHorizontal: spacing.xs },
});
