import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, PressableScale } from '../components/ui';
import { colors, spacing } from '../theme/tokens';

export default function ReceiptImageScreen({ route, navigation }) {
  const { imageUrl } = route.params;
  return (
    <Screen style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <Image source={{ uri: imageUrl }} style={styles.fullImage} resizeMode="contain" />
        {navigation ? (
          <PressableScale
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={26} color={colors.white} />
          </PressableScale>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(20,14,10,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(216,178,90,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
