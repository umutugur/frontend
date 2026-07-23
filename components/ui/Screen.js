// components/ui/Screen.js
import React from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/tokens';

/**
 * Screen — tüm ekranların kökü.
 * SafeArea + KeyboardAvoidingView + krem zemin gömülüdür.
 * Props: { children, scroll=false, style, contentContainerStyle, edges, keyboardOffset=0 }
 *   scroll: true → içerik ScrollView içinde; false → düz View.
 *   style: SafeAreaView'a uygulanan stil.
 *   contentContainerStyle: scroll ise ScrollView contentContainerStyle, değilse iç View stili.
 *   edges: SafeAreaView edges (varsayılan ['top','left','right']).
 *   keyboardOffset: KeyboardAvoidingView keyboardVerticalOffset.
 */
export default function Screen({
  children,
  scroll = false,
  style,
  contentContainerStyle,
  edges = ['top', 'left', 'right'],
  keyboardOffset = 0,
}) {
  const Body = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, contentContainerStyle]}>{children}</View>
  );

  return (
    <SafeAreaView style={[styles.safe, style]} edges={edges}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={keyboardOffset}
      >
        {Body}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
