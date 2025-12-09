import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { Alert, Animated, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const N8N_WEBHOOK_URL = 'https://mindflex.app.n8n.cloud/webhook/2b9dd8c6-5463-48b5-aa02-f8dad1aabdd4';

// Static Metadata (Icons/Colors/Names) to ensure UI consistency
const DIMENSION_METADATA: Record<string, any> = {
    '1': { title: 'Emotional States', subtitle: 'Mood & Energy', icon: '🎭', color: '#4ECDC4' },
    '2': { title: 'Life Areas', subtitle: 'Focus Distribution', icon: '🎯', color: '#95E1D3' },
    '3': { title: 'Psychological Patterns', subtitle: 'Thought Quality', icon: '🧠', color: '#F38181' },
    '4': { title: 'Goals & Values', subtitle: 'Alignment', icon: '⭐', color: '#AA96DA' },
    '5': { title: 'Actions & Skills', subtitle: 'Real Behavior', icon: '💪', color: '#FCBAD3' },
    '6': { title: 'Resilience', subtitle: 'Recovery Speed', icon: '🔋', color: '#FFFFD2' },
    '7': { title: 'Psychological Flexibility', subtitle: 'ACT Core', icon: '🌿', color: '#A8D8EA' },
    '8': { title: 'Alliance & Connection', subtitle: 'Therapeutic Bond', icon: '🤝', color: '#FFCFDF' },
};

const ANALYSIS_MESSAGES = [
    "Analyzing your conversations...",
    "Detecting emotional patterns...",
    "Calculating psychological trends...",
    "Measuring resilience factors...",
    "Evaluating therapeutic progress...",
    "Processing behavioral insights...",
];

interface AnalyticsData {
    id: string;
    value: number;
    status: string;
    trend: string;
    key_insight?: string;
    sub_dimensions?: any[]; // For detail view
}

export default function ProfileScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
    const [dailyInsight, setDailyInsight] = useState<string>("Analyzing your latest conversations...");
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // Countdown animation state
    const [countdown, setCountdown] = useState(60);
    const [analysisMessage, setAnalysisMessage] = useState(ANALYSIS_MESSAGES[0]);
    const progressAnim = useRef(new Animated.Value(0)).current;
    const countdownInterval = useRef<NodeJS.Timeout | null>(null);

    // Fetch Analytics Logic
    const fetchAnalytics = async (forceRefresh = false) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            // 1. Check local Supabase cache first
            const { data: existingData, error } = await supabase
                .from('user_analytics')
                .select('*')
                .eq('user_id', session.user.id)
                .single();

            if (existingData) {
                const updatedAt = new Date(existingData.last_updated_at);
                const now = new Date();
                const hoursDiff = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60);

                // Parse the raw n8n output structure
                // n8n saves data as: { output: { tracking_data: [...], daily_insight: "..." } }
                let trackingData = null;
                let insight = "Welcome back!";
                let previousData = null;

                if (existingData.output) {
                    // Handle n8n's nested structure
                    trackingData = existingData.output.tracking_data;
                    insight = existingData.output.daily_insight || "Welcome back!";
                } else if (existingData.current_scores) {
                    // Fallback: Handle old structure if it exists
                    trackingData = existingData.current_scores;
                    insight = existingData.current_insight || "Welcome back!";
                }

                // Get previous data for trend calculation
                if (existingData.previous_output?.tracking_data) {
                    previousData = existingData.previous_output.tracking_data;
                }

                if (trackingData) {
                    // Calculate trends if previous data exists
                    const dataWithTrends = trackingData.map((current: any) => {
                        if (!previousData) {
                            // No previous data, remove trend
                            const { trend, ...rest } = current;
                            return rest;
                        }

                        // Find matching previous dimension
                        const previous = previousData.find((p: any) => p.id === current.id);
                        if (!previous) {
                            const { trend, ...rest } = current;
                            return rest;
                        }

                        // Calculate percentage change
                        const change = current.value - previous.value;
                        const percentChange = previous.value !== 0
                            ? Math.round((change / previous.value) * 100)
                            : 0;

                        return {
                            ...current,
                            trend: percentChange > 0 ? `+${percentChange}%` : percentChange < 0 ? `${percentChange}%` : '0%'
                        };
                    });

                    setAnalyticsData(dataWithTrends);
                    setDailyInsight(insight);
                    setLastUpdated(updatedAt);
                }

                // If cache is fresh (< 24h) and we are not forcing, STOP here.
                if (hoursDiff < 24 && !forceRefresh && trackingData) {
                    return;
                }
            }

            // 2. If stale or missing, call n8n
            if (!analyzing) {
                setAnalyzing(true); // Show analyzing UI

                let response;
                let error;

                // Retry loop (3 attempts)
                for (let i = 0; i < 3; i++) {
                    try {
                        console.log(`[Profile] Calling n8n Webhook (Attempt ${i + 1})...`);
                        response = await fetch(N8N_WEBHOOK_URL, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${session.access_token}`
                            },
                            body: JSON.stringify({ userId: session.user.id })
                        });

                        if (response.ok) break; // Success!
                        console.warn(`[Profile] n8n Attempt ${i + 1} failed: Status ${response.status}`);
                    } catch (e) {
                        console.warn(`[Profile] n8n Attempt ${i + 1} error:`, e);
                        error = e;
                    }
                    // Wait 1s before retry, unless it's the last attempt
                    if (i < 2) await new Promise(r => setTimeout(r, 1000));
                }

                if (response && response.ok) {
                    const result = await response.json();
                    console.log("[Profile] n8n Analysis Success:", Object.keys(result));

                    if (result && result.tracking_data) {
                        setAnalyticsData(result.tracking_data);
                        setDailyInsight(result.daily_insight || "Here is your daily analysis.");
                        setLastUpdated(new Date());
                    }
                } else {
                    console.error("[Profile] All n8n analytics attempts failed.", error || response?.status);
                    Alert.alert("Analysis Failed", "Could not connect to the AI analyst. Please try again later.");
                }
                setAnalyzing(false);
            }

        } catch (e) {
            console.error("Error loading profile:", e);
            setAnalyzing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            console.log("Profile Screen Focused - Fetching Data");
            fetchAnalytics();
        }, [])
    );

    const handleSignOut = async () => {
        try {
            await supabase.auth.signOut();
            await AsyncStorage.removeItem('skipLogin');
            router.replace('/sign-in');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const renderTrackingCard = (item: AnalyticsData) => {
        const meta = DIMENSION_METADATA[item.id] || DIMENSION_METADATA['1'];

        return (
            <TouchableOpacity
                key={item.id}
                style={[styles.trackingCard, { backgroundColor: theme.card }]}
                onPress={() => {
                    // Pass the FULL complex object (including sub_dimensions) to the detail screen
                    router.push({
                        pathname: '/tracking-detail',
                        params: {
                            id: item.id,
                            title: meta.title, // Use Metadata title
                            subtitle: meta.subtitle,
                            icon: meta.icon,
                            color: meta.color,
                            // Pass dynamic data
                            insight: item.key_insight,
                            status: item.status,
                            value: item.value.toString(),
                            sub_dimensions: JSON.stringify(item.sub_dimensions || [])
                        }
                    });
                }}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.cardTitleRow}>
                        <ThemedText style={styles.cardIcon}>{meta.icon}</ThemedText>
                        <View style={styles.cardTitleContainer}>
                            <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
                                {meta.title}
                            </ThemedText>
                            <ThemedText style={styles.cardSubtitle}>{meta.subtitle}</ThemedText>
                        </View>
                    </View>
                    <View style={[styles.trendBadge, { backgroundColor: `${meta.color}20` }]}>
                        <ThemedText style={[styles.trendText, { color: meta.color }]}>
                            {item.trend || '+0%'}
                        </ThemedText>
                    </View>
                </View>

                <View style={styles.progressSection}>
                    <View style={styles.progressBar}>
                        <LinearGradient
                            colors={[meta.color, `${meta.color}80`]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[styles.progressFill, { width: `${item.value}%` }]}
                        />
                    </View>
                    <View style={styles.valueRow}>
                        <ThemedText type="defaultSemiBold" style={styles.valueText}>
                            {item.value}
                        </ThemedText>
                        <ThemedText style={styles.statusText}>{item.status}</ThemedText>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <View style={styles.feedbackButtonContainer}>
                <TouchableOpacity
                    style={[styles.feedbackButton, { backgroundColor: theme.primary }]}
                    onPress={() => router.push('/feedback')}
                >
                    <ThemedText style={styles.feedbackButtonText}>Feedback?</ThemedText>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.profileImageContainer}>
                        <Image
                            source={{ uri: '/characters/Dr. Morpheus.jpg' }} // Placeholder
                            style={styles.profileImage}
                            contentFit="cover"
                        />
                        <TouchableOpacity style={[styles.cameraButton, { backgroundColor: theme.primary }]}>
                            <IconSymbol name="camera.fill" size={22} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.nameRow}>
                        <ThemedText type="title" style={styles.name}>Moritz Tiedemann</ThemedText>
                        <TouchableOpacity style={styles.editNameButton}>
                            <IconSymbol name="pencil" size={18} color={theme.primary} />
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.messagesCard, { backgroundColor: theme.card }]}>
                        <View style={styles.messagesRow}>
                            <View>
                                <ThemedText style={styles.messagesLabel}>Free messages left</ThemedText>
                                <ThemedText type="title" style={[styles.messagesCount, { color: theme.primary }]}>
                                    100
                                </ThemedText>
                            </View>
                            <TouchableOpacity style={[styles.premiumButton, { backgroundColor: theme.primary }]}>
                                <IconSymbol name="plus" size={16} color="#fff" />
                                <ThemedText style={styles.premiumButtonText}>Get ai.therapy</ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Tracking Dashboard */}
                <View style={styles.trackingSection}>
                    <View style={styles.sectionHeader}>
                        <ThemedText type="subtitle" style={styles.sectionTitle}>
                            Your Psychological Journey
                        </ThemedText>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <ThemedText style={styles.sectionSubtitle}>
                                {analyzing
                                    ? "Analyzing your latest conversations..."
                                    : lastUpdated
                                        ? (() => {
                                            const now = new Date();
                                            const hoursSince = Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60));
                                            const hoursUntilNext = Math.max(0, 24 - hoursSince);

                                            if (hoursSince < 1) {
                                                return "Updated just now • Refreshes daily";
                                            } else if (hoursSince < 24) {
                                                return `Updated ${hoursSince}h ago • Next update in ${hoursUntilNext}h`;
                                            } else {
                                                return "Updating soon...";
                                            }
                                        })()
                                        : "AI-powered insights • Updates daily"}
                            </ThemedText>
                        </View>
                    </View>

                    {analyzing ? (
                        <AnalysisLoading theme={theme} onComplete={() => setAnalyzing(false)} />
                    ) : analyticsData.length === 0 ? (
                        <View style={{ padding: 20, alignItems: 'center' }}>
                            <ThemedText style={{ opacity: 0.5 }}>No data yet. Start chatting!</ThemedText>
                        </View>
                    ) : (
                        <View style={styles.trackingGrid}>
                            {analyticsData.map(renderTrackingCard)}
                        </View>
                    )}

                    {/* Daily Insight */}
                    <View style={[styles.insightCard, { backgroundColor: theme.card }]}>
                        <LinearGradient
                            colors={[`${theme.primary}20`, 'transparent']}
                            style={styles.insightGradient}
                        />
                        <ThemedText type="defaultSemiBold" style={styles.insightTitle}>
                            ✨ Daily Insight
                        </ThemedText>
                        <ThemedText style={styles.insightText}>
                            "{dailyInsight}"
                        </ThemedText>
                    </View>

                    <TouchableOpacity
                        style={styles.signOutButton}
                        onPress={handleSignOut}
                    >
                        <ThemedText style={styles.signOutText}>Sign Out</ThemedText>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    profileHeader: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 24 },
    profileImageContainer: { width: 100, height: 100, borderRadius: 50, overflow: 'hidden', marginBottom: 16, position: 'relative' },
    profileImage: { width: '100%', height: '100%' },
    cameraButton: { position: 'absolute', bottom: -8, right: -8, width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#000', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5 },
    name: { fontSize: 24, marginBottom: 24 },
    messagesCard: { paddingVertical: 16, paddingHorizontal: 24, borderRadius: 16, alignItems: 'center', marginBottom: 32, width: '100%' },
    messagesLabel: { fontSize: 14, opacity: 0.7, marginBottom: 8 },
    messagesCount: { fontSize: 32, fontWeight: 'bold' },
    trackingSection: { paddingHorizontal: 24, paddingBottom: 40 },
    sectionHeader: { marginBottom: 24 },
    sectionTitle: { fontSize: 22, marginBottom: 8 },
    sectionSubtitle: { fontSize: 14, opacity: 0.6 },
    trackingGrid: { gap: 16 },
    trackingCard: { padding: 20, borderRadius: 16, gap: 16 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    cardTitleRow: { flexDirection: 'row', gap: 12, flex: 1 },
    cardIcon: { fontSize: 28 },
    cardTitleContainer: { flex: 1, gap: 4 },
    cardTitle: { fontSize: 16 },
    cardSubtitle: { fontSize: 13, opacity: 0.6 },
    trendBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    trendText: { fontSize: 13, fontWeight: '600' },
    progressSection: { gap: 12 },
    progressBar: { height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 4 },
    valueRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    valueText: { fontSize: 24 },
    statusText: { fontSize: 12, opacity: 0.6, fontWeight: '600', letterSpacing: 0.5 },
    insightCard: { marginTop: 24, padding: 24, borderRadius: 16, overflow: 'hidden' },
    insightGradient: { ...StyleSheet.absoluteFillObject },
    insightTitle: { fontSize: 18, marginBottom: 12 },
    insightText: { fontSize: 15, lineHeight: 22, opacity: 0.8 },
    feedbackButtonContainer: { position: 'absolute', top: 10, right: 16, zIndex: 10 },
    feedbackButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
    feedbackButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24 },
    editNameButton: { padding: 4 },
    messagesRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
    premiumButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20 },
    premiumButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
    signOutButton: { marginTop: 32, marginBottom: 48, marginHorizontal: 24, paddingVertical: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#FF6B6B' },
    signOutText: { color: '#FF6B6B', fontSize: 16, fontWeight: '600' },
});
