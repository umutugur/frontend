import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import { FontAwesome } from '@expo/vector-icons';
import Input from './ui/Input';
import GradientButton from './ui/GradientButton';
import { useAlert } from '../context/AlertContext';
import { colors, radii, shadows, spacing, typography } from '../theme/tokens';

export default function RateSellerModal({ visible, onClose, sellerId, auctionId, buyerId }) {
  const { showAlert } = useAlert();
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState('');

  const handleStarPress = (value) => setScore(value);

  const submitRating = async () => {
    if (score === 0) {
      showAlert({ title: 'Hata', message: 'Lütfen 1-5 arası bir puan verin.' });
      return;
    }

    try {
      await axios.post('https://imame-backend.onrender.com/api/ratings', {
        sellerId,
        buyerId,
        auctionId,
        score,
        comment,
      });

      showAlert({ title: 'Teşekkürler', message: 'Puanınız kaydedildi' });
      setScore(0);
      setComment('');
      onClose();
    } catch (err) {
      showAlert({ title: 'Hata', message: err.response?.data?.message || err.message });
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackground}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Satıcıyı Puanla</Text>

          <View style={styles.starContainer}>
            {[1, 2, 3, 4, 5].map((value) => (
              <TouchableOpacity key={value} onPress={() => handleStarPress(value)}>
                <FontAwesome
                  name={value <= score ? 'star' : 'star-o'}
                  size={32}
                  color="#fbc02d"
                  style={{ marginHorizontal: 4 }}
                />
              </TouchableOpacity>
            ))}
          </View>

          <Input
            value={comment}
            onChangeText={setComment}
            style={styles.input}
            multiline
            placeholder="Yorum (opsiyonel)"
          />

          <View style={styles.buttonRow}>
            <GradientButton
              title="İptal"
              variant="secondary"
              onPress={onClose}
              style={styles.button}
            />
            <GradientButton
              title="Puanla"
              onPress={submitRating}
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
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.lg,
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
