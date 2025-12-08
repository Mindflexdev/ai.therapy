import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width } = Dimensions.get('window');

// Fallback data in case dynamic data is missing
const FALLBACK_DATA: Record<string, any> = {
    '1': {
        insight: "Your emotional recovery has improved by 50% over the past 3 weeks.",
        metrics: [
            { label: 'Mood (Valence)', value: 82, range: [64, 90], status: 'Stable', explanation: 'Positive tone detected.' },
        ]
    }
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

    // Dynamic Data from Profile
    const dynamicInsight = params.insight as string;
    const dynamicSubDimensions = params.sub_dimensions as string;

    const data = useMemo(() => {
        try {
            if (dynamicSubDimensions) {
                const metrics = JSON.parse(dynamicSubDimensions);
                return {
                    insight: dynamicInsight || "No insight available yet.",
                    metrics: metrics
                };
            }
        } catch (e) {
            console.error("Failed to parse sub_dimensions:", e);
        }
        return FALLBACK_DATA[id] || FALLBACK_DATA['1'];
    }, [dynamicSubDimensions, dynamicInsight, id]);

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

                    {data.metrics && data.metrics.length > 0 ? (
                        data.metrics.map((metric: any, index: number) => (
                            <View key={index} style={[styles.metricCard, { backgroundColor: theme.card }]}>
                                <View style={styles.metricHeader}>
                                    <ThemedText type="defaultSemiBold" style={styles.metricLabel}>
                                        {metric.label || metric.name}
                                    </ThemedText>
                                    <ThemedText style={[styles.metricStatus, { color }]}>
                                        {metric.status}
                                    </ThemedText>
                                </View>

                                <View style={styles.metricValueRow}>
                                    <ThemedText type="title" style={styles.metricValue}>{metric.value}</ThemedText>
                                    <ThemedText style={styles.metricRange}>
                                        {metric.range ? `Range: ${metric.range[0]}-${metric.range[1]}` : 'Range: 0-100'}
                                    </ThemedText>
                                </View>

                                <View style={styles.progressBar}>
                                    <LinearGradient
                                        colors={[color, `${color}60`]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={[styles.progressFill, { width: `${Math.min(100, Math.max(0, metric.value))}%` }]}
                                    />
                                </View>

                                {(metric.explanation || metric.text) && (
                                    <ThemedText style={styles.metricExplanation}>
                                        {metric.explanation || metric.text}
                                    </ThemedText>
                                )}
                            </View>
                        ))
                    ) : (
                        <View style={{ padding: 20 }}>
                            <ThemedText style={{ opacity: 0.5 }}>No detailed metrics available.</ThemedText>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
    backButton: { padding: 8 },
    headerTitle: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    headerIcon: { fontSize: 32 },
    headerText: { fontSize: 18 },
    headerSubtext: { fontSize: 13, opacity: 0.6 },
    insightSection: { padding: 24 },
    insightCard: { padding: 24, borderRadius: 16, overflow: 'hidden' },
    insightGradient: { ...StyleSheet.absoluteFillObject },
    insightTitle: { fontSize: 18, marginBottom: 12 },
    insightText: { fontSize: 15, lineHeight: 22, opacity: 0.8 },
    metricsSection: { paddingHorizontal: 24, paddingBottom: 100, gap: 16 },
    sectionTitle: { fontSize: 20, marginBottom: 8 },
    metricCard: { padding: 20, borderRadius: 16, gap: 16 },
    metricHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    metricLabel: { fontSize: 16, flex: 1 },
    metricStatus: { fontSize: 13, fontWeight: '600' },
    metricValueRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
    metricValue: { fontSize: 32 },
    metricRange: { fontSize: 13, opacity: 0.6 },
    progressBar: { height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 4 },
    metricExplanation: { fontSize: 14, lineHeight: 20, opacity: 0.7, marginTop: 4 },
});
