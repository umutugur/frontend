// screens/ProfileScreen.js
import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import axios from 'axios';
import RateSellerModal from '../components/RateSellerModal';
import ReportSellerModal from '../components/ReportSellerModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as AppleAuthentication from 'expo-apple-authentication';

import { Screen, Card, GradientButton } from '../components/ui';
import { colors, gradients, radii, shadows, spacing, typography } from '../theme/tokens';

const API = 'https://imame-backend.onrender.com';

/* ---------- Yardımcı Bileşenler (function deklarasyonu → hoisted) ---------- */
function SectionTitle({ children }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

function RowButton({
  title,
  subtitle,
  icon,
  onPress,
  variant = 'solid', // 'solid' | 'outline' | 'danger'
  disabled = false,
  rightChevron = true,
}) {
  const base = [styles.row, disabled && { opacity: 0.6 }];
  if (variant === 'outline') base.push(styles.rowOutline);
  if (variant === 'danger') base.push(styles.rowDanger);

  const iconColor =
    variant === 'solid' ? colors.brown : variant === 'danger' ? colors.danger : colors.brown;
  const textColor =
    variant === 'solid' ? colors.brownDark : variant === 'danger' ? colors.danger : colors.brownDark;

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} style={base} activeOpacity={0.85}>
      <View style={styles.rowLeft}>
        {!!icon && (
          <View style={[styles.rowIconWrap, variant === 'danger' && styles.rowIconWrapDanger]}>
            <Ionicons name={icon} size={18} color={iconColor} />
          </View>
        )}
        <View>
          <Text style={[styles.rowTitle, { color: textColor }]}>{title}</Text>
          {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      {rightChevron && (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={variant === 'danger' ? colors.danger : colors.muted}
        />
      )}
    </TouchableOpacity>
  );
}

