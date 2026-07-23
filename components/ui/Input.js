// components/ui/Input.js
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, radii, spacing, typography } from '../../theme/tokens';

/**
 * Input — tema uyumlu metin girişi (odak durumu, hata metni).
 * Props: { value, onChangeText, placeholder, error, ...rest }
 *   ...rest → altta yatan TextInput'e olduğu gibi geçirilir
 *            (secureTextEntry, keyboardType, multiline, autoCapitalize vb.).
 */
export default function Input({
  value,
  onChangeText,
  placeholder,
  error,
  style,
  onFocus,
  onBlur,
  ...rest
}) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        style={[
          styles.input,
          focused && styles.focused,
          !!error && styles.errored,
          style,
        ]}
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
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: spacing.md,
  },
  input: {
    ...typography.body,
    color: colors.brownDark,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
  },
  focused: {
    borderColor: colors.brown,
  },
  errored: {
    borderColor: colors.danger,
  },
  error: {
    ...typography.label,
    color: colors.danger,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
});
