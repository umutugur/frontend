// components/BidConfirmModal.js
import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientButton from './ui/GradientButton';
import OrnamentDivider from './ui/OrnamentDivider';
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
          <View style={styles.iconBadge}>
            <Ionicons name="hammer-outline" size={26} color={colors.gold} />
          </View>
          <Text style={styles.title}>Teklif Ver</Text>
          <OrnamentDivider style={styles.divider} />
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
              variant="gold"
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
    backgroundColor: colors.creamHi,
    padding: spacing.xxl,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.line,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
    ...shadows.raised,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(201,162,75,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.brownDark,
  },
  divider: {
    marginVertical: spacing.md,
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