function InfoLine({ label, value }) {
  return (
    <View style={styles.infoLine}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '-'}</Text>
    </View>
  );
}
/* --------------------------------------------------------------------------- */

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { showAlert } = useAlert();

  // Kök stack'teki LoginModal'ı aç
  const openLogin = () => {
    const root = navigation.getParent?.('RootStack') || navigation;
    root.navigate('LoginModal');
  };

  const route = useRoute();
  const {
    user: me,
    setUser,
    logout,
    deleteMyAccount,
    promptGoogle,
    loginWithApple,
  } = useContext(AuthContext);

  const viewedUserId = route.params?.userId ?? null;
  const isOwnProfile = !viewedUserId || viewedUserId === me?._id;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // seller view extras
  const [avgRating, setAvgRating] = useState(null);
  const [totalRatings, setTotalRatings] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favBusy, setFavBusy] = useState(false);
  const [wonFromThisSeller, setWonFromThisSeller] = useState(false);

  const [showRate, setShowRate] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const isLoggedIn = !!me?._id;

  // Apple button availability
  const [appleAvail, setAppleAvail] = useState(false);
  useEffect(() => {
    if (Platform.OS === 'ios') {
      AppleAuthentication.isAvailableAsync()
        .then(setAppleAvail)
        .catch(() => setAppleAvail(false));
    }
  }, []);

  // profile yükle
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        if (isOwnProfile) {
          if (mounted) setProfile(me || null);
        } else {
          const res = await axios.get(`${API}/api/users/${viewedUserId}`);
          if (mounted) setProfile(res.data);
        }
      } catch {
        showAlert({ title: 'Hata', message: 'Kullanıcı profili alınamadı.' });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isOwnProfile, viewedUserId, me]);

  // seller extras
  useEffect(() => {
    if (isOwnProfile || !profile?._id) return;
    (async () => {
      try {
        if (me?._id) {
          setIsFavorite(me?.favorites?.includes(profile._id));
          const won = await axios.get(`${API}/api/auctions/won-by/${me._id}/${profile._id}`);
          setWonFromThisSeller(!!won.data?.hasWon);
        }
        if (profile?.role === 'seller') {
          const r = await axios.get(`${API}/api/ratings/seller/${profile._id}`);
          setAvgRating(r.data?.avg ?? 0);
          setTotalRatings(r.data?.total ?? 0);
        }
      } catch {
        // ignore
      }
    })();
  }, [profile, isOwnProfile, me?._id]);

  const toggleFavorite = async () => {
    if (!me?._id || !profile?._id) return;
    setFavBusy(true);
    try {
      const res = await axios.post(`${API}/api/users/toggle-favorite`, {
        userId: me._id,
        sellerId: profile._id,
      });
      const status = res.data?.status;
      const updated =
        status === 'added'
          ? [...(me.favorites || []), profile._id]
          : (me.favorites || []).filter((id) => id !== profile._id);
      const newMe = { ...me, favorites: updated };
      setUser(newMe);
      await AsyncStorage.setItem('user', JSON.stringify(newMe));
      setIsFavorite(status === 'added');
    } catch {
      showAlert({ title: 'Hata', message: 'Favori işlemi başarısız.' });
    } finally {
      setFavBusy(false);
    }
  };

  const confirmDelete = () =>
    showAlert({
      title: 'Hesabı Sil',
      message: 'Hesabınızı ve verilerinizi kalıcı olarak sileceğiz. Bu işlem geri alınamaz.',
      buttons: [
        { text: 'Vazgeç', style: 'cancel' },
        { text: 'Evet, Sil', style: 'destructive', onPress: async () => { await deleteMyAccount().catch(() => {}); } },
      ],
    });

  const headerTitle = useMemo(
    () => (isOwnProfile ? 'Profilim' : profile?.companyName || 'Profil'),
    [isOwnProfile, profile?.companyName]
  );

  if (loading || !profile) {
    return (
      <Screen>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.brown} />
          <Text style={styles.loadingText}>Profil yükleniyor…</Text>
        </View>
      </Screen>
    );
  }

  const roleLabel =
    profile?.role === 'seller'
      ? 'Satıcı'
      : profile?.role === 'admin'
      ? 'Yönetici'
      : profile?.role === 'buyer'
      ? 'Alıcı'
      : 'Misafir';
  const avatarLetter =
    (profile?.companyName || profile?.name || 'İ')?.[0]?.toUpperCase() || 'İ';

  return (
    <Screen scroll contentContainerStyle={styles.scroll}>
      {/* Gradient profil başlığı */}
      <LinearGradient
        colors={gradients.goldToBrown}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{avatarLetter}</Text>
        </View>
        <Text style={styles.headerTitle}>{headerTitle}</Text>
        {isLoggedIn ? (
          <View style={styles.rolePill}>
            <Text style={styles.rolePillText}>{roleLabel}</Text>
          </View>
        ) : null}
      </LinearGradient>

      <View style={styles.container}>
        {!isLoggedIn && isOwnProfile && (
          <Text style={styles.subtitle}>
            Misafir olarak geziniyorsunuz. Teklif vermek, favori eklemek gibi özellikler için giriş yapın.
          </Text>
        )}

        {/* Profil bilgileri */}
        <Card style={styles.infoCard}>
          <InfoLine label="Ad Soyad" value={profile?.name} />
          <InfoLine label="E-posta" value={profile?.email} />
          <InfoLine label="Telefon" value={profile?.phone} />
        </Card>

        {/* Alıcı */}
        {isOwnProfile && isLoggedIn && profile?.role === 'buyer' && (
          <>
            <SectionTitle>Hesabım</SectionTitle>
            <RowButton title="Tekliflerim" icon="pricetag-outline" onPress={() => navigation.navigate('MyBids')} />
            <RowButton title="Biten Mezatlar" icon="checkmark-done-outline" onPress={() => navigation.navigate('CompletedAuctions')} />
            <RowButton title="Profili Düzenle" icon="create-outline" variant="outline" onPress={() => navigation.navigate('EditProfile')} />
          </>
        )}

        {/* Satıcı */}
        {isOwnProfile && isLoggedIn && profile?.role === 'seller' && (
          <>
            <SectionTitle>Satıcı Araçları</SectionTitle>
            <RowButton title="Mezat Ekle" icon="add-circle-outline" onPress={() => navigation.navigate('AddAuction')} />
            <RowButton title="Dekont Onayla" icon="receipt-outline" onPress={() => navigation.navigate('ReceiptApproval')} />
            <RowButton title="Mezatlarım" icon="cube-outline" onPress={() => navigation.navigate('MyAuctions')} />
          </>
        )}

        {/* Admin */}
        {isOwnProfile && isLoggedIn && profile?.role === 'admin' && (
          <>
            <SectionTitle>Yönetim</SectionTitle>
            <RowButton title="Admin Panel" icon="lock-closed-outline" onPress={() => navigation.navigate('AdminPanel')} />
          </>
        )}

        {/* Başkası (satıcı) */}
        {!isOwnProfile && profile?.role === 'seller' && (
          <>
            <SectionTitle>Satıcı Bilgisi</SectionTitle>
            <View style={styles.ratingBox}>
              <Ionicons name="star" size={16} color={colors.brown} style={{ marginRight: 6 }} />
              <Text style={styles.ratingText}>
                {avgRating === null ? 'Puanlanmamış' : `${avgRating.toFixed(1)} / 5`}
              </Text>
              {totalRatings > 0 && <Text style={styles.ratingCount}>({totalRatings})</Text>}
            </View>

            {wonFromThisSeller && (
              <>
                <RowButton
                  title={isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                  icon={isFavorite ? 'star' : 'star-outline'}
                  variant={isFavorite ? 'outline' : 'solid'}
                  onPress={toggleFavorite}
                  disabled={favBusy}
                />
                <RowButton title="Satıcıyı Puanla" icon="thumbs-up-outline" variant="outline" onPress={() => setShowRate(true)} />
                <RowButton title="Satıcıyı Şikayet Et" icon="flag-outline" variant="outline" onPress={() => setShowReport(true)} />
              </>
            )}
          </>
        )}

        {/* Genel */}
        <SectionTitle>Genel</SectionTitle>
        <RowButton title="Kullanım Koşulları" icon="document-text-outline" variant="outline" onPress={() => navigation.navigate('Terms')} />
        <RowButton title="Gizlilik Politikası" icon="shield-checkmark-outline" variant="outline" onPress={() => navigation.navigate('PrivacyPolicy')} />
        <RowButton title="Yardım & Destek" icon="help-circle-outline" variant="outline" onPress={() => navigation.navigate('HelpAndSupport')} />

        {/* Giriş CTA (misafir) */}
        {isOwnProfile && !isLoggedIn && (
          <>
            <SectionTitle>Giriş</SectionTitle>
            <GradientButton title="Giriş / Kayıt Yap" icon="log-in-outline" onPress={logout} style={styles.ctaButton} />
            <GradientButton title="Google ile Giriş Yap" icon="logo-google" variant="secondary" onPress={() => promptGoogle && promptGoogle()} style={styles.ctaButton} />
            {appleAvail && (
              <GradientButton title="Apple ile Giriş Yap" icon="logo-apple" variant="secondary" onPress={() => loginWithApple && loginWithApple()} style={styles.ctaButton} />
            )}
          </>
        )}

        {/* Hesap */}
        {isOwnProfile && isLoggedIn && (
          <>
            <SectionTitle>Hesap</SectionTitle>
            <GradientButton title="Çıkış Yap" icon="exit-outline" variant="secondary" onPress={logout} style={styles.ctaButton} />
            <View style={styles.dangerCard}>
              <Text style={styles.dangerTitle}>Hesabımı Sil</Text>
              <Text style={styles.dangerDesc}>
                Bu işlem geri alınamaz ve tüm verileriniz kalıcı olarak silinir.
              </Text>
              <GradientButton title="Hesabımı Sil" icon="trash-outline" variant="danger" onPress={confirmDelete} style={styles.ctaButton} />
            </View>
          </>
        )}
      </View>

      {/* Modallar */}
      <RateSellerModal visible={showRate} onClose={() => setShowRate(false)} sellerId={profile?._id} buyerId={me?._id} />
      <ReportSellerModal visible={showReport} onClose={() => setShowReport(false)} sellerId={profile?._id} reporterId={me?._id} />
    </Screen>
  );
}

