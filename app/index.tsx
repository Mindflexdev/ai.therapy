import { useState, useRef } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Image, Text, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '../src/constants/Theme';
import { useAuth } from '../src/context/AuthContext';
import { LandingHeader } from '../src/components/LandingHeader';
import { LandingDrawer } from '../src/components/LandingDrawer';
import { HeroSection } from '../src/components/sections/HeroSection';
import { FeaturesSection } from '../src/components/sections/FeaturesSection';
import { PricingSection } from '../src/components/sections/PricingSection';
import { FAQSection } from '../src/components/sections/FAQSection';
import { Footer } from '../src/components/sections/Footer';

const THERAPISTS = [
  { id: '1', name: 'Marcus', image: require('../assets/characters/marcus.jpg') },
  { id: '2', name: 'Sarah', image: require('../assets/characters/sarah.jpg') },
  { id: '3', name: 'Liam', image: require('../assets/characters/liam.jpg') },
  { id: '4', name: 'Emily', image: require('../assets/characters/emily.jpg') },
];

export default function Onboarding() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [sectionLayouts, setSectionLayouts] = useState<Record<string, number>>({});
  const router = useRouter();
  const { selectTherapist, isLoggedIn, loading, pendingTherapist } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);

  // If returning from OAuth redirect with a pending therapist, show a loading screen
  // while the OAuthRedirectHandler in _layout.tsx navigates to chat.
  // Also show it while auth is still loading with a pending therapist (prevents flash of landing page).
  if (pendingTherapist?.name && (loading || isLoggedIn)) {
    return (
      <View style={styles.loadingContainer}>
        <Image
          source={require('../assets/logo_ai.png')}
          style={styles.loadingLogo}
          resizeMode="contain"
        />
        <Text style={styles.loadingBrand}>
          <Text style={styles.loadingBrandWhite}>ai</Text>
          <Text style={styles.loadingBrandGold}>.</Text>
          <Text style={styles.loadingBrandWhite}>therapy</Text>
        </Text>
        <ActivityIndicator size="small" color={Theme.colors.primary} style={{ marginTop: 24 }} />
      </View>
    );
  }

  const handleSelectTherapist = (therapist: any) => {
    setSelectedId(therapist.id);
    selectTherapist(therapist.id);

    setTimeout(() => {
      router.push({
        pathname: '/(main)/chat',
        params: { name: therapist.name, image: therapist.image }
      });
    }, 400);
  };

  const handleNavigateToSection = (sectionId: string) => {
    const yPosition = sectionLayouts[sectionId];
    if (yPosition !== undefined && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: yPosition, animated: true });
    }
  };

  const handleSectionLayout = (sectionId: string, y: number) => {
    setSectionLayouts(prev => ({ ...prev, [sectionId]: y }));
  };

  const handleFreeTrial = () => {
    if (THERAPISTS.length > 0) {
      handleSelectTherapist(THERAPISTS[0]);
    }
  };

  const handleStartPro = () => {
    router.push('/(main)/paywall');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LandingHeader onMenuPress={() => setDrawerVisible(true)} />

      <ScrollView ref={scrollViewRef} style={styles.scrollView}>
        <View onLayout={(e) => handleSectionLayout('hero', e.nativeEvent.layout.y)}>
          <HeroSection
            therapists={THERAPISTS}
            selectedId={selectedId}
            onSelectTherapist={handleSelectTherapist}
          />
        </View>

        <View onLayout={(e) => handleSectionLayout('features', e.nativeEvent.layout.y)}>
          <FeaturesSection />
        </View>

        <View onLayout={(e) => handleSectionLayout('pricing', e.nativeEvent.layout.y)}>
          <PricingSection
            onFreeTrial={handleFreeTrial}
            onStartPro={handleStartPro}
          />
        </View>

        <View onLayout={(e) => handleSectionLayout('faq', e.nativeEvent.layout.y)}>
          <FAQSection />
        </View>

        <Footer />
      </ScrollView>

      <LandingDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        onNavigate={handleNavigateToSection}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingLogo: {
    width: 80,
    height: 80,
  },
  loadingBrand: {
    fontSize: 32,
    fontFamily: 'Outfit-Regular',
    marginTop: 8,
  },
  loadingBrandWhite: {
    color: Theme.colors.text.primary,
  },
  loadingBrandGold: {
    color: Theme.colors.primary,
  },
});
