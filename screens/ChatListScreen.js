import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export default function ChatListScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchChats = async () => {
        try {
          const res = await fetch(`https://imame-backend.onrender.com/api/chats/user/${user._id}`);
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
    }, [user._id])
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

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', color: '#666' }}>Sohbet bulunamadı.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff8e1',
  },
  chatItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
  },
  chatName: {
    fontSize: 18,
    color: '#4e342e',
  },
  badge: {
    backgroundColor: 'red',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
