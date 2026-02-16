import React from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Theme } from '../../src/constants/Theme';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, ShieldCheck, Lock, Cookie, FileText } from 'lucide-react-native';

export default function SafetyScreen() {
  const router = useRouter();

  const LegalCard = ({ icon: Icon, title, description, section }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push({ pathname: '/(main)/legal', params: { section } })}
    >
      <View style={styles.cardLeft}>
        <View style={styles.iconContainer}>
          <Icon size={24} color={Theme.colors.primary} />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardDescription}>{description}</Text>
        </View>
      </View>
      <ChevronRight size={20} color={Theme.colors.text.muted} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/')}>
          <ChevronLeft size={28} color={Theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Safety & Legal</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.intro}>
          Your privacy and safety are our top priority. Review our legal documentation to understand how we protect your data and operate our service.
        </Text>

        <View style={styles.section}>
          <LegalCard
            icon={Lock}
            title="Privacy Policy"
            description="Learn how we collect, use, and protect your personal data"
            section="privacy"
          />

          <LegalCard
            icon={FileText}
            title="Terms of Use"
            description="Understand the rules and guidelines for using ai.therapy"
            section="terms"
          />

          <LegalCard
            icon={Cookie}
            title="Cookie Policy"
            description="See how we use cookies and similar technologies"
            section="cookies"
          />

          <LegalCard
            icon={ShieldCheck}
            title="Imprint"
            description="Company information and legal details"
            section="imprint"
          />
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerTitle}>Important Reminder</Text>
          <Text style={styles.disclaimerText}>
            ai.therapy is not a medical service, healthcare service, or psychotherapy service. It is not a replacement for professional mental health care.
            {'\n\n'}
            If you are experiencing a crisis or emergency, please contact emergency services (EU: 112, US: 911) or a licensed healthcare professional immediately.
          </Text>
        </View>

        <View style={styles.contact}>
          <Text style={styles.contactTitle}>Questions?</Text>
          <Text style={styles.contactText}>
            If you have any questions about our legal documentation or privacy practices, please contact us at:
            {'\n\n'}
            hello@ai.therapy.free
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  headerTitle: {
    color: Theme.colors.text.primary,
    fontFamily: 'Inter-Bold',
    fontSize: 20,
  },
  scrollContent: {
    padding: Theme.spacing.xl,
  },
  intro: {
    color: Theme.colors.text.secondary,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: Theme.spacing.xl,
    textAlign: 'center',
  },
  section: {
    marginBottom: Theme.spacing.xl,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: Theme.borderRadius.l,
    padding: Theme.spacing.l,
    marginBottom: Theme.spacing.m,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: Theme.borderRadius.m,
    backgroundColor: 'rgba(235, 206, 128, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.m,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    color: Theme.colors.text.primary,
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    marginBottom: 4,
  },
  cardDescription: {
    color: Theme.colors.text.secondary,
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    lineHeight: 18,
  },
  disclaimer: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderRadius: Theme.borderRadius.l,
    padding: Theme.spacing.l,
    marginBottom: Theme.spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 68, 0.3)',
  },
  disclaimerTitle: {
    color: Theme.colors.danger,
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    marginBottom: Theme.spacing.s,
  },
  disclaimerText: {
    color: Theme.colors.text.secondary,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 22,
  },
  contact: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: Theme.borderRadius.l,
    padding: Theme.spacing.l,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  contactTitle: {
    color: Theme.colors.primary,
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    marginBottom: Theme.spacing.s,
  },
  contactText: {
    color: Theme.colors.text.secondary,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 22,
  },
});
