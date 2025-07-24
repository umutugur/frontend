import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { Alert } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 👇👇 Redirect URI üretimi
  const redirectUri = makeRedirectUri({ native: 'com.umutugur.imame:/oauthredirect' });

const [request, response, promptAsync] = Google.useAuthRequest({
  androidClientId: '10042514664-2ogtkaoj8ja49650g17gu6rd084ggejp.apps.googleusercontent.com',
  redirectUri,
});

  useEffect(() => {
    if (response) {
      Alert.alert("Google login response:", JSON.stringify(response));
    }
    if (response?.type === 'success') {
      const { authentication } = response;
      Alert.alert("Authentication objesi:", JSON.stringify(authentication));
      handleGoogleAuth(authentication.accessToken, authentication.idToken);
    }
  }, [response]);

  const handleGoogleAuth = async (accessToken, idToken) => {
    Alert.alert("Google login başlıyor", "accessToken: " + accessToken + "\nidToken: " + idToken);
    try {
      const res = await axios.post('https://imame-backend.onrender.com/api/auth/social-login', {
        provider: 'google',
        accessToken,
        idToken,
      });
      Alert.alert("Backend yanıtı:", JSON.stringify(res.data));
      const userData = res.data.user;
      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await registerForPushNotificationsAsync(userData._id);
    } catch (err) {
      Alert.alert('❌ Google auth error:', JSON.stringify(err.response?.data || err.message));
    }
  };

  // ✅ Push token
  const registerForPushNotificationsAsync = async (userId) => {
    try {
      if (!Device.isDevice) return;
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') return;
      const tokenData = await Notifications.getExpoPushTokenAsync();
      const expoPushToken = tokenData.data;
      await axios.post('https://imame-backend.onrender.com/api/users/update-token', {
        userId,
        pushToken: expoPushToken,
      });
    } catch (err) {
      Alert.alert('❌ Push token kaydedilemedi:', err.message);
    }
  };

  // ✅ Normal email login
  const login = async (email, password) => {
    try {
      const res = await axios.post('https://imame-backend.onrender.com/api/auth/login', { email, password });
      const userData = res.data.user;
      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await registerForPushNotificationsAsync(userData._id);
    } catch (err) {
      Alert.alert('❌ Giriş başarısız:', JSON.stringify(err.response?.data || err.message));
    }
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('user');
  };

  const updateUser = async (updatedFields) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.put(
        'https://imame-backend.onrender.com/api/auth/update-profile',
        updatedFields,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const updatedUser = res.data.user;
      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) {
      Alert.alert('❌ Profil güncelleme hatası:', JSON.stringify(err.response?.data || err.message));
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
          await registerForPushNotificationsAsync(parsed._id);
        }
      } catch (err) {
        setUser(null);
      }
      setIsLoading(false);
    };
    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        promptGoogle: () => promptAsync(),
        updateUser,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
