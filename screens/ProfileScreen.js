// screens/ProfileScreen.js
import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import RateSellerModal from '../components/RateSellerModal';
import ReportSellerModal from '../components/ReportSellerModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as AppleAuthentication from 'expo-apple-authentication';

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
    variant === 'solid' ? '#fff' : variant === 'danger' ? '#c62828' : '#6d4c41';
  const textColor =
    variant === 'solid' ? '#fff' : variant === 'danger' ? '#c62828' : '#4e342e';

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} style={base}>
      <View style={styles.rowLeft}>
        {!!icon && <Ionicons name={icon} size={20} color={iconColor} style={{ marginRight: 10 }} />}
        <View>
          <Text style={[styles.rowTitle, { color: textColor }]}>{title}</Text>
          {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      {rightChevron && (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={variant === 'solid' ? '#fff' : '#8d6e63'}
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
        Alert.alert('Hata', 'Kullanıcı profili alınamadı.');
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
      Alert.alert('Hata', 'Favori işlemi başarısız.');
    } finally {
      setFavBusy(false);
    }
  };

  const confirmDelete = () =>
    Alert.alert(
      'Hesabı Sil',
      'Hesabınızı ve verilerinizi kalıcı olarak sileceğiz. Bu işlem geri alınamaz.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        { text: 'Evet, Sil', style: 'destructive', onPress: async () => { await deleteMyAccount().catch(() => {}); } },
      ]
    );

  const headerTitle = useMemo(
    () => (isOwnProfile ? 'Profilim' : profile?.companyName || 'Profil'),
    [isOwnProfile, profile?.companyName]
  );

  if (loading || !profile) {
    return (
      <View style={[styles.full, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#6d4c41" />
        <Text style={{ marginTop: 8, color: '#6d4c41' }}>Profil yükleniyor…</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        {/* Başlık */}
        <Text style={styles.title}>{headerTitle}</Text>
        {!isLoggedIn && isOwnProfile && (
          <Text style={styles.subtitle}>
            Misafir olarak geziniyorsunuz. Teklif vermek, favori eklemek gibi özellikler için giriş yapın.
          </Text>
        )}

        {/* Profil bilgileri */}
        <View style={styles.card}>
          <InfoLine label="Ad Soyad" value={profile?.name} />
          <InfoLine label="E-posta" value={profile?.email} />
          <InfoLine label="Telefon" value={profile?.phone} />
        </View>

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
              <Text style={styles.ratingText}>
                {avgRating === null ? 'Puanlanmamış' : `Puan: ${avgRating.toFixed(1)} / 5`}
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
            <RowButton title="Google ile Giriş Yap" icon="logo-google" variant="outline" onPress={() => promptGoogle && promptGoogle()} />
            {appleAvail && (
              <RowButton title="Apple ile Giriş Yap" icon="logo-apple" variant="outline" onPress={() => loginWithApple && loginWithApple()} />
            )}
          </>
        )}

        {/* Hesap */}
        {isOwnProfile && isLoggedIn && (
          <>
            <SectionTitle>Hesap</SectionTitle>
            <RowButton title="Çıkış Yap" icon="exit-outline" variant="outline" onPress={logout} />
            <View style={styles.dangerCard}>
              <Text style={styles.dangerTitle}>Hesabımı Sil</Text>
              <Text style={styles.dangerDesc}>
                Bu işlem geri alınamaz ve tüm verileriniz kalıcı olarak silinir.
              </Text>
              <RowButton title="Hesabımı Sil" icon="trash-outline" variant="danger" onPress={confirmDelete} rightChevron={false} />
            </View>
          </>
        )}
      </View>

      {/* Modallar */}
      <RateSellerModal visible={showRate} onClose={() => setShowRate(false)} sellerId={profile?._id} buyerId={me?._id} />
      <ReportSellerModal visible={showReport} onClose={() => setShowReport(false)} sellerId={profile?._id} reporterId={me?._id} />
    </ScrollView>
  );
}

/* ---------- Stiller ---------- */
const styles = StyleSheet.create({
  full: { flex: 1, backgroundColor: '#fff8e1' },
  scroll: {
    flexGrow: 1,
    backgroundColor: '#fff8e1',
    paddingVertical: 16,
  },
  container: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4e342e',
    marginBottom: 8,
  },
  subtitle: {
    color: '#8d6e63',
    marginBottom: 12,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  infoLine: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0e6d6',
    paddingBottom: 8,
  },
  infoLabel: { fontSize: 13, fontWeight: '600', color: '#6d4c41' },
  infoValue: { fontSize: 16, color: '#3e2723', marginTop: 2 },

  sectionTitle: {
    fontSize: 12,
    letterSpacing: 0.6,
    fontWeight: '700',
    color: '#8d6e63',
    marginTop: 8,
    marginBottom: 8,
    textTransform: 'uppercase',
  },

  row: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#6d4c41',
    paddingHorizontal: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
  rowOutline: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#b5a16b',
  },
  rowDanger: {
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#ef9a9a',
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  rowTitle: { fontSize: 16, fontWeight: '600' },
  rowSubtitle: { fontSize: 12, color: '#8d6e63', marginTop: 2 },

  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#f5eee6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 10,
  },
  ratingText: { color: '#6d4c41', fontWeight: '700' },
  ratingCount: { marginLeft: 6, color: '#8d6e63', fontWeight: '600' },

  dangerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#fde0e0',
  },
  dangerTitle: { color: '#c62828', fontWeight: '700', marginBottom: 6 },
  dangerDesc: { color: '#8d6e63', fontSize: 12, marginBottom: 10 },
});