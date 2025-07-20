import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

export default function ReceiptImageScreen({ route }) {
  const { imageUrl } = route.params;
  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUrl }} style={styles.fullImage} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: 'black', 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  fullImage: {
    width: '100%', 
    height: '100%',
  },
});
