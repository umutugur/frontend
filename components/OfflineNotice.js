import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

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
      <Text style={styles.text}>İnternet bağlantısı yok</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#b71c1c',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
  text: {
    marginTop:'20',
    color: 'white',
    fontWeight: 'bold',
  },
});
