# İmame UI Yenileme — Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** İmame mobil uygulamasının tüm ekranlarını, çalışan hiçbir işlevi bozmadan, palet korunarak (gradient + animasyon eklenerek) modern "C — Dinamik" yönüyle yeniden tasarlamak.

**Architecture:** Merkezi `theme/tokens.js` + `components/ui/` bileşen kütüphanesi kurulur. Her ekran yalnızca **sunum katmanında** (JSX + StyleSheet) yeniden yazılır; mantık/API/navigation birebir korunur. SafeArea + KeyboardAvoidingView `Screen` bileşenine gömülüdür (tüm ekranlar otomatik alır). Tüm `Alert.alert` çağrıları global `AlertProvider` modallarıyla değiştirilir.

**Tech Stack:** Expo SDK 53, RN 0.79, `expo-linear-gradient` (yeni), `react-native-reanimated` (bağlanacak), yerleşik `Animated`, `react-native-safe-area-context`, `@expo/vector-icons`.

**Spec:** `docs/superpowers/specs/2026-07-23-imame-ui-redesign-design.md`

---

## Genel Kurallar (her ekran taşımasında geçerli)

**KORU (dokunma):** `useState/useEffect/useContext` mantığı ve bağımlılık dizileri; tüm `axios` çağrıları ve `https://imame-backend.onrender.com/...` URL'leri; event handler'lar ve iş kuralları; `navigation.navigate` hedef adları + route paramları; `AuthContext` kullanımı; AdMob birim ID'leri + `BannerAd` yerleşimi; izin akışları (bildirim/kamera/galeri/ATT); prop imzaları.

**DEĞİŞTİR (yalnızca sunum):** JSX ağacı → `Screen` + `ui/` bileşenleri; `StyleSheet` → `theme/tokens`; `Alert.alert(...)` → `showAlert(...)`; ham `TextInput/TouchableOpacity` → `Input/PressableScale/GradientButton`.

**Her ekran taşıma tamamlandığında doğrulama:**
- `grep -n "Alert" <dosya>` → yalnızca `useAlert`/`showAlert` kalmalı, `Alert.alert` KALMAMALI.
- Ekran kökü `<Screen>` olmalı (SafeArea + KeyboardAvoiding otomatik).
- Metro/simülatörde ekran hatasız açılmalı; temel etkileşim çalışmalı.

---

## Faz 0 — Temel (altyapı, görsel regresyon yok)

Bu faz TÜM diğer fazların ön koşuludur; ana ajan tarafından yapılır ve simülatörde açılış doğrulanır.

### Task 0.1: Bağımlılıklar ve babel
**Files:** Create `babel.config.js`; Modify `package.json` (expo install ekler).
- [ ] `npx expo install expo-linear-gradient`
- [ ] `babel.config.js` oluştur: `babel-preset-expo` preset + reanimated plugin (SDK 53 → `react-native-worklets/plugin` varsa onu, yoksa `react-native-reanimated/plugin`; kurulumdan sonra doğrula). Plugin **son sırada** olmalı.
- [ ] Metro cache temizle: `npx expo start -c` (bir kez), simülatörde beyaz ekran/crash olmadığını gör.
- [ ] Commit: `chore: add expo-linear-gradient and reanimated babel config`

