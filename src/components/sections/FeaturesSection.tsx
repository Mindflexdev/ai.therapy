import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '../../constants/Theme';

export function FeaturesSection() {
  const features = [
    { id: 1, text: 'no waiting lists' },
    { id: 2, text: 'no diagnosis required' },
    { id: 3, text: 'no promises we cant keep' },
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.title}>not therapy, but always there</Text>

      <View style={styles.featureList}>
        {features.map((feature) => (
          <View key={feature.id} style={styles.featureItem}>
            <View style={styles.bullet} />
            <Text style={styles.featureText}>{feature.text}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.xxl,
    backgroundColor: 'rgba(235, 206, 128, 0.05)',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: Theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
  },
  featureList: {
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.m,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Theme.colors.primary,
    marginRight: Theme.spacing.m,
  },
  featureText: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: Theme.colors.text.secondary,
  },
});
