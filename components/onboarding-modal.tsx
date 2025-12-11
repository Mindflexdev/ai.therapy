import React, { useEffect, useRef, useState } from 'react';
import { Animated, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

import { Colors } from '../constants/theme';
import { useColorScheme } from '../hooks/use-color-scheme';
import { supabase } from '../lib/supabase';
import { LogoWithDots } from './logo-with-dots';
import { ThemedText } from './themed-text';

interface Goal {
    id: string;
    title: string;
}

const GOALS: Goal[] = [
    { id: 'sleep', title: 'Better Sleep' },
    { id: 'performance', title: 'Improve Performance' },
    { id: 'self-worth', title: 'Build Self-Esteem' },
    { id: 'fears', title: 'Reduce Anxiety' },
    { id: 'stress', title: 'Reduce Stress' },
    { id: 'happier', title: 'Be Happier' },
    { id: 'grateful', title: 'Practice Gratitude' },
];

const LANGUAGES = [
    { id: 'en', title: 'English', flag: '🇬🇧' },
    { id: 'de', title: 'Deutsch', flag: '🇩🇪' },
];

export function OnboardingModal({ visible, onComplete }: { visible: boolean; onComplete: () => void }) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [step, setStep] = useState<'language' | 'goals'>('language');
    const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
    const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
    const [isCompleting, setIsCompleting] = useState(false);
    const scaleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    const handleLanguageSelect = async (language: string) => {
        setSelectedLanguage(language);

        try {
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

            setTimeout(() => {
                setStep('goals');
            }, 300);
        } catch (error: any) {
            console.error('Error saving language:', error);
        }
    };

    const toggleGoal = (goalId: string) => {
        setSelectedGoals(prev =>
            prev.includes(goalId)
                ? prev.filter(id => id !== goalId)
                : [...prev, goalId]
        );
    };

    const handleComplete = async () => {
        if (selectedGoals.length === 0) return;

        setIsCompleting(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                await supabase
                    .from('users')
                    .upsert({
                        id: session.user.id,
                        user_goals: selectedGoals,
                        onboarding_completed: true,
                        updated_at: new Date().toISOString()
                    });
            }

            setTimeout(() => {
                onComplete();
            }, 500);
        } catch (error: any) {
            console.error('Error saving goals:', error);
            setIsCompleting(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="none"
            statusBarTranslucent={true}
        >
            <View style={styles.modalOverlay}>
                <Animated.View style={[styles.popupContainer, { transform: [{ scale: scaleAnim }], backgroundColor: theme.card }]}>
                    {step === 'language' ? (
                        <>
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
                                {LANGUAGES.map((lang) => (
                                    <TouchableOpacity
                                        key={lang.id}
                                        style={[
                                            styles.languageButton,
                                            { borderColor: selectedLanguage === lang.id ? theme.primary : `${theme.text}20` },
                                            selectedLanguage === lang.id && { backgroundColor: `${theme.primary}15` }
                                        ]}
                                        onPress={() => handleLanguageSelect(lang.id)}
                                        activeOpacity={0.7}
                                    >
                                        <ThemedText style={styles.flag}>{lang.flag}</ThemedText>
                                        <ThemedText type="defaultSemiBold" style={styles.languageName}>{lang.title}</ThemedText>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </>
                    ) : (
                        <>
                            <View style={styles.header}>
                                <View style={styles.logoContainer}>
                                    <LogoWithDots fontSize={20} color={theme.text} />
                                </View>
                                <ThemedText type="title" style={styles.title}>
                                    What brings you here?
                                </ThemedText>
                                <ThemedText style={styles.subtitle}>
                                    We tailor recommendations based on your goals.
                                </ThemedText>
                            </View>

                            <View style={styles.goalsContainer}>
                                {GOALS.map((goal) => {
                                    const isSelected = selectedGoals.includes(goal.id);
                                    return (
                                        <TouchableOpacity
                                            key={goal.id}
                                            style={[
                                                styles.goalPill,
                                                {
                                                    borderColor: isSelected ? theme.primary : `${theme.text}20`,
                                                    backgroundColor: isSelected ? `${theme.primary}15` : 'transparent',
                                                }
                                            ]}
                                            onPress={() => toggleGoal(goal.id)}
                                            activeOpacity={0.7}
                                        >
                                            <ThemedText style={[
                                                styles.goalText,
                                                isSelected && { color: theme.primary, fontWeight: '600' }
                                            ]}>
                                                {goal.title}
                                            </ThemedText>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            <View style={styles.footer}>
                                <TouchableOpacity
                                    style={[
                                        styles.continueButton,
                                        { backgroundColor: selectedGoals.length > 0 ? theme.primary : '#ccc' }
                                    ]}
                                    onPress={handleComplete}
                                    disabled={selectedGoals.length === 0 || isCompleting}
                                    activeOpacity={0.8}
                                >
                                    <ThemedText style={styles.continueButtonText}>
                                        {isCompleting ? 'Saving...' : 'Continue'}
                                    </ThemedText>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    popupContainer: {
        width: '90%',
        maxWidth: 400,
        borderRadius: 20,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    logoContainer: {
        marginBottom: 12,
    },
    title: {
        fontSize: 22,
        textAlign: 'center',
        marginBottom: 6,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 13,
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
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        borderWidth: 1,
        gap: 10,
    },
    flag: {
        fontSize: 20,
    },
    languageName: {
        fontSize: 15,
    },
    goalsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 24,
    },
    goalPill: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        alignItems: 'center',
        minWidth: '40%',
    },
    goalText: {
        fontSize: 13,
        textAlign: 'center',
    },
    footer: {
        width: '100%',
    },
    continueButton: {
        paddingVertical: 12,
        borderRadius: 25,
        alignItems: 'center',
        width: '100%',
    },
    continueButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
});
