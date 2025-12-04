import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import { FontAwesome } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function SignInScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [loading, setLoading] = useState(false);

    const handleSignIn = async (provider: 'google' | 'facebook' | 'apple') => {
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: provider,
                options: {
                    redirectTo: 'therapyai://login-callback', // This needs to be configured in Supabase and app.json
                },
            });

            if (error) throw error;
            // The actual navigation happens via the onAuthStateChange listener in _layout.tsx
        } catch (error) {
            console.error('Error signing in:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Background Image or Gradient */}
            <Image
                source={{ uri: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop' }}
                style={styles.backgroundImage}
                contentFit="cover"
            />
            <View style={styles.overlay} />

            <View style={styles.content}>
                {/* Logo Section */}
                <View style={styles.logoContainer}>
                    <View style={styles.logoRow}>
                        <Image source={{ uri: '/icon.png' }} style={styles.logo} />
                        <ThemedText style={styles.logoText}>Therapy.AI</ThemedText>
                    </View>
                    <ThemedText style={styles.tagline}>CHAT + AI</ThemedText>
                </View>

                {/* Spacer */}
                <View style={{ flex: 1 }} />

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

                    <TouchableOpacity
                        style={styles.authButton}
                        onPress={() => handleSignIn('facebook')}
                        disabled={loading}
                    >
                        <FontAwesome name="facebook" size={20} color="#4267B2" style={styles.authIcon} />
                        <ThemedText style={styles.authButtonText}>Sign in with Facebook</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.authButton}
                        onPress={() => handleSignIn('apple')}
                        disabled={loading}
                    >
                        <FontAwesome name="apple" size={20} color="#000" style={styles.authIcon} />
                        <ThemedText style={styles.authButtonText}>Sign in with Apple</ThemedText>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    backgroundImage: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.6,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)', // Note: This is web syntax, for RN we need LinearGradient component if we want gradient. 
        // But for now, simple overlay is fine or I'll use a solid color with opacity.
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
        marginBottom: 16,
    },
    logo: {
        width: 40,
        height: 40,
        borderRadius: 10,
    },
    logoText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: 1,
    },
    tagline: {
        fontSize: 32,
        fontWeight: '300',
        color: '#fff',
        letterSpacing: 2,
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
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
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
});
