import { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Image, Text, Platform } from 'react-native';
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
import { SplashAnimation } from '../src/components/SplashAnimation';

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
  const { selectTherapist, isLoggedIn, loading, pendingTherapist, pendingTherapistLoaded } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);

  // Splash animation: show on every visit/refresh
  // Only skip if returning from OAuth redirect or user prefers reduced motion
  const [showSplash, setShowSplash] = useState(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // Skip if returning from OAuth redirect
      if (window.location.hash.includes('access_token')) return false;
      // Skip if user prefers reduced motion
      if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;
    }
    return true;
  });
  const [splashComplete, setSplashComplete] = useState(!showSplash);

  const handleSplashComplete = useCallback(() => {
    setSplashComplete(true);
    setTimeout(() => setShowSplash(false), 100);
  }, []);

  // Detect if we're returning from an OAuth redirect (Supabase puts tokens in the URL hash)
  // While Supabase is parsing these tokens, isLoggedIn is still false — so we need this
  // additional check to show the loading screen instead of flashing the landing page
  const hasOAuthTokensInUrl = Platform.OS === 'web' &&
    typeof window !== 'undefined' &&
    window.location.hash.includes('access_token');

  // While we're still loading auth, pendingTherapist, or processing OAuth tokens, show loading
  // (prevents flash of landing page before we know if we need to redirect)
  if (!pendingTherapistLoaded || loading || hasOAuthTokensInUrl) {
    // If splash hasn't completed yet, use it as the loading screen
    if (showSplash && !splashComplete) {
      return (
        <View style={styles.loadingContainer}>
          <SplashAnimation onComplete={handleSplashComplete} />
        </View>
      );
    }
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

  // If returning from OAuth redirect with a pending therapist, show a loading screen
  // while the OAuthRedirectHandler in _layout.tsx navigates to chat.
  if (pendingTherapist?.name && isLoggedIn) {
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
    selectTherapist(therapist.id, true);

    setTimeout(() => {
      router.push({
        pathname: '/(main)/chat',
        params: { name: therapist.name }
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

      {/* Splash overlay — renders on top of landing page on first visit */}
      {showSplash && !splashComplete && (
        <SplashAnimation onComplete={handleSplashComplete} />
      )}
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
