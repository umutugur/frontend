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
      <View style={styles.sideSpacer} /> 
      <View style={styles.logoWrapper}>
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
        />
      </View>
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
    height: 70,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  logoWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: screenWidth * 0.38, // Mesela 150px - 170px gibi (responsive)
    height: 45,
    resizeMode: 'contain',
  },
  sideSpacer: {
    width: 26,
  },
  iconWrapper: {
    width: 36,
    alignItems: 'flex-end',
  },
});
