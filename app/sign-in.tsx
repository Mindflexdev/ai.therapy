import { LoadingDots } from '@/components/loading-dots';
import { LogoWithDots } from '@/components/logo-with-dots';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function SignInScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [loading, setLoading] = useState(false);

    const handleSignIn = async (provider: 'google' | 'facebook' | 'apple') => {
        setLoading(true);
        try {
            const redirectTo = Platform.OS === 'web'
                ? window.location.origin // For web, redirect back to current origin
                : 'therapyai://login-callback'; // For mobile, use deep link

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: provider,
                options: {
                    redirectTo: redirectTo,
                },
            });

            if (error) throw error;

            // On web, the redirect happens automatically
            // On mobile, navigation happens via onAuthStateChange listener in _layout.tsx
        } catch (error) {
            console.error('Error signing in:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            alert(`Sign-in failed: ${errorMessage}`);
            setLoading(false);
        }
    };

    const handleSkipAuth = async () => {
        console.log('Skip login clicked');
        setLoading(true);
        try {
            // Set skip login flag in AsyncStorage
            await AsyncStorage.setItem('skipLogin', 'true');
            console.log('Skip login flag set in AsyncStorage');

            // Verify it was set
            const value = await AsyncStorage.getItem('skipLogin');
            console.log('Verified skip login value:', value);

            // Small delay to ensure storage is written
            await new Promise(resolve => setTimeout(resolve, 500));

            // Navigate to app
            console.log('Navigating to tabs...');
            router.replace('/(tabs)');
        } catch (error) {
            console.error('Error skipping auth:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <LogoWithDots fontSize={32} color="#2D3436" />
                <LoadingDots />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {/* Logo Section */}
                <View style={styles.logoContainer}>
                    <LogoWithDots fontSize={24} color="#1a1a1a" />
                </View>

                {/* Hero Image - Centered */}
                <View style={styles.heroContainer}>
                    <Image
                        source={require('@/assets/images/characters-hero.png')}
                        style={styles.heroImage}
                        contentFit="contain"
                    />
                </View>

                {/* Auth Buttons */}
                <View style={styles.authContainer}>
                    <TouchableOpacity
                        style={styles.authButton}
                        onPress={() => handleSignIn('google')}
                        disabled={loading}
                    >
                        <FontAwesome name="google" size={20} color="#DB4437" style={styles.authIcon} />
                        <ThemedText style={styles.authButtonText}>Sign in with Google</ThemedText>
                    </TouchableOpacity>

                    {/* Hidden - Set to true to reactivate */}
                    {false && (
                        <TouchableOpacity
                            style={styles.authButton}
                            onPress={() => handleSignIn('facebook')}
                            disabled={loading}
                        >
                            <FontAwesome name="facebook" size={20} color="#4267B2" style={styles.authIcon} />
                            <ThemedText style={styles.authButtonText}>Sign in with Facebook</ThemedText>
                        </TouchableOpacity>
                    )}

                    {/* Hidden - Set to true to reactivate */}
                    {false && (
                        <TouchableOpacity
                            style={styles.authButton}
                            onPress={() => handleSignIn('apple')}
                            disabled={loading}
                        >
                            <FontAwesome name="apple" size={20} color="#000" style={styles.authIcon} />
                            <ThemedText style={styles.authButtonText}>Sign in with Apple</ThemedText>
                        </TouchableOpacity>
                    )}

                    {/* Hidden - Set to true to reactivate */}
                    {false && (
                        <TouchableOpacity
                            style={[styles.authButton, { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#ccc', elevation: 0 }]}
                            onPress={handleSkipAuth}
                            disabled={loading}
                        >
                            <FontAwesome name="user-secret" size={20} color="#666" style={styles.authIcon} />
                            <ThemedText style={[styles.authButtonText, { color: '#666' }]}>Skip Login (Test Mode)</ThemedText>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={{ height: 40 }} />
            </View>
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },

    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'space-between',
    },
    logoContainer: {
        marginTop: 60,
        alignItems: 'flex-start',
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    logo: {
        width: 40,
        height: 40,
        borderRadius: 10,
    },
    logoText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a1a1a',
        letterSpacing: 1,
    },
    heroContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    heroImage: {
        width: '100%',
        height: '100%',
        maxWidth: 500,
        maxHeight: 500,
    },
    authContainer: {
        gap: 16,
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
    },
    authButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 30,
        width: '100%',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 3,
    },
    authIcon: {
        marginRight: 12,
        width: 24,
        textAlign: 'center',
    },
    authButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
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
