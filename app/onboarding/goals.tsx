import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
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
    { id: 'self-worth', title: 'Build Self-Esteem' }, // ID: self-worth
    { id: 'fears', title: 'Reduce Anxiety' }, // ID: fears
    { id: 'stress', title: 'Reduce Stress' },
    { id: 'happier', title: 'Be Happier' }, // ID: happier
    { id: 'grateful', title: 'Practice Gratitude' }, // ID: grateful
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
        } catch (error: any) {
            console.error('Error saving goals:', error);
            setIsCompleting(false);
            // Show more specific error if available
            const msg = error.message || error.error_description || JSON.stringify(error);
            alert(`Failed to save preferences: ${msg}. Please ensure RLS policies are applied.`);
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

                    {/* Continue Button small spacing */}
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

                </Animated.View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)', // Darker overlay for better focus
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
        borderRadius: 20,
        padding: 24,
        paddingBottom: 24,
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
        marginBottom: 0,
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
        minWidth: '40%', // Ensure consistent sizing
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
