import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/useColorScheme';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Goal {
    id: string;
    icon: string;
    title: string;
    description: string;
}

const GOALS: Goal[] = [
    { id: 'anxiety', icon: 'heart.fill', title: 'Anxiety & Stress', description: 'Manage worry and find calm' },
    { id: 'depression', icon: 'cloud.sun.fill', title: 'Depression', description: 'Navigate low moods and sadness' },
    { id: 'relationships', icon: 'person.2.fill', title: 'Relationships', description: 'Improve connections with others' },
    { id: 'self-esteem', icon: 'star.fill', title: 'Self-Esteem', description: 'Build confidence and self-worth' },
    { id: 'trauma', icon: 'shield.fill', title: 'Trauma & PTSD', description: 'Process difficult experiences' },
    { id: 'sleep', icon: 'moon.fill', title: 'Sleep Issues', description: 'Improve sleep quality' },
    { id: 'grief', icon: 'heart.slash.fill', title: 'Grief & Loss', description: 'Cope with loss and change' },
    { id: 'work', icon: 'briefcase.fill', title: 'Work & Career', description: 'Navigate professional challenges' },
];

export default function GoalSelectionScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
    const [isCompleting, setIsCompleting] = useState(false);
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

        // Save to database
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            await supabase
                .from('users')
                .update({
                    user_goals: selectedGoals,
                    onboarding_completed: true
                })
                .eq('id', session.user.id);
        }

        // Navigate to main app
        setTimeout(() => {
            router.replace('/(tabs)');
        }, 500);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
                {/* Header */}
                <View style={styles.header}>
                    <ThemedText type="title" style={styles.title}>
                        What brings you here?
                    </ThemedText>
                    <ThemedText style={styles.subtitle}>
                        Select the topics you'd like to explore
                    </ThemedText>
                </View>

                {/* Goals Grid */}
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
                                    styles.goalCard,
                                    { backgroundColor: theme.card },
                                    isSelected && {
                                        borderColor: theme.primary,
                                        borderWidth: 3,
                                        backgroundColor: `${theme.primary}15`
                                    }
                                ]}
                                onPress={() => toggleGoal(goal.id)}
                                activeOpacity={0.7}
                            >
                                <View style={[
                                    styles.iconContainer,
                                    { backgroundColor: isSelected ? theme.primary : `${theme.primary}20` }
                                ]}>
                                    <IconSymbol
                                        name={goal.icon as any}
                                        size={24}
                                        color={isSelected ? '#fff' : theme.primary}
                                    />
                                </View>
                                <ThemedText type="defaultSemiBold" style={styles.goalTitle}>
                                    {goal.title}
                                </ThemedText>
                                <ThemedText style={styles.goalDescription}>
                                    {goal.description}
                                </ThemedText>
                                {isSelected && (
                                    <View style={[styles.checkmark, { backgroundColor: theme.primary }]}>
                                        <IconSymbol name="checkmark" size={16} color="#fff" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* Continue Button */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[
                            styles.continueButton,
                            { backgroundColor: selectedGoals.length > 0 ? theme.primary : theme.text },
                            { opacity: selectedGoals.length > 0 ? 1 : 0.3 }
                        ]}
                        onPress={handleComplete}
                        disabled={selectedGoals.length === 0 || isCompleting}
                        activeOpacity={0.8}
                    >
                        <ThemedText style={styles.continueButtonText}>
                            {isCompleting ? 'Starting your journey...' : `Continue with ${selectedGoals.length} ${selectedGoals.length === 1 ? 'topic' : 'topics'}`}
                        </ThemedText>
                        {!isCompleting && (
                            <IconSymbol name="arrow.right" size={20} color="#fff" />
                        )}
                    </TouchableOpacity>

                    {/* Progress Indicator */}
                    <View style={styles.progressContainer}>
                        <View style={[styles.progressDot, { backgroundColor: theme.text, opacity: 0.2 }]} />
                        <View style={[styles.progressDot, { backgroundColor: theme.primary }]} />
                    </View>
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
    },
    header: {
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 16,
    },
    title: {
        fontSize: 28,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        opacity: 0.7,
        textAlign: 'center',
    },
    scrollView: {
        flex: 1,
    },
    goalsContainer: {
        paddingHorizontal: 24,
        paddingBottom: 24,
        gap: 16,
    },
    goalCard: {
        padding: 20,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: 'transparent',
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    goalTitle: {
        fontSize: 17,
        marginBottom: 4,
    },
    goalDescription: {
        fontSize: 14,
        opacity: 0.6,
        lineHeight: 20,
    },
    checkmark: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 24,
        paddingTop: 16,
    },
    continueButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    continueButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    progressContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    progressDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
});
