// components/CustomHeader.js
import React, { useContext } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Dimensions, Platform, StatusBar, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';

const screenWidth = Dimensions.get('window').width;
const statusBarH = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

export default function CustomHeader() {
  const navigation = useNavigation();
  const { notifications } = useContext(AuthContext);

  // Okunmamış bildirim sayısını hesapla
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <View style={styles.container}>
      <View style={styles.sideSpacer} />

      {/* Logo */}
      <Image source={require('../assets/HeaderLogo.png')} style={styles.logo} />

      {/* Bildirim ikonu + rozet */}
      <TouchableOpacity
        style={styles.iconWrapper}
        onPress={() => navigation.navigate('Notifications')}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="notifications-outline" size={26} color="#4e342e" />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: screenWidth,
    height: 40 + statusBarH,
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
    width: 150,
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
  badge: {
    position: 'absolute',
    right: -6,
    top: -4,
    backgroundColor: '#e53935',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
