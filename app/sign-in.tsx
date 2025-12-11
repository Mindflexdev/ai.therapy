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
import React, { useEffect, useState } from 'react';
import { Dimensions, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function SignInScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [emailSubmitted, setEmailSubmitted] = useState(false);

    useEffect(() => {
        // Preload character images for smoother experience
        const preloadImages = async () => {
            try {
                // Fetch public characters avatars
                const { data } = await supabase
                    .from('characters')
                    .select('avatar')
                    .eq('is_public', true)
                    .limit(20);

                if (data) {
                    const urls = data.map(c => c.avatar).filter(url => url && url.startsWith('http'));
                    // Prefetch in parallel
                    await Promise.all(urls.map(url => Image.prefetch(url)));
                }
            } catch (error) {
                console.log('Error preloading images:', error);
            }
        };

        preloadImages();
    }, []);

    const handleSignIn = async (provider: 'google' | 'facebook' | 'apple') => {
        setLoading(true);
        try {
            // Construct the redirect URL to always point to /app/
            const redirectTo = Platform.OS === 'web'
                ? (typeof window !== 'undefined' ? window.location.origin : '')
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

    const handleEmailSubmit = () => {
        if (email.trim()) {
            // For now, just show success UI (no backend functionality)
            setEmailSubmitted(true);
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
                    {/* Start Here Label with Arrow */}
                    <View style={styles.startHereContainer}>
                        <ThemedText style={styles.startHereText}>Start here</ThemedText>
                        <ThemedText style={styles.startHereArrow}>↓</ThemedText>
                    </View>

                    <TouchableOpacity
                        style={styles.authButton}
                        onPress={() => handleSignIn('google')}
                        disabled={loading}
                    >
                        <FontAwesome name="google" size={20} color="#DB4437" style={styles.authIcon} />
                        <ThemedText style={styles.authButtonText}>Sign in with Google</ThemedText>
                    </TouchableOpacity>

                    {/* Waitlist Section */}
                    <View style={styles.waitlistSection}>
                        <ThemedText style={styles.announcementText}>
                            Soon available on iOS and Android.
                        </ThemedText>
                        <ThemedText style={styles.waitlistPrompt}>
                            Join our waitlist here:
                        </ThemedText>

                        {!emailSubmitted ? (
                            <View style={styles.emailInputContainer}>
                                <TextInput
                                    style={styles.emailInput}
                                    placeholder="Enter your email"
                                    placeholderTextColor="#999"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    editable={!emailSubmitted}
                                />
                                <TouchableOpacity
                                    style={styles.submitButton}
                                    onPress={handleEmailSubmit}
                                    disabled={!email.trim()}
                                >
                                    <FontAwesome name="arrow-right" size={16} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.successContainer}>
                                <View style={styles.checkmarkCircle}>
                                    <FontAwesome name="check" size={20} color="#4CAF50" />
                                </View>
                                <ThemedText style={styles.successText}>
                                    Make sure to confirm the email we send you!
                                </ThemedText>
                            </View>
                        )}
                    </View>

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

                {/* Footer */}
                <View style={styles.footer}>
                    <ThemedText style={styles.footerText}>
                        Crafted with ❤️ and{' '}
                        <ThemedText
                            style={styles.footerLink}
                            onPress={() => {
                                if (Platform.OS === 'web') {
                                    window.open('https://antigravity.google/', '_blank');
                                } else {
                                    // For mobile, you'd use Linking.openURL
                                    import('expo-linking').then(({ default: Linking }) => {
                                        Linking.openURL('https://antigravity.google/');
                                    });
                                }
                            }}
                        >
                            Google Antigravity
                        </ThemedText>
                    </ThemedText>
                </View>
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
        marginTop: 40,
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
        paddingVertical: 20,
    },
    heroImage: {
        width: '100%',
        height: '100%',
        maxWidth: 500,
        maxHeight: 500,
    },
    authContainer: {
        gap: 12,
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
    },
    startHereContainer: {
        alignItems: 'center',
        marginBottom: 4,
    },
    startHereText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#5B8FD8',
        marginBottom: 2,
    },
    startHereArrow: {
        fontSize: 18,
        color: '#5B8FD8',
        transform: [{ rotate: '5deg' }],
    },
    authButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 14,
        paddingHorizontal: 20,
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
        fontSize: 15,
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
    waitlistSection: {
        marginTop: 16,
        padding: 14,
        backgroundColor: '#f9f9f9',
        borderRadius: 14,
        alignItems: 'center',
    },
    announcementText: {
        fontSize: 11,
        color: '#666',
        marginBottom: 2,
        textAlign: 'center',
    },
    waitlistPrompt: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
        textAlign: 'center',
    },
    emailInputContainer: {
        flexDirection: 'row',
        width: '100%',
        gap: 8,
    },
    emailInput: {
        flex: 1,
        backgroundColor: '#fff',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
        fontSize: 13,
        borderWidth: 1,
        borderColor: '#ddd',
        color: '#000',
    },
    submitButton: {
        backgroundColor: '#5B8FD8',
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    successContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        backgroundColor: '#f0f9f4',
        borderRadius: 12,
        width: '100%',
    },
    checkmarkCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#e8f5e9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    successText: {
        flex: 1,
        fontSize: 13,
        color: '#2e7d32',
        lineHeight: 18,
    },
    footer: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 11,
        color: '#666',
        textAlign: 'center',
    },
    footerLink: {
        fontSize: 11,
        color: '#5B8FD8',
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
});
