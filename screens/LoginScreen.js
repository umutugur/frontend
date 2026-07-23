// screens/LoginScreen.js
import React, { useState, useContext, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Image, Platform, Animated, TextInput, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { Screen, GradientButton, PressableScale } from '../components/ui';
import { colors, gradients, spacing, radii, typography, shadows } from '../theme/tokens';
import * as AppleAuthentication from 'expo-apple-authentication';

// Alt-çizgili input (Heritage yön için)
function UnderlineField({ icon, right, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.field, focused && styles.fieldFocused]}>
      <Ionicons name={icon} size={19} color={focused ? colors.gold : colors.muted} />
      <TextInput
        placeholderTextColor={colors.muted}
        style={styles.input}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      {right}
    </View>
  );
}

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
    Animated.timing(enter, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, [enter]);

  // Hero koyu → açık status bar; ayrılırken geri al.
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('light-content');
      return () => StatusBar.setBarStyle('dark-content');
    }, [])
  );

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
    <Screen scroll glow={false} edges={['left', 'right']} contentContainerStyle={styles.scroll}>
      {/* ── Hero (mihrap) ── */}
      <LinearGradient
        colors={['#4a2f22', '#2c1810']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.hero}
      >
        {/* 8 köşeli yıldız (khatim) motifi */}
        <View style={styles.starWrap} pointerEvents="none">
          <View style={styles.star} />
          <View style={[styles.star, styles.starRot]} />
        </View>

        {/* mihrap nişi + logo */}
        <View style={styles.niche}>
          <LinearGradient colors={gradients.creamSurface} style={styles.nicheFill}>
            <Image source={require('../assets/logo.png')} style={styles.logo} />
          </LinearGradient>
        </View>

        {/* süsleme ayıracı */}
        <View style={styles.heroOrn}>
          <View style={styles.heroLine} />
          <View style={styles.heroDiamond} />
          <View style={styles.heroLine} />
        </View>
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
              style={{ marginRight: spacing.sm }}
            />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <UnderlineField
          icon="mail-outline"
          value={email}
          onChangeText={setEmail}
          placeholder="E-posta"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <UnderlineField
          icon="lock-closed-outline"
          value={password}
          onChangeText={setPassword}
          placeholder="Şifre"
          secureTextEntry={!showPassword}
          right={
            <PressableScale onPress={() => setShowPassword((s) => !s)}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.muted} />
            </PressableScale>
          }
        />

        <GradientButton
          title="Giriş Yap"
          icon="log-in-outline"
          variant="gold"
          onPress={handleLogin}
          style={styles.fullBtn}
        />

        <View style={styles.orn}>
          <View style={styles.ornLine} />
          <View style={styles.ornDiamond} />
          <View style={styles.ornLine} />
        </View>

        <PressableScale style={styles.social} onPress={() => promptGoogle()}>
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

const NICHE_W = 208;
const NICHE_H = 194;

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingBottom: spacing.xxxl },

  hero: {
    paddingTop: 78,
    paddingBottom: spacing.xl,
    alignItems: 'center',
    borderBottomLeftRadius: radii.xxl + 8,
    borderBottomRightRadius: radii.xxl + 8,
    overflow: 'hidden',
  },
  starWrap: {
    position: 'absolute',
    top: 78,
    left: 0,
    right: 0,
    height: NICHE_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  star: {
    position: 'absolute',
    width: 288,
    height: 288,
    borderWidth: 1.5,
    borderColor: 'rgba(216,178,90,0.16)',
    borderRadius: 8,
  },
  starRot: { transform: [{ rotate: '45deg' }] },

  niche: {
    width: NICHE_W,
    height: NICHE_H,
    borderTopLeftRadius: NICHE_W / 2,
    borderTopRightRadius: NICHE_W / 2,
    borderBottomLeftRadius: radii.md,
    borderBottomRightRadius: radii.md,
    padding: 2,
    backgroundColor: 'rgba(216,178,90,0.6)',
    ...shadows.raised,
  },
  nicheFill: {
    flex: 1,
    borderTopLeftRadius: NICHE_W / 2 - 2,
    borderTopRightRadius: NICHE_W / 2 - 2,
    borderBottomLeftRadius: radii.md - 2,
    borderBottomRightRadius: radii.md - 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logo: { width: 300, height: 220, resizeMode: 'contain', marginTop: 22 },

  heroOrn: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.lg, opacity: 0.9 },
  heroLine: { width: 34, height: 1, backgroundColor: 'rgba(216,178,90,0.5)' },
  heroDiamond: {
    width: 7,
    height: 7,
    backgroundColor: colors.goldLight,
    transform: [{ rotate: '45deg' }],
    marginHorizontal: spacing.sm,
  },

  body: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  title: { ...typography.hero, textAlign: 'center' },
  subtitle: {
    ...typography.body,
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xxl,
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
  errorText: { ...typography.bodyStrong, color: colors.danger, flex: 1 },

  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderBottomWidth: 1.6,
    borderBottomColor: colors.line,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  fieldFocused: { borderBottomColor: colors.gold },
  input: { flex: 1, ...typography.body, color: colors.brownDark, paddingVertical: 2 },

  fullBtn: { width: '100%', marginTop: spacing.sm },

  orn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: spacing.xl },
  ornLine: { width: 48, height: 1, backgroundColor: colors.lineStrong },
  ornDiamond: {
    width: 7,
    height: 7,
    backgroundColor: colors.gold,
    transform: [{ rotate: '45deg' }],
    marginHorizontal: spacing.md,
  },

  social: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    width: '100%',
    minHeight: 54,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radii.pill,
    marginBottom: spacing.md,
    ...shadows.soft,
  },
  googleIcon: { width: 20, height: 20 },
  socialText: { ...typography.button, color: colors.brownDark },
  appleButton: { width: '100%', height: 54, marginBottom: spacing.md },

  guest: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    alignSelf: 'center',
    paddingVertical: spacing.md,
  },
  guestText: { ...typography.bodyStrong, color: colors.brown, textDecorationLine: 'underline' },
});
