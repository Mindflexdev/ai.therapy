import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import { Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { Outfit_400Regular, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Theme } from '../src/constants/Theme';

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
import { useRouter } from 'expo-router';

// Handles redirect after OAuth login (Google OAuth does a full-page redirect,
// so we persist the selected therapist and navigate to chat once session is detected)
function OAuthRedirectHandler() {
    const { isLoggedIn, loading, pendingTherapist } = useAuth();
    const router = useRouter();
    const hasRedirected = useRef(false);

    useEffect(() => {
        if (!loading && isLoggedIn && pendingTherapist?.name && !hasRedirected.current) {
            hasRedirected.current = true;
            // Don't clear pendingTherapist here — chat.tsx needs the pendingMessage
            // Chat screen will clear it after restoring the draft message
            router.replace({
                pathname: '/(main)/chat',
                params: { name: pendingTherapist.name }
            });
        }
    }, [isLoggedIn, loading, pendingTherapist]);

    return null;
}

function RootLayoutNav() {
    return (
        <AuthProvider>
            <ThemeProvider value={DarkTheme}>
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
        </AuthProvider>
    );
}
