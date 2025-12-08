import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock tracking data
const TRACKING_DATA = [
    {
        id: '1',
        title: 'Emotional States',
        subtitle: 'Mood & Energy',
        icon: '🎭',
        value: 78,
        status: 'OPTIMAL',
        trend: '+12%',
        color: '#4ECDC4',
    },
    {
        id: '2',
        title: 'Life Areas',
        subtitle: 'Focus Distribution',
        icon: '🎯',
        value: 65,
        status: 'BALANCED',
        trend: '+5%',
        color: '#95E1D3',
    },
    {
        id: '3',
        title: 'Psychological Patterns',
        subtitle: 'Thought Quality',
        icon: '🧠',
        value: 82,
        status: 'IMPROVING',
        trend: '+18%',
        color: '#F38181',
    },
    {
        id: '4',
        title: 'Goals & Values',
        subtitle: 'Alignment',
        icon: '⭐',
        value: 71,
        status: 'GROWING',
        trend: '+8%',
        color: '#AA96DA',
    },
    {
        id: '5',
        title: 'Actions & Skills',
        subtitle: 'Real Behavior',
        icon: '💪',
        value: 88,
        status: 'STRONG',
        trend: '+22%',
        color: '#FCBAD3',
    },
    {
        id: '6',
        title: 'Resilience',
        subtitle: 'Recovery Speed',
        icon: '🔋',
        value: 75,
        status: 'STABLE',
        trend: '+15%',
        color: '#FFFFD2',
    },
    {
        id: '7',
        title: 'Psychological Flexibility',
        subtitle: 'ACT Core',
        icon: '🌿',
        value: 80,
        status: 'EXCELLENT',
        trend: '+10%',
        color: '#A8D8EA',
    },
    {
        id: '8',
        title: 'Alliance & Connection',
        subtitle: 'Therapeutic Bond',
        icon: '🤝',
        value: 92,
        status: 'OUTSTANDING',
        trend: '+6%',
        color: '#FFCFDF',
    },
];

export default function ProfileScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const handleEmailPress = () => {
        Linking.openURL('mailto:hello@ai.therapy');
    };

    const handleSignOut = async () => {
        try {
            await supabase.auth.signOut();
            await AsyncStorage.removeItem('skipLogin');
            router.replace('/sign-in'); // Or '/' which redirects to sign-in
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const renderTrackingCard = (item: typeof TRACKING_DATA[0]) => (
        <TouchableOpacity
            key={item.id}
            style={[styles.trackingCard, { backgroundColor: theme.card }]}
            onPress={() => router.push({
                pathname: '/tracking-detail',
                params: {
                    id: item.id,
                    title: item.title,
                    subtitle: item.subtitle,
                    icon: item.icon,
                    color: item.color
                }
            })}
        >
            <View style={styles.cardHeader}>
                <View style={styles.cardTitleRow}>
                    <ThemedText style={styles.cardIcon}>{item.icon}</ThemedText>
                    <View style={styles.cardTitleContainer}>
                        <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
                            {item.title}
                        </ThemedText>
                        <ThemedText style={styles.cardSubtitle}>{item.subtitle}</ThemedText>
                    </View>
                </View>
                <View style={[styles.trendBadge, { backgroundColor: `${item.color}20` }]}>
                    <ThemedText style={[styles.trendText, { color: item.color }]}>
                        {item.trend}
                    </ThemedText>
                </View>
            </View>

            <View style={styles.progressSection}>
                <View style={styles.progressBar}>
                    <LinearGradient
                        colors={[item.color, `${item.color}80`]}
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

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            {/* Feedback Button */}
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
                            source={{ uri: '/characters/Dr. Morpheus.jpg' }}
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
                        <ThemedText style={styles.sectionSubtitle}>
                            AI-powered insights from your conversations
                        </ThemedText>
                    </View>

                    <View style={styles.trackingGrid}>
                        {TRACKING_DATA.map(renderTrackingCard)}
                    </View>

                    {/* Insight Summary */}
                    <View style={[styles.insightCard, { backgroundColor: theme.card }]}>
                        <LinearGradient
                            colors={[`${theme.primary}20`, 'transparent']}
                            style={styles.insightGradient}
                        />
                        <ThemedText type="defaultSemiBold" style={styles.insightTitle}>
                            ✨ This Week's Insight
                        </ThemedText>
                        <ThemedText style={styles.insightText}>
                            "You're recovering from stress 50% faster than 3 weeks ago. Your emotional resilience is growing steadily."
                        </ThemedText>
                    </View>

                    {/* Sign Out Button */}
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
    container: {
        flex: 1,
    },
    profileHeader: {
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 24,
    },
    profileImageContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        overflow: 'hidden',
        marginBottom: 16,
        position: 'relative',
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
    cameraButton: {
        position: 'absolute',
        bottom: -8,
        right: -8,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    name: {
        fontSize: 24,
        marginBottom: 24,
    },
    messagesCard: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 32,
        width: '100%',
    },
    messagesLabel: {
        fontSize: 14,
        opacity: 0.7,
        marginBottom: 8,
    },
    messagesCount: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    contactSection: {
        alignItems: 'center',
        gap: 8,
    },
    contactLabel: {
        fontSize: 14,
        fontWeight: '600',
        opacity: 0.7,
    },
    contactEmail: {
        fontSize: 16,
        fontWeight: '600',
    },
    contactSubtext: {
        fontSize: 13,
        opacity: 0.6,
        textAlign: 'center',
    },
    trackingSection: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    sectionHeader: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 22,
        marginBottom: 8,
    },
    sectionSubtitle: {
        fontSize: 14,
        opacity: 0.6,
    },
    trackingGrid: {
        gap: 16,
    },
    trackingCard: {
        padding: 20,
        borderRadius: 16,
        gap: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    cardTitleRow: {
        flexDirection: 'row',
        gap: 12,
        flex: 1,
    },
    cardIcon: {
        fontSize: 28,
    },
    cardTitleContainer: {
        flex: 1,
        gap: 4,
    },
    cardTitle: {
        fontSize: 16,
    },
    cardSubtitle: {
        fontSize: 13,
        opacity: 0.6,
    },
    trendBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    trendText: {
        fontSize: 13,
        fontWeight: '600',
    },
    progressSection: {
        gap: 12,
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
    valueRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    valueText: {
        fontSize: 24,
    },
    statusText: {
        fontSize: 12,
        opacity: 0.6,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    insightCard: {
        marginTop: 24,
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
    feedbackButtonContainer: {
        position: 'absolute',
        top: 10,
        right: 16,
        zIndex: 10,
    },
    feedbackButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    feedbackButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 24,
    },
    editNameButton: {
        padding: 4,
    },
    messagesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    premiumButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    premiumButtonText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
    signOutButton: {
        marginTop: 32,
        marginBottom: 48,
        marginHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FF6B6B',
    },
    signOutText: {
        color: '#FF6B6B',
        fontSize: 16,
        fontWeight: '600',
    },
});
