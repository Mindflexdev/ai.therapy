import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Switch, Image } from 'react-native';
import { Theme } from '../../src/constants/Theme';
import { X, Check } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function PaywallScreen() {
    const router = useRouter();
    const [isTrialEnabled, setIsTrialEnabled] = useState(false);

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
            <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                <X size={24} color={Theme.colors.text.muted} />
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.illustrationWrap}>
                    {/* Zen Premium Illustration Placeholder */}
                    <View style={styles.illustration} />
                </View>

                <Text style={styles.title}>Unlock Full Access</Text>

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
                    <FeatureRow label="Advanced AI Guidance" free={false} pro={true} />
                </View>

                <View style={styles.trialSection}>
                    <Text style={styles.trialText}>Not sure yet? Enable free trial</Text>
                    <Switch
                        value={isTrialEnabled}
                        onValueChange={setIsTrialEnabled}
                        trackColor={{ false: '#333', true: Theme.colors.primary }}
                    />
                </View>

                <View style={styles.ctaSection}>
                    <Text style={styles.priceInfo}>Subscribe to Pro for just <Text style={styles.price}>€9.99/week</Text></Text>
                    <TouchableOpacity style={styles.continueBtn} onPress={() => router.push('/(main)/chat')}>
                        <Text style={styles.continueText}>Continue</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footerLinks}>
                    <TouchableOpacity><Text style={styles.footerLink}>Restore Purchases</Text></TouchableOpacity>
                    <TouchableOpacity><Text style={styles.footerLink}>Terms</Text></TouchableOpacity>
                    <TouchableOpacity><Text style={styles.footerLink}>Privacy</Text></TouchableOpacity>
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
    },
    illustrationWrap: {
        width: '100%',
        height: 180,
        marginBottom: Theme.spacing.xl,
        backgroundColor: 'rgba(212, 175, 55, 0.05)',
        borderRadius: Theme.borderRadius.l,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    illustration: {
        width: '100%',
        height: '100%',
        // We'll replace this with the Zen art later
    },
    title: {
        fontSize: 28,
        color: Theme.colors.text.primary,
        fontFamily: 'Playfair-Bold',
        textAlign: 'center',
        marginBottom: Theme.spacing.xxl,
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
});
