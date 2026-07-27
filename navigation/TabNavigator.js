import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from '../screens/HomeScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ChatListScreen from '../screens/ChatListScreen';
import CustomHeader from '../components/CustomHeader';
import { AuthContext } from '../context/AuthContext';
import { colors, fonts, spacing, radii, shadows } from '../theme/tokens';

const Tab = createBottomTabNavigator();

// Aktif sekmenin ikonu üstünde küçük altın gösterge — heritage vurgu.
function TabIcon({ name, color, focused, size, badge }) {
  return (
    <View style={styles.iconSlot}>
      <View style={[styles.activeDot, { opacity: focused ? 1 : 0 }]} />
      <Ionicons name={name} size={size} color={color} />
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
        </View>
      ) : null}
    </View>
  );
}

export default function TabNavigator() {
  const { unreadCount } = useContext(AuthContext);
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        header: () => <CustomHeader />,
        tabBarActiveTintColor: colors.brownDark,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: [styles.tabBar, { height: 62 + insets.bottom, paddingBottom: Math.max(insets.bottom, spacing.sm) }],
        tabBarItemStyle: styles.tabItem,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;
          if (route.name === 'Anasayfa') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Favoriler') iconName = focused ? 'heart' : 'heart-outline';
          else if (route.name === 'Profil') iconName = focused ? 'person' : 'person-outline';
          else if (route.name === 'Sohbet') iconName = focused ? 'chatbubble' : 'chatbubble-outline';

          const badge = route.name === 'Sohbet' && unreadCount > 0 ? unreadCount : null;

          return (
            <TabIcon name={iconName} color={color} focused={focused} size={size} badge={badge} />
          );
        },
      })}
    >
      <Tab.Screen name="Anasayfa" component={HomeScreen} />
      <Tab.Screen name="Favoriler" component={FavoritesScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
      <Tab.Screen name="Sohbet" component={ChatListScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.creamHi,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: spacing.sm,
    ...shadows.soft,
  },
  tabItem: {
    paddingTop: spacing.xs,
  },
  tabLabel: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    marginTop: 2,
  },
  iconSlot: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xs,
  },
  activeDot: {
    position: 'absolute',
    top: -spacing.xs - 2,
    width: 16,
    height: 3,
    borderRadius: radii.pill,
    backgroundColor: colors.gold,
  },
  badge: {
    position: 'absolute',
    right: -8,
    top: -4,
    backgroundColor: colors.danger,
    borderRadius: radii.pill,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    fontFamily: fonts.bold,
    color: colors.white,
    fontSize: 10,
  },
});
