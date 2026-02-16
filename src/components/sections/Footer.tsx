import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Theme } from '../../constants/Theme';
import { useRouter } from 'expo-router';

export function Footer() {
  const router = useRouter();

  return (
    <View style={styles.footer}>
      <View style={styles.links}>
        <TouchableOpacity onPress={() => router.push({ pathname: '/(main)/legal', params: { section: 'terms' } })}>
          <Text style={styles.link}>Terms</Text>
        </TouchableOpacity>
        <Text style={styles.separator}>•</Text>
        <TouchableOpacity onPress={() => router.push({ pathname: '/(main)/legal', params: { section: 'privacy' } })}>
          <Text style={styles.link}>Privacy</Text>
        </TouchableOpacity>
        <Text style={styles.separator}>•</Text>
        <TouchableOpacity onPress={() => router.push({ pathname: '/(main)/legal', params: { section: 'cookies' } })}>
          <Text style={styles.link}>Cookies</Text>
        </TouchableOpacity>
        <Text style={styles.separator}>•</Text>
        <TouchableOpacity onPress={() => router.push({ pathname: '/(main)/legal', params: { section: 'imprint' } })}>
          <Text style={styles.link}>Imprint</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.copyright}>
        © 2024 ai.therapy
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.xxl,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  disclaimer: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    fontStyle: 'italic',
    color: Theme.colors.text.muted,
    textAlign: 'center',
    marginBottom: Theme.spacing.l,
  },
  links: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.m,
  },
  link: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Theme.colors.text.secondary,
    textDecorationLine: 'underline',
  },
  separator: {
    fontSize: 12,
    color: Theme.colors.text.muted,
    marginHorizontal: Theme.spacing.s,
  },
  copyright: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: Theme.colors.text.muted,
  },
});
