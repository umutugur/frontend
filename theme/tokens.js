// theme/tokens.js
// İmame tasarım sistemi — tek görsel kaynak.
// Kimlik: "sıcak heritage / butik mezat evi". Palet marka renklerini korur,
// altın vurgu + katmanlı gradient + ayırt edici tipografi ile derinlik kazandırır.
// Bileşenler bu değerleri kullanır; palette hex'i asla bileşen içinde tekrarlanmaz.

// ── Fontlar (custom font → fontFamily ağırlığı taşır, fontWeight KULLANILMAZ) ──
export const fonts = {
  // Fraunces: karakterli heritage serif (başlıklar)
  display: 'Fraunces_700Bold',
  displayBlack: 'Fraunces_900Black',
  displaySemi: 'Fraunces_600SemiBold',
  displayItalic: 'Fraunces_600SemiBold_Italic',
  // Manrope: temiz humanist sans (gövde + UI)
  body: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semibold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extrabold: 'Manrope_800ExtraBold',
};

export const colors = {
  brownDark: '#4e342e',
  brown: '#6d4c41',
  espresso: '#3a241c',
  gold: '#a1743b',
  goldLight: '#c9a24b',
  cream: '#fff8e1',
  creamDeep: '#FDF6E3',
  creamHi: '#fffdf7',
  surface: '#F9F6F2',
  priceGreen: '#2e7d32',
  priceGreenBg: '#e6f2e6',
  white: '#fff',
  danger: '#c0392b',
  dangerBg: '#f7e3e0',
  muted: '#9a8578',
  line: 'rgba(78,52,46,0.10)',
  lineStrong: 'rgba(78,52,46,0.18)',
};

export const gradients = {
  // altın→kahve (birincil CTA / hero)
  goldToBrown: ['#b98a45', '#4e342e'],
  gold: ['#d8b25a', '#a1743b'],
  // sayfa zemini — düz krem yerine sıcak atmosfer
  page: ['#fdf7e6', '#f6ead1'],
  creamSurface: ['#fffdf7', '#f4e7cd'],
  // görsel üstü karartma (metin okunurluğu)
  scrim: ['transparent', 'rgba(46,30,25,0.88)'],
  // koyu hero (geri sayım / başlık)
  heroDark: ['#5d4037', '#3a241c'],
  // kart üstü ince altın sheen
  sheen: ['rgba(255,255,255,0.5)', 'rgba(255,255,255,0)'],
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 44,
};

export const radii = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 30,
  pill: 999,
};

// Tipografi — serif başlık + sans gövde. fontFamily ağırlığı taşır.
export const typography = {
  hero: { fontFamily: fonts.displayBlack, fontSize: 34, lineHeight: 38, color: colors.brownDark },
  h1: { fontFamily: fonts.display, fontSize: 26, lineHeight: 31, color: colors.brownDark },
  h2: { fontFamily: fonts.display, fontSize: 21, lineHeight: 26, color: colors.brownDark },
  h3: { fontFamily: fonts.extrabold, fontSize: 16, lineHeight: 21, color: colors.brownDark },
  title: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 20, color: colors.brownDark },
  body: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.brown },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 21, color: colors.brownDark },
  small: { fontFamily: fonts.body, fontSize: 12, lineHeight: 17, color: colors.muted },
  label: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.4, color: colors.gold },
  button: { fontFamily: fonts.bold, fontSize: 15, letterSpacing: 0.3, color: colors.white },
  price: { fontFamily: fonts.extrabold, fontSize: 16, color: colors.priceGreen },
};

export const shadows = {
  soft: {
    shadowColor: '#3a241c',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  card: {
    shadowColor: '#3a241c',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  raised: {
    shadowColor: '#3a241c',
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  gold: {
    shadowColor: '#a1743b',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
};

export default { fonts, colors, gradients, spacing, radii, typography, shadows };
