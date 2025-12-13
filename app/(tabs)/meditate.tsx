import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Mock User Data
const USER_STREAK = 3; // Current user streak in days

const HIGHLIGHTS = [
    { id: '1', name: 'Dr. Morpheus', image: '/characters/Dr. Morpheus.jpg' },
    { id: '2', name: 'Joy Spark', image: '/characters/Joy Spark.jpg' },
    { id: '3', name: 'Dr. Courage', image: '/characters/Dr. Courage.jpg' },
    { id: '4', name: 'Coach Thunder', image: '/characters/Coach Thunder.jpg' },
];

// Mock Data for Meditations linked to Characters
const MEDITATIONS = [
    // Unlocked (0-3 days)
    {
        id: '1',
        title: 'Morning Sunshine',
        type: 'Meditation',
        duration: '5 min',
        characterName: 'Dr. Sunshine',
        characterImage: '/characters/Dr. Sunshine.jpg',
        image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=2662&auto=format&fit=crop',
        streakRequired: 0,
    },
    {
        id: '2',
        title: 'Deep Sleep Journey',
        type: 'Sleep Story',
        duration: '20 min',
        characterName: 'Dr. Morpheus',
        characterImage: '/characters/Dr. Morpheus.jpg',
        image: require('@/assets/images/deep_sleep_journey.png'),
        streakRequired: 0,
    },
    {
        id: '3',
        title: 'Anxiety Release',
        type: 'Breathwork',
        duration: '10 min',
        characterName: 'Dr. Courage',
        characterImage: '/characters/Dr. Courage.jpg',
        image: 'https://images.unsplash.com/photo-1474418397713-7ede21d49118?q=80&w=2653&auto=format&fit=crop',
        streakRequired: 1,
    },
    {
        id: '4',
        title: 'Focus Flow',
        type: 'Focus',
        duration: '15 min',
        characterName: 'Coach Thunder',
        characterImage: '/characters/Coach Thunder.jpg',
        image: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?q=80&w=2525&auto=format&fit=crop',
        streakRequired: 2,
    },
    {
        id: '5',
        title: 'Inner Child Healing',
        type: 'Therapy',
        duration: '12 min',
        characterName: 'Dr. Grace Chen',
        characterImage: '/characters/Dr. Grace Chen.jpg',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2673&auto=format&fit=crop',
        streakRequired: 3,
    },

    // Locked (>3 days)
    {
        id: '6',
        title: 'Finding Gratitude',
        type: 'Journaling',
        duration: '8 min',
        characterName: 'Dr. Thankful',
        characterImage: '/characters/Dr. Thankful.jpg',
        image: 'https://images.unsplash.com/photo-1499209974431-2761eb43a768?q=80&w=2670&auto=format&fit=crop',
        streakRequired: 5,
    },
    {
        id: '7',
        title: 'Overcoming Fear',
        type: 'Meditation',
        duration: '15 min',
        characterName: 'Fearless Wolf',
        characterImage: '/characters/Fearless Wolf.jpg',
        image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=2674&auto=format&fit=crop',
        streakRequired: 7,
    },
    {
        id: '8',
        title: 'Radical Self-Love',
        type: 'Affirmations',
        duration: '5 min',
        characterName: 'Sofia Bright',
        characterImage: '/characters/Sofia Bright.jpg',
        image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=2527&auto=format&fit=crop',
        streakRequired: 10,
    },
    {
        id: '9',
        title: 'Stress Melter',
        type: 'Somatic',
        duration: '10 min',
        characterName: 'Dr. Serenity',
        characterImage: '/characters/Dr. Serenity.jpg',
        image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2560&auto=format&fit=crop',
        streakRequired: 14,
    },
    {
        id: '10',
        title: 'Manifesting Dreams',
        type: 'Visualization',
        duration: '20 min',
        characterName: 'Luna Starlight',
        characterImage: '/characters/Luna Starlight.jpg',
        image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2694&auto=format&fit=crop',
        streakRequired: 21,
    },
    {
        id: '11',
        title: 'The Art of Doing Nothing',
        type: 'Relaxation',
        duration: '15 min',
        characterName: 'Lazy Sloth',
        characterImage: '/characters/Lazy Sloth.jpg',
        image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=2670&auto=format&fit=crop',
        streakRequired: 30,
    },
    {
        id: '12',
        title: 'Forest Bathing',
        type: 'Nature Sounds',
        duration: '30 min',
        characterName: 'Harvest Bear',
        characterImage: '/characters/Harvest Bear.jpg',
        image: 'https://images.unsplash.com/photo-1448375240586-dfd8f3793371?q=80&w=2670&auto=format&fit=crop',
        streakRequired: 45,
    },
    {
        id: '13',
        title: 'Eagle Vision',
        type: 'Perspective',
        duration: '10 min',
        characterName: 'Eagle Eye',
        characterImage: '/characters/Eagle Eye.jpg',
        image: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?q=80&w=2676&auto=format&fit=crop',
        streakRequired: 60,
    },
    {
        id: '14',
        title: 'Ocean Breath',
        type: 'Breathwork',
        duration: '12 min',
        characterName: 'Calm Dolphin',
        characterImage: '/characters/Calm Dolphin.jpg',
        image: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?q=80&w=2652&auto=format&fit=crop',
        streakRequired: 75,
    },
    {
        id: '15',
        title: 'Zen Mastery',
        type: 'Advanced',
        duration: '60 min',
        characterName: 'Zen Master',
        characterImage: '/characters/Zen Master.jpg',
        image: 'https://images.unsplash.com/photo-1528351655768-2c831e774331?q=80&w=2574&auto=format&fit=crop',
        streakRequired: 90,
    },
];

