// components/CustomHeader.js
import React, { useContext } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Dimensions, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import { colors, gradients, spacing, typography } from '../theme/tokens';

const screenWidth = Dimensions.get('window').width;

export default function CustomHeader() {
  const navigation = useNavigation();
  const { notifications } = useContext(AuthContext);
  // Üst inset'i başlık taşır; altındaki Screen'ler top kenarını kapatır.
  // Eskiden StatusBar.currentHeight kullanılıyordu — o yalnızca Android'de
  // dolu, iOS'ta 0. Kökte SafeAreaView dolguyu verdiği sürece fark etmiyordu;
  // artık gerçek inset okunuyor, iki platformda da doğru çalışıyor.
  const { top: statusBarH } = useSafeAreaInsets();

  // Okunmamış bildirim sayısını hesapla
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <LinearGradient
      colors={gradients.creamSurface}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, { height: 40 + statusBarH, paddingTop: statusBarH }]}
    >
      {/* alt kenarda ince altın çizgi — heritage vurgu */}
      <View style={styles.goldRule} pointerEvents="none" />

      <View style={styles.sideSpacer} />

      {/* Logo */}
      <Image source={require('../assets/HeaderLogo.png')} style={styles.logo} />

      {/* Bildirim ikonu + rozet */}
      <TouchableOpacity
        style={styles.iconWrapper}
        onPress={() => navigation.navigate('Notifications')}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="notifications-outline" size={26} color={colors.brownDark} />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    width: screenWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    elevation: 3,
    shadowColor: colors.brownDark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  goldRule: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 1.5,
    backgroundColor: 'rgba(201,162,75,0.35)',
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
    backgroundColor: colors.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    ...typography.label,
    color: colors.white,
    fontSize: 10,
    letterSpacing: 0,
  },
});
