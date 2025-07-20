import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function ChatListScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kullanıcıya ait sohbetleri çek
    const fetchChats = async () => {
      try {
        const res = await fetch(`https://imame-backend.onrender.com/api/chats/user/${user._id}`);
const data = await res.json();
setChats(data.chats || []);

      } catch (err) {
        setChats([]); // Boş liste dön
      } finally {
        setLoading(false);
      }
    };
    fetchChats();
  }, []);

  const renderItem = ({ item }) => {
    // Karşı tarafı bul (sen alıcıysan satıcı, satıcıysan alıcı)
    const otherUser = item.buyer?._id === user._id ? item.seller : item.buyer;
    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => navigation.navigate('Chat', { chatId: item._id })}
      >
        <Text style={styles.chatName}>
          {otherUser?.companyName || otherUser?.name || "Kullanıcı"}
        </Text>
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
        ListEmptyComponent={<Text style={{textAlign:'center',color:'#666'}}>Sohbet bulunamadı.</Text>}
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
