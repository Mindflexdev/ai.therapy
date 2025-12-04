import React from 'react';
import { StyleSheet, View, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

const { width } = Dimensions.get('window');

const DETAIL_DATA: Record<string, any> = {
    '1': { // Emotional States
        metrics: [
            {
                label: 'Mood (Valence)',
                value: 82,
                range: [64, 90],
                status: 'Stable',
                explanation: 'Your overall emotional tone is positive and stable. This reflects how you generally feel throughout the day, detected through your word choice and expression patterns.'
            },
            {
                label: 'Stress (Arousal)',
                value: 45,
                range: [30, 76],
                status: 'Relaxed',
                explanation: 'Your stress levels are well-managed. We detect this through your writing tempo, topic intensity, and how you describe daily challenges.'
            },
            {
                label: 'Energy/Drive',
                value: 75,
                range: [60, 88],
                status: 'Good',
                explanation: 'You show consistent motivation and engagement. This is measured by your activity patterns, initiative in conversations, and goal-oriented language.'
            },
            {
                label: 'Emotional Intensity',
                value: 68,
                range: [50, 82],
                status: 'Balanced',
                explanation: 'Your emotional responses are proportionate and balanced. You experience feelings fully without being overwhelmed by them.'
            },
            {
                label: 'Emotional Recovery',
                value: 88,
                range: [70, 95],
                status: 'Excellent',
                explanation: 'You bounce back from difficult moments quickly. This improved recovery time shows growing emotional resilience and self-regulation skills.'
            },
        ],
        insight: "Your emotional recovery has improved by 50% over the past 3 weeks. You're bouncing back from stress much faster.",
    },
    '2': { // Life Areas
        metrics: [
            {
                label: 'Work & Career',
                value: 45,
                range: [30, 60],
                status: 'High Focus',
                explanation: 'Work is currently your primary focus area. This percentage shows how much mental energy and conversation time is dedicated to career topics.'
            },
            {
                label: 'Relationships',
                value: 25,
                range: [15, 40],
                status: 'Moderate',
                explanation: 'Relationships receive moderate attention. This includes romantic partnerships, friendships, and social connections you discuss.'
            },
            {
                label: 'Health & Body',
                value: 15,
                range: [10, 25],
                status: 'Low',
                explanation: 'Physical health and body-related topics appear less frequently in your conversations, suggesting this area could benefit from more attention.'
            },
            {
                label: 'Family',
                value: 10,
                range: [5, 20],
                status: 'Minimal',
                explanation: 'Family dynamics and relationships are discussed occasionally but aren\'t a primary focus right now.'
            },
            {
                label: 'Identity & Self-worth',
                value: 5,
                range: [0, 15],
                status: 'Emerging',
                explanation: 'Questions about who you are and your self-worth are beginning to surface more in your reflections—a sign of deeper self-exploration.'
            },
        ],
        insight: "80% of your stress comes from work context. Consider balancing your focus across life areas.",
    },
    '3': { // Psychological Patterns
        metrics: [
            {
                label: 'Rumination',
                value: 35,
                range: [50, 20],
                status: 'Decreasing',
                explanation: 'Repetitive negative thinking is decreasing. You\'re spending less time stuck in thought loops and more time in productive reflection.'
            },
            {
                label: 'Catastrophizing',
                value: 28,
                range: [45, 15],
                status: 'Improving',
                explanation: 'You\'re jumping to worst-case scenarios less often. Your thinking is becoming more balanced and realistic about potential outcomes.'
            },
            {
                label: 'Self-criticism',
                value: 42,
                range: [60, 30],
                status: 'Better',
                explanation: 'Harsh self-judgment is reducing. You\'re treating yourself with more compassion and acknowledging your efforts, not just outcomes.'
            },
            {
                label: 'Avoidance',
                value: 38,
                range: [55, 25],
                status: 'Reducing',
                explanation: 'You\'re facing difficult situations more directly instead of avoiding them. This shows growing courage and emotional capacity.'
            },
            {
                label: 'Emotional Reactivity',
                value: 45,
                range: [65, 35],
                status: 'Stabilizing',
                explanation: 'Your emotional responses are becoming more measured. You have more space between trigger and reaction, allowing for thoughtful choices.'
            },
        ],
        insight: "Your self-critical thoughts have decreased by 30%. You're treating yourself with more compassion.",
    },
    '4': { // Goals & Values
        metrics: [
            {
                label: 'Honesty',
                value: 85,
                range: [70, 92],
                status: 'Strong',
                explanation: 'Authenticity and truthfulness are central to your decisions. Your actions consistently reflect this core value.'
            },
            {
                label: 'Peace & Calm',
                value: 72,
                range: [60, 85],
                status: 'Growing',
                explanation: 'Your desire for inner peace is becoming clearer. You\'re making more choices that prioritize tranquility over chaos.'
            },
            {
                label: 'Connection',
                value: 68,
                range: [55, 80],
                status: 'Developing',
                explanation: 'Meaningful relationships are increasingly important to you. You\'re investing more in deep, authentic connections.'
            },
            {
                label: 'Growth',
                value: 90,
                range: [75, 95],
                status: 'Core Value',
                explanation: 'Personal development is your strongest value. You consistently seek learning, improvement, and self-understanding.'
            },
            {
                label: 'Authenticity',
                value: 78,
                range: [65, 88],
                status: 'Aligned',
                explanation: 'Being true to yourself matters deeply. Your choices increasingly reflect who you really are, not who you think you should be.'
            },
        ],
        insight: "You're moving closer to your value of 'Honesty'. Your actions increasingly reflect your core values.",
    },
    '5': { // Actions & Skills
        metrics: [
            {
                label: 'Setting Boundaries',
                value: 82,
                range: [60, 90],
                status: 'Strong',
                explanation: 'You\'re effectively communicating your limits and protecting your energy. This skill has grown significantly.'
            },
            {
                label: 'Self-opening',
                value: 75,
                range: [55, 85],
                status: 'Good',
                explanation: 'You\'re sharing more authentically and vulnerably. Opening up is becoming easier and more natural for you.'
            },
            {
                label: 'Mindfulness Moments',
                value: 88,
                range: [70, 95],
                status: 'Excellent',
                explanation: 'You\'re frequently present and aware. These moments of mindfulness help you respond rather than react to life.'
            },
            {
                label: 'Self-soothing',
                value: 70,
                range: [50, 80],
                status: 'Developing',
                explanation: 'You\'re learning to comfort yourself during difficult moments. This self-compassion skill is growing steadily.'
            },
            {
                label: 'Perspective-taking',
                value: 85,
                range: [65, 92],
                status: 'Strong',
                explanation: 'You\'re able to see situations from multiple angles. This cognitive flexibility helps you navigate complex situations wisely.'
            },
        ],
        insight: "You've taken 5 concrete brave actions this week. You're using healthy skills instead of avoidance.",
    },
    '6': { // Resilience
        metrics: [
            {
                label: 'Recovery Speed',
                value: 85,
                range: [60, 95],
                status: 'Fast',
                explanation: 'You return to baseline emotional state quickly after stress. This rapid recovery is a key indicator of resilience.'
            },
            {
                label: 'Emotional Stability',
                value: 78,
                range: [65, 88],
                status: 'Stable',
                explanation: 'Your mood doesn\'t swing wildly. You maintain emotional equilibrium even when facing challenges.'
            },
            {
                label: 'Post-crisis Strength',
                value: 82,
                range: [70, 90],
                status: 'Strong',
                explanation: 'After difficult events, you emerge stronger. You\'re learning and growing from challenges rather than being depleted by them.'
            },
            {
                label: 'Mental Capacity',
                value: 75,
                range: [60, 85],
                status: 'Good',
                explanation: 'You have good bandwidth for handling life\'s demands. Your mental resources are well-managed and sustainable.'
            },
            {
                label: 'Stress Tolerance',
                value: 80,
                range: [65, 90],
                status: 'High',
                explanation: 'You can handle significant pressure without breaking down. Your threshold for stress has increased notably.'
            },
        ],
        insight: "You recover from stress 50% faster than before. Your mental resilience is significantly stronger.",
    },
    '7': { // Psychological Flexibility
        metrics: [
            {
                label: 'Acceptance',
                value: 78,
                range: [60, 88],
                status: 'Good',
                explanation: 'You\'re learning to accept difficult thoughts and feelings without fighting them. This reduces unnecessary suffering.'
            },
            {
                label: 'Cognitive Defusion',
                value: 82,
                range: [65, 92],
                status: 'Strong',
                explanation: 'You\'re creating distance from unhelpful thoughts. You can observe your thinking without being controlled by it.'
            },
            {
                label: 'Present Moment',
                value: 75,
                range: [60, 85],
                status: 'Developing',
                explanation: 'You\'re spending more time in the here-and-now rather than lost in past regrets or future worries.'
            },
            {
                label: 'Self-as-Context',
                value: 70,
                range: [55, 80],
                status: 'Growing',
                explanation: 'You\'re recognizing that you are more than your thoughts, feelings, or experiences. This perspective shift is liberating.'
            },
            {
                label: 'Values Clarity',
                value: 88,
                range: [70, 95],
                status: 'Excellent',
                explanation: 'You have clear understanding of what matters most to you. This clarity guides your decisions and actions.'
            },
            {
                label: 'Committed Action',
                value: 85,
                range: [70, 92],
                status: 'Strong',
                explanation: 'You\'re taking consistent action aligned with your values, even when it\'s difficult. This builds a meaningful life.'
            },
        ],
        insight: "You're less controlled by your thoughts. You make decisions more aligned with your values.",
    },
    '8': { // Alliance & Connection
        metrics: [
            {
                label: 'Openness',
                value: 90,
                range: [75, 98],
                status: 'Very High',
                explanation: 'You share freely and authentically. This openness creates space for genuine connection and support.'
            },
            {
                label: 'Self-disclosure Depth',
                value: 88,
                range: [70, 95],
                status: 'Deep',
                explanation: 'You\'re willing to explore vulnerable topics. This depth of sharing enables meaningful therapeutic work.'
            },
            {
                label: 'Engagement',
                value: 92,
                range: [80, 98],
                status: 'Excellent',
                explanation: 'You\'re actively involved in your growth process. Your consistent engagement accelerates positive change.'
            },
            {
                label: 'Trust Level',
                value: 95,
                range: [85, 100],
                status: 'Outstanding',
                explanation: 'You trust the therapeutic relationship deeply. This trust foundation allows for transformative work.'
            },
            {
                label: 'Consistency',
                value: 90,
                range: [75, 98],
                status: 'Very High',
                explanation: 'You show up regularly and reliably. This consistency compounds the benefits of your therapeutic journey.'
            },
        ],
        insight: "You use your AI companion very consistently. It's easier for you to open up and share deeply.",
    },
};

export default function TrackingDetailScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const id = params.id as string;
    const title = params.title as string;
    const subtitle = params.subtitle as string;
    const icon = params.icon as string;
    const color = (params.color as string) || theme.primary;

    const data = DETAIL_DATA[id] || DETAIL_DATA['1'];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.icon }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <IconSymbol name="chevron.right" size={24} color={theme.text} style={{ transform: [{ rotate: '180deg' }] }} />
                </TouchableOpacity>
                <View style={styles.headerTitle}>
                    <ThemedText style={styles.headerIcon}>{icon}</ThemedText>
                    <View>
                        <ThemedText type="defaultSemiBold" style={styles.headerText}>{title}</ThemedText>
                        <ThemedText style={styles.headerSubtext}>{subtitle}</ThemedText>
                    </View>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Insight Card */}
                <View style={styles.insightSection}>
                    <View style={[styles.insightCard, { backgroundColor: theme.card }]}>
                        <LinearGradient
                            colors={[`${color}20`, 'transparent']}
                            style={styles.insightGradient}
                        />
                        <ThemedText type="defaultSemiBold" style={styles.insightTitle}>
                            💡 Key Insight
                        </ThemedText>
                        <ThemedText style={styles.insightText}>{data.insight}</ThemedText>
                    </View>
                </View>

                {/* Metrics */}
                <View style={styles.metricsSection}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Detailed Metrics</ThemedText>

                    {data.metrics.map((metric: any, index: number) => (
                        <View key={index} style={[styles.metricCard, { backgroundColor: theme.card }]}>
                            <View style={styles.metricHeader}>
                                <ThemedText type="defaultSemiBold" style={styles.metricLabel}>
                                    {metric.label}
                                </ThemedText>
                                <ThemedText style={[styles.metricStatus, { color }]}>
                                    {metric.status}
                                </ThemedText>
                            </View>

                            <View style={styles.metricValueRow}>
                                <ThemedText type="title" style={styles.metricValue}>{metric.value}</ThemedText>
                                <ThemedText style={styles.metricRange}>
                                    Range: {metric.range[0]}-{metric.range[1]}
                                </ThemedText>
                            </View>

                            <View style={styles.progressBar}>
                                <LinearGradient
                                    colors={[color, `${color}60`]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={[styles.progressFill, { width: `${metric.value}%` }]}
                                />
                            </View>

                            {metric.explanation && (
                                <ThemedText style={styles.metricExplanation}>
                                    {metric.explanation}
                                </ThemedText>
                            )}
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    headerIcon: {
        fontSize: 32,
    },
    headerText: {
        fontSize: 18,
    },
    headerSubtext: {
        fontSize: 13,
        opacity: 0.6,
    },
    insightSection: {
        padding: 24,
    },
    insightCard: {
        padding: 24,
        borderRadius: 16,
        overflow: 'hidden',
    },
    insightGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    insightTitle: {
        fontSize: 18,
        marginBottom: 12,
    },
    insightText: {
        fontSize: 15,
        lineHeight: 22,
        opacity: 0.8,
    },
    metricsSection: {
        paddingHorizontal: 24,
        paddingBottom: 100,
        gap: 16,
    },
    sectionTitle: {
        fontSize: 20,
        marginBottom: 8,
    },
    metricCard: {
        padding: 20,
        borderRadius: 16,
        gap: 16,
    },
    metricHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    metricLabel: {
        fontSize: 16,
        flex: 1,
    },
    metricStatus: {
        fontSize: 13,
        fontWeight: '600',
    },
    metricValueRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
    },
    metricValue: {
        fontSize: 32,
    },
    metricRange: {
        fontSize: 13,
        opacity: 0.6,
    },
    progressBar: {
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    metricExplanation: {
        fontSize: 14,
        lineHeight: 20,
        opacity: 0.7,
        marginTop: 4,
    },
});
