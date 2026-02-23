import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '../../constants/Theme';
import { TherapistCard } from '../TherapistCard';

interface Therapist {
  id: string;
  name: string;
  image: any;
}

interface Props {
  therapists: Therapist[];
  selectedId: string | null;
  onSelectTherapist: (therapist: Therapist) => void;
}

export function HeroSection({ therapists, selectedId, onSelectTherapist }: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.heading}>
        when you cant talk to humans right now
      </Text>

      <Text style={styles.subheading}>choose one:</Text>

      <View style={styles.grid}>
        {therapists.map((t) => (
          <TherapistCard
            key={t.id}
            therapist={t}
            isSelected={selectedId === t.id}
            onSelect={() => onSelectTherapist(t)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: Theme.spacing.m,
    paddingTop: Theme.spacing.l,
    paddingBottom: Theme.spacing.xxl,
    alignItems: 'center',
  },
  heading: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: Theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: Theme.spacing.l,
    lineHeight: 36,
  },
  subheading: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.m,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Theme.spacing.m,
    width: '100%',
    maxWidth: 600,
  },
});
