// theme/tokens.js
// İmame tasarım sistemi — tek görsel kaynak.
// Palet SABİT (marka renkleri değişmez); yalnızca gradient türevleri eklenir.
// Bileşenler bu değerleri kullanır; palette hex'i asla bileşen içinde tekrarlanmaz.

export const colors = {
  brownDark: '#4e342e',
  brown: '#6d4c41',
  cream: '#fff8e1',
  creamDeep: '#FDF6E3',
  surface: '#F9F6F2',
  priceGreen: '#2e7d32',
  white: '#fff',
  danger: '#c62828',
  muted: '#8d7b6f',
  line: 'rgba(78,52,46,0.12)',
};

export const gradients = {
  goldToBrown: ['#a1743b', '#4e342e'],
  creamSurface: ['#fff8e1', '#f3e4c4'],
  scrim: ['transparent', 'rgba(46,30,25,0.85)'],
  heroDark: ['#5d4037', '#8d6e63'],
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
};

export const typography = {
  h1: { fontSize: 24, fontWeight: '800' },
  h2: { fontSize: 20, fontWeight: '800' },
  h3: { fontSize: 16, fontWeight: '700' },
  body: { fontSize: 14 },
  label: { fontSize: 12, letterSpacing: 0.5 },
  price: { fontSize: 14, fontWeight: '800', color: '#2e7d32' },
};

export const shadows = {
  soft: {
    shadowColor: '#4e342e',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  card: {
    shadowColor: '#4e342e',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  raised: {
    shadowColor: '#4e342e',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
};

export default { colors, gradients, spacing, radii, typography, shadows };
