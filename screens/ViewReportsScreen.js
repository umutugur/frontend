// screens/ViewReportsScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { Screen, ScreenHeader, Card, EmptyState } from '../components/ui';
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
      <View style={styles.reportHead}>
        <Ionicons name="flag" size={16} color={colors.danger} />
        <Text style={styles.reportHeadText}>Şikayet</Text>
      </View>
      <Text style={styles.label}>Şikayet Eden</Text>
      <Text style={styles.text}>{item.reporter?.email || item.reporter?.name}</Text>
      <Text style={styles.label}>Şikayet Edilen</Text>
      <Text style={styles.text}>{item.reportedSeller?.email || item.reportedSeller?.name}</Text>
      <Text style={styles.label}>Açıklama</Text>
      <Text style={styles.reason}>{item.message}</Text>
    </Card>
  );

  if (loading) {
    return (
      <Screen>
        <ScreenHeader title="Gelen Şikayetler" subtitle="Kullanıcı şikayetleri" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.brown} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader title="Gelen Şikayetler" subtitle="Kullanıcı şikayetleri" />
      <View style={styles.container}>
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
  container: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.sm },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingBottom: spacing.xl, flexGrow: 1 },
  card: { marginBottom: spacing.md },
  reportHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  reportHeadText: {
    ...typography.label,
    color: colors.danger,
  },
  label: {
    ...typography.label,
    color: colors.gold,
    marginTop: spacing.sm,
  },
  text: {
    ...typography.bodyStrong,
    marginTop: 2,
    color: colors.brownDark,
  },
  reason: {
    ...typography.body,
    color: colors.muted,
    marginTop: 2,
  },
});