### Task 0.2: `App.js` sarmalayıcılar
**Files:** Modify `App.js`
- [ ] En dış sarmalayıcı olarak `GestureHandlerRootView style={{flex:1}}` ekle (import `react-native-gesture-handler` en üstte).
- [ ] `AuthProvider` çevresine `AlertProvider` ekle (AlertProvider dışta ki AuthContext singleton'a erişebilsin — bkz Task 0.4).
- [ ] Mevcut `SafeAreaView`, `NavigationContainer`, `Toast`, notification listener'ları KORU.
- [ ] Commit: `chore: wrap app with GestureHandlerRootView and AlertProvider`

### Task 0.3: `theme/tokens.js`
**Files:** Create `theme/tokens.js`
- [ ] Export `colors, gradients, spacing, radii, typography, shadows`. Değerler spec §4'ten:
  - `colors`: brownDark `#4e342e`, brown `#6d4c41`, cream `#fff8e1`, creamDeep `#FDF6E3`, surface `#F9F6F2`, priceGreen `#2e7d32`, white `#fff`, danger `#c62828`, muted `#8d7b6f`, line `rgba(78,52,46,0.12)`.
  - `gradients`: goldToBrown `['#a1743b','#4e342e']`, creamSurface `['#fff8e1','#f3e4c4']`, scrim `['transparent','rgba(46,30,25,0.85)']`, heroDark `['#5d4037','#8d6e63']`.
  - `spacing`: `{xs:4,sm:8,md:12,lg:16,xl:20,xxl:24,xxxl:32}`.
  - `radii`: `{sm:8,md:12,lg:16,xl:20,pill:999}`.
  - `typography`: `{h1:{fontSize:24,fontWeight:'800'}, h2:{fontSize:20,fontWeight:'800'}, h3:{fontSize:16,fontWeight:'700'}, body:{fontSize:14}, label:{fontSize:12,letterSpacing:0.5}, price:{fontSize:14,fontWeight:'800',color:'#2e7d32'}}`.
  - `shadows`: `soft/card/raised` — iOS `shadowColor:'#4e342e'` + shadowOpacity/Radius/Offset; Android `elevation`.
- [ ] Commit: `feat(theme): add design tokens`

### Task 0.4: `AlertProvider` (global modal + AuthContext köprüsü)
**Files:** Create `context/AlertContext.js`
- [ ] `AlertProvider` component: kuyruk/tek modal state; `showAlert({title, message, buttons})` — `buttons` yoksa tek "Tamam"; her buton `{text, onPress, style}` (`style:'destructive'|'cancel'|'default'`). Modal görünümü: `theme` renkleri, arka plan karartma, `GradientButton` ile aksiyonlar, hafif fade/scale giriş (`Animated`).
- [ ] `useAlert()` hook → `{showAlert, confirm, notify}`. `confirm({title,message})` → `Promise<boolean>`; `notify(title,message)` tek butonlu.
- [ ] **Modül singleton köprüsü:** `let _handler=null; export const setAlertHandler=f=>_handler=f; export const alertBridge={ showAlert:(...a)=> _handler? _handler(...a): undefined };` Provider mount olunca `setAlertHandler(showAlert)` çağırır. React dışı yerler (AuthContext) `alertBridge.showAlert(...)` kullanır.
- [ ] Commit: `feat(ui): add themed AlertProvider replacing Alert.alert`

### Task 0.5: Çekirdek `components/ui/` bileşenleri
**Files:** Create dosyalar `components/ui/`
Aşağıdaki **API sözleşmesi** subagent'ler için bağlayıcıdır (props değişmez):
- [ ] `Screen.js` — props: `{children, scroll=false, style, contentContainerStyle, edges, keyboardOffset=0}`. İçyapı: `SafeAreaView` (safe-area-context) + `KeyboardAvoidingView` (`behavior={Platform.OS==='ios'?'padding':undefined}`) + (scroll ? `ScrollView` : `View`). Zemin `colors.cream`.
- [ ] `PressableScale.js` — `{onPress, children, style, disabled}`; basınca `Animated` ile scale 0.97.
- [ ] `GradientButton.js` — `{title, onPress, loading, disabled, variant='primary', icon, style}`. `LinearGradient` (variant→gradients.goldToBrown), `PressableScale`, `ActivityIndicator` loading'de.
- [ ] `Card.js` — `{children, style, gradientBorder=false, onPress}`; `shadows.card`, `radii.lg`, `colors.white`.
- [ ] `Badge.js` — `{label, tone='signed'|'pending'|'approved'|'rejected'|'neutral', icon}`; tone→renk eşlemesi.
- [ ] `Input.js` — `{value, onChangeText, placeholder, error, ...rest}`; odak durumu (border rengi), hata metni. `TextInput`'in tüm props'unu geçirir (`...rest`).
- [ ] `SectionHeader.js` — `{title, actionLabel, onAction}`.
- [ ] `EmptyState.js` — `{icon, title, message}`.
- [ ] `Skeleton.js` — `{width, height, radius}`; `Animated` shimmer.
- [ ] `AuctionCard.js` — `{item, onPress}`. `item` şekli Home'daki gibi: `{_id, images[], isSigned, title, currentPrice, startingPrice, seller:{companyName}}`. Görsel + Usta İmzalı `Badge` + başlık + yeşil fiyat pill + satıcı. `PressableScale`.
- [ ] `CountdownHero.js` — `{endsAtHour=22}`. Bugün TR 22:00'e geri sayım (`setInterval`, unmount'ta temizle). `LinearGradient` heroDark, gradient metin, saat ikonu. Salt görsel — veri/istek yok.
- [ ] `index.js` (barrel export) tüm bileşenleri dışa aktarır.
- [ ] Her bileşen eklendikçe küçük commit; faz sonunda: simülatörde import edip bir demo ekranda render ederek crash olmadığını doğrula (demo geçici, commit etme).
- [ ] Commit: `feat(ui): add core component library`

