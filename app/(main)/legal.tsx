import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Theme } from '../../src/constants/Theme';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Lock, FileText, Cookie, ShieldCheck, Menu, AlignLeft, AlignRight } from 'lucide-react-native';

type LegalSection = 'privacy' | 'terms' | 'cookies' | 'imprint';

export default function LegalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedSection, setSelectedSection] = useState<LegalSection>(
    (params.section as LegalSection) || 'privacy'
  );

  const sections = [
    { id: 'privacy' as LegalSection, title: 'Privacy Policy', icon: Lock },
    { id: 'terms' as LegalSection, title: 'Terms of Use', icon: FileText },
    { id: 'cookies' as LegalSection, title: 'Cookie Policy', icon: Cookie },
    { id: 'imprint' as LegalSection, title: 'Imprint', icon: ShieldCheck },
  ];

  const renderContent = () => {
    switch (selectedSection) {
      case 'privacy':
        return <PrivacyContent />;
      case 'terms':
        return <TermsContent />;
      case 'cookies':
        return <CookiesContent />;
      case 'imprint':
        return <ImprintContent />;
      default:
        return <PrivacyContent />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={28} color={Theme.colors.text.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.brandingContainer}
          onPress={() => router.replace('/')}
          activeOpacity={0.7}
        >
          <View style={styles.logoContainer}>
            <Image source={require('../../assets/logo_ai.png')} style={styles.logoImage} />
            <Text style={styles.logo}>
              <Text style={styles.logoWhite}>ai</Text>
              <Text style={styles.logoDot}>.</Text>
              <Text style={styles.logoWhite}>therapy</Text>
            </Text>
          </View>
          <Text style={styles.slogan}>(not real therapy)</Text>
        </TouchableOpacity>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.tabBar}>
        {sections.map((section) => {
          const Icon = section.icon;
          const isSelected = selectedSection === section.id;
          return (
            <TouchableOpacity
              key={section.id}
              style={[styles.tabItem, isSelected && styles.tabItemSelected]}
              onPress={() => setSelectedSection(section.id)}
            >
              <Icon
                size={18}
                color={isSelected ? Theme.colors.primary : Theme.colors.text.secondary}
              />
              <Text style={[styles.tabText, isSelected && styles.tabTextSelected]}>
                {section.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.mainContainer}>
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {renderContent()}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// Privacy Policy Content
function PrivacyContent() {
  return (
    <>
      <Text style={styles.heading}>Privacy Policy</Text>
      <Text style={styles.updated}>Last updated: 17.02.2026</Text>

      <Text style={styles.heading}>1. Controller</Text>
      <Text style={styles.body}>
        The controller responsible for data processing is:
        {'\n\n'}
        Mindflex UG (haftungsbeschränkt){'\n'}
        Mariendorfer Damm 85{'\n'}
        12109 Berlin{'\n'}
        Germany
        {'\n\n'}
        Commercial Register: Amtsgericht Berlin-Charlottenburg{'\n'}
        HRB 276989 B{'\n'}
        VAT ID: DE456508601
        {'\n\n'}
        Email: hello@ai.therapy.free{'\n'}
        Website: https://ai.therapy.free
        {'\n\n'}
        Managing Directors:{'\n'}
        Felix Mai{'\n'}
        Moritz Tiedemann{'\n'}
        Julian Hecht
      </Text>

      <Text style={styles.heading}>2. Data Protection Officer</Text>
      <Text style={styles.body}>
        We have appointed a Data Protection Officer:
        {'\n\n'}
        heyData GmbH{'\n'}
        Schützenstraße 5{'\n'}
        10117 Berlin{'\n'}
        Germany
        {'\n\n'}
        Email: datenschutz@heydata.eu
      </Text>

      <Text style={styles.heading}>3. Overview of Data Processing</Text>
      <Text style={styles.body}>
        We process personal data when you:{'\n'}
        • visit our website{'\n'}
        • create an account{'\n'}
        • use the AI chat service{'\n'}
        • subscribe to paid services{'\n'}
        • contact us{'\n'}
        • interact with platform features
        {'\n\n'}
        Personal data means any information that identifies you.
      </Text>

      <Text style={styles.heading}>4. Legal Basis for Processing (GDPR)</Text>
      <Text style={styles.body}>
        We process personal data based on the following legal grounds:
        {'\n\n'}
        Art. 6(1)(b) GDPR – Contract performance{'\n'}
        To provide and operate the platform.
        {'\n\n'}
        Art. 6(1)(f) GDPR – Legitimate interest{'\n'}
        To improve, secure, and maintain the service.
        {'\n\n'}
        Art. 6(1)(a) GDPR – Consent{'\n'}
        Where required, such as analytics or optional features.
        {'\n\n'}
        Art. 6(1)(c) GDPR – Legal obligation{'\n'}
        To comply with legal requirements.
      </Text>

      <Text style={styles.heading}>5. Your Rights Under GDPR</Text>
      <Text style={styles.body}>
        You have the right to:{'\n'}
        • access your data (Art. 15 GDPR){'\n'}
        • correct inaccurate data (Art. 16 GDPR){'\n'}
        • delete your data (Art. 17 GDPR){'\n'}
        • restrict processing (Art. 18 GDPR){'\n'}
        • data portability (Art. 20 GDPR){'\n'}
        • object to processing (Art. 21 GDPR){'\n'}
        • withdraw consent (Art. 7 GDPR)
        {'\n\n'}
        To exercise your rights, contact: hello@ai.therapy.free
      </Text>
    </>
  );
}

// Terms of Use Content
function TermsContent() {
  return (
    <>
      <Text style={styles.heading}>Terms of Use</Text>
      <Text style={styles.updated}>Last updated: 17.02.2026</Text>

      <Text style={styles.heading}>1. Provider</Text>
      <Text style={styles.body}>
        These Terms of Use govern the use of the ai.therapy platform.
        {'\n\n'}
        Provider of the platform is:
        {'\n\n'}
        Mindflex UG (haftungsbeschränkt){'\n'}
        Mariendorfer Damm 85{'\n'}
        12109 Berlin{'\n'}
        Germany
        {'\n\n'}
        Commercial Register: Amtsgericht Berlin-Charlottenburg{'\n'}
        HRB 276989 B
      </Text>

      <Text style={styles.heading}>2. Scope of Application</Text>
      <Text style={styles.body}>
        These Terms apply to all users accessing the platform.
        {'\n\n'}
        By using the service, you agree to these Terms.
      </Text>

      <Text style={styles.heading}>3. Nature of the Service</Text>
      <Text style={styles.body}>
        ai.therapy is an AI-powered conversational platform.
        {'\n\n'}
        Important: This is NOT a medical service, healthcare service, or psychotherapy service. It is NOT a replacement for professional mental health care.
        {'\n\n'}
        The platform uses artificial intelligence to provide conversational support only.
      </Text>

      <Text style={styles.heading}>4. User Account</Text>
      <Text style={styles.body}>
        You may be required to create an account to use certain features.
        {'\n\n'}
        You are responsible for:{'\n'}
        • maintaining the confidentiality of your account{'\n'}
        • all activities under your account{'\n'}
        • ensuring your information is accurate
      </Text>

      <Text style={styles.heading}>5. Acceptable Use</Text>
      <Text style={styles.body}>
        You agree NOT to:{'\n'}
        • use the platform for illegal purposes{'\n'}
        • violate the rights of others{'\n'}
        • attempt to interfere with platform operation{'\n'}
        • upload malicious content{'\n'}
        • impersonate others
      </Text>

      <Text style={styles.heading}>6. Contact</Text>
      <Text style={styles.body}>
        Email: hello@ai.therapy.free
      </Text>
    </>
  );
}

// Cookie Policy Content
function CookiesContent() {
  return (
    <>
      <Text style={styles.heading}>Cookie Policy</Text>
      <Text style={styles.updated}>Last updated: 17.02.2026</Text>

      <Text style={styles.heading}>1. What are cookies?</Text>
      <Text style={styles.body}>
        Cookies are small text files that are stored on your device when you visit a website or use an online service.
        {'\n\n'}
        Cookies help ensure the platform functions correctly, securely, and efficiently.
      </Text>

      <Text style={styles.heading}>2. Controller</Text>
      <Text style={styles.body}>
        The controller responsible for data processing is:
        {'\n\n'}
        Mindflex UG (haftungsbeschränkt){'\n'}
        Mariendorfer Damm 85{'\n'}
        12109 Berlin{'\n'}
        Germany
        {'\n\n'}
        Email: hello@ai.therapy.free{'\n'}
        Website: https://ai.therapy.free
      </Text>

      <Text style={styles.heading}>3. Categories of cookies we use</Text>

      <Text style={styles.subheading}>3.1 Strictly necessary cookies</Text>
      <Text style={styles.body}>
        These cookies are essential for the operation and security of the platform.
        {'\n\n'}
        Without these cookies, the platform cannot function properly.
        {'\n\n'}
        Legal basis: Article 6(1)(b) GDPR (contract performance) and Article 6(1)(f) GDPR (legitimate interest).
      </Text>

      <Text style={styles.subheading}>3.2 Functional cookies</Text>
      <Text style={styles.body}>
        Functional cookies help improve the usability and performance of the platform.
        {'\n\n'}
        Legal basis: Article 6(1)(f) GDPR or Article 6(1)(a) GDPR where consent is required.
      </Text>

      <Text style={styles.subheading}>3.3 Analytics cookies</Text>
      <Text style={styles.body}>
        Analytics cookies help us understand how users interact with the platform.
        {'\n\n'}
        Analytics cookies are only used if you provide consent.
        {'\n\n'}
        Legal basis: Article 6(1)(a) GDPR (consent).
      </Text>

      <Text style={styles.heading}>4. Managing cookies</Text>
      <Text style={styles.body}>
        You can control and manage cookies through your browser settings.
        {'\n\n'}
        Please note that disabling strictly necessary cookies may prevent the platform from functioning properly.
      </Text>

      <Text style={styles.heading}>5. Contact</Text>
      <Text style={styles.body}>
        Email: hello@ai.therapy.free
      </Text>
    </>
  );
}

// Imprint Content
function ImprintContent() {
  return (
    <>
      <Text style={styles.heading}>Imprint</Text>
      <Text style={styles.updated}>Last updated: 17.02.2026</Text>
      <Text style={styles.subheading}>Information pursuant to Section 5 of the German Digital Services Act (DDG)</Text>

      <Text style={styles.sectionTitle}>Service Provider</Text>
      <Text style={styles.body}>
        Mindflex UG (haftungsbeschränkt){'\n'}
        Mariendorfer Damm 85{'\n'}
        12109 Berlin{'\n'}
        Germany
      </Text>

      <Text style={styles.sectionTitle}>Commercial Register</Text>
      <Text style={styles.body}>
        Registered in the Commercial Register{'\n'}
        Register Court: Local Court (Amtsgericht) Berlin-Charlottenburg{'\n'}
        Registration Number: HRB 276989 B
      </Text>

      <Text style={styles.sectionTitle}>Represented by the Managing Directors</Text>
      <Text style={styles.body}>
        Felix Mai{'\n'}
        Moritz Tiedemann{'\n'}
        Julian Hecht
      </Text>

      <Text style={styles.sectionTitle}>Contact</Text>
      <Text style={styles.body}>
        Email: hello@ai.therapy.free{'\n'}
        Website: https://ai.therapy.free
      </Text>

      <Text style={styles.sectionTitle}>VAT Identification Number</Text>
      <Text style={styles.body}>
        VAT Identification Number pursuant to Section 27a of the German VAT Act:{'\n'}
        DE456508601
      </Text>

      <Text style={styles.sectionTitle}>Responsible for Content pursuant to Section 18 (2) German State Media Treaty (MStV)</Text>
      <Text style={styles.body}>
        Mindflex UG (haftungsbeschränkt){'\n'}
        Mariendorfer Damm 85{'\n'}
        12109 Berlin{'\n'}
        Germany
        {'\n\n'}
        Represented by the Managing Directors Felix Mai, Moritz Tiedemann, Julian Hecht
      </Text>
    </>
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
  brandingContainer: {
    alignItems: 'center',
    marginTop: -10,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  slogan: {
    fontSize: 10,
    color: Theme.colors.text.secondary,
    fontFamily: 'Outfit-Regular',
    marginTop: -20,
    marginLeft: 60,
  },
  logoImage: {
    width: 60,
    height: 60,
    marginTop: 10,
  },
  logo: {
    fontSize: 28,
    fontFamily: 'Outfit-Regular',
  },
  logoWhite: {
    color: Theme.colors.text.primary,
  },
  logoDot: {
    color: Theme.colors.primary,
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(235, 206, 128, 0.2)',
    paddingVertical: Theme.spacing.s,
    justifyContent: 'center',
    gap: Theme.spacing.s,
    flexWrap: 'wrap',
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.m,
    paddingHorizontal: Theme.spacing.m,
    gap: Theme.spacing.s,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabItemSelected: {
    borderBottomColor: Theme.colors.primary,
  },
  tabText: {
    color: Theme.colors.text.secondary,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  tabTextSelected: {
    color: Theme.colors.primary,
    fontFamily: 'Inter-Bold',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  contentContainer: {
    padding: Theme.spacing.xl,
    maxWidth: 1500,
    width: '100%',
    alignSelf: 'center',
  },
  updated: {
    color: Theme.colors.text.muted,
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginBottom: Theme.spacing.l,
    fontStyle: 'italic',
  },
  heading: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: Theme.colors.primary,
    marginTop: Theme.spacing.l,
    marginBottom: Theme.spacing.m,
  },
  subheading: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: Theme.colors.text.primary,
    marginTop: Theme.spacing.m,
    marginBottom: Theme.spacing.s,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: Theme.colors.text.primary,
    marginTop: Theme.spacing.l,
    marginBottom: Theme.spacing.s,
  },
  body: {
    color: Theme.colors.text.secondary,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 24,
    marginBottom: Theme.spacing.m,
  },
});
