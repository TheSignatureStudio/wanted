/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const brand = {
  accent: '#7c5dff',
  accentStrong: '#a181ff',
  bgDark: '#050816',
  bgLight: '#f6f6f8',
  panelDark: '#11142b',
  panelLight: '#ffffff',
  textDark: '#f4f4f5',
  textLight: '#12121a',
  mutedDark: '#a6a8c3',
  mutedLight: '#4d5060',
  borderDark: 'rgba(255, 255, 255, 0.12)',
  borderLight: 'rgba(5, 8, 22, 0.12)',
};

export const Colors = {
  light: {
    text: brand.textLight,
    background: brand.bgLight,
    tint: brand.accent,
    icon: brand.mutedLight,
    tabIconDefault: '#9ea0a8',
    tabIconSelected: brand.accent,
    card: brand.panelLight,
    muted: brand.mutedLight,
    border: brand.borderLight,
    accentStrong: brand.accentStrong,
  },
  dark: {
    text: brand.textDark,
    background: brand.bgDark,
    tint: brand.accent,
    icon: brand.mutedDark,
    tabIconDefault: brand.mutedDark,
    tabIconSelected: brand.accent,
    card: brand.panelDark,
    muted: brand.mutedDark,
    border: brand.borderDark,
    accentStrong: brand.accentStrong,
  },
} as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
