# İmame — Heritage Tasarım Reçetesi (tüm ekranlar)

Onaylanan **Login (A / Mihrap-Heritage)** dili tüm ekranlara uygulanır. Referans uygulama:
`screens/LoginScreen.js` (mihrap nişi, altın khatim yıldızı, süsleme ayıraçları, alt-çizgili inputlar, altın CTA, serif başlıklar). Bu dosyayı OKU ve bar olarak al.

## Değişmez kural
Yalnızca **sunum** değişir. KORU: tüm `useState/useEffect/useContext`, `axios` çağrıları ve
`https://imame-backend.onrender.com/...` URL'leri, event handler'lar, iş kuralları,
`navigation.navigate` hedef adları + route paramları, AuthContext kullanımı, AdMob birimleri +
`BannerAd` yerleşimi, izin akışları, prop imzaları. **Hiç `Alert.alert` kullanma** (mevcutlar zaten
`showAlert`'e taşındı — öyle kalsın). Palet SABİT; hex'i hardcode etme, hep `theme/tokens` kullan;
`fontWeight` KULLANMA (fontlar fontFamily ile gelir — `typography.*` token'larını kullan).

## Bileşen sözleşmesi (import: `../components/ui`, `../theme/tokens`)
- `Screen {scroll, edges, glow, bgColors, contentContainerStyle}` — her ekranın kökü (SafeArea+KAV).
- `ScreenHeader {title, subtitle, onBack, right, variant='plain'|'hero', showBack}` — **GERİ BUTONU buradadır.**
  Push edilen (detay/form/liste) ekranların en üstüne koy. `variant='hero'` = koyu gradient bant + büyük
  serif başlık + süsleme (birincil/detay ekranlar için); `variant='plain'` = krem üzerinde daire geri
  butonu + serif başlık (form/liste için). Geri varsayılan `navigation.goBack()`.
- `GradientButton {title, onPress, icon, variant='gold'|'primary'|'secondary'|'danger', loading}` —
  birincil aksiyon **`variant="gold"`**; yıkıcı `danger`; ikincil `secondary`.
- `Input {variant='underline'|'box', leftIcon, rightElement, error, ...TextInput}` — formlarda
  **`variant="underline"`** + `leftIcon` (Login'deki gibi).
- `Card {gradientBorder, onPress}` (krem, hairline), `Badge {label, tone}`, `AuctionCard {item,onPress}`,
  `MenuTile {icon,title,subtitle,tone,onPress}` (menü satırları), `EmptyState {icon,title,message}`,
  `SectionHeader {title,actionLabel,onAction}`, `Skeleton`, `OrnamentDivider`, `CountdownHero`, `PressableScale`.

## Heritage görsel dil
- **Serif başlıklar** (`typography.hero/h1/h2` = Fraunces), sans gövde (Manrope). Bol nefes alanı.
- **Altın vurgular**: gradient butonlar, ince altın hairline, `OrnamentDivider` (altın çizgiler arası elmas).
- **Motifler (ölçülü kullan, her ekrana değil)**: birincil ekranlarda `ScreenHeader variant="hero"`;
  marka/başarı anlarında mihrap-niş veya khatim (8 köşeli yıldız) arka motifi (Login'deki gibi,
  düşük opaklıkta altın). Abartma — 1 güçlü motif > 5 dağınık süs.
- **Kartlar**: `Card` (krem yüzey, hairline, yumuşak gölge). Listeler: `AuctionCard`/`Card`/`MenuTile`.
- **Durumlar**: `Badge` tone'ları (signed/pending/approved/rejected/neutral).
- Boş liste → `EmptyState`. Yükleniyor → `Skeleton`.

## GERİ BUTONU kuralı
- **Push edilen tüm ekranlar** `ScreenHeader` ile geri butonu alır (App.js `headerShown:false`, başka header yok).
- **Tab kökleri geri butonu ALMAZ** (bunlar `CustomHeader` altında): **HomeScreen, FavoritesScreen,
  ProfileScreen, ChatListScreen**. Bu 4'ünde ScreenHeader/geri KOYMA; sadece içeriği heritage diliyle stille.

## Ekran kalıpları
- **Detay/birincil** (ör. AuctionDetail, AdminPanel): `ScreenHeader variant="hero"` + zengin içerik.
- **Form** (ör. Register, AddAuction, EditProfile, AddSeller, SendNotification, ReportUser):
  `ScreenHeader variant="plain"` + `Input variant="underline"` + `GradientButton variant="gold"`.
- **Liste** (ör. MyBids, Notifications, UserList, BanUser, ViewReports, Ongoing/Completed, MyAuctions,
  ManageAuctions, ReceiptApproval): `ScreenHeader variant="plain"` + Card/AuctionCard satırları + EmptyState.
- **Statik metin** (Terms, Privacy, HelpAndSupport): `ScreenHeader variant="plain"` + `<Screen scroll>` serif
  başlıklar + okunur gövde + `OrnamentDivider` bölüm ayırıcı. Metin içeriğini AYNEN koru.
- **Tam ekran görsel** (ReceiptImage): görsel + üstte yarı saydam yuvarlak geri/kapat butonu.

## Doğrulama (her dosya)
- `grep -n "Alert.alert\|Alert.prompt"` → boş.
- Kök `<Screen>`. Push ekranlarında `ScreenHeader` (geri butonu) var. Tab köklerinde YOK.
- `node -e "require('@babel/core').transformFileSync('<dosya>',{presets:['babel-preset-expo']})"` hatasız.
- `npx expo start` ÇALIŞTIRMA (port çakışması — başka ajanlar var).
- Küçük mantıklı commit'ler; mesaj sonunda boş satır + `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
