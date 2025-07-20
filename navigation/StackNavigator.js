import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import UploadReceiptScreen from '../screens/UploadReceiptScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatScreen from '../screens/ChatScreen';
import AdminPanelScreen from '../screens/AdminPanelScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import TermsAndConditionsScreen from '../screens/TermsAndConditionsScreen';

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Giriş yapılmadıysa */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      
      {/* Giriş yapıldıysa */}
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="UploadReceipt" component={UploadReceiptScreen} />
      <Stack.Screen name="ChatList" component={ChatListScreen} />
      <Stack.Screen name='Chat' component={ChatScreen}/>
      <Stack.Screen name='AdminPanel' component={AdminPanelScreen}/>
      <Stack.Screen name='Notifications' component={NotificationsScreen}/>
      <Stack.Screen name='Terms' component={TermsAndConditionsScreen}/>
    
    </Stack.Navigator>
  );
};

export default StackNavigator;
