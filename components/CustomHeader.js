// components/CustomHeader.js
import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

export default function CustomHeader() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.sideSpacer} /> {/* Sol boşluk */}
      
      <Image
        source={require('../assets/logo.png')}
        style={styles.logo}
      />

      <TouchableOpacity
        style={styles.iconWrapper}
        onPress={() => navigation.navigate('Notifications')}
      >
        <Ionicons name="notifications-outline" size={26} color="#4e342e" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: screenWidth,
    height: 120,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  logo: {
    marginTop:20,
    width: 360,
    height: 120,
    resizeMode: 'contain',
    position: 'absolute',
    left: screenWidth / 2 - 180, // 360/2 = 180, tam ortalamak için
    top: 0,
  },
  sideSpacer: {
    width: 26, // Sol boşluk, ikonun dengesi için
  },
  iconWrapper: {
    marginTop:35,
    width: 26,
    alignItems: 'flex-end',
  },
});
