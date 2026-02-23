import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Theme } from '../../constants/Theme';

interface Props {
  onFreeTrial: () => void;
  onStartPro: () => void;
}

export function PricingSection({ onFreeTrial, onStartPro }: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>Pricing</Text>

      <View style={styles.pricingGrid}>
        {/* FREE Plan */}
        <View style={styles.planCard}>
          <Text style={styles.planName}>FREE</Text>
          <Text style={styles.price}>€0</Text>

          <View style={styles.featureList}>
            <FeatureRow text="unlimited messages" included={true} />
            <FeatureRow text="unlock all characters" included={false} />
            <FeatureRow text="long-term memory" included={false} />
            <FeatureRow text="voice & phone calls" included={false} />
          </View>

          <TouchableOpacity style={styles.freeButton} onPress={onFreeTrial}>
            <Text style={styles.freeButtonText}>try free</Text>
          </TouchableOpacity>
        </View>

        {/* PRO Plan */}
        <View style={[styles.planCard, styles.proPlan]}>
          <Text style={styles.planName}>PRO</Text>
          <Text style={styles.price}>€9.99/week</Text>

          <View style={styles.featureList}>
            <FeatureRow text="unlimited messages" included={true} />
            <FeatureRow text="unlock all characters" included={true} />
            <FeatureRow text="long-term memory" included={true} />
            <FeatureRow text="voice & phone calls" included={true} />
          </View>

          <TouchableOpacity style={styles.proButton} onPress={onStartPro}>
            <Text style={styles.proButtonText}>start pro</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function FeatureRow({ text, included }: { text: string; included: boolean }) {
  return (
    <View style={styles.featureRow}>
      <Text style={[styles.featureText, !included && styles.disabledText]}>
        {included ? '✓' : '—'} {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.xxl,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: Theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
  },
  pricingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Theme.spacing.m,
    maxWidth: 800,
    alignSelf: 'center',
  },
  planCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: Theme.borderRadius.m,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: Theme.spacing.l,
    width: '100%',
    maxWidth: 350,
  },
  proPlan: {
    borderColor: Theme.colors.primary,
    borderWidth: 2,
  },
  planName: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: Theme.colors.text.secondary,
    textTransform: 'uppercase',
    marginBottom: Theme.spacing.s,
  },
  price: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.l,
  },
  featureList: {
    marginBottom: Theme.spacing.l,
  },
  featureRow: {
    marginBottom: Theme.spacing.s,
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Theme.colors.text.primary,
  },
  disabledText: {
    color: Theme.colors.text.muted,
  },
  freeButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 14,
    borderRadius: Theme.borderRadius.m,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.primary,
  },
  freeButtonText: {
    color: Theme.colors.primary,
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
  proButton: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: 14,
    borderRadius: Theme.borderRadius.m,
    alignItems: 'center',
  },
  proButtonText: {
    color: '#000000',
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
});
