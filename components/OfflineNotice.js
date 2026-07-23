import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import { colors, spacing, typography } from '../theme/tokens';

export default function OfflineNotice() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  if (isConnected) return null;

  return (
    <View style={styles.container}>
      <Ionicons name="cloud-offline-outline" size={16} color={colors.white} style={styles.icon} />
      <Text style={styles.text}>İnternet bağlantısı yok</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.danger,
    height: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
  icon: {
    marginRight: spacing.sm,
  },
  text: {
    ...typography.body,
    color: colors.white,
    fontWeight: 'bold',
  },
});
