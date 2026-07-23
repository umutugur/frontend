# İmame — UI Yenileme (Redesign) Tasarım Dokümanı

**Tarih:** 2026-07-23
**Repo:** `frontend` (Expo SDK 53 / RN 0.79 / React 19)
**Durum:** Onaylandı — uygulamaya geçiş bekliyor

---

## 1. Amaç ve Kapsam

Uygulamanın tamamen düz / "yapay zeka üretimi" görünümünden çıkıp **modern, canlı
ve İmame'ye özgü** bir görünüme kavuşması. **Renk paleti korunur**; gradient ve
animasyon eklenir; ekran düzenleri modernleştirilir.

**Değişmez kural:** *Çalışan hiçbir işlev bozulmayacak.* Tüm iş mantığı, API
çağrıları, navigation, state, izinler ve reklam entegrasyonları birebir korunur;
yalnızca **sunum katmanı** yeniden yazılır.

**Kapsam:** 33 ekran + ortak bileşenler (`CustomHeader`, `OfflineNotice`,
`BidConfirmModal`, `RateSellerModal`, `ReportSellerModal`).

### Seçilen görsel yön: **C — Dinamik & Canlı**
- Üstte gradient **geri sayım hero'su** (mezatlar TR 22:00'de biter kuralını öne çıkarır).
- Gradient vurgu çizgileri/rozetler, derinlikli kartlar, hareket hissi.
- 2 sütunlu ürün gridi korunur ama modern kart tasarımıyla.

---

## 2. Kesin Şartlar (Hard Requirements)

Bu dört şart **istisnasız tüm ekranlarda** geçerlidir:

1. **SafeArea:** Her ekran güvenli alan içinde render edilir (çentik/ev tuşu
   bölgeleri korunur). `react-native-safe-area-context` kullanılır (zaten kurulu).
2. **KeyboardAvoidingView:** Klavye açılan/giriş içeren tüm ekranlar klavyeyi
   yönetir (input klavyenin altında kalmaz). iOS `padding`, Android uygun davranış.
3. **Alert yasağı:** Uygulamada **hiçbir `Alert.alert` / `Alert.prompt`
   kullanılmaz.** Mevcut **63 çağrı** (19 dosya) uygulama renklerinde tema
   modallarıyla değiştirilir. Mesaj metinleri ve buton davranışları birebir korunur.
4. **Palet sabit:** Marka renkleri değişmez; yalnızca gradient türevleri eklenir.

Şartlar (1) ve (2) merkezi `Screen` bileşenine gömülerek **her ekran otomatik
olarak** bunları alır. Şart (3) global `AlertProvider` ile karşılanır.

---

## 3. Teknik Temel

### Bağımlılıklar
- **Eklenecek:** `expo-linear-gradient` (gradient için zorunlu — `npx expo install`).
- **Bağlanacak:** `react-native-reanimated` (zaten dependency, ama kullanılmıyor ve
  babel plugin yok). `babel.config.js` oluşturulup `babel-preset-expo` +
  reanimated/worklets plugin eklenecek.
- **Mevcut, kullanılacak:** `react-native-safe-area-context`,
  `react-native-gesture-handler`, `react-native-toast-message`, `@expo/vector-icons`.

### Animasyon yaklaşımı: **İkisi birlikte**
- Çoğu ekran: React Native yerleşik **`Animated`** API (fade, slide, press-scale,
  liste giriş animasyonu, geri sayım) — sıfır ek kurulum, sıfır build riski.
- Hero geri sayım ve özel geçişler: **Reanimated** (daha akıcı).
- `App.js` köküne `GestureHandlerRootView` eklenir (şu an yok) — gesture/reanimated
  için gerekli, mevcut davranışı etkilemez.

### Build riski notu
Reanimated babel kurulumu yanlış yapılırsa uygulama açılmayabilir. Bu yüzden
**Faz 0**'da kurulum yapılır ve simülatörde açılış doğrulanır; sorun çıkarsa
o faz reanimated olmadan (yalnızca `Animated`) tamamlanır.

