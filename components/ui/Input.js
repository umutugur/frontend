// components/ui/Input.js
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, typography } from '../../theme/tokens';

/**
 * Input — tema uyumlu metin girişi (odak halkası, hata metni, opsiyonel ikonlar).
 * Props: { value, onChangeText, placeholder, error, leftIcon, rightElement, ...rest → TextInput }
 *   leftIcon: Ionicons adı (string) — solda ikon.
 *   rightElement: React node — sağda (ör. şifre göster/gizle).
 */
export default function Input({
  value,
  onChangeText,
  placeholder,
  error,
  leftIcon,
  rightElement,
  variant = 'box',
  style,
  onFocus,
  onBlur,
  ...rest
}) {
  const [focused, setFocused] = useState(false);
  const underline = variant === 'underline';

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          underline ? styles.underline : styles.field,
          focused && (underline ? styles.underlineFocused : styles.focused),
          !!error && (underline ? styles.underlineErrored : styles.errored),
        ]}
      >
        {leftIcon ? (
          <Ionicons
            name={leftIcon}
            size={19}
            color={focused ? colors.gold : colors.muted}
            style={styles.leftIcon}
          />
        ) : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          style={[styles.input, style]}
          onFocus={(e) => {
            setFocused(true);
            onFocus && onFocus(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur && onBlur(e);
          }}
          {...rest}
        />
        {rightElement ? <View style={styles.right}>{rightElement}</View> : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%', marginBottom: spacing.md },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.creamHi,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    minHeight: 54,
  },
  focused: { borderColor: colors.gold, backgroundColor: colors.white },
  errored: { borderColor: colors.danger },
  underline: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1.6,
    borderBottomColor: colors.line,
    paddingVertical: spacing.md,
    minHeight: 52,
  },
  underlineFocused: { borderBottomColor: colors.gold },
  underlineErrored: { borderBottomColor: colors.danger },
  leftIcon: { marginRight: spacing.sm },
  right: { marginLeft: spacing.sm },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.brownDark,
    paddingVertical: spacing.md + 2,
  },
  error: {
    ...typography.small,
    color: colors.danger,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
});
