import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Switch,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../context/AuthContext';

export default function AddAuctionScreen() {
  const { user } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [images, setImages] = useState([]);
  const [isSigned, setIsSigned] = useState(false);

  const pickImage = async () => {
    if (images.length >= 5) {
      Alert.alert('Uyarı', 'En fazla 5 fotoğraf yükleyebilirsiniz.');
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

  const handleSubmit = async () => {
    if (!title || !startingPrice || !user || !user._id) {
      Alert.alert('Eksik bilgi', 'Lütfen gerekli tüm alanları doldurun.');
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

      Alert.alert('Başarılı', 'Mezat başarıyla oluşturuldu.');
      setTitle('');
      setDescription('');
      setStartingPrice('');
      setImages([]);
      setIsSigned(false);
    } catch (err) {
      Alert.alert('Hata', err.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fff8e1' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Mezat Oluştur</Text>

        <TextInput
          placeholder="Tesbih Başlığı"
          placeholderTextColor="#4e342e"
          style={styles.input}
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          placeholder="Açıklama"
          placeholderTextColor="#4e342e"
          style={[styles.input, { height: 100 }]}
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <TextInput
          placeholder="Başlangıç Fiyatı"
          placeholderTextColor="#4e342e"
          style={styles.input}
          value={startingPrice}
          onChangeText={setStartingPrice}
          keyboardType="numeric"
        />

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Usta İmzalı</Text>
          <Switch value={isSigned} onValueChange={setIsSigned} />
        </View>

        <TouchableOpacity style={styles.pickButton} onPress={pickImage}>
          <Text style={styles.pickButtonText}>Fotoğraf Ekle ({images.length}/5)</Text>
        </TouchableOpacity>

        <View style={styles.imagePreviewContainer}>
          {images.map((img, idx) => (
            <Image key={idx} source={{ uri: img.uri }} style={styles.previewImage} />
          ))}
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Mezatı Kaydet</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff8e1',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4e342e',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    color: '#4e342e',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  switchLabel: {
    fontSize: 16,
    color: '#4e342e',
  },
  pickButton: {
    backgroundColor: '#d7ccc8',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  pickButtonText: {
    color: '#4e342e',
    fontWeight: 'bold',
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  previewImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  submitButton: {
    backgroundColor: '#6d4c41',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
