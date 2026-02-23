import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Switch, Linking } from 'react-native';
import { Theme } from '../../src/constants/Theme';
import { ChevronLeft, User, CreditCard, Sliders, Link, ShieldCheck, Bell, Globe, Lock, MessageCircle, ChevronRight, LogOut, FileText } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useSubscription } from '../../src/context/SubscriptionContext';

export default function SettingsScreen() {
    const router = useRouter();
    const { logout, user } = useAuth();
    const { isPro } = useSubscription();

    const handleLogout = () => {
        logout();
        router.replace('/');
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
                    <SettingRow icon={User} label="Profile" />
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
                    <SettingRow icon={ShieldCheck} label="Safety & Legal" onPress={() => router.push({ pathname: '/(main)/legal', params: { section: 'safety' } })} />
                    <SettingRow icon={Lock} label="Privacy Policy" onPress={() => Linking.openURL('https://ai.therapy.free/legal?section=privacy')} />
                    <SettingRow icon={FileText} label="Terms of Use" onPress={() => Linking.openURL('https://ai.therapy.free/legal?section=terms')} />
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
    }
});
