import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
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
  const router = useRouter();
  const segments = useSegments();

  // Check initial session and listen for auth changes
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const [sessionResponse, skipLoginValue] = await Promise.all([
          supabase.auth.getSession(),
          AsyncStorage.getItem('skipLogin')
        ]);

        const currentSession = sessionResponse.data.session;
        const currentSkipLogin = skipLoginValue === 'true';

        setSession(currentSession);
        setSkipLogin(currentSkipLogin);

        if (currentSession) {
          const { data } = await supabase
            .from('users')
            .select('onboarding_completed')
            .eq('id', currentSession.user.id)
            .single();
          setIsOnboardingCompleted(data?.onboarding_completed ?? false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setShowLoading(false);
        SplashScreen.hideAsync();
        setIsReady(true);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Auth state changed:', _event, session ? 'Logged in' : 'Not logged in');
      setSession(session);

      if (session) {
        AsyncStorage.removeItem('skipLogin');
        setSkipLogin(false);

        // Fetch onboarding status on auth change
        const { data } = await supabase
          .from('users')
          .select('onboarding_completed')
          .eq('id', session.user.id)
          .single();
        setIsOnboardingCompleted(data?.onboarding_completed ?? false);
      } else {
        setIsOnboardingCompleted(false);
      }
    });

    return () => subscription.unsubscribe();
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

      const inAuthGroup = segments[0] === 'sign-in';
      const inOnboardingGroup = segments[0] === 'onboarding';
      const inTabsGroup = segments[0] === '(tabs)';

      console.log('Navigation check:', { session: !!session, isOnboardingCompleted, skipLogin, inAuthGroup, inTabsGroup, segments });

      if (session) {
        // User is signed in
        if (inAuthGroup) {
          // Just logged in from sign-in page
          if (isOnboardingCompleted) {
            router.replace('/(tabs)');
          } else {
            router.replace('/(tabs)'); // TabLayout will redirect to onboarding if needed
          }
        } else if (inOnboardingGroup) {
          // In onboarding, only redirect out if completed
          if (isOnboardingCompleted) {
            router.replace('/(tabs)');
          }
        }
        // If already in tabs, do nothing (prevent redirect loop)
      } else if (skipLogin) {
        // Skipped login
        if (inAuthGroup) {
          router.replace('/(tabs)');
        }
      } else {
        // Not signed in and not skipped
        if (!inAuthGroup && inTabsGroup) {
          // Trying to access tabs without auth
          console.log('Redirecting to sign-in');
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
