import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Screen, EmptyState } from '../components/ui';
import { spacing } from '../theme/tokens';

export default function SettingsScreen() {
  return (
    <Screen>
      <View style={styles.container}>
        <EmptyState
          icon="cog-outline"
          title="Ayarlar"
          message="Ayarlar ekranı yakında."
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
});
