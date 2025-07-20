import React, { useEffect, useState, useContext } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert
} from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function MyBidsScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?._id) {
      fetchBids();
    }
  }, [user]);

  const fetchBids = async () => {
    try {
      const res = await axios.get(`https://imame-backend.onrender.com/api/bids/user/${user._id}`);
      const allBids = res.data;

      // Mezata göre grupla, her mezat için hem kendi son teklifini hem de en son teklifi bulalım
      const grouped = {};

      allBids.forEach((bid) => {
        const auctionId = bid.auction._id.toString();
        if (!grouped[auctionId]) {
          grouped[auctionId] = { myBid: null, lastBid: null, all: [] };
        }
        grouped[auctionId].all.push(bid);
        // Kendi verdiği en son teklifi
        if (bid.user._id === user._id) {
          if (
            !grouped[auctionId].myBid ||
            new Date(bid.createdAt) > new Date(grouped[auctionId].myBid.createdAt)
          ) {
            grouped[auctionId].myBid = bid;
          }
        }
        // O mezattaki en son teklifi
        if (
          !grouped[auctionId].lastBid ||
          new Date(bid.createdAt) > new Date(grouped[auctionId].lastBid.createdAt)
        ) {
          grouped[auctionId].lastBid = bid;
        }
      });

      const list = Object.values(grouped).map((grp) => {
        const isMyBidLast = grp.lastBid.user._id === user._id;
        const statusText = isMyBidLast
          ? 'Teklif Verildi'
          : 'Sizden sonra teklif verildi';
        return {
          ...grp.myBid,
          auctionCurrentPrice: grp.lastBid.amount,
          statusText,
        };
      });

      setBids(list);
    } catch (err) {
      Alert.alert('Teklifler alınamadı:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => {
  if (!item || !item.auction) return null; // NULL CHECK!

  const auctionImage =
    item.auction.images && item.auction.images.length > 0
      ? item.auction.images[0]
      : null;
  const showRed = item.statusText === 'Sizden sonra teklif verildi';

  return (
    <TouchableOpacity
      style={styles.bidItem}
      onPress={() =>
        navigation.navigate('AuctionDetail', { auctionId: item.auction._id })
      }
    >
      {auctionImage && (
        <Image source={{ uri: auctionImage }} style={styles.auctionImage} />
      )}
      <View style={styles.rightContainer}>
        <Text style={[styles.title, { marginTop: 6 }]}>
          {item.auction.title}
        </Text>
        <Text style={[styles.amount, { marginTop: 6 }]}>
          {showRed ? item.auctionCurrentPrice : item.amount} TL
        </Text>
        <Text
          style={[
            styles.status,
            showRed
              ? { color: '#d32f2f', fontWeight: 'bold' }
              : { color: '#00796b' },
          ]}
        >
          {item.statusText}
        </Text>
        {showRed && (
          <Text style={styles.redWarning}>
            Dikkat: Sizden sonra teklif verildi!
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};
gi
  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#6d4c41" />
        <Text>Teklifler yükleniyor...</Text>
      </View>
    );
  }

  if (bids.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Henüz teklif vermediniz.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Tekliflerim</Text>
      <FlatList
        data={bids}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff8e1', padding: 16 },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4e342e',
    marginBottom: 10,
    marginTop: 30,
  },
  bidItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 2,
    alignItems: 'center',
  },
  auctionImage: {
    width: 100,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
  },
  rightContainer: {
    flex: 1,
  },
  title: { fontSize: 16, fontWeight: 'bold', color: '#3e2723' },
  amount: { fontSize: 14, color: '#6d4c41' },
  status: { fontSize: 14 },
  redWarning: {
    color: '#d32f2f',
    fontWeight: 'bold',
    marginTop: 4,
    fontSize: 13,
  },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#999' },
});
