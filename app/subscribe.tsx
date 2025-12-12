import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width: screenWidth } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const MAX_CONTENT_WIDTH = 480; // Mobile-width constraint for desktop

// Sleepy Bear from Supabase storage
const SLEEPY_BEAR_IMAGE = 'https://cxzzakslsiynhjeyhejo.supabase.co/storage/v1/object/public/characters/Sleepy%20Bear.jpg';

export default function SubscribeScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [isYearly, setIsYearly] = useState(true);

    // Premium feature colors - each feature has its own unique accent
    const featureColors = {
        moon: { bg: '#F0E6FF', icon: '#8B5CF6' },      // Purple - calm, night
        timer: { bg: '#DBEAFE', icon: '#3B82F6' },     // Blue - time, sessions
        sparkles: { bg: '#FEF3C7', icon: '#F59E0B' },  // Amber - AI, magic
        book: { bg: '#D1FAE5', icon: '#10B981' },      // Emerald - memory, knowledge
        ticket: { bg: '#FCE7F3', icon: '#EC4899' },    // Pink - exclusive, VIP
        bolt: { bg: '#FEE2E2', icon: '#EF4444' },      // Red - speed, priority
    };

    const benefits = [
        {
            icon: 'moon.fill',
            title: 'Less Interruptions',
            description: 'No pop-ups or distractions during your therapy sessions.',
            colorKey: 'moon',
        },
        {
            icon: 'timer.fill',
            title: 'Extended Sessions',
            description: 'Longer conversations, more context, and deeper insights.',
            colorKey: 'timer',
        },
        {
            icon: 'sparkles',
            title: 'Advanced AI Models',
            description: 'Access to our smartest and most empathetic AI models.',
            colorKey: 'sparkles',
        },
        {
            icon: 'book.closed.fill',
            title: 'Enhanced Memory',
            description: 'Characters remember details from your past sessions.',
            colorKey: 'book',
        },
        {
            icon: 'ticket.fill',
            title: 'Exclusive Benefits',
            description: 'Unlock new features first & join the ai.therapy+ community.',
            colorKey: 'ticket',
        },
        {
            icon: 'bolt.fill',
            title: 'Priority Access',
            description: 'Skip the waiting line during peak hours.',
            colorKey: 'bolt',
        },
    ];

    return (
        <View style={styles.container}>
            {/* White/Light background */}
            <View style={StyleSheet.absoluteFill}>
                <View style={styles.backgroundGradient} />
            </View>

            {/* Back Button */}
            <SafeAreaView style={styles.backButtonContainer} edges={['top']}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}>
                    <IconSymbol name="chevron.left" size={24} color="#1F2937" />
                </TouchableOpacity>
            </SafeAreaView>

            {/* Main content wrapper - constrains to mobile width on desktop */}
            <View style={styles.mainWrapper}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Header - Title first, then character */}
                    <View style={styles.headerSection}>
                        <ThemedText type="title" style={styles.title}>
                            ai.therapy<ThemedText style={styles.plusSign}>+</ThemedText>
                        </ThemedText>

                        {/* Character image with premium glow */}
                        <View style={styles.characterContainer}>
                            <LinearGradient
                                colors={['#8B5CF6', '#3B82F6', '#10B981']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.characterGradientRing}
                            />
                            <Image
                                source={SLEEPY_BEAR_IMAGE}
                                style={styles.characterImage}
                                contentFit="cover"
                            />
                        </View>
                    </View>

                    {/* Toggle Switch - Premium glass effect */}
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
                            <View style={styles.toggleContent}>
                                <ThemedText style={[styles.toggleText, isYearly && styles.toggleTextActive]}>
                                    Yearly
                                </ThemedText>
                                <View style={styles.saveBadge}>
                                    <ThemedText style={styles.saveText}>-16%</ThemedText>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Benefits List - Premium cards */}
                    <View style={styles.benefitsList}>
                        {benefits.map((benefit, index) => {
                            const colors = featureColors[benefit.colorKey as keyof typeof featureColors];
                            return (
                                <View key={index} style={styles.benefitCard}>
                                    <View style={[styles.benefitIcon, { backgroundColor: colors.bg }]}>
                                        <IconSymbol name={benefit.icon as any} size={22} color={colors.icon} />
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
                            );
                        })}
                    </View>

                    {/* Trust indicators */}
                    <View style={styles.trustSection}>
                        <View style={styles.trustItem}>
                            <IconSymbol name="lock.fill" size={14} color="#6B7280" />
                            <ThemedText style={styles.trustText}>Secure payment</ThemedText>
                        </View>
                        <View style={styles.trustDivider} />
                        <View style={styles.trustItem}>
                            <IconSymbol name="checkmark.circle.fill" size={14} color="#6B7280" />
                            <ThemedText style={styles.trustText}>Cancel anytime</ThemedText>
                        </View>
                    </View>
                </ScrollView>

                {/* Full-width Footer matching feature cards */}
                <View style={styles.footer}>
                    <View style={styles.priceRow}>
                        <ThemedText style={styles.price}>
                            {isYearly ? '99.99 €' : '9.99 €'}
                        </ThemedText>
                        <ThemedText style={styles.pricePeriod}>
                            /{isYearly ? 'year' : 'month'}
                        </ThemedText>
                        {isYearly && (
                            <View style={styles.savingsBadge}>
                                <ThemedText style={styles.savingsNote}>Save 19.89 €</ThemedText>
                            </View>
                        )}
                    </View>

                    <TouchableOpacity style={styles.subscribeButton}>
                        <LinearGradient
                            colors={['#8B5CF6', '#6366F1']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.subscribeGradient}
                        >
                            <ThemedText style={styles.subscribeText}>
                                Start Free Trial
                            </ThemedText>
                        </LinearGradient>
                    </TouchableOpacity>

                    <ThemedText style={styles.footerNote}>
                        7-day free trial • Cancel anytime
                    </ThemedText>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    backgroundGradient: {
        flex: 1,
        backgroundColor: '#FAFBFC',
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
        zIndex: 100,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
    },
    mainWrapper: {
        flex: 1,
        width: '100%',
        maxWidth: MAX_CONTENT_WIDTH,
        alignSelf: 'center',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 140,
    },
    headerSection: {
        alignItems: 'center',
        marginBottom: 16,
    },
    characterContainer: {
        marginTop: 16,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    characterGradientRing: {
        position: 'absolute',
        width: 108,
        height: 108,
        borderRadius: 54,
    },
    characterImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: '#FFFFFF',
    },
    title: {
        fontSize: 28,
        textAlign: 'center',
        color: '#1F2937',
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    plusSign: {
        color: '#8B5CF6',
        fontSize: 28,
        fontWeight: '800',
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderRadius: 14,
        padding: 3,
        marginBottom: 16,
    },
    toggleOption: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 11,
    },
    toggleActive: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    toggleContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    toggleText: {
        color: '#9CA3AF',
        fontWeight: '600',
        fontSize: 14,
    },
    toggleTextActive: {
        color: '#1F2937',
    },
    saveBadge: {
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 5,
    },
    saveText: {
        color: '#16A34A',
        fontSize: 11,
        fontWeight: '700',
    },
    benefitsList: {
        gap: 10,
    },
    benefitCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        padding: 14,
        borderRadius: 14,
        alignItems: 'center',
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    benefitIcon: {
        width: 42,
        height: 42,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    benefitContent: {
        flex: 1,
    },
    benefitTitle: {
        color: '#1F2937',
        marginBottom: 2,
        fontSize: 15,
        fontWeight: '600',
    },
    benefitDesc: {
        color: '#6B7280',
        fontSize: 13,
        lineHeight: 18,
    },
    trustSection: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        paddingVertical: 12,
    },
    trustItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    trustText: {
        color: '#6B7280',
        fontSize: 12,
    },
    trustDivider: {
        width: 1,
        height: 14,
        backgroundColor: '#E5E7EB',
        marginHorizontal: 14,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingTop: 14,
        paddingBottom: 28,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 8,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        marginBottom: 12,
    },
    price: {
        color: '#1F2937',
        fontSize: 24,
        fontWeight: '800',
    },
    pricePeriod: {
        color: '#6B7280',
        fontSize: 16,
        fontWeight: '500',
    },
    savingsBadge: {
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        marginLeft: 8,
    },
    savingsNote: {
        color: '#16A34A',
        fontSize: 12,
        fontWeight: '600',
    },
    subscribeButton: {
        borderRadius: 14,
        overflow: 'hidden',
        marginBottom: 10,
    },
    subscribeGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    subscribeText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    footerNote: {
        color: '#9CA3AF',
        fontSize: 11,
        textAlign: 'center',
    },
});
