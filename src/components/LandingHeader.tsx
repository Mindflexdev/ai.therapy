import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Menu } from 'lucide-react-native';
import { Theme } from '../constants/Theme';
import { Logo } from './Logo';

interface Props {
  onMenuPress: () => void;
}

export function LandingHeader({ onMenuPress }: Props) {
  return (
    <View style={styles.header}>
      <View style={{ marginTop: -10 }}>
        <Logo size="large" />
      </View>

      <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
        <Menu size={28} color={Theme.colors.text.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.m,
    backgroundColor: Theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  menuButton: {
    padding: Theme.spacing.s,
  },
});
