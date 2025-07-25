// screens/NotificationsScreen.js
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

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => markAsRead(item._id)}>
      <View
        style={[
          styles.notification,
          !item.isRead && { backgroundColor: '#ffe0b2' }, // okunmamış bildirimler için renk
        ]}
      >
        <Text style={[styles.title, !item.isRead && { fontWeight: 'bold' }]}>
          {item.title}
        </Text>
        <Text style={styles.body}>{item.message}</Text>
        {/* İsterseniz tarih gösterebilirsiniz */}
      </View>
    </TouchableOpacity>
  );

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
    padding: 16,
  },
  notification: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  title: { fontSize: 16 },
  body: { fontSize: 14, marginTop: 4 },
});
