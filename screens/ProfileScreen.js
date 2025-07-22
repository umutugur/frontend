import React, { useContext, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import RateSellerModal from '../components/RateSellerModal';
import ReportSellerModal from '../components/ReportSellerModal';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user: currentUser, logout } = useContext(AuthContext);

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [avgRating, setAvgRating] = useState(null);
  const [totalRatings, setTotalRatings] = useState(0);
  const [hasWonAuction, setHasWonAuction] = useState(false);
  

  const userIdFromParams = route.params?.userId ?? null;
  const isOwnProfile = !userIdFromParams || userIdFromParams === currentUser?._id;

  // Profili çek
  useEffect(() => {
    if (isOwnProfile) {
      setProfileData(currentUser);
      setLoading(false);
    } else {
      fetchUserProfile(userIdFromParams);
    }
  }, [userIdFromParams, currentUser]);

  // Favori kontrolü
  useEffect(() => {
    if (!isOwnProfile && currentUser && profileData?._id) {
      setIsFavorite(currentUser.favorites?.includes(profileData._id));
    }
  }, [profileData, currentUser, isOwnProfile]);

  // Ortalama puan ve "kazandı mı" kontrolü
  useEffect(() => {
    if (!isOwnProfile && profileData?.role === 'seller' && currentUser?._id) {
      // Ortalama puan
      axios.get(`https://imame-backend.onrender.com/api/ratings/seller/${profileData._id}`)
        .then(res => {
          setAvgRating(res.data.avg);
          setTotalRatings(res.data.total);
        })
        .catch(() => {
          setAvgRating(null);
          setTotalRatings(0);
        });

      // Kazanan mı
      axios.get(`https://imame-backend.onrender.com/api/auctions/won-by/${currentUser._id}/${profileData._id}`)
        .then(res => setHasWonAuction(res.data.hasWon))
        .catch(() => setHasWonAuction(false));
    }
  }, [profileData, currentUser, isOwnProfile]);

  const fetchUserProfile = async (userId) => {
    try {
      setLoading(true);
      const res = await axios.get(`https://imame-backend.onrender.com/api/users/${userId}`);
     setProfileData(res.data);
    } catch (err) {
      Alert.alert('Kullanıcı profili alınamadı', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Favori toggle
  const handleToggleFavorite = async () => {
    if (!currentUser?._id || !profileData?._id) return;
    setFavLoading(true);
    try {
      const res = await axios.post('https://imame-backend.onrender.com/api/users/toggle-favorite', {
        userId: currentUser._id,
        sellerId: profileData._id,
      });
      setIsFavorite(res.data.status === 'added');
    } catch (err) {
      Alert.alert('Hata', 'Favori işlemi başarısız: ' + err.message);
    }
    setFavLoading(false);
  };

  // Buyer opsiyonları
  const renderBuyerOptions = () => (
    <>
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('MyBids')}>
        <Text style={styles.link}>📌 Tekliflerim</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('CompletedAuctions')}>
        <Text style={styles.link}>✅ Biten Mezatlar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.card, { backgroundColor: '#d7ccc8' }]} onPress={() => navigation.navigate('EditProfile')}>
        <Text style={[styles.link, { color: '#4e342e', fontWeight: 'bold' }]}>✏️ Profili Düzenle</Text>
      </TouchableOpacity>
    </>
  );

  // Seller opsiyonları
  const renderSellerOptions = () => (
    <>
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('AddAuction')}>
        <Text style={styles.link}>➕ Mezat Ekle</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('ReceiptApproval')}>
        <Text style={styles.link}>🧾 Dekont Onayla</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('MyAuctions')}>
        <Text style={styles.link}>📦 Mezatlarım</Text>
      </TouchableOpacity>
    </>
  );

  // Admin opsiyonu
  const renderAdminOptions = () => (
    <TouchableOpacity onPress={() => navigation.navigate('AdminPanel')}>
      <Text style={{ color: 'blue', marginTop: 20, fontWeight: 'bold' }}>🔐 Admin Panel</Text>
    </TouchableOpacity>
  );

  // Ortak butonlar
  const renderCommonOptions = () => (
    <>
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Terms')}>
        <Text style={styles.link}>📃 Kullanım Koşulları</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Notifications')}>
        <Text style={styles.link}>🔔 Bildirimler</Text>
      </TouchableOpacity>
    </>
  );

  // Çıkış
  const renderLogout = () => (
    <TouchableOpacity onPress={logout} style={[styles.card, { backgroundColor: '#fce4ec' }]}>
      <Text style={[styles.link, { color: '#d32f2f' }]}>🚪 Çıkış Yap</Text>
    </TouchableOpacity>
  );

  // ⭐ Başkasının profilindeysek ve seller ise butonlar (ve kazandıysa)
  const renderVisitedProfileButtons = () => (
    <>
      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: isFavorite ? '#ffe082' : '#fff' },
          favLoading && { opacity: 0.7 },
        ]}
        onPress={handleToggleFavorite}
        disabled={favLoading}
      >
        <Text style={[styles.link, { color: '#4e342e', fontWeight: 'bold' }]}>
          {isFavorite ? '⭐ Favorilerden Çıkar' : '⭐ Favorilere Ekle'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.card} onPress={() => setShowReportModal(true)}>
        <Text style={styles.link}>🚩 Satıcıyı Şikayet Et</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.card} onPress={() => setShowRateModal(true)}>
        <Text style={styles.link}>🌟 Satıcıyı Puanla</Text>
      </TouchableOpacity>
    </>
  );

  // ---- GÖRSEL ----
  if (loading || !profileData) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#6d4c41" />
        <Text>Profil yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        {isOwnProfile ? 'Profilim' : `${profileData?.name || 'Kullanıcı'} Profili`}
      </Text>

      {/* ⭐⭐⭐⭐⭐ Ortalama puan alanı */}
      {!isOwnProfile && profileData?.role === 'seller' && (
        <View style={styles.ratingBox}>
          <Text style={styles.ratingLabel}>Satıcı Puanı: </Text>
          <Text style={styles.ratingStars}>
            {avgRating === null
              ? <ActivityIndicator size="small" color="#6d4c41" />
              : (
                <>
                  {[...Array(5)].map((_, i) => (
                    <Text key={i}>{i < Math.round(avgRating) ? '⭐' : '☆'}</Text>
                  ))}
                  <Text style={styles.ratingScore}>
                    {avgRating > 0 ? ` ${avgRating.toFixed(1)} / 5` : ' Henüz puan yok'}
                  </Text>
                  {totalRatings > 0 && <Text style={styles.ratingTotal}>  ({totalRatings})</Text>}
                </>
              )
            }
          </Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.label}>Ad Soyad:</Text>
        <Text style={styles.value}>{profileData?.name || '-'}</Text>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{profileData?.email || '-'}</Text>
        <Text style={styles.label}>Telefon:</Text>
        <Text style={styles.value}>{profileData?.phone || '-'}</Text>
      </View>

      {/* Sadece kendi profilin açıldıysa eski butonlar + çıkış */}
      {isOwnProfile && profileData?.role === 'buyer' && renderBuyerOptions()}
      {isOwnProfile && profileData?.role === 'seller' && renderSellerOptions()}
      {isOwnProfile && profileData?.role === 'admin' && renderAdminOptions()}
      {renderCommonOptions()}
      {isOwnProfile && renderLogout()}

      {/* Başkasının satıcı profili ise ve kazandıysan: */}
      {!isOwnProfile && profileData?.role === 'seller' && hasWonAuction && renderVisitedProfileButtons()}

      {/* Modallar */}
      <RateSellerModal
        visible={showRateModal}
        onClose={() => setShowRateModal(false)}
        sellerId={profileData._id}
      />
      <ReportSellerModal
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
        sellerId={profileData._id}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff8e1' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, color: '#4e342e' },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  label: { color: '#6d4c41', fontWeight: 'bold', fontSize: 16 },
  value: { fontSize: 16, marginBottom: 5 },
  link: { fontSize: 18, fontWeight: '500', color: '#6d4c41' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  ratingBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start'
  },
  ratingLabel: {
    fontWeight: 'bold',
    color: '#6d4c41',
    fontSize: 17,
    marginRight: 5,
  },
  ratingStars: {
    flexDirection: 'row',
    fontSize: 19,
    fontWeight: 'bold',
    color: '#ffab00',
    alignItems: 'center',
  },
  ratingScore: {
    color: '#6d4c41',
    fontWeight: '600',
    marginLeft: 3,
    fontSize: 16,
  },
  ratingTotal: {
    color: '#8d6e63',
    fontSize: 13,
    marginLeft: 5,
  }
});
