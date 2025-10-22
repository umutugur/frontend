// App.js
import React, { useContext, useEffect, useRef } from 'react';
import { ActivityIndicator, View, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { AuthProvider, AuthContext } from './context/AuthContext';
import OfflineNotice from './components/OfflineNotice';
import { SafeAreaView } from 'react-native-safe-area-context';
import { requestTrackingPermissionsAsync, getTrackingPermissionsAsync } from 'expo-tracking-transparency';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Screens
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import TabNavigator from './navigation/TabNavigator';
import AuctionDetailScreen from './screens/AuctionDetailScreen';
import SettingsScreen from './screens/SettingsScreen';
import MyBidsScreen from './screens/MyBidsScreen';
import OngoingAuctionsScreen from './screens/OngoingAuctionsScreen';
import CompletedAuctionsScreen from './screens/CompletedAuctionsScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import UploadReceiptScreen from './screens/UploadReceiptScreen';
import ChatScreen from './screens/ChatScreen';
import AdminPanelScreen from './screens/AdminPanelScreen';
import UserListScreen from './screens/UserListScreen';
import AddSellerScreen from './screens/AddSellerScreen';
import ManageAuctionsScreen from './screens/ManageAuctionsScreen';
import ReceiptApprovalScreen from './screens/ReceiptApprovalScreen';
import ViewReportsScreen from './screens/ViewReportsScreen';
import BanUserScreen from './screens/BanUserScreen';
import SendNotificationScreen from './screens/SendNotificationScreen';
import AddAuctionScreen from './screens/AddAuctionScreen';
import MyAuctionsScreen from './screens/MyAuctionsScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import TermsAndConditionsScreen from './screens/TermsAndConditionsScreen';
import ProfileScreen from './screens/ProfileScreen';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen';
import HelpAndSupportScreen from './screens/HelpAndSupportScreen';

const Stack = createNativeStackNavigator();

function MainNavigator() {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6d4c41" />
      </View>
    );
  }

  return (
    // ⬇️ id eklendi
    <Stack.Navigator id="RootStack" screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen name="AuctionDetail" component={AuctionDetailScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="MyBids" component={MyBidsScreen} />
          <Stack.Screen name="OngoingAuctions" component={OngoingAuctionsScreen} />
          <Stack.Screen name="CompletedAuctions" component={CompletedAuctionsScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="UploadReceipt" component={UploadReceiptScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="AdminPanel" component={AdminPanelScreen} />
          <Stack.Screen name="UserList" component={UserListScreen} />
          <Stack.Screen name="AddSeller" component={AddSellerScreen} />
          <Stack.Screen name="ManageAuctions" component={ManageAuctionsScreen} />
          <Stack.Screen name="ReceiptApproval" component={ReceiptApprovalScreen} />
          <Stack.Screen name="ViewReports" component={ViewReportsScreen} />
          <Stack.Screen name="BanUser" component={BanUserScreen} />
          <Stack.Screen name="SendNotification" component={SendNotificationScreen} />
          <Stack.Screen name="AddAuction" component={AddAuctionScreen} />
          <Stack.Screen name="MyAuctions" component={MyAuctionsScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="Terms" component={TermsAndConditionsScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="ProfileDetail" component={ProfileScreen} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
          <Stack.Screen name="HelpAndSupport" component={HelpAndSupportScreen} />
        </>
      )}

      {/* Modallar her durumda mevcut */}
      <Stack.Group screenOptions={{ presentation: 'modal', headerShown: false }}>
        <Stack.Screen name="LoginModal" component={LoginScreen} />
        <Stack.Screen name="RegisterModal" component={RegisterScreen} />
      </Stack.Group>
    </Stack.Navigator>
  );
}

export default function App() {
  const navigationRef = useRef();

  useEffect(() => {
    const askATT = async () => {
      if (Platform.OS !== 'ios') return;
      try {
        const { status } = await getTrackingPermissionsAsync();
        if (status !== 'granted') {
          await requestTrackingPermissionsAsync();
        }
      } catch (e) {
        console.log('ATT request error:', e?.message || e);
      }
    };
    askATT();
  }, []);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;

      if (data?.type === 'chat' && data.chatId) {
        navigationRef.current?.navigate('Chat', {
          chatId: data.chatId,
          otherUserName: data.otherUserName || 'Sohbet',
        });
      }

      if (data?.type === 'auction' && data.auctionId) {
        navigationRef.current?.navigate('AuctionDetail', {
          auctionId: data.auctionId,
        });
      }

      if (data?.type === 'receipt') {
        navigationRef.current?.navigate('UploadReceipt');
      }
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener((notification) => {
      const { title, body } = notification.request.content;
      Toast.show({
        type: 'success',
        text1: title || 'Bildirim',
        text2: body || 'Yeni bir bildirim aldınız.',
        visibilityTime: 4000,
        position: 'top',
      });
    });
    return () => sub.remove();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9F6F2' }}>
      <AuthProvider>
        <NavigationContainer ref={navigationRef}>
          <OfflineNotice />
          <MainNavigator />
          <Toast />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaView>
  );
}