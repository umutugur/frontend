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
  const { user, login, promptGoogle, loginWithApple, signInGuest } = useContext(AuthContext);
  const { showAlert } = useAlert();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [banned, setBanned] = useState(false);
  const [isAppleAvailable, setIsAppleAvailable] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      AppleAuthentication.isAvailableAsync().then(setIsAppleAvailable);
    }
  }, []);

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
    <Screen scroll contentContainerStyle={styles.scroll}>
      {/* Marka */}
      <View style={styles.brand}>
        <View style={styles.glow} pointerEvents="none" />
        <LinearGradient
          colors={gradients.creamSurface}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.medallion}
        >
          <Image source={require('../assets/logo.png')} style={styles.logo} />
        </LinearGradient>
        <Text style={styles.kicker}>TESPİH MEZATI</Text>
      </View>

      <Text style={styles.title}>Giriş Yap</Text>
      <Text style={styles.subtitle}>Hesabınıza erişmek için giriş yapın</Text>

      {!!error && (
        <View style={[styles.errorBox, banned && styles.banBox]}>
          <Ionicons
            name={banned ? 'alert-circle' : 'information-circle'}
            size={18}
            color={colors.danger}
            style={styles.errorIcon}
          />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Form */}
      <View style={styles.card}>
        <Input
          placeholder="E-posta"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          leftIcon="mail-outline"
        />
        <Input
          placeholder="Şifre"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          leftIcon="lock-closed-outline"
          rightElement={
            <PressableScale onPress={() => setShowPassword((s) => !s)}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={colors.muted}
              />
            </PressableScale>
          }
        />
        <GradientButton
          title="Giriş Yap"
          icon="log-in-outline"
          onPress={handleLogin}
          style={styles.fullBtn}
        />
      </View>

      {/* Ayıraç */}
      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>veya</Text>
        <View style={styles.line} />
      </View>

      {/* Sosyal */}
      <PressableScale style={styles.socialButton} onPress={() => promptGoogle()}>
        <Image source={require('../assets/google-icon.png')} style={styles.googleIcon} />
        <Text style={styles.socialText}>Google ile Giriş Yap</Text>
      </PressableScale>

      {Platform.OS === 'ios' && isAppleAvailable && (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={radii.pill}
          style={styles.appleButton}
          onPress={async () => {
            try {
              await loginWithApple();
            } catch (err) {
              if (err.code !== 'ERR_CANCELED') {
                showAlert({ title: 'Apple Girişi Hatası', message: err.message || 'Bir hata oluştu.' });
              }
            }
          }}
        />
      )}

      {/* Misafir */}
      <PressableScale style={styles.guest} onPress={signInGuest}>
        <Ionicons name="arrow-forward-circle-outline" size={18} color={colors.brown} />
        <Text style={styles.guestText}>Üye olmadan devam et</Text>
      </PressableScale>
    </Screen>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  scroll: {
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
  },
  brand: { alignItems: 'center', marginBottom: spacing.xl },
  glow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    top: -30,
    backgroundColor: 'rgba(201,162,75,0.18)',
  },
  medallion: {
    width: 168,
    height: 112,
    borderRadius: radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(161,116,59,0.35)',
    ...shadows.raised,
  },
  logo: { width: 140, height: 78, resizeMode: 'contain' },
  kicker: {
    ...typography.label,
    color: colors.gold,
    marginTop: spacing.md,
  },
  title: {
    ...typography.hero,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fbefd0',
    borderColor: 'rgba(138,90,18,0.3)',
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  banBox: { backgroundColor: colors.dangerBg, borderColor: 'rgba(192,57,43,0.35)' },
  errorIcon: { marginRight: spacing.sm },
  errorText: { ...typography.bodyStrong, color: colors.danger, flex: 1 },
  card: {
    backgroundColor: colors.creamHi,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.lg,
    ...shadows.card,
  },
  fullBtn: { width: '100%', marginTop: spacing.xs },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  line: { flex: 1, height: 1, backgroundColor: colors.lineStrong },
  dividerText: {
    ...typography.label,
    color: colors.muted,
    marginHorizontal: spacing.md,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 54,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radii.pill,
    marginBottom: spacing.md,
    ...shadows.soft,
  },
  googleIcon: { width: 20, height: 20, marginRight: spacing.sm },
  socialText: { ...typography.button, color: colors.brownDark },
  appleButton: { width: '100%', height: 54, marginBottom: spacing.md },
  guest: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  guestText: {
    ...typography.bodyStrong,
    color: colors.brown,
    textDecorationLine: 'underline',
  },
});
