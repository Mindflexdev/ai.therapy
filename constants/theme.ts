/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#5B8FD8';
const tintColorDark = '#6BA3E8';

export const Colors = {
  light: {
    text: '#2D3436',
    background: '#F5F7FA',
    tint: tintColorLight,
    icon: '#636E72',
    tabIconDefault: '#B2BEC3',
    tabIconSelected: tintColorLight,
    card: '#FFFFFF',
    primary: '#5B8FD8',
    secondary: '#7BA8E0',
    accent: '#FF7675',
  },
  dark: {
    text: '#DFE6E9',
    background: '#1E272E',
    tint: tintColorDark,
    icon: '#B2BEC3',
    tabIconDefault: '#636E72',
    tabIconSelected: tintColorDark,
    card: '#2D3436',
    primary: '#6BA3E8',
    secondary: '#7BA8E0',
    accent: '#FF7675',
  },
};

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
