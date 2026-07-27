import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Screen, ScreenHeader, EmptyState, OrnamentDivider } from '../components/ui';
import { spacing } from '../theme/tokens';

export default function SettingsScreen() {
  return (
    <Screen>
      <ScreenHeader variant="plain" title="Ayarlar" />
      <View style={styles.container}>
        <EmptyState
          icon="cog-outline"
          title="Ayarlar"
          message="Ayarlar ekranı yakında."
        />
        <OrnamentDivider style={styles.divider} />
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
  divider: {
    marginTop: 0,
  },
});
