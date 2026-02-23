import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Theme } from '../../src/constants/Theme';
import { ChevronLeft, CreditCard, Sliders, Link, ShieldCheck, Bell, Globe, Lock, MessageCircle, ChevronRight, LogOut, FileText, Cookie, Building2, Trash2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useSubscription } from '../../src/context/SubscriptionContext';
import { supabase } from '../../src/lib/supabase';
import { SuccessOverlay } from '../../src/components/SuccessOverlay';

export default function SettingsScreen() {
    const router = useRouter();
    const { logout, user } = useAuth();
    const { isPro } = useSubscription();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

    const handleLogout = () => {
        logout();
        router.replace('/');
    };

    const handleDeleteSuccessDone = async () => {
        await logout();
        router.replace('/');
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'This will permanently delete your account, including your email and personal data. Your past conversations will be anonymized and can no longer be linked to you.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Continue',
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert(
                            'Are you sure?',
                            'This action cannot be undone. You will be signed out immediately.',
                            [
                                { text: 'Go Back', style: 'cancel' },
                                {
                                    text: 'Delete My Account',
                                    style: 'destructive',
                                    onPress: async () => {
                                        setIsDeleting(true);
                                        try {
                                            const { error } = await supabase.rpc('delete_own_account');
                                            if (error) throw error;
                                            setShowDeleteSuccess(true);
                                        } catch (e: any) {
                                            setIsDeleting(false);
                                            Alert.alert('Error', e.message || 'Failed to delete account. Please try again.');
                                        }
                                    },
                                },
                            ]
                        );
                    },
                },
            ]
        );
    };

    const SettingRow = ({ icon: Icon, label, value, onPress }: any) => (
        <TouchableOpacity style={styles.row} onPress={onPress}>
            <View style={styles.rowLeft}>
                <Icon size={20} color={Theme.colors.text.muted} />
                <Text style={styles.rowLabel}>{label}</Text>
            </View>
            <View style={styles.rowRight}>
                {value && <Text style={styles.rowValue}>{value}</Text>}
                <ChevronRight size={18} color={Theme.colors.text.muted} />
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {showDeleteSuccess && (
                <SuccessOverlay
                    title="Account Deleted"
                    subtitle={"Your account and personal data have been\nremoved. Past conversations have been\nanonymized."}
                    onDone={handleDeleteSuccessDone}
                />
            )}

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={28} color={Theme.colors.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.userCard}>
                    <Text style={styles.email}>{user?.email || ''}</Text>
                </View>

                {!isPro && (
                    <View style={styles.upgradeCard}>
                        <Text style={styles.upgradeTitle}>Upgrade to ai.therapy Pro</Text>
                        <Text style={styles.upgradeText}>Unlock all characters, unlimited calls, and long-term memory.</Text>
                        <TouchableOpacity style={styles.upgradeBtn} onPress={() => router.push('/(main)/paywall')}>
                            <Text style={styles.upgradeBtnText}>Upgrade</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.section}>
                    <SettingRow icon={Trash2} label="Delete Account" onPress={handleDeleteAccount} />
                    <SettingRow icon={CreditCard} label="Billing" />
                </View>

                <View style={styles.section}>
                    <SettingRow icon={Sliders} label="Features" />
                    <SettingRow icon={Link} label="Connectors" />
                    <SettingRow icon={ShieldCheck} label="Permissions" />
                </View>

                <View style={styles.section}>
                    <SettingRow icon={Globe} label="Appearance" value="System" />
                    <SettingRow icon={MessageCircle} label="Input Language" value="EN" />
                    <SettingRow icon={Bell} label="Notifications" />
                </View>

                <View style={styles.section}>
                    <SettingRow icon={Lock} label="Privacy Policy" onPress={() => router.push({ pathname: '/(main)/legal', params: { section: 'privacy' } })} />
                    <SettingRow icon={FileText} label="Terms of Use" onPress={() => router.push({ pathname: '/(main)/legal', params: { section: 'terms' } })} />
                    <SettingRow icon={Cookie} label="Cookie Policy" onPress={() => router.push({ pathname: '/(main)/legal', params: { section: 'cookies' } })} />
                    <SettingRow icon={Building2} label="Imprint" onPress={() => router.push({ pathname: '/(main)/legal', params: { section: 'imprint' } })} />
                </View>

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <LogOut size={20} color={'#ff4444'} />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Theme.spacing.m,
    },
    backButton: {
        padding: Theme.spacing.s,
    },
    headerTitle: {
        color: Theme.colors.text.primary,
        fontFamily: 'Inter-Bold',
        fontSize: 20,
    },
    scrollContent: {
        padding: Theme.spacing.l,
        paddingBottom: Theme.spacing.xxl,
    },
    userCard: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: Theme.spacing.m,
        borderRadius: Theme.borderRadius.m,
        marginBottom: Theme.spacing.l,
    },
    email: {
        color: Theme.colors.text.secondary,
        fontSize: 14,
        fontFamily: 'Inter-Regular',
    },
    upgradeCard: {
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.3)',
        padding: Theme.spacing.l,
        borderRadius: Theme.borderRadius.l,
        marginBottom: Theme.spacing.xl,
    },
    upgradeTitle: {
        color: Theme.colors.primary,
        fontFamily: 'Inter-Bold',
        fontSize: 18,
        marginBottom: 4,
    },
    upgradeText: {
        color: Theme.colors.text.secondary,
        fontSize: 14,
        marginBottom: Theme.spacing.l,
        lineHeight: 20,
    },
    upgradeBtn: {
        backgroundColor: Theme.colors.primary,
        paddingVertical: 12,
        borderRadius: Theme.borderRadius.m,
        alignItems: 'center',
    },
    upgradeBtnText: {
        color: Theme.colors.background,
        fontFamily: 'Inter-Bold',
        fontSize: 16,
    },
    section: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: Theme.borderRadius.m,
        marginBottom: Theme.spacing.l,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Theme.spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rowLabel: {
        color: Theme.colors.text.primary,
        marginLeft: Theme.spacing.m,
        fontSize: 16,
    },
    rowRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rowValue: {
        color: Theme.colors.text.muted,
        marginRight: Theme.spacing.s,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: Theme.spacing.m,
        backgroundColor: 'rgba(255, 68, 68, 0.1)',
        borderRadius: Theme.borderRadius.m,
        marginTop: Theme.spacing.xl,
    },
    logoutText: {
        color: '#ff4444',
        fontFamily: 'Inter-Bold',
        marginLeft: Theme.spacing.s,
        fontSize: 16,
    },
});
