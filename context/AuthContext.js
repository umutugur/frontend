import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Alert } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const redirectUri = makeRedirectUri({
    native: 'com.umutugur.imame:/oauthredirect',
  });

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: '10042514664-2ogtkaoj8ja49650g17gu6rd084ggejp.apps.googleusercontent.com',
    redirectUri,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      handleGoogleAuth(authentication.accessToken, authentication.idToken);
    }
  }, [response]);

  const fetchNotifications = async (userId) => {
    try {
      const res = await axios.get(`https://imame-backend.onrender.com/api/user-notifications/user/${userId}`);
      setNotifications(res.data);
    } catch (err) {
      console.log('Bildirimler alınamadı:', err.message);
    }
  };

  const fetchUnreadMessages = async (userId) => {
    try {
      const res = await axios.get(`https://imame-backend.onrender.com/api/messages/unread-count/${userId}`);
      setUnreadCount(res.data.count || 0);
    } catch (err) {
      console.log('❌ Okunmamış mesaj sayısı alınamadı:', err.message);
    }
  };

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
      console.log('Google login hatası:', err.message);
    }
  };

  const loginWithApple = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const { identityToken, email, fullName } = credential;
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
      throw err;
    }
  };

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

      await fetchNotifications(userId);
      await fetchUnreadMessages(userId);
    } catch (err) {
      console.log('Bildirim token gönderme hatası:', err.message);
    }
  };

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
      await fetchUnreadMessages(userData._id);
    } catch (err) {
      console.log('Login hatası:', err.message);
    }
  };

  const logout = async () => {
    try {
      if (user?.notificationToken || user?._id) {
        await axios.post('https://imame-backend.onrender.com/api/users/remove-token', {
          userId: user._id,
        });
      }
    } catch (err) {
      console.log("Push token silme hatası:", err.message);
    }

    setUser(null);
    setNotifications([]);
    setUnreadCount(0);
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
      console.log('Profil güncelleme hatası:', err.message);
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
          await fetchNotifications(parsed._id);
          await fetchUnreadMessages(parsed._id);
        }
      } catch (err) {
        setUser(null);
      }
      setIsLoading(false);
    };
    loadUser();
  }, []);

  // ✅ Ban kontrolü: user objesi güncellendiğinde çalışır
  useEffect(() => {
    const checkBanStatus = async () => {
      if (!user?._id) return;

      try {
        const res = await axios.get(`https://imame-backend.onrender.com/api/users/${user._id}`);
        if (res.data?.isBanned) {
          Alert.alert("Hesabınız askıya alındı", "Lütfen destekle iletişime geçin.");
          logout();
        }
      } catch (err) {
        console.log("Ban kontrolü hatası:", err.message);
      }
    };

    checkBanStatus();
  }, [user]);

  // 🔔 Yeni bildirim geldiğinde state'e ekle
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      const { title, body, data } = notification.request.content;
      setNotifications((prev) => [
        {
          _id: Date.now().toString(),
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
        setUser,
        isLoading,
        login,
        logout,
        updateUser,
        promptGoogle: () => promptAsync(),
        loginWithApple,
        notifications,
        setNotifications,
        unreadCount,
        setUnreadCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
