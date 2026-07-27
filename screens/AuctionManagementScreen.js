// screens/AuctionManagementScreen.js
import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useAlert } from '../context/AlertContext';
import { Screen, ScreenHeader, Card, Badge, GradientButton } from '../components/ui';
import { colors, spacing, typography } from '../theme/tokens';

const dummyAuctions = [
  { id: '1', title: 'Kuka Tesbih', status: 'Devam Ediyor' },
  { id: '2', title: 'Sıkma Kehribar', status: 'Bitti' },
  { id: '3', title: 'Usta İşçilikli Oltu', status: 'Devam Ediyor' },
];

const AuctionManagementScreen = ({ navigation }) => {
  const { showAlert } = useAlert();

  const handleEdit = (id) => {
    showAlert({ title: 'Düzenle', message: `Mezat #${id} düzenleme ekranına yönlendirilecek.` });
  };

  const handleDelete = (id) => {
    showAlert({ title: 'Sil', message: `Mezat #${id} silinecek.` });
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <View style={styles.infoBlock}>
        <Text style={styles.title}>{item.title}</Text>
        <Badge
          label={item.status}
          tone={item.status === 'Bitti' ? 'rejected' : 'pending'}
          icon={item.status === 'Bitti' ? 'flag-checkered' : 'progress-clock'}
        />
      </View>
      <View style={styles.actions}>
        <GradientButton
          title="Düzenle"
          icon="create-outline"
          variant="secondary"
          onPress={() => handleEdit(item.id)}
          style={styles.button}
        />
        <GradientButton
          title="Sil"
          icon="trash-outline"
          variant="danger"
          onPress={() => handleDelete(item.id)}
          style={styles.button}
        />
      </View>
    </Card>
  );

  return (
    <Screen>
      <ScreenHeader variant="plain" title="Mezat Yönetimi" />
      <FlatList
        data={dummyAuctions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xl,
  },
  card: {
    marginBottom: spacing.md,
  },
  infoBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.brownDark,
    flex: 1,
    marginRight: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
  },
  button: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
});

export default AuctionManagementScreen;
