// components/BidConfirmModal.js
import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import GradientButton from './ui/GradientButton';
import { colors, radii, shadows, spacing, typography } from '../theme/tokens';

export default function BidConfirmModal({ visible, onClose, onConfirm }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Teklif Ver</Text>
          <Text style={styles.message}>Bu mezata teklif vermek istediğinize emin misiniz?</Text>

          <View style={styles.buttonContainer}>
            <GradientButton
              title="İptal"
              variant="secondary"
              onPress={onClose}
              style={styles.button}
            />
            <GradientButton
              title="Evet"
              onPress={onConfirm}
              style={styles.button}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(46,30,25,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContainer: {
    backgroundColor: colors.white,
    padding: spacing.xxl,
    borderRadius: radii.xl,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
    ...shadows.raised,
  },
  title: {
    ...typography.h2,
    color: colors.brownDark,
    marginBottom: spacing.sm,
  },
  message: {
    ...typography.body,
    fontSize: 16,
    color: colors.brown,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
  },
});
