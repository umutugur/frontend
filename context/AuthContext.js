import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // Redirect URI
  const redirectUri = makeRedirectUri({ native: 'com.umutugur.imame:/oauthredirect' });

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: '10042514664-2ogtkaoj8ja49650g17gu6rd084ggejp.apps.googleusercontent.com',
    redirectUri,
  });

  // Google auth response listener
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      handleGoogleAuth(authentication.accessToken, authentication.idToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  // Bildirimleri backend'den çek
  const fetchNotifications = async (userId) => {
    try {
      const res = await axios.get(
        `https://imame-backend.onrender.com/api/user-notifications/user/${userId}`
      );
      setNotifications(res.data);
    } catch (err) {
      console.log('Bildirimler alınamadı:', err.message);
    }
  };

  // Google sosyal girişini tamamla
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
    } catch (err) {
      // Hata yönetimi
    }
  };

  // Push token kaydetme
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

      // Token'ı backend'e gönder
      await axios.post('https://imame-backend.onrender.com/api/users/update-token', {
        userId,
        pushToken: expoPushToken,
      });

      // Token güncellendikten sonra bildirimleri çek
      await fetchNotifications(userId);
    } catch (err) {
      // İsteğe bağlı hata yönetimi
    }
  };

  // Normal login
  const login = async (email, password) => {
    try {
      const res = await axios.post('https://imame-backend.onrender.com/api/auth/login', {
        email,
        password,
      });
      const userData = res.data.user;
      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await registerForPushNotificationsAsync(userData._id);
      await fetchNotifications(userData._id);
    } catch (err) {
      // Hata yönetimi
    }
  };

  const logout = async () => {
    setUser(null);
    setNotifications([]);
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
      // Hata yönetimi
    }
  };

  // Uygulama ilk açıldığında kullanıcıyı ve bildirimleri yükle
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
          await registerForPushNotificationsAsync(parsed._id);
          await fetchNotifications(parsed._id);
        }
      } catch (err) {
        setUser(null);
      }
      setIsLoading(false);
    };
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Gelen push'ları dinle ve listeye ekle
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      const { title, body, data } = notification.request.content;
      setNotifications((prev) => [
        {
          _id: Date.now().toString(), // geçici ID; backend'den gerçek ID gelince yenilenebilir
          title,
          message: body,
          data,
          isRead: false,
        },
        ...prev,
      ]);
    });
    return () => subscription.remove();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        updateUser,
        promptGoogle: () => promptAsync(),
        notifications,
        setNotifications,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
