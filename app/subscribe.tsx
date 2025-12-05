import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, Dimensions, ImageBackground } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { MOCK_CHATS, TOPICS } from '@/constants/data';

const { width } = Dimensions.get('window');

export default function SubscribeScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [isYearly, setIsYearly] = useState(true);

    // Logic to get the adaptive image
    // 1. Try to get the last active chat character
    // 2. Fallback to Dr. Morpheus
    const lastChat = MOCK_CHATS.length > 0 ? MOCK_CHATS[0] : null;
    let heroImage = '/characters/Dr. Morpheus.jpg'; // Default fallback

    if (lastChat) {
        // Find the character details to get the image
        // In a real app, we might store the full character object or look it up properly
        // For now, we use the image from the chat object if available, or look it up
        heroImage = lastChat.characterImage;
    }

    const benefits = [
        {
            icon: 'moon.fill',
            title: 'Less Interruptions',
            description: 'No pop-ups or distractions during your therapy sessions.',
        },
        {
            icon: 'arrow.up.circle.fill',
            title: 'Extended Sessions',
            description: 'Longer conversations, more context, and deeper memory.',
        },
        {
            icon: 'sparkles',
            title: 'Advanced Models',
            description: 'Access to our smartest and most empathetic AI models (18+).',
        },
        {
            icon: 'book.closed.fill',
            title: 'Better Memory',
            description: 'Characters remember details from your past sessions much better.',
        },
        {
            icon: 'ticket.fill',
            title: 'Exclusive Benefits',
            description: 'Unlock new features first & join the therapy.ai+ community.',
        },
        {
            icon: 'bolt.fill',
            title: 'Priority Access',
            description: 'Skip the waiting line during peak hours.',
        },
    ];

    return (
        <View style={[styles.container, { backgroundColor: '#000' }]}>
            {/* Hero Image Background */}
            <View style={styles.heroContainer}>
                <Image
                    source={heroImage}
                    style={styles.heroImage}
                    contentFit="cover"
                    contentPosition="top center"
                />
                <LinearGradient
                    colors={['transparent', '#000']}
                    style={styles.heroGradient}
                />
            </View>

            {/* Back Button Overlay - Moved to root for better z-index */}
            <SafeAreaView style={styles.backButtonContainer} edges={['top']}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}>
                    <IconSymbol name="chevron.left" size={32} color="#fff" />
                </TouchableOpacity>
            </SafeAreaView>

            <View style={styles.contentContainer}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <ThemedText type="title" style={styles.title}>
                        Upgrade to therapy.ai +
                    </ThemedText>

                    {/* Toggle Switch */}
                    <View style={styles.toggleContainer}>
                        <TouchableOpacity
                            style={[styles.toggleOption, !isYearly && styles.toggleActive]}
                            onPress={() => setIsYearly(false)}>
                            <ThemedText style={[styles.toggleText, !isYearly && styles.toggleTextActive]}>
                                Monthly
                            </ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.toggleOption, isYearly && styles.toggleActive]}
                            onPress={() => setIsYearly(true)}>
                            <ThemedText style={[styles.toggleText, isYearly && styles.toggleTextActive]}>
                                Yearly <ThemedText style={styles.saveText}>-16%</ThemedText>
                            </ThemedText>
                        </TouchableOpacity>
                    </View>

                    {/* Benefits List */}
                    <View style={styles.benefitsList}>
                        {benefits.map((benefit, index) => (
                            <View key={index} style={styles.benefitCard}>
                                <View style={styles.benefitIcon}>
                                    <IconSymbol name={benefit.icon as any} size={24} color={theme.primary} />
                                </View>
                                <View style={styles.benefitContent}>
                                    <ThemedText type="defaultSemiBold" style={styles.benefitTitle}>
                                        {benefit.title}
                                    </ThemedText>
                                    <ThemedText style={styles.benefitDesc}>
                                        {benefit.description}
                                    </ThemedText>
                                </View>
                            </View>
                        ))}
                    </View>
                </ScrollView>

                {/* Sticky Footer */}
                <View style={[styles.footer, { backgroundColor: '#000' }]}>
                    {isYearly && (
                        <ThemedText style={styles.footerNote}>
                            Save 19.89 € per year. Renews yearly until cancelled.
                        </ThemedText>
                    )}
                    {!isYearly && (
                        <ThemedText style={styles.footerNote}>
                            Renews monthly until cancelled.
                        </ThemedText>
                    )}

                    <TouchableOpacity style={[styles.subscribeButton, { backgroundColor: theme.primary }]}>
                        <ThemedText style={styles.subscribeText}>
                            Subscribe for {isYearly ? '99.99 €/year' : '9.99 €/mo'}
                        </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.back()}>
                        <ThemedText style={styles.skipText}>Skip for now</ThemedText>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    heroContainer: {
        height: 400, // Increased height
        width: '100%',
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    heroGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 200, // Taller gradient
    },
    backButtonContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingHorizontal: 16,
        zIndex: 100, // Increased zIndex
        elevation: 5, // For Android
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        marginLeft: -8, // Adjust alignment to match other screens if needed
    },
    contentContainer: {
        flex: 1,
        marginTop: -40, // Pull content up
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 220, // Clear footer
    },
    title: {
        fontSize: 28,
        textAlign: 'center',
        color: '#fff',
        marginBottom: 24,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#1C1C1E',
        borderRadius: 25,
        padding: 4,
        marginBottom: 24,
    },
    toggleOption: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 21,
    },
    toggleActive: {
        backgroundColor: '#3A3A3C',
    },
    toggleText: {
        color: '#8E8E93',
        fontWeight: '600',
    },
    toggleTextActive: {
        color: '#fff',
    },
    saveText: {
        color: '#5B8FD8',
        fontSize: 12,
    },
    benefitsList: {
        gap: 12,
    },
    benefitCard: {
        flexDirection: 'row',
        backgroundColor: '#1C1C1E',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        gap: 16,
    },
    benefitIcon: {
        width: 32,
        alignItems: 'center',
    },
    benefitContent: {
        flex: 1,
    },
    benefitTitle: {
        color: '#fff',
        marginBottom: 4,
    },
    benefitDesc: {
        color: '#8E8E93',
        fontSize: 13,
        lineHeight: 18,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        paddingBottom: 34,
        borderTopWidth: 1,
        borderTopColor: '#1C1C1E',
    },
    footerNote: {
        color: '#5B8FD8',
        fontSize: 12,
        textAlign: 'center',
        marginBottom: 16,
    },
    subscribeButton: {
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
        marginBottom: 16,
    },
    subscribeText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: 'bold',
    },
    skipText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: '600',
    },
});
