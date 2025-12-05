import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { LoadingDots } from '@/components/loading-dots';
import { ThemedText } from '@/components/themed-text';
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
  const [showLoading, setShowLoading] = useState(true); // Start with loading
  const router = useRouter();
  const segments = useSegments();

  // Check initial session and listen for auth changes
  useEffect(() => {
    // Get initial session and skip login flag
    Promise.all([
      supabase.auth.getSession(),
      AsyncStorage.getItem('skipLogin')
    ]).then(([{ data: { session } }, skipLoginValue]) => {
      console.log('Initial session:', session ? 'Logged in' : 'Not logged in');
      console.log('Skip login:', skipLoginValue === 'true');
      setSession(session);
      setSkipLogin(skipLoginValue === 'true');
      setShowLoading(false);
      SplashScreen.hideAsync();
      setIsReady(true);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session ? 'Logged in' : 'Not logged in');
      setSession(session);
      // Clear skip login if user actually signs in
      if (session) {
        AsyncStorage.removeItem('skipLogin');
        setSkipLogin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Navigate based on auth state
  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === 'sign-in';
    console.log('Navigation check:', { session: !!session, skipLogin, inAuthGroup, segments });

    if ((session || skipLogin) && inAuthGroup) {
      // User is signed in or skipped login but on sign-in page -> redirect to app
      console.log('Redirecting to app (user is signed in or skipped)');
      router.replace('/(tabs)');
    } else if (!session && !skipLogin && !inAuthGroup) {
      // User is not signed in and didn't skip login but trying to access app -> redirect to sign-in
      console.log('Redirecting to sign-in (user not signed in)');
      router.replace('/sign-in');
    }
  }, [session, skipLogin, segments, isReady]);

  // Show loading screen after sign-in
  if (showLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ThemedText style={styles.loadingText}>ai.therapy</ThemedText>
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
