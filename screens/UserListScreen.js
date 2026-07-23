import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import axios from 'axios';
import { Screen, ScreenHeader, Card, Input, Badge, GradientButton, EmptyState } from '../components/ui';
import { useAlert } from '../context/AlertContext';
import { colors, spacing, typography } from '../theme/tokens';

export default function UserListScreen() {
  const { showAlert } = useAlert();
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
      showAlert({ title: 'Başarılı', message: 'Kullanıcı banlandı.' });
      fetchUsers();
    } catch (err) {
      console.error('Ban hatası:', err);
      showAlert({ title: 'Hata', message: 'Ban işlemi başarısız.' });
    }
  };

  const handleUnban = async (userId) => {
    try {
      await axios.patch(`https://imame-backend.onrender.com/api/users/unban/${userId}`);
      showAlert({ title: 'Başarılı', message: 'Ban kaldırıldı.' });
      fetchUsers();
    } catch (err) {
      console.error('Unban hatası:', err);
      showAlert({ title: 'Hata', message: 'Ban kaldırma işlemi başarısız.' });
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
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.name}>{item.name}</Text>
        {item.isBanned ? (
          <Badge label="Banlı" tone="rejected" icon="account-cancel-outline" />
        ) : (
          <Badge label={item.role} tone="neutral" icon="account-outline" />
        )}
      </View>
      <Text style={styles.email}>{item.email}</Text>

      {item.isBanned ? (
        <GradientButton
          title="Banı Kaldır"
          variant="secondary"
          onPress={() => handleUnban(item._id)}
          style={styles.actionButton}
        />
      ) : (
        <GradientButton
          title="Banla"
          variant="danger"
          onPress={() => handleBan(item._id)}
          style={styles.actionButton}
        />
      )}
    </Card>
  );

  return (
    <Screen>
      <ScreenHeader title="Kullanıcı Yönetimi" subtitle="Tüm kayıtlı kullanıcılar" />
      <View style={styles.container}>
        <Input
          placeholder="E-posta ile ara..."
          value={searchEmail}
          onChangeText={filterByEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          leftIcon="search-outline"
        />
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyState
              icon="account-search-outline"
              title="Kullanıcı bulunamadı"
            />
          }
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  listContent: {
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    ...typography.h3,
    color: colors.brownDark,
    flexShrink: 1,
    marginRight: spacing.sm,
  },
  email: {
    ...typography.body,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  actionButton: {
    marginTop: spacing.md,
  },
});
