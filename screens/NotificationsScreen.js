import React, { useContext } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Screen, Card, EmptyState } from '../components/ui';
import { colors, spacing, radii, typography } from '../theme/tokens';

export default function NotificationsScreen() {
  const { notifications, setNotifications } = useContext(AuthContext);

  const markAsRead = async (notifId) => {
    try {
      await axios.patch(
        `https://imame-backend.onrender.com/api/user-notifications/${notifId}/read`
      );
      setNotifications((prev) =>
        prev.map((n) => (n._id === notifId ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.log('Bildirim okundu yapılamadı', err.message);
    }
  };

  const renderItem = ({ item }) => {
    const formattedDate = new Date(item.createdAt).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <Card
        style={[styles.notification, !item.isRead && styles.unreadNotification]}
        onPress={() => markAsRead(item._id)}
      >
        <View style={styles.titleRow}>
          {!item.isRead && <View style={styles.unreadDot} />}
          <MaterialCommunityIcons
            name="bell-outline"
            size={18}
            color={colors.brown}
            style={styles.bellIcon}
          />
          <Text
            style={[styles.title, !item.isRead && styles.unreadTitle]}
            numberOfLines={2}
          >
            {item.title}
          </Text>
        </View>
        <Text style={styles.body}>{item.message}</Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </Card>
    );
  };

  return (
    <Screen>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="bell-off-outline"
            title="Bildirim yok"
            message="Yeni bildirimleriniz burada görünecek."
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },
  notification: {
    marginBottom: spacing.md,
  },
  unreadNotification: {
    backgroundColor: '#fff3e0',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.danger,
    marginRight: spacing.sm,
  },
  bellIcon: {
    marginRight: spacing.xs,
  },
  title: {
    ...typography.h3,
    fontWeight: '500',
    color: colors.brownDark,
    flex: 1,
  },
  unreadTitle: {
    fontWeight: '800',
  },
  body: {
    ...typography.body,
    color: colors.brown,
    marginTop: spacing.sm,
  },
  date: {
    ...typography.label,
    color: colors.muted,
    marginTop: spacing.sm,
    textAlign: 'right',
  },
});
