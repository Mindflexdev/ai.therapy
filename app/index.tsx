import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Theme } from '../src/constants/Theme';
import { TherapistCard } from '../src/components/TherapistCard';

const THERAPISTS = [
  { id: '1', name: 'Marcus', image: require('../assets/characters/marcus.jpg') },
  { id: '2', name: 'Sarah', image: require('../assets/characters/sarah.jpg') },
  { id: '3', name: 'Liam', image: require('../assets/characters/liam.jpg') },
  { id: '4', name: 'Emily', image: require('../assets/characters/emily.jpg') },
];

export default function Onboarding() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const router = useRouter();

  const handleSelect = (therapist: any) => {
    setSelectedId(therapist.id);
    // Short delay for the glow effect to be visible
    setTimeout(() => {
      router.push({
        pathname: '/(main)/chat',
        params: { name: therapist.name, image: therapist.image }
      });
    }, 400);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.logo}>ai.therapy</Text>
          <Text style={styles.slogan}>not real therapy</Text>
        </View>

        <Text style={styles.title}>When you cant{"\n"}talk to humans...</Text>

        <View style={styles.grid}>
          {THERAPISTS.map((t) => (
            <TherapistCard
              key={t.id}
              therapist={t}
              isSelected={selectedId === t.id}
              onSelect={() => handleSelect(t)}
            />
          ))}
        </View>

        <Text style={styles.footerText}>...choose one!</Text>
      </ScrollView>

      <View style={styles.disclaimerContainer}>
        <Text style={styles.disclaimer}>
          By exchanging messages with ChatGPT, an AI chatbot, you agree to our{' '}
          <Text style={styles.link}>Terms of Use</Text> and confirm that you have read our{' '}
          <Text style={styles.link}>Privacy Policy</Text>. See{' '}
          <Text style={styles.link}>Cookie Preferences</Text>.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollContent: {
    padding: Theme.spacing.l,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginTop: Theme.spacing.xl,
    marginBottom: Theme.spacing.xxl,
  },
  logo: {
    fontSize: 24,
    color: Theme.colors.primary,
    fontFamily: 'Playfair-Bold',
  },
  slogan: {
    fontSize: 12,
    color: Theme.colors.text.secondary,
    fontFamily: 'Inter-Regular',
    marginTop: -4,
  },
  title: {
    fontSize: 32,
    color: Theme.colors.text.primary,
    fontFamily: 'Playfair-Bold',
    textAlign: 'center',
    marginBottom: Theme.spacing.xxl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  footerText: {
    fontSize: 20,
    color: Theme.colors.text.primary,
    fontFamily: 'Playfair-Bold',
    marginTop: Theme.spacing.l,
    marginBottom: Theme.spacing.xl,
  },
  disclaimerContainer: {
    padding: Theme.spacing.m,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    backgroundColor: Theme.colors.background,
  },
  disclaimer: {
    fontSize: 11,
    color: Theme.colors.text.muted,
    textAlign: 'center',
    lineHeight: 16,
  },
  link: {
    color: Theme.colors.text.secondary,
    textDecorationLine: 'underline',
  },
});
