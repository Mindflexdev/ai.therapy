// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'bubble.left.and.bubble.right.fill': 'chat',
  'book.fill': 'book',
  'magnifyingglass': 'search',
  'plus': 'add',
  'brain': 'psychology',
  'person': 'person',
  'play.fill': 'play-arrow',
  'pause.fill': 'pause',
  'stop.fill': 'stop',
  'gobackward.15': 'replay-10',
  'goforward.15': 'forward-10',
  'chevron.down': 'keyboard-arrow-down',
  'airplayaudio': 'airplay',
  'arrow.down.circle': 'arrow-circle-down',
  'hand.thumbsup': 'thumb-up',
  'heart': 'favorite-border',
  'square.and.arrow.up': 'share',
  'list.bullet': 'list',
  'clock.fill': 'access-time',
  'lock.fill': 'lock',
  'flame.fill': 'local-fire-department',
  'checkmark.circle.fill': 'check-circle',
  'building.2.fill': 'business',
  'camera.fill': 'camera-alt',
  'pencil': 'edit',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
