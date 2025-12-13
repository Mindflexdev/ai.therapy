import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { LoadingDots } from '@/components/loading-dots';
import { LogoWithDots } from '@/components/logo-with-dots';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { useRouter, useSegments } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isReady, setIsReady] = useState(false);

  const [session, setSession] = useState<Session | null>(null);
  const [skipLogin, setSkipLogin] = useState(false);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);
  const [showLoading, setShowLoading] = useState(true); // Start with loading
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();
  const segments = useSegments();

  // Use a ref to track if onAuthStateChange has already set a session
  const sessionSetByAuthChange = useRef(false);
  const hasInitialized = useRef(false);

  // Listen for auth changes - this is the PRIMARY auth detection mechanism
  useEffect(() => {
    // Set up auth listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth event:', event, 'Session:', session?.user?.email || 'none', 'Time:', new Date().toISOString());

      // Always update session state
      setSession(session);

      // Mark that we've received an auth event
      if (!hasInitialized.current) {
        hasInitialized.current = true;
        setShowLoading(false);
        SplashScreen.hideAsync().catch(() => { });
        setIsReady(true);
      }

      // Mark that onAuthStateChange has set a session
      if (session) {
        sessionSetByAuthChange.current = true;
        AsyncStorage.removeItem('skipLogin');
        setAuthError(null); // Clear any previous errors
        setSkipLogin(false);

        // SYNC GOOGLE PROFILE: Ensure user profile data is synced to users table
        try {
          const metadata = session.user.user_metadata;
          if (metadata) {
            console.log('🔄 Syncing user profile from metadata...');
            await supabase.from('users').upsert({
              id: session.user.id,
              email: session.user.email,
              full_name: metadata.full_name || metadata.name || null,
              avatar_url: metadata.avatar_url || metadata.picture || null,
              // Keep existing fields if they exist
              updated_at: new Date().toISOString()
            }, { onConflict: 'id' }).select(); // Add .select() to ensure completion
          }
        } catch (e) {
          console.error('Error syncing user profile:', e);
        }

        // Fetch onboarding status
        const { data } = await supabase
          .from('users')
          .select('onboarding_completed')
          .eq('id', session.user.id)
          .single();
        const isCompleted = data?.onboarding_completed ?? false;
        setIsOnboardingCompleted(isCompleted);
        AsyncStorage.setItem('onboarding_completed', String(isCompleted));
        console.log('👤 User onboarding status:', isCompleted);
      } else {
        // Track sign-out events
        if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out');
        }
        setIsOnboardingCompleted(false);
      }
    });

    // Also do a fallback check for skipLogin and cached onboarding status
    const loadCachedState = async () => {
      try {
        const [skipLoginValue, cachedOnboarding] = await Promise.all([
          AsyncStorage.getItem('skipLogin'),
          AsyncStorage.getItem('onboarding_completed')
        ]);

        if (skipLoginValue === 'true') {
          setSkipLogin(true);
          console.log('⏭️ Skip login enabled from cache');
        }
        if (cachedOnboarding !== null) {
          setIsOnboardingCompleted(cachedOnboarding === 'true');
        }
      } catch (e) {
        console.error('Error loading cached state:', e);
      }
    };

    loadCachedState();

    // Fallback timeout - if no auth event received within 10 seconds, proceed anyway
    const fallbackTimeout = setTimeout(() => {
      if (!hasInitialized.current) {
        console.warn('Auth fallback timeout reached - proceeding with no session');
        hasInitialized.current = true;
        setShowLoading(false);
        SplashScreen.hideAsync().catch(() => { });
        setIsReady(true);
      }
    }, 10000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(fallbackTimeout);
    };
  }, []);

  // Navigate based on auth state
  useEffect(() => {
    if (!isReady) return;

    const performNavigationCheck = async () => {
      // Re-check skip login flag whenever we navigate
      const skipLoginValue = await AsyncStorage.getItem('skipLogin');
      const shouldSkip = skipLoginValue === 'true';
      if (shouldSkip !== skipLogin) {
        setSkipLogin(shouldSkip);
      }

      const inAuthGroup = segments[0] === 'sign-in' || segments.length === 0;
      const inOnboardingGroup = segments[0] === 'onboarding';
      const inTabsGroup = segments[0] === '(tabs)';

      console.log('🧭 Navigation check:', {
        session: !!session,
        email: session?.user?.email,
        isOnboardingCompleted,
        skipLogin,
        inAuthGroup,
        inTabsGroup,
        segments: segments.join('/') || 'root'
      });

      if (session) {
        // User is signed in
        if (inAuthGroup) {
          // Just logged in from sign-in page
          console.log('✈️ Redirecting authenticated user from sign-in to app');
          if (isOnboardingCompleted) {
            router.replace('/(tabs)');
          } else {
            router.replace('/(tabs)'); // TabLayout will redirect to onboarding if needed
          }
        } else if (inOnboardingGroup) {
          // In onboarding, only redirect out if completed
          if (isOnboardingCompleted) {
            console.log('✈️ Redirecting from onboarding (completed) to app');
            router.replace('/(tabs)');
          }
        }
        // If already in tabs, do nothing (prevent redirect loop)
      } else if (skipLogin) {
        // Skipped login
        if (inAuthGroup) {
          console.log('✈️ Redirecting skip-login user to app');
          router.replace('/(tabs)');
        }
      } else {
        // Not signed in and not skipped
        if (!inAuthGroup && inTabsGroup) {
          // Trying to access tabs without auth
          console.log('🚫 Redirecting to sign-in (no auth)');
          router.replace('/sign-in');
        }
      }
    };

    performNavigationCheck();
  }, [session, skipLogin, isOnboardingCompleted, segments, isReady]);

  // Show loading screen after sign-in
  if (showLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LogoWithDots fontSize={32} color="#2D3436" />
        <LoadingDots />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="sign-in" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen
          name="onboarding/language"
          options={{
            headerShown: false,
            presentation: 'transparentModal',
            animation: 'fade',
            contentStyle: { backgroundColor: 'transparent' }
          }}
        />
        <Stack.Screen
          name="onboarding/goals"
          options={{
            headerShown: false,
            presentation: 'transparentModal',
            animation: 'fade',
            contentStyle: { backgroundColor: 'transparent' }
          }}
        />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="conversation/[id]" options={{ headerShown: false }} />

        <Stack.Screen
          name="player"
          options={{
            headerShown: false,
            presentation: 'modal',
            animation: 'slide_from_bottom'
          }}
        />
        <Stack.Screen
          name="tracking-detail"
          options={{
            headerShown: false,
            animation: 'slide_from_right'
          }}
        />
        <Stack.Screen
          name="feedback"
          options={{
            headerShown: false,
            animation: 'slide_from_right'
          }}
        />
        <Stack.Screen
          name="subscribe"
          options={{
            headerShown: false,
            animation: 'slide_from_bottom'
          }}
        />
        <Stack.Screen
          name="therapy-detail-modal"
          options={{
            headerShown: false,
            presentation: 'modal',
            animation: 'slide_from_bottom'
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2D3436',
  },
});
