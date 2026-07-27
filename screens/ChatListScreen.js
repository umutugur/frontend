import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Feather } from '@expo/vector-icons';

import { Screen, Card, Badge, EmptyState, GradientButton } from '../components/ui';
import { colors, radii, spacing, typography } from '../theme/tokens';

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
    const displayName = otherUser?.companyName || otherUser?.name || 'Kullanıcı';

    return (
      <Card
        style={styles.chatCard}
        onPress={() =>
          navigation.navigate('Chat', {
            chatId: item._id,
            otherUserName: displayName,
          })
        }
      >
        <View style={styles.row}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {displayName?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
          <Text style={styles.chatName} numberOfLines={1}>
            {displayName}
          </Text>
          {unreadCount > 0 ? (
            <Badge label={String(unreadCount)} tone="rejected" icon="email" />
          ) : (
            <Feather name="chevron-right" size={20} color={colors.muted} />
          )}
        </View>
      </Card>
    );
  };

  if (loading) {
    return (
      <Screen edges={['left', 'right']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.brown} />
        </View>
      </Screen>
    );
  }

  const isGuest = !user?._id || user?.role === 'guest';

  return (
    <Screen edges={['left', 'right']}>
      {/* Misafir CTA */}
      {isGuest ? (
        <View style={styles.guestWrap}>
          <EmptyState
            icon="chat-outline"
            title="Mesajlarım"
            message="Mesajlaşma için giriş yapmanız gerekir."
          />

          <View style={styles.ctaButtons}>
            <GradientButton
              title="Giriş / Kayıt"
              icon="log-in-outline"
              onPress={logout}
              style={styles.ctaButton}
            />
            <GradientButton
              title="Google ile Giriş Yap"
              icon="logo-google"
              variant="secondary"
              onPress={() => promptGoogle?.()}
              style={styles.ctaButton}
            />
            {appleAvail && (
              <GradientButton
                title="Apple ile Giriş Yap"
                icon="logo-apple"
                variant="secondary"
                onPress={() => loginWithApple?.()}
                style={styles.ctaButton}
              />
            )}
          </View>
        </View>
      ) : (
        <FlatList
          data={chats}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="chat-remove-outline"
              title="Sohbet bulunamadı"
              message="Henüz bir sohbetiniz yok. Kazandığınız mezatlarda satıcıyla mesajlaşabilirsiniz."
            />
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.lg,
    flexGrow: 1,
  },
  chatCard: {
    marginBottom: spacing.md,
    paddingVertical: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.brown,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    ...typography.h3,
    color: colors.white,
  },
  chatName: {
    ...typography.h3,
    color: colors.brownDark,
    flex: 1,
    marginRight: spacing.sm,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  ctaButtons: {
    marginTop: spacing.lg,
  },
  ctaButton: {
    marginBottom: spacing.md,
  },
});
