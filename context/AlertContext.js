// context/AlertContext.js
// Global tema modalı — tüm Alert.alert / Alert.prompt çağrılarının yerini alır.
// İmperatif API: useAlert() → { showAlert, confirm, notify }
// React dışı yerler (AuthContext gibi) modül singleton köprüsü (alertBridge) kullanır.
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
} from 'react-native';
import GradientButton from '../components/ui/GradientButton';
import { colors, radii, shadows, spacing, typography } from '../theme/tokens';

// ---- Modül singleton köprüsü (React dışı çağrılar için) ------------------
let _handler = null;
export const setAlertHandler = (fn) => {
  _handler = fn;
};
export const alertBridge = {
  showAlert: (...args) => (_handler ? _handler(...args) : undefined),
};

// ---- Context ------------------------------------------------------------
const AlertContext = createContext(null);

export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) {
    // Provider yoksa çökmemek için no-op'lar dön.
    return {
      showAlert: () => {},
      confirm: () => Promise.resolve(false),
      notify: () => {},
    };
  }
  return ctx;
}

export function AlertProvider({ children }) {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState({ title: '', message: '', buttons: [] });

  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  const runEntrance = useCallback(() => {
    opacity.setValue(0);
    scale.setValue(0.9);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 6,
      }),
    ]).start();
  }, [opacity, scale]);

  const close = useCallback(() => {
    setVisible(false);
  }, []);

  // showAlert({ title, message, buttons }) — imza Alert.alert ile birebir.
  // buttons yoksa tek "Tamam" butonu.
  const showAlert = useCallback(
    ({ title, message, buttons } = {}) => {
      const finalButtons =
        Array.isArray(buttons) && buttons.length > 0
          ? buttons
          : [{ text: 'Tamam', style: 'default' }];
      setConfig({ title: title || '', message: message || '', buttons: finalButtons });
      setVisible(true);
    },
    []
  );

  useEffect(() => {
    if (visible) runEntrance();
  }, [visible, runEntrance]);

  // Provider mount olunca köprüye handler'ı yaz; unmount'ta temizle.
  useEffect(() => {
    setAlertHandler(showAlert);
    return () => setAlertHandler(null);
  }, [showAlert]);

  // confirm({ title, message }) → Promise<boolean>
  const confirm = useCallback(
    ({ title, message, confirmText = 'Evet', cancelText = 'İptal' } = {}) =>
      new Promise((resolve) => {
        showAlert({
          title,
          message,
          buttons: [
            { text: cancelText, style: 'cancel', onPress: () => resolve(false) },
            { text: confirmText, style: 'default', onPress: () => resolve(true) },
          ],
        });
      }),
    [showAlert]
  );

  // notify(title, message) — tek butonlu bilgi modalı.
  const notify = useCallback(
    (title, message) => {
      showAlert({ title, message });
    },
    [showAlert]
  );

  const handlePress = useCallback(
    (btn) => {
      close();
      // onPress'i modalın kapanış animasyonundan hemen sonra çalıştır.
      if (btn && typeof btn.onPress === 'function') {
        btn.onPress();
      }
    },
    [close]
  );

  const variantForStyle = (style) => {
    if (style === 'destructive') return 'danger';
    if (style === 'cancel') return 'secondary';
    return 'primary';
  };

  return (
    <AlertContext.Provider value={{ showAlert, confirm, notify }}>
      {children}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={close}
        statusBarTranslucent
      >
        <Pressable style={styles.backdrop} onPress={close}>
          {/* İçeriğe basınca kapanmasın */}
          <Pressable onPress={() => {}} style={styles.centerWrap}>
            <Animated.View
              style={[styles.card, { opacity, transform: [{ scale }] }]}
            >
              {config.title ? (
                <Text style={styles.title}>{config.title}</Text>
              ) : null}
              {config.message ? (
                <Text style={styles.message}>{config.message}</Text>
              ) : null}

              <View style={styles.actions}>
                {config.buttons.map((btn, i) => (
                  <GradientButton
                    key={`${btn.text}-${i}`}
                    title={btn.text}
                    variant={variantForStyle(btn.style)}
                    onPress={() => handlePress(btn)}
                    style={styles.actionButton}
                  />
                ))}
              </View>
            </Animated.View>
          </Pressable>
        </Pressable>
      </Modal>
    </AlertContext.Provider>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(46,30,25,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  centerWrap: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'stretch',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: spacing.xl,
    ...shadows.raised,
  },
  title: {
    ...typography.h2,
    color: colors.brownDark,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    color: colors.brown,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  actions: {
    marginTop: spacing.sm,
  },
  actionButton: {
    marginTop: spacing.sm,
  },
});
