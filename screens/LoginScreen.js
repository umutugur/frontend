// screens/LoginScreen.js
import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { Screen, Input, GradientButton, PressableScale } from '../components/ui';
import { colors, gradients, spacing, radii, typography, shadows } from '../theme/tokens';
import * as AppleAuthentication from 'expo-apple-authentication';

const LoginScreen = ({ navigation }) => {
  const {
    user,
    login,
    promptGoogle,
    loginWithApple,
    signInGuest, // 👈 misafir girişi
  } = useContext(AuthContext);
  const { showAlert } = useAlert();

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
    <Screen scroll contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
        <LinearGradient
          colors={gradients.goldToBrown}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logoBadge}
        >
          <Image source={require('../assets/logo.png')} style={styles.logo} />
        </LinearGradient>

        <Text style={styles.title}>Giriş Yap</Text>
        <Text style={styles.subtitle}>Hesabınıza erişmek için giriş yapın</Text>

        {!!error && (
          <View style={[styles.errorBox, banned ? styles.banBox : null]}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Input
          placeholder="Şifre"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <GradientButton
          title="Giriş Yap"
          icon="log-in-outline"
          onPress={handleLogin}
          style={styles.primaryButton}
        />

        <PressableScale style={styles.socialButton} onPress={() => promptGoogle()}>
          <Image source={require('../assets/google-icon.png')} style={styles.googleIcon} />
          <Text style={styles.socialButtonText}>Google ile Giriş Yap</Text>
        </PressableScale>

        {Platform.OS === 'ios' && isAppleAvailable && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={radii.md}
            style={styles.appleButton}
            onPress={async () => {
              try {
                await loginWithApple();
              } catch (err) {
                if (err.code !== 'ERR_CANCELED') {
                  showAlert({
                    title: 'Apple Girişi Hatası',
                    message: err.message || 'Bir hata oluştu.',
                  });
                }
              }
            }}
          />
        )}

        <PressableScale style={styles.guestButton} onPress={signInGuest}>
          <Ionicons name="person-outline" size={18} color={colors.brown} style={styles.guestIcon} />
          <Text style={styles.guestButtonText}>Üye Olmadan Devam Et</Text>
        </PressableScale>
      </View>
    </Screen>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  scrollContent: {
    justifyContent: 'center',
    padding: spacing.xl,
  },
  container: {
    alignItems: 'center',
  },
  logoBadge: {
    width: 200,
    height: 120,
    borderRadius: radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    ...shadows.raised,
  },
  logo: { width: 170, height: 90, resizeMode: 'contain' },
  title: {
    ...typography.h1,
    color: colors.brownDark,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.muted,
    marginBottom: spacing.xl,
  },
  errorBox: {
    width: '100%',
    backgroundColor: '#fff3cd',
    borderColor: colors.muted,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  banBox: { backgroundColor: '#f8d7da', borderColor: colors.danger },
  errorText: {
    color: colors.danger,
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '600',
  },
  primaryButton: {
    width: '100%',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 50,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radii.md,
    marginBottom: spacing.md,
    ...shadows.soft,
  },
  googleIcon: { width: 22, height: 22, marginRight: spacing.sm },
  socialButtonText: {
    ...typography.h3,
    color: colors.brownDark,
  },
  appleButton: { width: '100%', height: 50, marginBottom: spacing.md },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 50,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.brown,
    borderRadius: radii.md,
    marginTop: spacing.sm,
  },
  guestIcon: { marginRight: spacing.sm },
  guestButtonText: {
    color: colors.brown,
    fontWeight: '700',
    fontSize: 15,
  },
});
