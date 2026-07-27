import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Switch,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { Screen, ScreenHeader, Input, GradientButton, Card } from '../components/ui';
import { colors, radii, spacing, typography, shadows } from '../theme/tokens';

export default function AddAuctionScreen() {
  const { user } = useContext(AuthContext);
  const { showAlert } = useAlert();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [images, setImages] = useState([]);
  const [isSigned, setIsSigned] = useState(false);

  const pickImage = async () => {
    if (images.length >= 5) {
      showAlert({ title: 'Uyarı', message: 'En fazla 5 fotoğraf yükleyebilirsiniz.' });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0]]);
    }
  };

  // --- FOTOĞRAF SİLME FONKSİYONU ---
  const handleRemoveImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!title || !startingPrice || !user || !user._id) {
      showAlert({ title: 'Eksik bilgi', message: 'Lütfen gerekli tüm alanları doldurun.' });
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('startingPrice', startingPrice);
    formData.append('seller', user._id);
    formData.append('isSigned', isSigned);

    images.forEach((img, idx) => {
      formData.append('images', {
        uri: img.uri,
        name: `photo_${idx}.jpg`,
        type: 'image/jpeg',
      });
    });

    try {
      const res = await fetch('https://imame-backend.onrender.com/api/auctions', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Mezat oluşturulamadı');

      showAlert({ title: 'Başarılı', message: 'Mezat başarıyla oluşturuldu.' });
      setTitle('');
      setDescription('');
      setStartingPrice('');
      setImages([]);
      setIsSigned(false);
    } catch (err) {
      showAlert({ title: 'Hata', message: err.message });
    }
  };

  return (
    <Screen>
      <ScreenHeader variant="plain" title="Mezat Oluştur" subtitle="Yeni tesbih mezatı" />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.formCard}>
          <Text style={styles.fieldLabel}>Tesbih Başlığı</Text>
          <Input
            variant="underline"
            leftIcon="pricetag-outline"
            placeholder="Tesbih Başlığı"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.fieldLabel}>Açıklama</Text>
          <Input
            variant="underline"
            leftIcon="document-text-outline"
            placeholder="Açıklama"
            value={description}
            onChangeText={setDescription}
            multiline
            style={styles.multiline}
          />

          <Text style={styles.fieldLabel}>Başlangıç Fiyatı</Text>
          <Input
            variant="underline"
            leftIcon="cash-outline"
            placeholder="Başlangıç Fiyatı"
            value={startingPrice}
            onChangeText={setStartingPrice}
            keyboardType="numeric"
          />

          <View style={styles.switchRow}>
            <View style={styles.switchLabelWrap}>
              <MaterialCommunityIcons name="seal-variant" size={18} color={colors.brown} />
              <Text style={styles.switchLabel}>Usta İmzalı</Text>
            </View>
            <Switch
              value={isSigned}
              onValueChange={setIsSigned}
              trackColor={{ true: colors.brown, false: colors.line }}
              thumbColor={colors.white}
            />
          </View>
        </Card>

        <Text style={styles.sectionLabel}>Fotoğraflar ({images.length}/5)</Text>
        <View style={styles.imagePreviewContainer}>
          {images.map((img, idx) => (
            <View key={idx} style={styles.imageWrapper}>
              <Image source={{ uri: img.uri }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveImage(idx)}
              >
                <MaterialCommunityIcons name="close" size={15} color={colors.white} />
              </TouchableOpacity>
            </View>
          ))}
          {images.length < 5 ? (
            <TouchableOpacity style={styles.addTile} onPress={pickImage} activeOpacity={0.85}>
              <MaterialCommunityIcons name="camera-plus-outline" size={26} color={colors.brown} />
              <Text style={styles.addTileText}>Ekle</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <GradientButton
          title="Mezatı Kaydet"
          icon="checkmark-circle-outline"
          variant="gold"
          onPress={handleSubmit}
          style={styles.submitButton}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  formCard: {
    marginBottom: spacing.xl,
  },
  fieldLabel: {
    ...typography.label,
    color: colors.brown,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  switchLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    ...typography.h3,
    color: colors.brownDark,
    marginLeft: spacing.sm,
  },
  sectionLabel: {
    ...typography.h3,
    color: colors.brownDark,
    marginBottom: spacing.md,
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.xl,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: spacing.md,
    marginBottom: spacing.md,
    ...shadows.soft,
  },
  previewImage: {
    width: 76,
    height: 76,
    borderRadius: radii.md,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.danger,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    elevation: 2,
  },
  addTile: {
    width: 76,
    height: 76,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderStyle: 'dashed',
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTileText: {
    ...typography.label,
    color: colors.brown,
    marginTop: 2,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
});