---

## 4. Tasarım Sistemi

### `theme/tokens.js` — tek görsel kaynak
- **Renkler:** `brownDark #4e342e`, `brown #6d4c41`, `cream #fff8e1`,
  `creamDeep #FDF6E3`, `surface #F9F6F2`, `priceGreen #2e7d32`, gerekli nötrler.
- **Gradientler:** `goldToBrown` (#a1743b→#4e342e), `creamSurface` (#fff8e1→#f3e4c4),
  `scrim` (transparent→rgba(46,30,25,.85)), `heroDark` (#5d4037→#8d6e63).
- **Spacing:** 4 tabanlı ölçek (4/8/12/16/20/24/32).
- **Radii:** sm 8, md 12, lg 16, xl 20, pill 999.
- **Tipografi:** başlık/gövde/etiket ölçeği, ağırlıklar. (Özel font eklenmez;
  sistem fontu + ağırlık/serif vurgu ile "editöryel" his — YAGNI.)
- **Gölgeler:** `soft`, `card`, `raised` presetleri (iOS shadow + Android elevation).

### İkonografi
- Ana set **Ionicons** (mevcut tab bar ile tutarlı). İçerik ikonları için
  `@expo/vector-icons` içindeki **MaterialCommunityIcons** ve **Feather** aileleri
  serbestçe kullanılabilir (ek bağımlılık gerektirmez — hepsi `@expo/vector-icons`
  içinde gelir). Uygulamanın ruhuna (tespih/el sanatı) uygun ikonlar (madalya,
  mühür, çekiç/mezat, kumbara vb.) bu ailelerden seçilir.
- Gerekirse tekil özel SVG ikon eklenebilir; yeni **npm ikon paketi** ancak
  `@expo/vector-icons` bir ihtiyacı karşılamıyorsa değerlendirilir.

### `components/ui/` — yeniden kullanılabilir bileşenler
| Bileşen | Görev |
|---------|-------|
| `Screen` | **SafeArea + KeyboardAvoidingView + krem zemin** sarmalayıcı. Tüm ekranların kökü. `scroll` prop'u ile scroll'lu/scroll'suz. |
| `GradientButton` | Gradient dolgu, press-scale animasyonu, loading state. |
| `PressableScale` | Basınca hafif küçülen dokunmatik sarmalayıcı. |
| `Card` | Derinlikli yüzey (gölge + radius), gradient kenar opsiyonu. |
| `AuctionCard` | Ana grid kartı (görsel, Usta İmzalı rozeti, başlık, fiyat pill, satıcı). |
| `CountdownHero` | Gradient geri sayım başlığı (bugünkü 22:00'e). |
| `Badge` | "Usta İmzalı", durum etiketleri (pending/approved/rejected renkleri). |
| `Input` | Tema uyumlu metin girişi (odak durumu, hata metni). |
| `SectionHeader` | Başlık + opsiyonel "tümü" aksiyonu. |
| `EmptyState` | Boş liste durumu (ikon + mesaj). |
| `Skeleton` | Yükleniyor placeholder (shimmer). |
| `FadeInList` | Liste öğelerinin sıralı giriş animasyonu. |

### Global uyarı sistemi — `AlertProvider` (`context/AlertContext.js`)
- `App.js` içinde `AuthProvider`'ı sarmalar (veya yanına eklenir).
- İmperatif API: `const { showAlert } = useAlert();`
  `showAlert({ title, message, buttons })` — imza mevcut `Alert.alert(title, msg, buttons)`
  ile birebir eşlenir; her `button` `{ text, onPress, style }`.
- Kolaylık: `confirm({ title, message })` → `Promise<boolean>`; `notify(title, msg)`
  tek butonlu bilgi modalı.
- Modal görünümü: uygulama renkleri, gradient buton, hafif giriş animasyonu,
  arka plan karartma. `react-native-toast-message` **kalır** (anlık bildirimler için);
  `Alert` → modal, transient push toast → toast ayrımı korunur.
- **Bağlam dışı çağrılar (AuthContext gibi):** AuthContext bir React bileşeni
  olmadığından `useAlert` çağıramaz. Çözüm: `AlertProvider` mount olduğunda
  imperatif handler'ı bir modül singleton'a (`alertRef`) kaydeder; AuthContext
  bu singleton üzerinden `showAlert` çağırır. Böylece 8 adet AuthContext Alert'i de
  modala taşınır.

---

## 5. Ekran Taşıma Kuralı (işlev koruma garantisi)

Her ekran yeniden yazılırken **korunacaklar** (dokunulmaz):
- Tüm `useState` / `useEffect` / `useContext` mantığı ve bağımlılık dizileri.
- Tüm `axios` çağrıları ve **URL'ler** (`https://imame-backend.onrender.com/...`).
- Event handler'lar, iş kuralları (teklif verme, dekont yükleme, onay/ret akışları).
- `navigation.navigate(...)` **hedef adları** ve route parametreleri.
- `AuthContext` kullanımları (login/logout/guest/updateUser/deleteMyAccount vb.).
- AdMob birim ID'leri ve `BannerAd` yerleşimi (Home/Favorites/AuctionDetail).
- İzin akışları (bildirim, kamera/galeri, ATT).

**Değişecekler (yalnızca sunum):**
- `return (...)` JSX ağacı → `Screen` + `ui/` bileşenleri.
- `StyleSheet` → `theme/tokens` referansları.
- `Alert.alert(...)` → `showAlert(...)`.
- Ham `TextInput`/`TouchableOpacity` → `Input`/`PressableScale`/`GradientButton`.

---

## 6. Faz Planı

- **Faz 0 — Temel (görsel değişiklik yok, altyapı):**
  `expo-linear-gradient` kurulumu, `babel.config.js` + reanimated, `App.js`'e
  `GestureHandlerRootView` + `AlertProvider`, `theme/tokens.js`, `components/ui/`
  çekirdek bileşenleri, `AlertContext`. **Doğrulama:** simülatörde açılış + mevcut
  akış bozulmadı.
- **Faz 1 — Çekirdek alıcı akışı:** Home, AuctionDetail, Favorites, Profile,
  ChatList, Chat.
- **Faz 2 — Auth + teklif/bildirim/dekont:** Login, Register, MyBids,
  Notifications, UploadReceipt, OngoingAuctions, CompletedAuctions.
- **Faz 3 — Satıcı:** AddAuction, MyAuctions, ReceiptApproval, AuctionManagement,
  ManageAuctions.
- **Faz 4 — Admin + ayarlar + statik + modallar:** AdminPanel, UserList,
  AddSeller, BanUser, SendNotification, ViewReports, ReportUser, Settings,
  EditProfile, HelpAndSupport, Terms, PrivacyPolicy, ReceiptImage,
  `CustomHeader`, `OfflineNotice`, `BidConfirmModal`, `RateSellerModal`,
  `ReportSellerModal`.

Her fazda: o fazın Alert'leri modala taşınır, SafeArea + KeyboardAvoiding
uygulanır (Screen bileşeni sayesinde otomatik).

---

## 7. Doğrulama Stratejisi

Her fazdan sonra iOS Simulator'da:
- **Görsel:** ekranlar açılır, palet/gradient/animasyon beklenildiği gibi.
- **İşlev:** temsili akışlar denenir — giriş (e-posta/misafir), mezat listeleme,
  mezat detayına gitme, teklif verme onayı, dekont yükleme ekranı, navigasyon,
  klavye davranışı, alert→modal.
- **Regresyon kontrolü:** hiçbir `Alert.alert` kalmadığının grep ile teyidi
  (`grep -r "Alert.alert" screens components context` → boş).

---

## 8. Kapsam Dışı (YAGNI)

- Renk kimliği değişimi, yeni marka.
- Özel font ailesi entegrasyonu.
- Backend / API değişikliği.
- Yeni ekran veya yeni özellik (yalnızca mevcut ekranların yeniden tasarımı).
