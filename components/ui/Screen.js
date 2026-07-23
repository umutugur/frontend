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
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../../theme/tokens';

/**
 * Screen — tüm ekranların kökü.
 * Atmosferik sayfa gradyanı + SafeArea + KeyboardAvoidingView gömülüdür.
 * Props: { children, scroll=false, style, contentContainerStyle, edges, keyboardOffset=0 }
 */
export default function Screen({
  children,
  scroll = false,
  style,
  contentContainerStyle,
  edges = ['top', 'left', 'right'],
  keyboardOffset = 0,
  bgColors = gradients.page,
  glow = true,
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
    <View style={styles.flex}>
      <LinearGradient
        colors={bgColors}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
      />
      {/* üstte ince altın ışıma — sayfaya derinlik */}
      {glow ? (
        <LinearGradient
          colors={['rgba(201,162,75,0.16)', 'transparent']}
          style={styles.topGlow}
          pointerEvents="none"
        />
      ) : null}
      <SafeAreaView style={[styles.safe, style]} edges={edges}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={keyboardOffset}
        >
          {Body}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  topGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 220 },
});