**Faz 0 çıkış doğrulaması:** `npx expo start -c` → uygulama önceki gibi açılıyor, giriş/misafir akışı çalışıyor, hiçbir görsel bozulma yok (henüz ekranlar yeni değil). Reanimated kurulumu crash veriyorsa: hero'yu yalnızca `Animated` ile yaz, reanimated'ı geri al.

---

## Faz 1 — Çekirdek alıcı akışı

Her ekran = bir task. Genel Kurallar + aşağıdaki tasarım direktifleri uygulanır.

### Task 1.1: HomeScreen
**Files:** Modify `screens/HomeScreen.js`
- Koru: `fetchAuctions` + `/api/auctions/all`, `isFocused` refetch, `numColumns=2` grid, `navigation.navigate('AuctionDetail',{auctionId})`, `BannerAd` + `adUnitId` (TestIds/prod).
- Tasarım: kök `<Screen>`. Liste başlığına (`ListHeaderComponent`) `CountdownHero`. Kartlar → `AuctionCard`. `FadeInList` ile giriş animasyonu. Boşsa `EmptyState`. Reklam yerleşimi korunur.
- Doğrulama: grid görünüyor, karta basınca detay açılıyor, banner altta.

### Task 1.2: AuctionDetailScreen
**Files:** Modify `screens/AuctionDetailScreen.js`
- Koru: tüm veri çekme, teklif verme akışı (`BidConfirmModal`), `/api/bids`, `/api/auctions/:id`, `/api/ratings`, favori, sohbet başlatma, AdMob — **10 adet `Alert.alert` → `showAlert`**.
- Tasarım: `<Screen scroll>`. Görsel galeri + gradient scrim başlık, fiyat/teklif alanı gradient kart, `GradientButton` teklif ver, `CountdownHero`/geri sayım rozeti, satıcı puanı `Badge`. Modallar tema uyumlu.
- Doğrulama: teklif verme onay modalı çalışıyor, navigasyon korunuyor.

### Task 1.3: FavoritesScreen
**Files:** Modify `screens/FavoritesScreen.js`
- Koru: favori çekme, `BannerAd`, navigation.
- Tasarım: `<Screen>`, `AuctionCard` grid, `EmptyState` boşsa.

### Task 1.4: ProfileScreen
**Files:** Modify `screens/ProfileScreen.js`
- Koru: `AuthContext` (user, logout, deleteMyAccount), menü navigasyonları, **3 `Alert` → modal**.
- Tasarım: `<Screen scroll>`, gradient profil başlığı (avatar/isim/rol), `Card` menü satırları + Ionicons/MaterialCommunityIcons, `GradientButton` çıkış.

### Task 1.5: ChatListScreen
**Files:** Modify `screens/ChatListScreen.js`
- Koru: sohbet listesi çekme, okunmamış sayacı, `navigation.navigate('Chat',...)`.
- Tasarım: `<Screen>`, `Card` sohbet satırları (avatar, son mesaj, okunmamış `Badge`), `EmptyState`.

### Task 1.6: ChatScreen
**Files:** Modify `screens/ChatScreen.js`
- Koru: mesaj çekme/gönderme, `mark-as-read`, polling/interval, `KeyboardAvoiding` DAVRANIŞI (Screen sağlar).
- Tasarım: `<Screen>`, baloncuk mesajlar (gönderen gradient kahve, alıcı krem), `Input` + gradient gönder butonu.

---

## Faz 2 — Auth + teklif/bildirim/dekont

### Task 2.1: LoginScreen — Koru: `login`, `promptGoogle`, `loginWithApple`, `signInGuest`, navigation. Tasarım: gradient logo başlığı, `Input`, `GradientButton`, sosyal butonlar (Apple/Google ikonları), misafir linki. **1 Alert → modal.**
### Task 2.2: RegisterScreen — Koru: kayıt `axios`, validasyon, navigation. Tasarım: `<Screen scroll>`, `Input`'ler, `GradientButton`. **1 Alert → modal.**
### Task 2.3: MyBidsScreen — Koru: `/api/bids/user/:userId`, statusText mantığı. Tasarım: `Card` liste + durum `Badge`, `EmptyState`. **1 Alert → modal.**
### Task 2.4: NotificationsScreen — Koru: `/api/user-notifications`, okundu işaretleme. Tasarım: `Card` bildirim satırları, okunmamış vurgusu.
### Task 2.5: UploadReceiptScreen — Koru: görsel seçme/yükleme (Cloudinary/`/api/receipts/upload`), izinler. Tasarım: gradient yükleme alanı, önizleme, `GradientButton`. **5 Alert → modal.**
### Task 2.6: OngoingAuctionsScreen — Koru: veri çekme, navigation. Tasarım: `AuctionCard`/`Card` liste.
### Task 2.7: CompletedAuctionsScreen — Koru: veri çekme, kazanan durumu. Tasarım: `Card` liste + sonuç `Badge`.

