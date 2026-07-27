import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import * as Notifications from 'expo-notifications';

import { Screen, ScreenHeader, Input, PressableScale } from '../components/ui';
import { colors, gradients, radii, shadows, spacing, typography } from '../theme/tokens';

export default function ChatScreen({ route, navigation }) {
  const { chatId, otherUserName } = route.params;
  const { user, fetchUnreadMessages } = useContext(AuthContext);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);

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

  const renderItem = ({ item }) => {
    const mine = item.sender === user._id;
    if (mine) {
      return (
        <View style={styles.myRow}>
          <LinearGradient
            colors={gradients.goldToBrown}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.bubble, styles.myBubble]}
          >
            <Text style={styles.myText}>{item.text}</Text>
          </LinearGradient>
        </View>
      );
    }
    return (
      <View style={styles.theirRow}>
        <View style={[styles.bubble, styles.theirBubble]}>
          <Text style={styles.theirText}>{item.text}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <Screen>
        <ScreenHeader variant="plain" title={otherUserName || 'Sohbet'} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.brown} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen keyboardOffset={90} contentContainerStyle={styles.container}>
      <ScreenHeader variant="plain" title={otherUserName || 'Sohbet'} />
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
        inverted
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.inputArea}>
        <View style={styles.inputWrap}>
          <Input
            placeholder="Mesaj yaz..."
            value={input}
            onChangeText={setInput}
            style={styles.input}
          />
        </View>
        <PressableScale onPress={handleSend} style={styles.sendButton}>
          <LinearGradient
            colors={gradients.goldToBrown}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sendGradient}
          >
            <Ionicons name="send" size={20} color={colors.white} />
          </LinearGradient>
        </PressableScale>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cream,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    padding: spacing.md,
  },
  myRow: {
    alignItems: 'flex-end',
    marginVertical: spacing.xs,
  },
  theirRow: {
    alignItems: 'flex-start',
    marginVertical: spacing.xs,
  },
  bubble: {
    maxWidth: '78%',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    ...shadows.soft,
  },
  myBubble: {
    borderRadius: radii.lg,
    borderBottomRightRadius: radii.xs || 4,
  },
  theirBubble: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    borderBottomLeftRadius: 4,
  },
  myText: {
    ...typography.body,
    fontSize: 15,
    color: colors.white,
  },
  theirText: {
    ...typography.body,
    fontSize: 15,
    color: colors.brownDark,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.cream,
  },
  inputWrap: {
    flex: 1,
    marginRight: spacing.sm,
  },
  input: {
    marginBottom: 0,
    borderRadius: radii.pill,
  },
  sendButton: {
    borderRadius: radii.pill,
    overflow: 'hidden',
    ...shadows.card,
  },
  sendGradient: {
    width: 48,
    height: 48,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
