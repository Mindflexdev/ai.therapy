import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import { Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { Outfit_400Regular, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { Stack } from 'expo-router';
import Head from 'expo-router/head';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Theme } from '../src/constants/Theme';
import * as Linking from 'expo-linking';
import { supabase } from '../src/lib/supabase';

export {
    // Catch any errors thrown by the Layout component.
    ErrorBoundary,
} from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [loaded, error] = useFonts({
        'Playfair-Bold': PlayfairDisplay_700Bold,
        'Inter-Regular': Inter_400Regular,
        'Inter-Bold': Inter_700Bold,
        'Outfit-Regular': Outfit_400Regular,
        'Outfit-Bold': Outfit_700Bold,
    });

    useEffect(() => {
        if (error) throw error;
    }, [error]);

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    return <RootLayoutNav />;
}

import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { SubscriptionProvider } from '../src/context/SubscriptionContext';
import { useRouter } from 'expo-router';

// Handle deep links on native:
// 1. OAuth callbacks (access_token in URL)
// 2. Character deep links (e.g. ai-therapy:///chat?name=Marcus)
function NativeDeepLinkHandler() {
    const router = useRouter();

    useEffect(() => {
        if (Platform.OS === 'web') return;

        const handleUrl = async (event: { url: string }) => {
            const url = event.url;
            if (!url) return;

            // OAuth callback — set session tokens
            if (url.includes('access_token')) {
                const params = new URLSearchParams(url.split('#')[1] || '');
                const accessToken = params.get('access_token');
                const refreshToken = params.get('refresh_token');
                if (accessToken && refreshToken) {
                    await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken,
                    });
                }
                return;
            }

            // Character deep link — e.g. ai-therapy:///chat?name=Marcus
            try {
                const parsed = new URL(url);
                const path = parsed.pathname?.replace(/^\/+/, ''); // strip leading slashes
                const name = parsed.searchParams?.get('name');

                if (path === 'chat' && name) {
                    router.replace({
                        pathname: '/(main)/chat',
                        params: { name },
                    });
                }
                // For root URL (ai-therapy:///) — let Expo Router handle normally (→ index)
            } catch (e) {
                // Malformed URL — ignore
            }
        };

        // Check if the app was opened with a deep link URL
        Linking.getInitialURL().then((url) => {
            if (url) handleUrl({ url });
        });

        // Listen for subsequent deep links while app is running
        const subscription = Linking.addEventListener('url', handleUrl);
        return () => subscription.remove();
    }, []);

    return null;
}

// Handles redirect after OAuth login (Google OAuth does a full-page redirect,
// so we persist the selected therapist and navigate to chat once session is detected)
function OAuthRedirectHandler() {
    const { isLoggedIn, loading, pendingTherapist, pendingTherapistLoaded } = useAuth();
    const router = useRouter();
    const hasRedirected = useRef(false);

    useEffect(() => {
        // Wait for BOTH auth session AND pendingTherapist to be loaded
        // before making any redirect decision.
        if (!loading && pendingTherapistLoaded && isLoggedIn && !hasRedirected.current) {
            hasRedirected.current = true;
            router.replace({
                pathname: '/(main)/chat',
                params: pendingTherapist?.name ? { name: pendingTherapist.name } : {}
            });
        }
    }, [isLoggedIn, loading, pendingTherapist, pendingTherapistLoaded]);

    return null;
}

function RootLayoutNav() {
    return (
        <AuthProvider>
            <SubscriptionProvider>
                <ThemeProvider value={DarkTheme}>
                    {Platform.OS === 'web' && (
                        <Head>
                            <link rel="apple-touch-icon" sizes="180x180" href="/assets/favicons/apple-touch-icon.png" />
                            <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicons/favicon-32x32.png" />
                            <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicons/favicon-16x16.png" />
                            <link rel="manifest" href="/assets/favicons/site.webmanifest" />
                            <meta name="apple-mobile-web-app-capable" content="yes" />
                            <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                            <meta name="apple-mobile-web-app-title" content="ai.therapy" />
                        </Head>
                    )}
                    <NativeDeepLinkHandler />
                    <OAuthRedirectHandler />
                    <Stack
                        screenOptions={{
                            headerShown: false,
                            contentStyle: { backgroundColor: Theme.colors.background },
                        }}
                    >
                        <Stack.Screen name="index" options={{ headerShown: false }} />
                        <Stack.Screen name="(main)" options={{ presentation: 'transparentModal', headerShown: false }} />
                    </Stack>
                    <StatusBar style="light" />
                </ThemeProvider>
            </SubscriptionProvider>
        </AuthProvider>
    );
}
