import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import Input from './ui/Input';
import GradientButton from './ui/GradientButton';
import { useAlert } from '../context/AlertContext';
import { colors, radii, shadows, spacing, typography } from '../theme/tokens';

export default function ReportSellerModal({ visible, onClose, sellerId, reporterId }) {
  const { showAlert } = useAlert();
  const [message, setMessage] = useState('');

  const submitReport = async () => {
    try {
      await axios.post('https://imame-backend.onrender.com/api/reports', {
        reportedSeller: sellerId,
        reporter: reporterId,
        message,
      });
      showAlert({ title: 'Teşekkürler', message: 'Şikayetiniz alındı' });
      setMessage('');
      onClose();
    } catch (err) {
      showAlert({ title: 'Hata', message: err.response?.data?.message || err.message });
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.modalBackground}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Satıcıyı Şikayet Et</Text>
          <Input
            value={message}
            onChangeText={setMessage}
            style={styles.input}
            multiline
            placeholder="Şikayet sebebinizi yazabilirsiniz (isteğe bağlı)"
          />
          <View style={styles.buttonRow}>
            <GradientButton
              title="İptal"
              variant="secondary"
              onPress={onClose}
              style={styles.button}
            />
            <GradientButton
              title="Gönder"
              variant="danger"
              onPress={submitReport}
              style={styles.button}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(46,30,25,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: spacing.xxl,
    width: '90%',
    maxWidth: 400,
    ...shadows.raised,
  },
  title: {
    ...typography.h3,
    fontSize: 18,
    marginBottom: spacing.md,
    color: colors.brownDark,
    textAlign: 'center',
  },
  input: {
    height: 80,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  button: {
    flex: 1,
  },
});
