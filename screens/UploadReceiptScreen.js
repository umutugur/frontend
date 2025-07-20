import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

export default function UploadReceiptScreen({ route, navigation }) {
  const { auctionId } = route.params;
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
        Alert.alert('Uyarı', 'Bu mezat için zaten bir dekont yüklediniz.', [
          {
            text: 'Tamam',
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (err) {
      console.error('Dekont kontrol hatası:', err);
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('İzin Gerekli', 'Galeriye erişim izni vermeniz gerekiyor.');
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
      Alert.alert('Uyarı', 'Lütfen bir dekont resmi seçin.');
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

      Alert.alert('Başarılı', 'Dekont başarıyla yüklendi!');
      setReceiptImage(null);
      navigation.goBack();
    } catch (err) {
      console.error('Dekont yükleme hatası:', err);
      Alert.alert('Hata', 'Dekont yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (alreadyUploaded) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dekont Yükleme</Text>

      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        {receiptImage ? (
          <Image source={{ uri: receiptImage }} style={styles.image} />
        ) : (
          <Text style={styles.pickText}>Dekont Seç</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.uploadButton} onPress={handleUpload} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.uploadText}>Yükle</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff8e1', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#4e342e', marginBottom: 20 },
  imagePicker: {
    width: 250,
    height: 250,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#aaa',
    backgroundColor: '#f0eae2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  pickText: { color: '#5d4037', fontSize: 16 },
  image: { width: '100%', height: '100%', borderRadius: 10 },
  uploadButton: {
    backgroundColor: '#6d4c41',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  uploadText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
