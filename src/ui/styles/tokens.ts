import { Platform } from 'react-native';
import { CubeColor } from '@/domain/Color';
import { CubeSymbol } from '@/domain/Symbol';

// Paleta inspirada en la caja del juego (assets/manual/caja.jpg):
// pergamino crema + tinta azul marino oscura + acentos en rojo manuscrito.
export const colors = {
  background: '#E5D4A3',
  surface: '#F0E0B4',
  surfaceAlt: '#DAC68F',
  border: '#B89968',
  text: '#1B2336',
  textMuted: '#7A6747',
  textOnDark: '#F0E0B4',
  accent: '#1B2336',
  danger: '#9C2A2A',
  success: '#4A5A2E',
  locked: '#A89572',
  parchment: '#D4BB7A',
  parchmentDark: '#C9A968',
  parchmentLight: '#F4E6BC',
  gold: '#A87E2F',
  goldBright: '#C9A14A',
  sepia: '#5A4630',
};

export const gradients = {
  parchment: ['#F4E6BC', '#E5D4A3', '#CDB179'],
  surface: ['#F4E6BC', '#EAD8A8'],
  gold: ['#C9A14A', '#A87E2F'],
} as const;

export const shadows = {
  card: Platform.select<object>({
    web: { boxShadow: '0 2px 6px rgba(43, 32, 16, 0.25)' },
    default: {
      shadowColor: '#2B2010',
      shadowOpacity: 0.25,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3,
    },
  }) as object,
  raised: Platform.select<object>({
    web: { boxShadow: '0 6px 18px rgba(43, 32, 16, 0.4)' },
    default: {
      shadowColor: '#2B2010',
      shadowOpacity: 0.4,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 8,
    },
  }) as object,
};

export const cubeColorHex: Record<CubeColor, string> = {
  nigredo: '#1A1410',
  citrinitas: '#C49C2B',
  rubedo: '#9F2A23',
};

export const cubeColorContrast: Record<CubeColor, string> = {
  nigredo: '#F0E0B4',
  citrinitas: '#1B2336',
  rubedo: '#F0E0B4',
};

// El selector de variación U+FE0E (VS15) fuerza el estilo de texto (monocromo,
// con grosor de fuente) en lugar del estilo emoji a color. Garantiza que los
// tres glifos respeten `fontWeight` y se rendericen de forma consistente.
const VS_TEXT = '︎';
export const cubeSymbolGlyph: Record<CubeSymbol, string> = {
  sulfur: `🜍${VS_TEXT}`,
  mercury: `☿${VS_TEXT}`,
  salt: `🜔${VS_TEXT}`,
};

export const cubeColorLabel: Record<CubeColor, string> = {
  nigredo: 'Nigredo',
  citrinitas: 'Citrinitas',
  rubedo: 'Rubedo',
};

export const cubeSymbolLabel: Record<CubeSymbol, string> = {
  sulfur: 'Azufre',
  mercury: 'Mercurio',
  salt: 'Sal',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
};

export const fonts = {
  serif: Platform.select({
    ios: 'Georgia',
    android: 'serif',
    default: 'Georgia, serif',
  }) as string,
};
