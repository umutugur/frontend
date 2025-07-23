import React, { useState, useContext } from 'react';
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

const LoginScreen = ({ navigation }) => {
  const { login, promptGoogle } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [banned, setBanned] = useState(false);

  const handleLogin = async () => {
    setError('');
    setBanned(false);
    try {
      await login(email, password);
      navigation.replace('Main');
    } catch (error) {
      const message = error?.message?.toLowerCase() || '';

      if (message.includes('ban') || message.includes('askıya') || message.includes('banned')) {
        setBanned(true);
        setError('Hesabınız geçici olarak askıya alınmıştır. Lütfen 7 gün sonra tekrar deneyin veya destek ekibimizle iletişime geçin.');
      } else if (message.includes('wrong password') || message.includes('şifre')) {
        setError('E-posta veya şifre hatalı.');
      } else {
        setError('Giriş başarısız: ' + error.message);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#F9F6F2' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Image source={require('../assets/logo.png')} style={styles.logo} />
          <Text style={styles.title}>Giriş Yap</Text>

          {error !== '' && (
            <View style={[
              styles.errorBox,
              banned ? styles.banBox : null
            ]}>
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

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Hesabın yok mu?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}> Kayıt ol</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F9F6F2',
  },
  logo: {
    width: 240,
    height: 120,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#7B1421',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  errorBox: {
    width: '100%',
    backgroundColor: '#fff3cd',
    borderColor: '#b5a16b',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  banBox: {
    backgroundColor: '#f8d7da',
    borderColor: '#7B1421',
  },
  errorText: {
    color: '#7B1421',
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '600',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#b5a16b',
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 15,
    backgroundColor: '#fff',
    color: '#7B1421',
    fontSize: 16,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#B5A16B',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#b5a16b',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#B5A16B',
    borderRadius: 10,
    justifyContent: 'center',
    marginBottom: 20,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  googleButtonText: {
    color: '#7B1421',
    fontWeight: 'bold',
    fontSize: 16,
  },
  registerContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  registerText: {
    color: '#2C2C2C',
    fontSize: 14,
  },
  registerLink: {
    color: '#B5A16B',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
