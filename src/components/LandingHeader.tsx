import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Menu } from 'lucide-react-native';
import { Theme } from '../constants/Theme';

interface Props {
  onMenuPress: () => void;
}

export function LandingHeader({ onMenuPress }: Props) {
  return (
    <View style={styles.header}>
      <View style={styles.brandingContainer}>
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/logo_ai.png')} style={styles.logoImage} />
          <Text style={styles.logo}>
            <Text style={styles.logoWhite}>ai</Text>
            <Text style={styles.logoDot}>.</Text>
            <Text style={styles.logoWhite}>therapy</Text>
          </Text>
        </View>
        <Text style={styles.slogan}>not real therapy</Text>
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
  brandingContainer: {
    alignItems: 'flex-start',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  slogan: {
    fontSize: 10,
    color: Theme.colors.text.secondary,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
    marginLeft: 44,
  },
  logoImage: {
    width: 32,
    height: 32,
  },
  logo: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  logoWhite: {
    color: Theme.colors.text.primary,
  },
  logoDot: {
    color: Theme.colors.primary,
  },
  menuButton: {
    padding: Theme.spacing.s,
  },
});
