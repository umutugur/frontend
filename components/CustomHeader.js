// components/CustomHeader.js
import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;
const statusBarH = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

export default function CustomHeader() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Sol spacer (şimdilik görünmez) */}
      <View style={styles.sideSpacer} />

      {/* Logo */}
      <Image
        source={require('../assets/logo.png')}
        style={styles.logo}
      />

      {/* Bildirim ikonu */}
      <TouchableOpacity
        style={styles.iconWrapper}
        onPress={() => navigation.navigate('Notifications')}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="notifications-outline" size={26} color="#4e342e" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
  width: screenWidth,
  height: 60 + statusBarH,
  paddingTop: statusBarH,
  backgroundColor: '#fff',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 16,
  elevation: 3,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
},

 logo: {
  width: 150,         // sabit genişlik daha net durur
  height: 45,
  resizeMode: 'contain',
},
  sideSpacer: {
    width: 26,
  },
  iconWrapper: {
    width: 26,
    alignItems: 'flex-end',
  },
});
