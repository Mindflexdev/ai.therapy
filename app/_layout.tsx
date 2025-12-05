import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '@/components/themed-text';
import { supabase } from '@/lib/supabase';
import { LoadingDots } from '@/components/loading-dots';
import { useRouter, useSegments } from 'expo-router';
import { Session } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isReady, setIsReady] = useState(false);

  const [session, setSession] = useState<Session | null>(null);
  const [showLoading, setShowLoading] = useState(true); // Start with loading
  const router = useRouter();
  const segments = useSegments();

  // Check initial session and listen for auth changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session ? 'Logged in' : 'Not logged in');
      setSession(session);
      setShowLoading(false);
      SplashScreen.hideAsync();
      setIsReady(true);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session ? 'Logged in' : 'Not logged in');
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Navigate based on auth state
  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === 'sign-in';
    console.log('Navigation check:', { session: !!session, inAuthGroup, segments });

    if (session && inAuthGroup) {
      // User is signed in but on sign-in page -> redirect to app
      console.log('Redirecting to app (user is signed in)');
      router.replace('/(tabs)');
    } else if (!session && !inAuthGroup) {
      // User is not signed in but trying to access app -> redirect to sign-in
      console.log('Redirecting to sign-in (user not signed in)');
      router.replace('/sign-in');
    }
  }, [session, segments, isReady]);

  // Show loading screen after sign-in
  if (showLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ThemedText style={styles.loadingText}>therapy.ai</ThemedText>
        <LoadingDots />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="sign-in" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="conversation/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="create-character" options={{ headerShown: false }} />
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