---

## Faz 3 — Satıcı

### Task 3.1: AddAuctionScreen — Koru: form + görsel yükleme + `axios` create, izinler. Tasarım: `<Screen scroll>`, `Input`, görsel ekleme grid, `GradientButton`. **4 Alert → modal.**
### Task 3.2: MyAuctionsScreen — Koru: satıcı mezatları çekme, navigation. Tasarım: `Card`/`AuctionCard` liste, durum `Badge`.
### Task 3.3: ReceiptApprovalScreen — Koru: `/api/receipts/mine`, approve/reject `PATCH`. Tasarım: dekont kartları, onay/ret `GradientButton` (yeşil/kırmızı ton). **2 Alert → modal.**
### Task 3.4: AuctionManagementScreen — Koru: mevcut mantık. Tasarım: `Card` liste + aksiyonlar.
### Task 3.5: ManageAuctionsScreen — Koru: mevcut mantık, silme. Tasarım: `Card` liste. **4 Alert → modal.**

---

## Faz 4 — Admin + ayarlar + statik + ortak bileşenler

### Task 4.1: AdminPanelScreen — Koru: menü navigasyonları. Tasarım: gradient başlık, `Card` menü ızgarası (ikonlu).
### Task 4.2: UserListScreen — Koru: kullanıcı listesi, aksiyonlar. Tasarım: `Card` satır + `Input` arama. **4 Alert → modal.**
### Task 4.3: AddSellerScreen — Koru: form + create. Tasarım: `Input` + `GradientButton`. **4 Alert → modal.**
### Task 4.4: BanUserScreen — Koru: ban/unban `PATCH`. Tasarım: `Card` liste + durum `Badge`. **2 Alert → modal.**
### Task 4.5: SendNotificationScreen — Koru: `/api/notifications/send`. Tasarım: `Input` + `GradientButton`. **4 Alert → modal.**
### Task 4.6: ViewReportsScreen — Koru: `/api/reports`. Tasarım: `Card` rapor listesi. **1 Alert → modal.**
### Task 4.7: ReportUserScreen — Koru: rapor gönderme. Tasarım: `Input` + `GradientButton`. **2 Alert → modal.**
### Task 4.8: SettingsScreen — Koru: ayar/menü navigasyonları, bildirim toggle. Tasarım: `Card` gruplu ayar satırları.
### Task 4.9: EditProfileScreen — Koru: `updateUser`, form. Tasarım: `Input` + `GradientButton`. **2 Alert → modal.**
### Task 4.10: HelpAndSupportScreen — Koru: içerik/linkler. Tasarım: `Card` SSS/iletişim.
### Task 4.11: TermsAndConditionsScreen — Koru: metin içeriği. Tasarım: `<Screen scroll>` tipografi.
### Task 4.12: PrivacyPolicyScreen — Koru: metin içeriği. Tasarım: `<Screen scroll>` tipografi.
### Task 4.13: ReceiptImageScreen — Koru: görsel gösterme. Tasarım: tam ekran görsel + kapat.
### Task 4.14: Ortak bileşenler — `CustomHeader` (gradient başlık), `OfflineNotice` (tema banner), `BidConfirmModal`/`RateSellerModal`/`ReportSellerModal` (tema modal + `GradientButton`; **RateSeller 3, ReportSeller 2 Alert → modal**).

---

## Bitiş Doğrulaması (tüm fazlardan sonra)
- [ ] `grep -rn "Alert.alert\|Alert.prompt" screens components context` → **boş**.
- [ ] Her ekran kökü `<Screen>` (SafeArea + KeyboardAvoiding).
- [ ] iOS Simulator: giriş (e-posta + misafir), mezat listeleme, detay, teklif onayı, dekont ekranı, sohbet, satıcı ekle mezat, admin panel gezinme — hepsi çalışıyor.
- [ ] `git log` fazlar halinde temiz commit'ler.

## Self-Review Notu
Spec §2'deki 4 şart plana bağlandı: SafeArea+KeyboardAvoiding → Task 0.5 `Screen` (tüm ekranlarda kök); Alert yasağı → Task 0.4 + her ekranda "N Alert → modal"; ikonografi → Faz 0/ekranlarda `@expo/vector-icons`; palet+gradient → Task 0.3 tokens. 33 ekranın tamamı + 5 ortak bileşen Faz 1–4'te birer task.
