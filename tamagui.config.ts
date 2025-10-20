import { createTamagui } from 'tamagui';
import { createFont, createTokens, createThemes } from 'tamagui';

const tokens = createTokens({
  color: {
    white: '#ffffff',
    black: '#000000',
    gray1: '#111111',
    gray2: '#222222',
    gray3: '#333333',
    gray7: '#777777',
    gray9: '#999999',
    blue10: '#0a84ff',
    red10: '#ff453a',
    green10: '#30d158'
  },
  radius: {
    0: 0,
    1: 4,
    2: 8,
    3: 12
  },
  space: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24
  },
  size: {
    1: 28,
    2: 32,
    3: 36
  }
});

const bodyFont = createFont({
  family: 'System',
  size: {
    1: 14,
    2: 16,
    3: 18
  },
  lineHeight: {
    1: 18,
    2: 20,
    3: 24
  },
  weight: {
    1: '400',
    2: '600'
  }
});

const themes = createThemes({
  light: {
    bg: tokens.color.white,
    color: tokens.color.gray3
  },
  dark: {
    bg: tokens.color.gray1,
    color: tokens.color.gray9
  }
});

const config = createTamagui({
  tokens,
  themes,
  fonts: {
    body: bodyFont
  },
  shorthands: {
    p: 'padding',
    m: 'margin'
  }
});

export type AppTamaguiConfig = typeof config;

declare module 'tamagui' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface TamaguiCustomConfig extends AppTamaguiConfig {}
}

export default config;
