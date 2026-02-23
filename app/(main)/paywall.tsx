import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Theme } from '../../src/constants/Theme';
import { X, Check } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSubscription } from '../../src/context/SubscriptionContext';

export default function PaywallScreen() {
    const router = useRouter();
    const { name } = useLocalSearchParams();
    const [isTrialEnabled, setIsTrialEnabled] = useState(false);
    const { offerings, purchasePackage, restorePurchases, isPro, isLoading } = useSubscription();

    // Get the current offering's weekly package
    const currentOffering = offerings?.current;
    const weeklyPackage = currentOffering?.weekly;

    // Dynamic pricing from RevenueCat
    const priceString = weeklyPackage?.product.priceString ?? '---';
    const introPrice = weeklyPackage?.product.introPrice;
    const hasTrialOffer = !!introPrice && introPrice.price === 0;

    const handleContinue = async () => {
        if (!weeklyPackage) return;

        const success = await purchasePackage(weeklyPackage);
        if (success) {
            router.push({
                pathname: '/(main)/chat',
                params: { name },
            });
        }
    };

    const handleRestore = async () => {
        await restorePurchases();
    };

    const handleClose = () => {
        router.back();
    };

    const FeatureRow = ({ label, free, pro }: any) => (
        <View style={styles.featureRow}>
            <Text style={styles.featureLabel}>{label}</Text>
            <View style={styles.featureStatus}>
                <Text style={styles.statusText}>{free ? '✓' : '—'}</Text>
            </View>
            <View style={[styles.featureStatus, styles.proStatus]}>
                <Check size={18} color={Theme.colors.primary} />
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <X size={24} color={Theme.colors.text.muted} />
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.logoSection}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../../assets/logo_ai.png')}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                        <Text style={styles.logo}>
                            <Text style={styles.logoWhite}>ai</Text>
                            <Text style={styles.logoDot}>.</Text>
                            <Text style={styles.logoWhite}>therapy</Text>
                        </Text>
                    </View>
                    <Text style={styles.slogan}>(not real therapy)</Text>
                </View>

                <Text style={styles.title}>Unlock Pro Access</Text>

                <View style={styles.tableHeader}>
                    <Text style={styles.headerSpacer}></Text>
                    <Text style={styles.headerLabel}>FREE</Text>
                    <Text style={[styles.headerLabel, styles.proLabel]}>PRO</Text>
                </View>

                <View style={styles.comparisonTable}>
                    <FeatureRow label="Unlimited Messages" free={true} pro={true} />
                    <FeatureRow label="Unlock All Characters" free={false} pro={true} />
                    <FeatureRow label="Long-term Memory" free={false} pro={true} />
                    <FeatureRow label="Voice & Phone Calls" free={false} pro={true} />
                </View>

                {hasTrialOffer && (
                    <View style={styles.trialSection}>
                        <Text style={styles.trialText}>Not sure yet? Enable free trial</Text>
                        <TouchableOpacity
                            onPress={() => setIsTrialEnabled(!isTrialEnabled)}
                            activeOpacity={0.8}
                            style={[
                                styles.customSwitch,
                                isTrialEnabled ? styles.customSwitchActive : styles.customSwitchInactive
                            ]}
                        >
                            <View style={[
                                styles.customSwitchThumb,
                                isTrialEnabled ? styles.customSwitchThumbActive : styles.customSwitchThumbInactive
                            ]} />
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.ctaSection}>
                    {isLoading ? (
                        <ActivityIndicator color={Theme.colors.primary} size="large" style={{ marginBottom: Theme.spacing.m }} />
                    ) : (
                        <>
                            <Text style={styles.priceInfo}>
                                {isTrialEnabled && hasTrialOffer ? (
                                    <>Start your <Text style={styles.price}>7-day free trial</Text>, then {priceString}/week</>
                                ) : (
                                    <>Subscribe to Pro for just <Text style={styles.price}>{priceString}/week</Text></>
                                )}
                            </Text>
                            <TouchableOpacity
                                style={[styles.continueBtn, !weeklyPackage && styles.continueBtnDisabled]}
                                onPress={handleContinue}
                                disabled={!weeklyPackage}
                            >
                                <Text style={styles.continueText}>
                                    {isTrialEnabled && hasTrialOffer ? 'Start Free Trial' : 'Continue'}
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                <View style={styles.footerLinks}>
                    <TouchableOpacity onPress={handleRestore}>
                        <Text style={styles.footerLink}>Restore Purchases</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push({ pathname: '/(main)/legal', params: { section: 'terms' } })}>
                        <Text style={styles.footerLink}>Terms</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push({ pathname: '/(main)/legal', params: { section: 'privacy' } })}>
                        <Text style={styles.footerLink}>Privacy</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    closeButton: {
        padding: Theme.spacing.l,
        alignSelf: 'flex-end',
    },
    scrollContent: {
        paddingHorizontal: Theme.spacing.xl,
        paddingBottom: Theme.spacing.xxl,
        alignItems: 'center',
        width: '100%',
        maxWidth: 1500,
        alignSelf: 'center',
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: Theme.spacing.xl,
        marginTop: -Theme.spacing.m,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    logoImage: {
        width: 52,
        height: 52,
        marginTop: 14,
    },
    logo: {
        fontSize: 28,
        fontFamily: 'Outfit-Regular',
    },
    logoWhite: {
        color: Theme.colors.text.primary,
    },
    logoDot: {
        color: Theme.colors.primary,
    },
    slogan: {
        fontSize: 10,
        color: Theme.colors.text.secondary,
        fontFamily: 'Outfit-Regular',
        marginTop: -18,
        textAlign: 'center',
    },
    title: {
        fontSize: 24,
        color: Theme.colors.text.primary,
        fontFamily: 'Inter-Bold',
        textAlign: 'center',
        marginBottom: Theme.spacing.xl,
    },
    tableHeader: {
        flexDirection: 'row',
        width: '100%',
        paddingHorizontal: Theme.spacing.m,
        marginBottom: Theme.spacing.m,
    },
    headerSpacer: {
        flex: 2,
    },
    headerLabel: {
        flex: 1,
        textAlign: 'center',
        color: Theme.colors.text.muted,
        fontFamily: 'Inter-Bold',
        fontSize: 12,
    },
    proLabel: {
        color: Theme.colors.primary,
    },
    comparisonTable: {
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: Theme.borderRadius.l,
        padding: Theme.spacing.m,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Theme.spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    featureLabel: {
        flex: 2,
        color: Theme.colors.text.secondary,
        fontSize: 14,
        fontFamily: 'Inter-Regular',
    },
    featureStatus: {
        flex: 1,
        alignItems: 'center',
    },
    proStatus: {
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        borderRadius: 8,
        paddingVertical: 4,
    },
    statusText: {
        color: Theme.colors.text.muted,
        fontSize: 16,
    },
    trialSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: Theme.spacing.l,
        borderRadius: Theme.borderRadius.xl,
        marginTop: Theme.spacing.xl,
        marginBottom: Theme.spacing.xl,
    },
    trialText: {
        color: Theme.colors.text.primary,
        fontFamily: 'Inter-Regular',
        fontSize: 14,
    },
    ctaSection: {
        width: '100%',
        alignItems: 'center',
        marginTop: Theme.spacing.xl,
    },
    priceInfo: {
        color: Theme.colors.text.secondary,
        fontSize: 14,
        marginBottom: Theme.spacing.m,
    },
    price: {
        fontFamily: 'Inter-Bold',
        color: Theme.colors.text.primary,
    },
    continueBtn: {
        width: '100%',
        backgroundColor: Theme.colors.primary,
        paddingVertical: 18,
        borderRadius: Theme.borderRadius.xl,
        alignItems: 'center',
    },
    continueBtnDisabled: {
        opacity: 0.5,
    },
    continueText: {
        color: Theme.colors.background,
        fontFamily: 'Inter-Bold',
        fontSize: 18,
    },
    footerLinks: {
        flexDirection: 'row',
        marginTop: Theme.spacing.xl,
        gap: Theme.spacing.l,
    },
    footerLink: {
        color: Theme.colors.text.muted,
        fontSize: 12,
        textDecorationLine: 'underline',
    },
    customSwitch: {
        width: 50,
        height: 28,
        borderRadius: 14,
        padding: 2,
    },
    customSwitchActive: {
        backgroundColor: Theme.colors.primary,
    },
    customSwitchInactive: {
        backgroundColor: '#333333',
    },
    customSwitchThumb: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
    },
    customSwitchThumbActive: {
        alignSelf: 'flex-end' as const,
    },
    customSwitchThumbInactive: {
        alignSelf: 'flex-start' as const,
    },
});
