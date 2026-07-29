// components/ui/Checkbox.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import PressableScale from './PressableScale';
import { colors, gradients, radii, spacing, typography } from '../../theme/tokens';

/**
 * Checkbox — Heritage temalı onay kutusu.
 *
 * @react-native-community/checkbox'un yerini alır: o paket Yeni Mimari'yi
 * desteklemiyor (expo-doctor tarafından işaretlendi) ve platformun kendi
 * gri kutusunu çizdiği için uygulamanın tasarım diline de uymuyordu.
 *
 * Props: { value, onValueChange, label, disabled }
 */
export default function Checkbox({ value, onValueChange, label, disabled = false }) {
  return (
    <PressableScale
      style={styles.row}
      disabled={disabled}
      onPress={() => onValueChange?.(!value)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: !!value, disabled }}
      accessibilityLabel={label}
    >
      {value ? (
        <LinearGradient
          colors={gradients.gold}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.box, styles.boxOn]}
        >
          <Ionicons name="checkmark" size={16} color={colors.white} />
        </LinearGradient>
      ) : (
        <View style={[styles.box, styles.boxOff, disabled && styles.boxDisabled]} />
      )}
      {label ? <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text> : null}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  box: {
    width: 24,
    height: 24,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOff: {
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  boxOn: {
    borderWidth: 0,
  },
  boxDisabled: {
    backgroundColor: colors.line,
  },
  label: {
    ...typography.body,
    color: colors.brownDark,
    marginLeft: spacing.md,
    flex: 1,
  },
  labelDisabled: {
    color: colors.muted,
  },
});