/* ---------- Stiller ---------- */
const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingBottom: spacing.xxxl,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    marginTop: spacing.sm,
    color: colors.brown,
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: radii.xl,
    borderBottomRightRadius: radii.xl,
    ...shadows.raised,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.white,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.white,
    textAlign: 'center',
  },
  rolePill: {
    marginTop: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
  },
  rolePillText: {
    ...typography.label,
    color: colors.cream,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  container: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  subtitle: {
    color: colors.muted,
    marginBottom: spacing.md,
    ...typography.body,
  },
  infoCard: {
    marginBottom: spacing.lg,
  },
  infoLine: {
    marginBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingBottom: spacing.sm,
  },
  infoLabel: { ...typography.label, fontWeight: '600', color: colors.brown },
  infoValue: { fontSize: 16, color: colors.brownDark, marginTop: 2 },

  sectionTitle: {
    ...typography.label,
    fontWeight: '700',
    color: colors.muted,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },

  row: {
    minHeight: 52,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.soft,
  },
  rowOutline: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  rowDanger: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(198,40,40,0.25)',
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  rowIconWrap: {
    width: 34,
    height: 34,
    borderRadius: radii.sm,
    backgroundColor: 'rgba(78,52,46,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  rowIconWrapDanger: {
    backgroundColor: 'rgba(198,40,40,0.10)',
  },
  rowTitle: { fontSize: 15, fontWeight: '600' },
  rowSubtitle: { ...typography.label, color: colors.muted, marginTop: 2 },

  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  ratingText: { color: colors.brown, fontWeight: '700' },
  ratingCount: { marginLeft: 6, color: colors.muted, fontWeight: '600' },

  ctaButton: {
    marginBottom: spacing.md,
  },
  dangerCard: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
    borderWidth: 1,
    borderColor: 'rgba(198,40,40,0.2)',
  },
  dangerTitle: { ...typography.h3, color: colors.danger, marginBottom: spacing.xs },
  dangerDesc: { color: colors.muted, ...typography.label, marginBottom: spacing.md },
});
