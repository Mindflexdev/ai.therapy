import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LogoWithDots } from '../../components/logo-with-dots';
import { ThemedText } from '../../components/themed-text';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { supabase } from '../../lib/supabase';

type Language = 'en' | 'de';

export default function LanguageSelectionScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
    const scaleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
        }).start();
    }, []);

    const handleLanguageSelect = async (language: Language) => {
        setSelectedLanguage(language);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { error } = await supabase
                    .from('users')
                    .upsert({
                        id: session.user.id,
                        preferred_language: language,
                        updated_at: new Date().toISOString()
                    });
                if (error) throw error;
            }

            // Navigate to goal selection after a brief delay
            setTimeout(() => {
                router.push('/onboarding/goals');
            }, 300);
        } catch (error: any) {
            console.error('Error saving language:', error);
            const msg = error.message || error.error_description || JSON.stringify(error);
            alert(`Failed to save language: ${msg}. Please ensure RLS policies are applied.`);
        }
    };

    return (
        <View style={styles.mainContainer}>
            <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
                <Animated.View style={[styles.popupContainer, { transform: [{ scale: scaleAnim }], backgroundColor: theme.card }]}>

                    {/* Header with Logo */}
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <LogoWithDots fontSize={20} color={theme.text} />
                        </View>
                        <ThemedText type="title" style={styles.title}>
                            Welcome!
                        </ThemedText>
                        <ThemedText style={styles.subtitle}>
                            Please choose your preferred language
                        </ThemedText>
                    </View>

                    <View style={styles.languageContainer}>
                        {/* English */}
                        <TouchableOpacity
                            style={[
                                styles.languageButton,
                                { borderColor: selectedLanguage === 'en' ? theme.primary : `${theme.text}20` },
                                selectedLanguage === 'en' && { backgroundColor: `${theme.primary}15` }
                            ]}
                            onPress={() => handleLanguageSelect('en')}
                            activeOpacity={0.7}
                        >
                            <ThemedText style={styles.flag}>🇬🇧</ThemedText>
                            <ThemedText type="defaultSemiBold" style={styles.languageName}>English</ThemedText>
                        </TouchableOpacity>

                        {/* German */}
                        <TouchableOpacity
                            style={[
                                styles.languageButton,
                                { borderColor: selectedLanguage === 'de' ? theme.primary : `${theme.text}20` },
                                selectedLanguage === 'de' && { backgroundColor: `${theme.primary}15` }
                            ]}
                            onPress={() => handleLanguageSelect('de')}
                            activeOpacity={0.7}
                        >
                            <ThemedText style={styles.flag}>🇩🇪</ThemedText>
                            <ThemedText type="defaultSemiBold" style={styles.languageName}>Deutsch</ThemedText>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)', // Darker overlay
        justifyContent: 'center',
        alignItems: 'center',
    },
    safeArea: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    popupContainer: {
        width: '85%',
        maxWidth: 320,
        borderRadius: 20,
        padding: 24,
        paddingBottom: 32,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    logoContainer: {
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        textAlign: 'center',
        marginBottom: 8,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 14,
        opacity: 0.7,
        textAlign: 'center',
    },
    languageContainer: {
        gap: 12,
        width: '100%',
    },
    languageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12, // Reduced from 16
        paddingHorizontal: 20,
        borderRadius: 25,
        borderWidth: 1,
        gap: 10,
    },
    flag: {
        fontSize: 20, // Reduced from 24
    },
    languageName: {
        fontSize: 15, // Reduced from 16
    },
});
