// screens/LoginScreen.js
import React, { useState, useContext, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Platform, Animated } from 'react-native';
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

  const enter = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(enter, { toValue: 1, duration: 550, useNativeDriver: true }).start();
  }, [enter]);

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

  const translateY = enter.interpolate({ inputRange: [0, 1], outputRange: [18, 0] });

  return (
    <Screen scroll edges={['left', 'right']} contentContainerStyle={styles.scroll}>
      {/* ── Hero bandı ── */}
      <LinearGradient
        colors={gradients.heroDark}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.hero}
      >
        <LinearGradient colors={gradients.sheen} style={styles.heroSheen} pointerEvents="none" />
        <View style={styles.plaque}>
          <LinearGradient
            colors={gradients.creamSurface}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.plaqueFill}
          >
            <Image source={require('../assets/logo.png')} style={styles.logo} />
          </LinearGradient>
        </View>
        <Text style={styles.kicker}>· EL YAPIMI TESPİH MEZATI ·</Text>
      </LinearGradient>

      {/* ── Form ── */}
      <Animated.View style={[styles.body, { opacity: enter, transform: [{ translateY }] }]}>
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
          <GradientButton title="Giriş Yap" icon="log-in-outline" onPress={handleLogin} style={styles.fullBtn} />
        </View>

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>veya</Text>
          <View style={styles.line} />
        </View>

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

        <PressableScale style={styles.guest} onPress={signInGuest}>
          <Ionicons name="arrow-forward-circle-outline" size={18} color={colors.brown} />
          <Text style={styles.guestText}>Üye olmadan devam et</Text>
        </PressableScale>
      </Animated.View>
    </Screen>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingBottom: spacing.xxxl },

  hero: {
    paddingTop: spacing.huge,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
    borderBottomLeftRadius: radii.xxl + 6,
    borderBottomRightRadius: radii.xxl + 6,
    overflow: 'hidden',
  },
  heroSheen: { position: 'absolute', top: 0, left: 0, right: 0, height: '50%' },
  plaque: {
    borderRadius: radii.xl,
    padding: 2,
    backgroundColor: 'rgba(201,162,75,0.55)',
    ...shadows.raised,
  },
  plaqueFill: {
    width: 172,
    height: 112,
    borderRadius: radii.xl - 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { width: 140, height: 78, resizeMode: 'contain' },
  kicker: {
    ...typography.label,
    color: colors.goldLight,
    marginTop: spacing.lg,
    letterSpacing: 1.6,
  },

  body: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  title: { ...typography.hero, textAlign: 'center' },
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
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.xl },
  line: { flex: 1, height: 1, backgroundColor: colors.lineStrong },
  dividerText: { ...typography.label, color: colors.muted, marginHorizontal: spacing.md },
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
  guestText: { ...typography.bodyStrong, color: colors.brown, textDecorationLine: 'underline' },
});
