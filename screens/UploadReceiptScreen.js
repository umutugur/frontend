import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useAlert } from '../context/AlertContext';
import { Screen, ScreenHeader, GradientButton, PressableScale } from '../components/ui';
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
    <Screen>
      <ScreenHeader
        variant="plain"
        title="Dekont Yükleme"
        subtitle="Ödeme dekontunuzu yükleyin"
      />
      <View style={styles.container}>
        <PressableScale onPress={pickImage} style={styles.pickerWrap}>
          {receiptImage ? (
            <View style={styles.previewWrap}>
              <Image source={{ uri: receiptImage }} style={styles.image} />
              <LinearGradient colors={gradients.scrim} style={styles.previewScrim} pointerEvents="none" />
              <View style={styles.changeChip}>
                <MaterialCommunityIcons name="image-edit-outline" size={15} color={colors.creamHi} />
                <Text style={styles.changeText}>Değiştir</Text>
              </View>
            </View>
          ) : (
            <LinearGradient
              colors={gradients.creamSurface}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.imagePicker}
            >
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons
                  name="cloud-upload-outline"
                  size={44}
                  color={colors.gold}
                />
              </View>
              <Text style={styles.pickText}>Dekont Seç</Text>
              <Text style={styles.pickHint}>Galeriden bir görsel seçin</Text>
              <View style={styles.orn}>
                <View style={styles.ornLine} />
                <View style={styles.ornDiamond} />
                <View style={styles.ornLine} />
              </View>
            </LinearGradient>
          )}
        </PressableScale>

        <GradientButton
          title="Yükle"
          icon="cloud-upload-outline"
          variant="gold"
          onPress={handleUpload}
          loading={loading}
          disabled={loading}
          style={styles.uploadButton}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerWrap: {
    width: 280,
    height: 280,
    borderRadius: radii.lg,
    overflow: 'hidden',
    marginBottom: spacing.xxl,
    ...shadows.card,
  },
  imagePicker: {
    flex: 1,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.gold,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(201,162,75,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  pickText: {
    ...typography.h3,
    color: colors.brownDark,
  },
  pickHint: {
    ...typography.small,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  orn: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.lg },
  ornLine: { width: 26, height: 1, backgroundColor: colors.lineStrong },
  ornDiamond: {
    width: 6,
    height: 6,
    backgroundColor: colors.gold,
    transform: [{ rotate: '45deg' }],
    marginHorizontal: spacing.sm,
  },
  previewWrap: { flex: 1 },
  image: { width: '100%', height: '100%', borderRadius: radii.lg },
  previewScrim: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '40%' },
  changeChip: {
    position: 'absolute',
    bottom: spacing.md,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(58,36,28,0.72)',
  },
  changeText: {
    ...typography.bodyStrong,
    color: colors.creamHi,
    fontSize: 13,
  },
  uploadButton: {
    width: 280,
  },
});
