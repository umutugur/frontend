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
            style={styles.closeButton}
          >
            <Ionicons name="close" size={26} color={colors.white} />
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
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
