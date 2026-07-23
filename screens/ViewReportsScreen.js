// screens/ViewReportsScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { Screen, Card, EmptyState } from '../components/ui';
import { useAlert } from '../context/AlertContext';
import { colors, spacing, typography } from '../theme/tokens';

export default function ViewReportsScreen() {
  const { showAlert } = useAlert();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get('https://imame-backend.onrender.com/api/reports');
        setReports(res.data);
      } catch (err) {
        showAlert({ title: 'Hata', message: err.response?.data?.message || err.message });
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Text style={styles.label}>Şikayet Eden:</Text>
      <Text style={styles.text}>{item.reporter?.email || item.reporter?.name}</Text>
      <Text style={styles.label}>Şikayet Edilen:</Text>
      <Text style={styles.text}>{item.reportedSeller?.email || item.reportedSeller?.name}</Text>
      <Text style={styles.label}>Açıklama:</Text>
      <Text style={styles.reason}>{item.message}</Text>
    </Card>
  );

  if (loading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.brown} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.header}>Gelen Şikayetler</Text>
        <FlatList
          data={reports}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyState
              icon="flag-outline"
              title="Hiç şikayet bulunamadı."
            />
          }
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.xl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    ...typography.h1,
    color: colors.brownDark,
    marginBottom: spacing.lg,
  },
  listContent: { paddingBottom: spacing.xl, flexGrow: 1 },
  card: { marginBottom: spacing.md },
  label: {
    ...typography.label,
    fontSize: 13,
    fontWeight: '700',
    color: colors.brown,
  },
  text: {
    ...typography.body,
    marginBottom: spacing.xs,
    color: colors.brownDark,
  },
  reason: {
    ...typography.body,
    color: colors.muted,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
});
