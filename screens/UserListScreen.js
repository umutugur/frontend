import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  Alert, TextInput
} from 'react-native';
import axios from 'axios';

export default function UserListScreen() {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchEmail, setSearchEmail] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('https://imame-backend.onrender.com/api/users/all');
      setUsers(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error('Kullanıcılar alınamadı:', err);
    }
  };

  const handleBan = async (userId) => {
    try {
      await axios.patch(`https://imame-backend.onrender.com/api/users/ban/${userId}`);
      Alert.alert('Başarılı', 'Kullanıcı banlandı.');
      fetchUsers();
    } catch (err) {
      console.error('Ban hatası:', err);
      Alert.alert('Hata', 'Ban işlemi başarısız.');
    }
  };

  const handleUnban = async (userId) => {
    try {
      await axios.patch(`https://imame-backend.onrender.com/api/users/unban/${userId}`);
      Alert.alert('Başarılı', 'Ban kaldırıldı.');
      fetchUsers();
    } catch (err) {
      console.error('Unban hatası:', err);
      Alert.alert('Hata', 'Ban kaldırma işlemi başarısız.');
    }
  };

  const filterByEmail = (text) => {
    setSearchEmail(text);
    if (text.trim() === '') {
      setFiltered(users);
    } else {
      const lower = text.toLowerCase();
      const result = users.filter((u) =>
        u.email && u.email.toLowerCase().includes(lower)
      );
      setFiltered(result);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.email}>{item.email}</Text>
      <Text style={styles.role}>{item.role}</Text>

      {item.isBanned ? (
        <TouchableOpacity style={styles.unbanButton} onPress={() => handleUnban(item._id)}>
          <Text style={styles.buttonText}>Banı Kaldır</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.banButton} onPress={() => handleBan(item._id)}>
          <Text style={styles.buttonText}>Banla</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kullanıcı Yönetimi</Text>
      <TextInput
        placeholder="E-posta ile ara..."
        value={searchEmail}
        onChangeText={filterByEmail}
        style={styles.searchInput}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>Kullanıcı bulunamadı</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8e1',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4e342e',
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  email: {
    fontSize: 14,
    color: '#555',
    marginVertical: 4,
  },
  role: {
    fontSize: 14,
    color: '#777',
  },
  banButton: {
    marginTop: 10,
    backgroundColor: '#d84315',
    paddingVertical: 8,
    borderRadius: 8,
  },
  unbanButton: {
    marginTop: 10,
    backgroundColor: '#388e3c',
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  empty: {
    marginTop: 30,
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
  },
});
