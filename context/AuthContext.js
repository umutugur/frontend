// context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import * as AppleAuthentication from 'expo-apple-authentication';
import Constants from 'expo-constants';
import { Alert } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const redirectUri = makeRedirectUri({ native: 'com.umutugur.imame:/oauthredirect' });

  // Google OAuth yapılandırması (mevcut değerler kullanılmalı)
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: '10042514664-2ogtkaoj8ja49650g17gu6rd084ggejp.apps.googleusercontent.com',
    iosClientId: '10042514664-3hndgs91erv9lsi477vgij988r85liel.apps.googleusercontent.com',
    redirectUri,
  });

  // Google OAuth callback
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      handleGoogleAuth(authentication.accessToken, authentication.idToken);
    }
  }, [response]);

  // Bildirimleri ve okunmamış mesaj sayısını al
  const fetchNotifications = async (userId) => {
    try {
      const res = await axios.get(`https://imame-backend.onrender.com/api/user-notifications/user/${userId}`);
      setNotifications(res.data);
    } catch (err) {
      console.error('Bildirimler alınamadı:', err.message);
    }
  };

  const fetchUnreadMessages = async (userId) => {
    try {
      const res = await axios.get(`https://imame-backend.onrender.com/api/messages/unread-count/${userId}`);
      setUnreadCount(res.data.count || 0);
    } catch (err) {
      console.error('Okunmamış mesaj sayısı alınamadı:', err.message);
    }
  };

  // Google login işlemi
  const handleGoogleAuth = async (accessToken, idToken) => {
    try {
      const res = await axios.post('https://imame-backend.onrender.com/api/auth/social-login', {
        provider: 'google',
        accessToken,
        idToken,
      });
      const userData = res.data.user;
      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await registerForPushNotificationsAsync(userData._id);
      await fetchNotifications(userData._id);
      await fetchUnreadMessages(userData._id);
    } catch (err) {
      console.error('Google login hatası:', err.message);
      Alert.alert('Giriş Hatası', err.response?.data?.message || err.message);
    }
  };

  // Apple ile giriş
  const loginWithApple = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      const { identityToken, email, fullName } = credential;
      if (!identityToken) {
        Alert.alert('Giriş Hatası', 'Apple kimlik doğrulaması başarısız. Lütfen tekrar deneyin.');
        return;
      }
      const res = await axios.post('https://imame-backend.onrender.com/api/auth/social-login', {
        provider: 'apple',
        idToken: identityToken,
        email,
        name: fullName ? `${fullName.givenName || ''} ${fullName.familyName || ''}`.trim() : undefined,
      });
      const userData = res.data.user;
      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await registerForPushNotificationsAsync(userData._id);
      await fetchNotifications(userData._id);
      await fetchUnreadMessages(userData._id);
    } catch (err) {
      console.error('Apple login hatası:', err.message);
      Alert.alert('Giriş Hatası', err.response?.data?.message || err.message);
    }
  };

  // Klasik e‑posta/şifre ile giriş
  const login = async (email, password) => {
    try {
      const res = await axios.post('https://imame-backend.onrender.com/api/auth/login', { email, password });
      const userData = res.data.user;
      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await registerForPushNotificationsAsync(userData._id);
      await fetchNotifications(userData._id);
      await fetchUnreadMessages(userData._id);
    } catch (err) {
      console.error('Login hatası:', err.message);
      Alert.alert('Giriş Hatası', err.response?.data?.message || err.message);
    }
  };

  // Çıkış işlemi (push token’ı sunucudan siler)
  const logout = async () => {
    try {
      if (user?._id) {
        await axios.post('https://imame-backend.onrender.com/api/users/remove-token', { userId: user._id });
      }
    } catch (err) {
      console.error('Push token silme hatası:', err.message);
    }
    setUser(null);
    setNotifications([]);
    setUnreadCount(0);
    await AsyncStorage.removeItem('user');
  };

  // Push bildirim token’ını kaydet
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

      // iOS üzerinde token alırken projectId verilmezse expoPushToken üretmez
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      const tokenData = projectId
        ? await Notifications.getExpoPushTokenAsync({ projectId })
        : await Notifications.getExpoPushTokenAsync();
      const expoPushToken = tokenData?.data;

      if (expoPushToken) {
        await axios.post('https://imame-backend.onrender.com/api/users/update-token', {
          userId,
          pushToken: expoPushToken,
        });
      }

      await fetchNotifications(userId);
      await fetchUnreadMessages(userId);
    } catch (err) {
      console.error('Bildirim token gönderme hatası:', err.message);
    }
  };

  // Uygulama açıldığında kullanıcının bilgilerini yükle
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
          await registerForPushNotificationsAsync(parsed._id);
          await fetchNotifications(parsed._id);
          await fetchUnreadMessages(parsed._id);
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        setUser,
        login,
        logout,
        loginWithApple,
        promptAsync, // Google login çağrısı
        promptGoogle:promptAsync,
        notifications,
        setNotifications,
        unreadCount,
        setUnreadCount,
        fetchUnreadMessages,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
