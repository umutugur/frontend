import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import * as AppleAuthentication from 'expo-apple-authentication';

export default function ChatListScreen({ navigation }) {
  const { user, promptGoogle, loginWithApple, logout } = useContext(AuthContext);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appleAvail, setAppleAvail] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      AppleAuthentication.isAvailableAsync()
        .then(setAppleAvail)
        .catch(() => setAppleAvail(false));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchChats = async () => {
        if (!user?._id) {
          setChats([]);
          setLoading(false);
          return;
        }
        try {
          const res = await fetch(
            `https://imame-backend.onrender.com/api/chats/user/${user._id}`
          );
          const data = await res.json();
          setChats(data.chats || []);
        } catch (err) {
          console.error('❌ Chat listesi alınamadı:', err.message);
          setChats([]);
        } finally {
          setLoading(false);
        }
      };

      fetchChats();
    }, [user?._id])
  );

  const renderItem = ({ item }) => {
    const otherUser = item.buyer?._id === user._id ? item.seller : item.buyer;
    const unreadCount = item.unreadMessages || 0;

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() =>
          navigation.navigate('Chat', {
            chatId: item._id,
            otherUserName: otherUser?.companyName || otherUser?.name || 'Kullanıcı',
          })
        }
      >
        <View style={styles.row}>
          <Text style={styles.chatName}>
            {otherUser?.companyName || otherUser?.name || 'Kullanıcı'}
          </Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6d4c41" />
      </View>
    );
  }

  const isGuest = !user?._id || user?.role === 'guest';

  return (
    <View style={styles.container}>
      {/* Misafir CTA */}
      {isGuest ? (
        <View style={{ paddingTop: 24 }}>
          <Text style={styles.helperText}>
            Mesajlaşma için giriş yapmanız gerekir.
          </Text>

          <TouchableOpacity style={styles.primaryBtn} onPress={logout}>
            <Text style={styles.primaryBtnText}>Giriş / Kayıt</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.outlineBtn} onPress={() => promptGoogle?.()}>
            <Text style={styles.outlineBtnText}>Google ile Giriş Yap</Text>
          </TouchableOpacity>

          {appleAvail && (
            <TouchableOpacity style={styles.appleBtn} onPress={() => loginWithApple?.()}>
              <Text style={styles.appleBtnText}>Apple ile Giriş Yap</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={chats}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', color: '#666' }}>
              Sohbet bulunamadı.
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff8e1' },
  chatItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
  },
  chatName: { fontSize: 18, color: '#4e342e' },
  badge: {
    backgroundColor: 'red',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Guest CTA styles
  helperText: { color: '#6d4c41', marginBottom: 10, textAlign: 'center' },
  primaryBtn: {
    height: 46,
    borderRadius: 10,
    backgroundColor: '#6d4c41',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  outlineBtn: {
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#b5a16b',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  outlineBtnText: { color: '#4e342e', fontWeight: '700' },
  appleBtn: {
    height: 46,
    borderRadius: 10,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appleBtnText: { color: '#fff', fontWeight: '700' },
});