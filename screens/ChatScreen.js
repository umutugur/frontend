import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import * as Notifications from 'expo-notifications';

export default function ChatScreen({ route, navigation }) {
  const { chatId, otherUserName } = route.params;
  const { user, fetchUnreadMessages } = useContext(AuthContext);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: otherUserName || 'Sohbet',
    });
  }, [otherUserName]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`https://imame-backend.onrender.com/api/chats/${chatId}`);
      const data = await res.json();
      setMessages(data.messages.reverse());

      // ✅ Okunmamış mesajları işaretle
      await fetch(`https://imame-backend.onrender.com/api/messages/mark-as-read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: chatId,
          userId: user._id,
        }),
      });

      // ✅ Tab bar'daki unreadCount'u sıfırla
      await fetchUnreadMessages(user._id);

    } catch (err) {
      console.error('❌ Mesajlar yüklenemedi:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    try {
      const res = await fetch(`https://imame-backend.onrender.com/api/chats/${chatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user._id,
          text: input.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessages((prev) => [data.message, ...prev]);
      setInput('');
    } catch (err) {
      console.error('❌ Mesaj gönderilemedi:', err.message);
    }
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.message,
        item.sender === user._id ? styles.myMessage : styles.theirMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6d4c41" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        style={styles.chatArea}
        inverted
      />

      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          placeholder="Mesaj yaz..."
          placeholderTextColor="#999"
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>Gönder</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  chatArea: { flex: 1, padding: 10 },
  message: {
    maxWidth: '75%',
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
  },
  myMessage: {
    backgroundColor: '#dcedc8',
    alignSelf: 'flex-end',
  },
  theirMessage: {
    backgroundColor: '#ffe0b2',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
  },
  inputArea: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 40,
    marginRight: 10,
    color: '#000',
  },
  sendButton: {
    backgroundColor: '#6d4c41',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
