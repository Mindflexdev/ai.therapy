import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
        // Entrance animation
        Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
        }).start();
    }, []);

    const handleLanguageSelect = async (language: Language) => {
        setSelectedLanguage(language);

        // Save to database
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            await supabase
                .from('users')
                .upsert({
                    id: session.user.id,
                    preferred_language: language,
                    updated_at: new Date().toISOString()
                });
        }

        // Navigate to goal selection after a brief delay
        setTimeout(() => {
            router.push('/onboarding/goals');
        }, 300);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
                {/* Header */}
                <View style={styles.header}>
                    <ThemedText type="title" style={styles.title}>
                        Welcome to ai.therapy
                    </ThemedText>
                    <ThemedText style={styles.subtitle}>
                        Choose your preferred language
                    </ThemedText>
                </View>

                {/* Language Options */}
                <View style={styles.languageContainer}>
                    {/* English */}
                    <TouchableOpacity
                        style={[
                            styles.languageCard,
                            { backgroundColor: theme.card },
                            selectedLanguage === 'en' && { borderColor: theme.primary, borderWidth: 3 }
                        ]}
                        onPress={() => handleLanguageSelect('en')}
                        activeOpacity={0.7}
                    >
                        <View style={styles.flagContainer}>
                            <ThemedText style={styles.flag}>🇬🇧</ThemedText>
                        </View>
                        <ThemedText type="subtitle" style={styles.languageName}>
                            English
                        </ThemedText>
                        <ThemedText style={styles.languageDescription}>
                            Continue in English
                        </ThemedText>
                    </TouchableOpacity>

                    {/* German */}
                    <TouchableOpacity
                        style={[
                            styles.languageCard,
                            { backgroundColor: theme.card },
                            selectedLanguage === 'de' && { borderColor: theme.primary, borderWidth: 3 }
                        ]}
                        onPress={() => handleLanguageSelect('de')}
                        activeOpacity={0.7}
                    >
                        <View style={styles.flagContainer}>
                            <ThemedText style={styles.flag}>🇩🇪</ThemedText>
                        </View>
                        <ThemedText type="subtitle" style={styles.languageName}>
                            Deutsch
                        </ThemedText>
                        <ThemedText style={styles.languageDescription}>
                            Auf Deutsch fortfahren
                        </ThemedText>
                    </TouchableOpacity>
                </View>

                {/* Progress Indicator */}
                <View style={styles.progressContainer}>
                    <View style={[styles.progressDot, { backgroundColor: theme.primary }]} />
                    <View style={[styles.progressDot, { backgroundColor: theme.text, opacity: 0.2 }]} />
                </View>
            </Animated.View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 48,
    },
    title: {
        fontSize: 32,
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        opacity: 0.7,
        textAlign: 'center',
    },
    languageContainer: {
        gap: 20,
        marginBottom: 48,
    },
    languageCard: {
        padding: 32,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    flagContainer: {
        marginBottom: 16,
    },
    flag: {
        fontSize: 64,
    },
    languageName: {
        fontSize: 24,
        marginBottom: 8,
    },
    languageDescription: {
        fontSize: 14,
        opacity: 0.6,
    },
    progressContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginTop: 24,
    },
    progressDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
});
