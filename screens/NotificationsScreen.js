import React, { useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

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
      <TouchableOpacity onPress={() => markAsRead(item._id)}>
        <View
          style={[
            styles.notification,
            !item.isRead && styles.unreadNotification,
          ]}
        >
          <Text style={[styles.title, !item.isRead && styles.unreadTitle]}>
            {item.title}
          </Text>
          <Text style={styles.body}>{item.message}</Text>
          <Text style={styles.date}>{formattedDate}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefefe',
    padding: 16,
  },
  notification: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  unreadNotification: {
    backgroundColor: '#fff3e0',
  },
  title: {
    fontSize: 16,
    color: '#4e342e',
  },
  unreadTitle: {
    fontWeight: 'bold',
  },
  body: {
    fontSize: 14,
    color: '#5d4037',
    marginTop: 6,
  },
  date: {
    fontSize: 12,
    color: '#8d6e63',
    marginTop: 8,
    textAlign: 'right',
  },
});
