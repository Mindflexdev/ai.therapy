import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LogoWithDots } from '../../components/logo-with-dots';
import { ThemedText } from '../../components/themed-text';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { supabase } from '../../lib/supabase';

const { width, height } = Dimensions.get('window');

interface Goal {
    id: string;
    title: string;
}

const GOALS: Goal[] = [
    { id: 'sleep', title: 'Better Sleep' },
    { id: 'performance', title: 'Improve Performance' },
    { id: 'self-esteem', title: 'Build Self-Esteem' },
    { id: 'anxiety', title: 'Reduce Anxiety' },
    { id: 'stress', title: 'Reduce Stress' },
    { id: 'happiness', title: 'Be Happier' },
    { id: 'gratitude', title: 'Practice Gratitude' },
];

export default function GoalSelectionScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
    const [isCompleting, setIsCompleting] = useState(false);
    const scaleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
        }).start();
    }, []);

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
                const { error } = await supabase
                    .from('users')
                    .upsert({
                        id: session.user.id,
                        user_goals: selectedGoals,
                        onboarding_completed: true,
                        updated_at: new Date().toISOString()
                    });

                if (error) throw error;
            }

            // Navigate to main app
            setTimeout(() => {
                router.replace('/(tabs)');
            }, 500);
        } catch (error) {
            console.error('Error saving goals:', error);
            setIsCompleting(false);
            alert('Failed to save preferences. Please try again.');
        }
    };

    return (
        <View style={styles.mainContainer}>
            {/* Background Image or Gradient could go here */}

            <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
                <Animated.View style={[styles.popupContainer, { transform: [{ scale: scaleAnim }], backgroundColor: theme.card }]}>

                    {/* Header with Logo */}
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

                    {/* Goals List */}
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.goalsContainer}
                        showsVerticalScrollIndicator={false}
                    >
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
                    </ScrollView>

                    {/* Continue Button */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[
                                styles.continueButton,
                                { backgroundColor: selectedGoals.length > 0 ? theme.primary : '#ccc' } // Grey if disabled
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

                </Animated.View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent background for popup feel
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
        width: '90%',
        maxWidth: 400,
        maxHeight: '85%',
        borderRadius: 24,
        padding: 24,
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
        alignSelf: 'flex-start', // Top left as requested
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        opacity: 0.7,
        textAlign: 'center',
        lineHeight: 20,
    },
    scrollView: {
        flex: 1,
        marginBottom: 24,
    },
    goalsContainer: {
        gap: 12,
    },
    goalPill: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 30, // Pill shape
        borderWidth: 1,
        alignItems: 'center', // Center text
    },
    goalText: {
        fontSize: 16,
    },
    footer: {
        // Footer styles
    },
    continueButton: {
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
        width: '100%',
    },
    continueButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