export default function MindGymScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const renderSectionHeader = (title: string, showSeeAll = true) => (
        <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>{title}</ThemedText>
            {showSeeAll && (
                <TouchableOpacity>
                    <ThemedText style={[styles.seeAllText, { color: theme.primary }]}>See All</ThemedText>
                </TouchableOpacity>
            )}
        </View>
    );

    const renderHighlight = (item: typeof HIGHLIGHTS[0]) => (
        <TouchableOpacity
            key={item.id}
            style={styles.highlightContainer}
            onPress={() => router.push({
                pathname: '/player',
                params: {
                    title: `Daily Session with ${item.name}`,
                    author: 'TherapyAI',
                    narrator: item.name,
                    image: item.image,
                    duration: '10:00'
                }
            })}
        >
            <View style={[styles.highlightRing, { borderColor: theme.primary }]}>
                <Image
                    source={{ uri: item.image }}
                    style={styles.highlightImage}
                    cachePolicy="memory-disk"
                    transition={300}
                />
            </View>
            <ThemedText style={styles.highlightName} numberOfLines={1}>{item.name}</ThemedText>
        </TouchableOpacity>
    );

    const renderCard = (item: typeof MEDITATIONS[0], large = false) => {
        const isLocked = item.streakRequired > USER_STREAK;
        const daysRemaining = item.streakRequired - USER_STREAK;

        return (
            <TouchableOpacity
                key={item.id}
                style={[
                    styles.card,
                    large ? styles.cardLarge : styles.cardSmall,
                    { backgroundColor: theme.card }
                ]}
                disabled={isLocked}
                onPress={() => router.push({
                    pathname: '/player',
                    params: {
                        title: item.title,
                        author: item.characterName,
                        narrator: item.characterName,
                        image: item.characterImage,
                        duration: item.duration
                    }
                })}
            >

                <View style={styles.imageContainer}>
                    <Image
                        source={typeof item.image === 'string' ? { uri: item.image } : item.image}
                        style={styles.cardImage}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                        transition={300}
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.7)']}
                        style={styles.cardGradient}
                    />

                    {/* Lock Overlay */}
                    {isLocked && (
                        <View style={styles.lockOverlay}>
                            <View style={styles.lockBadge}>
                                <IconSymbol name="lock.fill" size={20} color="#fff" />
                            </View>
                            <ThemedText style={styles.lockText}>
                                {daysRemaining} more days
                            </ThemedText>
                        </View>
                    )}

                    {/* Duration Badge */}
                    <View style={styles.durationBadge}>
                        <IconSymbol name="clock.fill" size={10} color="#fff" />
                        <ThemedText style={styles.durationText}>{item.duration}</ThemedText>
                    </View>
                </View>

                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <ThemedText style={styles.cardType} numberOfLines={1}>{item.type}</ThemedText>
                        {item.streakRequired > 0 && !isLocked && (
                            <View style={styles.unlockedBadge}>
                                <IconSymbol name="checkmark.circle.fill" size={12} color={theme.primary} />
                            </View>
                        )}
                    </View>

                    <ThemedText type="defaultSemiBold" style={styles.cardTitle} numberOfLines={1}>
                        {item.title}
                    </ThemedText>

                    <View style={styles.authorContainer}>
                        <Image
                            source={{ uri: item.characterImage }}
                            style={styles.authorImage}
                            cachePolicy="memory-disk"
                            transition={300}
                        />
                        <ThemedText style={styles.authorName} numberOfLines={1}>
                            {item.characterName}
                        </ThemedText>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    // Group meditations
    const popularItems = MEDITATIONS.slice(0, 5);
    const challengeItems = MEDITATIONS.slice(5, 10);
    const masterItems = MEDITATIONS.slice(10, 15);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            {/* Header with Search and Feedback */}
            <View style={styles.header}>
                <ThemedText type="title" style={styles.headerTitle}>Meditate</ThemedText>
                <View style={styles.headerButtons}>
                    <TouchableOpacity style={styles.headerButton}>
                        <IconSymbol name="magnifyingglass" size={24} color={theme.text} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.feedbackButton, { backgroundColor: theme.primary }]}
                        onPress={() => router.push('/feedback')}
                    >
                        <ThemedText style={styles.feedbackButtonText}>Feedback?</ThemedText>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Spacer removed since we have header now */}

                {/* Highlights Section */}
                <View style={styles.highlightsSection}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.highlightsList}>
                        {HIGHLIGHTS.map(renderHighlight)}
                    </ScrollView>
                </View>

                {/* Popular Section */}
                <View style={styles.section}>
                    {renderSectionHeader('Popular Sessions')}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                        {popularItems.map(item => renderCard(item, true))}
                    </ScrollView>
                </View>

                {/* Challenge Section */}
                <View style={styles.section}>
                    {renderSectionHeader('Unlockable Challenges')}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                        {challengeItems.map(item => renderCard(item, false))}
                    </ScrollView>
                </View>

                {/* Mastery Section */}
                <View style={styles.section}>
                    {renderSectionHeader('Mastery Series')}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
                        {masterItems.map(item => renderCard(item, false))}
                    </ScrollView>
                </View>

                {/* Bottom Padding */}
                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Coming Soon Overlay */}
            <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
                <View style={styles.overlayContent}>
                    <IconSymbol name="brain" size={100} color="#fff" style={{ marginBottom: 24, opacity: 0.9 }} />
                    <ThemedText type="title" style={styles.overlayTitle}>Meditate</ThemedText>
                    <View style={styles.overlayTextContainer}>
                        <ThemedText style={styles.overlayText}>
                            In 2026: Unlock guided meditations based on your chats!
                        </ThemedText>
                    </View>
                </View>
            </View>
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    overlayContent: {
        padding: 32,
        alignItems: 'center',
        gap: 16,
    },
    overlayTitle: {
        color: '#fff',
        fontSize: 28,
        marginTop: 8,
        fontWeight: 'bold',
    },
    overlayTextContainer: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 16,
        marginTop: 8,
    },
    overlayText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 16,
        lineHeight: 24,
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: '600',
    },
    horizontalList: {
        paddingHorizontal: 20,
        gap: 16,
    },
    card: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    cardLarge: {
        width: 280,
    },
    cardSmall: {
        width: 200,
    },
    imageContainer: {
        height: 160,
        width: '100%',
        position: 'relative',
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    cardGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '50%',
    },
    lockOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    lockBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    lockText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 12,
    },
    durationBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    durationText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '600',
    },
    cardContent: {
        padding: 16,
        gap: 8,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardType: {
        fontSize: 12,
        opacity: 0.7,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    unlockedBadge: {
        marginLeft: 4,
    },
    cardTitle: {
        fontSize: 16,
    },
    authorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 4,
    },
    authorImage: {
        width: 24,
        height: 24,
        borderRadius: 12,
    },
    authorName: {
        fontSize: 12,
        opacity: 0.8,
        flex: 1,
    },
    highlightsSection: {
        marginBottom: 24,
    },
    highlightsList: {
        paddingHorizontal: 20,
        gap: 20,
    },
    highlightContainer: {
        alignItems: 'center',
        gap: 8,
        width: 72,
    },
    highlightRing: {
        width: 72,
        height: 72,
        borderRadius: 36,
        borderWidth: 2,
        padding: 3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    highlightImage: {
        width: '100%',
        height: '100%',
        borderRadius: 33,
    },
    highlightName: {
        fontSize: 11,
        textAlign: 'center',
        opacity: 0.8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    headerTitle: {
        fontSize: 28,
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerButton: {
        padding: 8,
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
});
