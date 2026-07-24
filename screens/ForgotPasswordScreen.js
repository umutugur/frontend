// screens/ForgotPasswordScreen.js
// Şifremi Unuttum — iki adımlı akış (aynı ekran içinde):
//   1) E-posta gir → POST /api/auth/forgot-password
//   2) 6 haneli kod + yeni şifre gir → POST /api/auth/reset-password
// Tasarım dili LoginScreen.js ile birebir eşleşecek şekilde heritage bileşenleri kullanır.
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAlert } from '../context/AlertContext';
import { Screen, ScreenHeader, Input, GradientButton, PressableScale } from '../components/ui';
import { colors, spacing, radii, typography } from '../theme/tokens';

const API_BASE = 'https://imame-backend.onrender.com';

export default function ForgotPasswordScreen({ navigation }) {
  const { showAlert } = useAlert();

  const [step, setStep] = useState(1); // 1: e-posta, 2: kod + yeni şifre

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());

  const requestCode = useCallback(async () => {
    setError('');

    if (!email.trim() || !isValidEmail(email)) {
      setError('Lütfen geçerli bir e-posta adresi girin.');
      return false;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/auth/forgot-password`, {
        email: email.trim().toLowerCase(),
      });
      return true;
    } catch (err) {
      setError(err?.response?.data?.message || 'Kod gönderilemedi. Lütfen tekrar deneyin.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [email]);

  const handleSendCode = async () => {
    const ok = await requestCode();
    if (ok) setStep(2);
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    const ok = await requestCode();
    setResendLoading(false);
    if (ok) {
      showAlert({ title: 'Kod Gönderildi', message: 'Bu e-posta kayıtlıysa yeni bir kod gönderildi.' });
    }
  };

  const handleResetPassword = async () => {
    setError('');

    if (!code.trim()) {
      setError('Lütfen e-postanıza gelen kodu girin.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('Yeni şifre en az 6 karakter olmalıdır.');
      return;
    }
    if (newPassword !== repeatPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE}/api/auth/reset-password`, {
        email: email.trim().toLowerCase(),
        code: code.trim(),
        newPassword,
      });

      showAlert({
        title: 'Şifre Güncellendi',
        message: 'Şifreniz başarıyla güncellendi. Yeni şifrenizle giriş yapabilirsiniz.',
        buttons: [
          {
            text: 'Giriş Yap',
            onPress: () => navigation.navigate('Login'),
          },
        ],
      });
    } catch (err) {
      setError(err?.response?.data?.message || 'Kod geçersiz veya süresi dolmuş.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setError('');
      setStep(1);
      return;
    }
    navigation.goBack();
  };

  return (
    <Screen scroll edges={['top', 'left', 'right']}>
      <ScreenHeader
        variant="plain"
        title="Şifremi Unuttum"
        subtitle={step === 1 ? 'E-postanızı girin' : 'Kodu ve yeni şifrenizi girin'}
        onBack={handleBack}
      />

      <View style={styles.body}>
        <Text style={styles.intro}>
          {step === 1
            ? 'Hesabınıza kayıtlı e-posta adresinizi girin, size 6 haneli bir sıfırlama kodu gönderelim.'
            : `${email.trim()} adresine bir kod gönderdik. Kodu ve yeni şifrenizi aşağıya girin.`}
        </Text>

        {!!error && (
          <View style={styles.errorBox}>
            <Ionicons
              name="information-circle"
              size={18}
              color={colors.danger}
              style={{ marginRight: spacing.sm }}
            />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {step === 1 ? (
          <>
            <Input
              variant="underline"
              leftIcon="mail-outline"
              value={email}
              onChangeText={setEmail}
              placeholder="E-posta"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />

            <GradientButton
              title="Kod Gönder"
              icon="paper-plane-outline"
              variant="gold"
              loading={loading}
              onPress={handleSendCode}
              style={styles.fullBtn}
            />
          </>
        ) : (
          <>
            <Input
              variant="underline"
              leftIcon="keypad-outline"
              value={code}
              onChangeText={setCode}
              placeholder="6 haneli kod"
              keyboardType="number-pad"
              maxLength={6}
              editable={!loading}
            />
            <Input
              variant="underline"
              leftIcon="lock-closed-outline"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Yeni şifre"
              secureTextEntry={!showPassword}
              editable={!loading}
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
            <Input
              variant="underline"
              leftIcon="lock-closed-outline"
              value={repeatPassword}
              onChangeText={setRepeatPassword}
              placeholder="Yeni şifre (tekrar)"
              secureTextEntry={!showPassword}
              editable={!loading}
            />

            <GradientButton
              title="Şifreyi Sıfırla"
              icon="checkmark-circle-outline"
              variant="gold"
              loading={loading}
              onPress={handleResetPassword}
              style={styles.fullBtn}
            />

            <PressableScale style={styles.resend} onPress={handleResendCode} disabled={resendLoading}>
              <Ionicons name="refresh-outline" size={16} color={colors.brown} />
              <Text style={styles.resendText}>
                {resendLoading ? 'Gönderiliyor…' : 'Kodu tekrar gönder'}
              </Text>
            </PressableScale>
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xxxl },

  intro: {
    ...typography.body,
    color: colors.brown,
    marginBottom: spacing.xl,
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerBg,
    borderColor: 'rgba(192,57,43,0.35)',
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorText: { ...typography.bodyStrong, color: colors.danger, flex: 1 },

  fullBtn: { width: '100%', marginTop: spacing.sm },

  resend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    alignSelf: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  resendText: { ...typography.bodyStrong, color: colors.brown, textDecorationLine: 'underline' },
});
