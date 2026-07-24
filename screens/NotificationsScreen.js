import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Screen, ScreenHeader, Card, EmptyState, Skeleton } from '../components/ui';
import { colors, spacing, radii, typography } from '../theme/tokens';

// Yükleniyor durumunda bildirim satırını taklit eden iskelet.
function NotificationRowSkeleton() {
  return (
    <Card style={styles.notification}>
      <View style={styles.titleRow}>
        <Skeleton width={32} height={32} radius={radii.pill} style={styles.skeletonBell} />
        <Skeleton height={14} width="60%" />
      </View>
      <Skeleton height={12} width="90%" style={styles.skeletonBody} />
      <Skeleton height={12} width="30%" style={styles.skeletonDate} />
    </Card>
  );
}

export default function NotificationsScreen() {
  const { notifications, setNotifications } = useContext(AuthContext);
  // Bildirimler AuthContext'te uygulama girişinde alınır ve burada bir
  // "yükleniyor" bayrağı olarak dışa açılmaz; ekranın ilk açılışında kısa bir
  // iskelet geçişi göstermek için yalnızca sunumsal, yerel bir gecikme kullanılır
  // (herhangi bir axios çağrısı veya iş kuralı eklemez).
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

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
        {!item.isRead ? <View style={styles.unreadAccent} /> : null}
        <View style={styles.titleRow}>
          <View style={[styles.bellCircle, !item.isRead && styles.bellCircleUnread]}>
            <MaterialCommunityIcons
              name={item.isRead ? 'bell-outline' : 'bell-ring-outline'}
              size={16}
              color={item.isRead ? colors.brown : colors.gold}
            />
          </View>
          <Text
            style={[styles.title, !item.isRead && styles.unreadTitle]}
            numberOfLines={2}
          >
            {item.title}
          </Text>
          {!item.isRead ? <View style={styles.unreadDot} /> : null}
        </View>
        <Text style={styles.body}>{item.message}</Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </Card>
    );
  };

  if (loading) {
    return (
      <Screen>
        <ScreenHeader variant="plain" title="Bildirimler" />
        <View style={styles.listContent}>
          {[0, 1, 2, 3].map((i) => (
            <NotificationRowSkeleton key={i} />
          ))}
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader variant="plain" title="Bildirimler" />
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
    overflow: 'hidden',
  },
  unreadNotification: {
    backgroundColor: colors.cream,
  },
  unreadAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: colors.gold,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bellCircle: {
    width: 32,
    height: 32,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(78,52,46,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  bellCircleUnread: {
    backgroundColor: 'rgba(201,162,75,0.16)',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.gold,
    marginLeft: spacing.sm,
  },
  title: {
    ...typography.bodyStrong,
    color: colors.brownDark,
    flex: 1,
  },
  unreadTitle: {
    ...typography.h3,
  },
  body: {
    ...typography.body,
    color: colors.brown,
    marginTop: spacing.sm,
  },
  date: {
    ...typography.small,
    color: colors.muted,
    marginTop: spacing.sm,
    textAlign: 'right',
  },
  skeletonBell: {
    marginRight: spacing.sm,
  },
  skeletonBody: {
    marginTop: spacing.sm,
  },
  skeletonDate: {
    marginTop: spacing.sm,
    alignSelf: 'flex-end',
  },
});
