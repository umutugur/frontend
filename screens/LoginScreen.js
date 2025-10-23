// screens/LoginScreen.js
import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import * as AppleAuthentication from 'expo-apple-authentication';

const LoginScreen = ({ navigation }) => {
  const {
    user,
    login,
    promptGoogle,
    loginWithApple,
    signInGuest, // 👈 misafir girişi
  } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [banned, setBanned] = useState(false);
  const [isAppleAvailable, setIsAppleAvailable] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      AppleAuthentication.isAvailableAsync().then(setIsAppleAvailable);
    }
  }, []);

  // Kullanıcı giriş yaptığında geri dön; mümkün değilse Main'e git.
  useEffect(() => {
    if (user) {
      if (navigation.canGoBack()) navigation.goBack();
      else navigation.navigate('Main');
    }
  }, [user, navigation]);

  const handleLogin = async () => {
    setError('');
    setBanned(false);
    try {
      await login(email, password);
    } catch (err) {
      const message = err?.message?.toLowerCase() || '';
      if (message.includes('ban') || message.includes('askıya') || message.includes('banned')) {
        setBanned(true);
        setError(
          'Hesabınız geçici olarak askıya alınmıştır. Lütfen 7 gün sonra tekrar deneyin veya destek ekibimizle iletişime geçin.'
        );
      } else if (message.includes('wrong password') || message.includes('şifre')) {
        setError('E-posta veya şifre hatalı.');
      } else {
        setError('Giriş başarısız: ' + err.message);
      }
    }
  };

  return (
  <KeyboardAvoidingView
    style={{ flex: 1, backgroundColor: '#fff8e1' }}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  >
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Image source={require('../assets/logo.png')} style={styles.logo} />
          <Text style={styles.title}>Giriş Yap</Text>

          {!!error && (
            <View style={[styles.errorBox, banned ? styles.banBox : null]}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TextInput
            placeholder="Email"
            placeholderTextColor="#B5A16B"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Şifre"
            placeholderTextColor="#B5A16B"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Giriş Yap</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.googleButton} onPress={() => promptGoogle()}>
            <Image source={require('../assets/google-icon.png')} style={styles.googleIcon} />
            <Text style={styles.googleButtonText}>Google ile Giriş Yap</Text>
          </TouchableOpacity>

          {Platform.OS === 'ios' && isAppleAvailable && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={5}
              style={{ width: '100%', height: 50, marginBottom: 15 }}
              onPress={async () => {
                try {
                  await loginWithApple();
                } catch (err) {
                  if (err.code !== 'ERR_CANCELED') {
                    Alert.alert('Apple Girişi Hatası', err.message || 'Bir hata oluştu.');
                  }
                }
              }}
            />
          )}
        </View>
      </ScrollView>

      {/* 👇 Alt sabit buton */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.guestButton} onPress={signInGuest}>
          <Text style={styles.guestButtonText}>Üye Olmadan Devam Et</Text>
        </TouchableOpacity>
      </View>
    </View>
  </KeyboardAvoidingView>
);
};

export default LoginScreen;

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, justifyContent: 'center' },
  container: {
    flex: 1,
    backgroundColor: '#fff8e1',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: { width: 260, height: 130, marginBottom: 10, resizeMode: 'contain' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#4e342e', marginBottom: 20, letterSpacing: 0.4 },
  errorBox: {
    width: '100%',
    backgroundColor: '#fff3cd',
    borderColor: '#b5a16b',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  banBox: { backgroundColor: '#f8d7da', borderColor: '#7B1421' },
  errorText: { color: '#7B1421', fontSize: 15, textAlign: 'center', fontWeight: '600' },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#b5a16b',
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 15,
    backgroundColor: '#fff',
    color: '#4e342e',
    fontSize: 16,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#6d4c41',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, letterSpacing: 0.3 },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#b5a16b',
    borderRadius: 10,
    justifyContent: 'center',
    marginBottom: 20,
  },
  googleIcon: { width: 22, height: 22, marginRight: 10 },
  googleButtonText: { color: '#4e342e', fontWeight: 'bold', fontSize: 15 },

  // Üye olmadan devam et
  guestButton: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#6d4c41',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  guestButtonText: {
    color: '#6d4c41',
    fontWeight: '700',
    fontSize: 15,
  },
});