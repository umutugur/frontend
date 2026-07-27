// utils/feedSeed.js
// Misafir kullanıcılar için kalıcı feed tohumu. Girişli kullanıcıda sunucu
// zaten userId'yi tohum olarak kullanır; bu yalnızca misafir sırasını kararlı kılar.
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'feedSeed';
let cached = null;

export async function getFeedSeed() {
  if (cached) return cached;
  try {
    let seed = await AsyncStorage.getItem(KEY);
    if (!seed) {
      seed = Math.random().toString(36).slice(2, 12);
      await AsyncStorage.setItem(KEY, seed);
    }
    cached = seed;
    return seed;
  } catch {
    return 'guest';
  }
}
