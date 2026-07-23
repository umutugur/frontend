import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useAlert } from '../context/AlertContext';
import { Screen, GradientButton, PressableScale } from '../components/ui';
import { colors, gradients, spacing, radii, typography, shadows } from '../theme/tokens';

export default function UploadReceiptScreen({ route, navigation }) {
  const { auctionId } = route.params;
  const { showAlert } = useAlert();
  const [receiptImage, setReceiptImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alreadyUploaded, setAlreadyUploaded] = useState(false);

  useEffect(() => {
    checkReceiptStatus();
  }, []);

  const checkReceiptStatus = async () => {
    try {
      const res = await axios.get(`https://imame-backend.onrender.com/api/auctions/${auctionId}`);
      if (res.data.receiptUploaded) {
        setAlreadyUploaded(true);
        showAlert({
          title: 'Uyarı',
          message: 'Bu mezat için zaten bir dekont yüklediniz.',
          buttons: [
            {
              text: 'Tamam',
              onPress: () => navigation.goBack(),
            },
          ],
        });
      }
    } catch (err) {
      console.error('Dekont kontrol hatası:', err);
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      showAlert({
        title: 'İzin Gerekli',
        message: 'Galeriye erişim izni vermeniz gerekiyor.',
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setReceiptImage(result.assets[0].uri);
    }
  };

  const handleUpload = async () => {
    if (!receiptImage) {
      showAlert({ title: 'Uyarı', message: 'Lütfen bir dekont resmi seçin.' });
      console.log('auctionId:', auctionId);
      return;
    }

    setLoading(true);
    try {
      // 1. Cloudinary'e yükle
      const formData = new FormData();
      formData.append('file', {
        uri: receiptImage,
        type: 'image/jpeg',
        name: 'receipt.jpg',
      });
      formData.append('upload_preset', 'imame_uploads');
      formData.append('folder', 'receipts');

     const cloudRes = await fetch('https://api.cloudinary.com/v1_1/dlazcw1gc/image/upload', {
  method: 'POST',
  body: formData,
      });

      const cloudData = await cloudRes.json();
      console.log('Cloudinary response:', cloudData);
      console.log('receiptUrl:', cloudData.secure_url);
      const receiptUrl = cloudData.secure_url;

      // 2. Backend’e bildir
      await axios.put(`https://imame-backend.onrender.com/api/receipts/upload/${auctionId}`, {
        receiptUrl,
      });

      showAlert({ title: 'Başarılı', message: 'Dekont başarıyla yüklendi!' });
      setReceiptImage(null);
      navigation.goBack();
    } catch (err) {
      console.error('Dekont yükleme hatası:', err);
      showAlert({ title: 'Hata', message: 'Dekont yüklenirken bir hata oluştu.' });
    } finally {
      setLoading(false);
    }
  };

  if (alreadyUploaded) return null;

  return (
    <Screen contentContainerStyle={styles.container}>
      <Text style={styles.title}>Dekont Yükleme</Text>

      <PressableScale onPress={pickImage} style={styles.pickerWrap}>
        {receiptImage ? (
          <Image source={{ uri: receiptImage }} style={styles.image} />
        ) : (
          <LinearGradient
            colors={gradients.creamSurface}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.imagePicker}
          >
            <MaterialCommunityIcons
              name="cloud-upload-outline"
              size={48}
              color={colors.brown}
            />
            <Text style={styles.pickText}>Dekont Seç</Text>
          </LinearGradient>
        )}
      </PressableScale>

      <GradientButton
        title="Yükle"
        icon="cloud-upload-outline"
        onPress={handleUpload}
        loading={loading}
        disabled={loading}
        style={styles.uploadButton}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.h1,
    color: colors.brownDark,
    marginBottom: spacing.xl,
  },
  pickerWrap: {
    width: 260,
    height: 260,
    borderRadius: radii.lg,
    overflow: 'hidden',
    marginBottom: spacing.xl,
    ...shadows.card,
  },
  imagePicker: {
    flex: 1,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.line,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickText: {
    color: colors.brown,
    fontSize: 16,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  image: { width: '100%', height: '100%', borderRadius: radii.lg },
  uploadButton: {
    width: 260,
  },
});
