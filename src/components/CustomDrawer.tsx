import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Linking, Image, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerContentComponentProps, DrawerContentScrollView } from '@react-navigation/drawer';
import { Theme } from '../constants/Theme';
import { LogIn, Crown, MessageSquare, ExternalLink, Lightbulb, Lock } from 'lucide-react-native';
import { THERAPISTS } from '../constants/Therapists';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { Logo } from './Logo';

const INITIAL_THERAPIST_KEY = 'initialTherapistId';

export const CustomDrawer = (props: DrawerContentComponentProps) => {
    const { isLoggedIn, selectedTherapistId, setShowLoginModal, user, pendingTherapist } = useAuth();
    const { isPro } = useSubscription();
    const router = useRouter();

    // Fixed sort order: the FIRST therapist the user ever chose stays on top forever.
    // After that, the order never changes — even when switching chats or unlocking premium.
    const [initialTherapistId, setInitialTherapistId] = useState<string | null>(null);

    // Load the initial therapist ID from storage on mount
    useEffect(() => {
        (async () => {
            try {
                const stored = Platform.OS === 'web' && typeof window !== 'undefined'
                    ? window.localStorage.getItem(INITIAL_THERAPIST_KEY)
                    : await AsyncStorage.getItem(INITIAL_THERAPIST_KEY);
                if (stored) {
                    setInitialTherapistId(stored);
                }
            } catch {}
        })();
    }, []);

    // Save the initial therapist ID the FIRST time a therapist is selected
    useEffect(() => {
        if (selectedTherapistId && !initialTherapistId) {
            setInitialTherapistId(selectedTherapistId);
            try {
                if (Platform.OS === 'web' && typeof window !== 'undefined') {
                    window.localStorage.setItem(INITIAL_THERAPIST_KEY, selectedTherapistId);
                } else {
                    AsyncStorage.setItem(INITIAL_THERAPIST_KEY, selectedTherapistId);
                }
            } catch {}
        }
    }, [selectedTherapistId, initialTherapistId]);

    const isUnlocked = (t: any) => {
        // Unlocked if user is Pro OR if it's the strictly selected therapist
        return isPro || (t.id === selectedTherapistId);
    };

    // Sort therapists: initial choice always on top, rest in default THERAPISTS array order
    const sortId = initialTherapistId || selectedTherapistId;
    const sortedTherapists = [...THERAPISTS].sort((a, b) => {
        if (a.id === sortId) return -1;
        if (b.id === sortId) return 1;
        return 0;
    });

    const handleTherapistPress = (t: any) => {
        if (isUnlocked(t)) {
            props.navigation.navigate('chat', { name: t.name, image: t.image });
        } else {
            props.navigation.navigate('paywall', { name: t.name, image: t.image });
        }
    };

    const handleLinkPress = (route: string) => {
        if (route === 'legal') {
            Linking.openURL('https://ai.therapy.free/legal');
        } else {
            props.navigation.navigate(route);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.brandingContainer}
                    onPress={() => { props.navigation.closeDrawer(); router.replace('/'); }}
                    activeOpacity={0.7}
                >
                    <Logo size="medium" />
                </TouchableOpacity>
            </View>

            <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionTitle}>Available</Text>
                <View style={styles.section}>
                    {sortedTherapists.map((t) => {
                        const unlocked = isUnlocked(t);
                        return (
                            <TouchableOpacity key={t.id} style={styles.therapistItem} onPress={() => handleTherapistPress(t)}>
                                <View style={styles.avatarOuter}>
                                    <View style={styles.avatarWrapper}>
                                        <Image source={t.image} style={[styles.avatar, !unlocked && styles.lockedAvatar]} defaultSource={require('../../assets/adaptive-icon.png')} />
                                        {!unlocked && (
                                            <View style={styles.lockOverlay}>
                                                <Lock size={12} color="#FFF" />
                                            </View>
                                        )}
                                    </View>
                                    {unlocked && (
                                        <View style={styles.proBadge}>
                                            <Crown size={10} color={Theme.colors.background} />
                                        </View>
                                    )}
                                </View>
                                <View>
                                    <Text style={[styles.therapistName, !unlocked && styles.lockedText]} numberOfLines={1}>{t.name}</Text>
                                    <View style={styles.statusRow}>
                                        <View style={styles.statusDot} />
                                        <Text style={styles.statusText}>online</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <Text style={styles.sectionTitle}>Support</Text>
                <View style={styles.section}>
                    <TouchableOpacity style={styles.feedbackItem} onPress={() => { props.navigation.closeDrawer(); router.push('/(main)/feedback'); }}>
                        <View style={styles.feedbackIconWrapper}>
                            <Lightbulb size={18} color={Theme.colors.text.secondary} />
                        </View>
                        <Text style={styles.feedbackText}>Provide Feedback</Text>
                    </TouchableOpacity>
                </View>

            </DrawerContentScrollView>

            <View style={styles.bottomSection}>
                {isLoggedIn ? (
                    <TouchableOpacity style={styles.userProfile} onPress={() => props.navigation.navigate('settings')}>
                        <View style={styles.userAvatar}>
                            <Text style={styles.userInitial}>{(() => {
                                const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name;
                                if (fullName) {
                                    const parts = fullName.trim().split(/\s+/);
                                    return parts.length >= 2
                                        ? (parts[0][0] + parts[1][0]).toUpperCase()
                                        : parts[0][0].toUpperCase();
                                }
                                const email = user?.email || '';
                                if (email.includes('privaterelay') || /^\d/.test(email)) return '?';
                                return email.charAt(0).toUpperCase() || '?';
                            })()}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.userName} numberOfLines={1}>{(() => {
                                const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name;
                                if (fullName) return fullName.trim().split(/\s+/)[0];
                                return 'User';
                            })()}</Text>
                            <Text style={styles.userEmail} numberOfLines={1}>{user?.email || ''}</Text>
                        </View>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.loginButton} onPress={() => {
                        props.navigation.closeDrawer();
                        setShowLoginModal(true);
                    }}>
                        <LogIn size={20} color={Theme.colors.text.primary} />
                        <Text style={styles.loginText}>Log in</Text>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    header: {
        padding: Theme.spacing.l,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    brandingContainer: {
        alignItems: 'center',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    slogan: {
        fontSize: 10,
        color: Theme.colors.text.secondary,
        fontFamily: 'Outfit-Regular',
        marginTop: -18,
        marginLeft: 48,
    },
    logoImage: {
        width: 48,
        height: 48,
        marginTop: 12,
    },
    logo: {
        fontSize: 24,
        fontFamily: 'Outfit-Regular',
    },
    logoWhite: {
        color: Theme.colors.text.primary,
    },
    logoDot: {
        color: Theme.colors.primary,
    },
    newChat: {
        padding: Theme.spacing.s,
    },
    scrollContent: {
        paddingHorizontal: Theme.spacing.m,
    },
    section: {
        marginBottom: Theme.spacing.xl,
    },
    sectionTitle: {
        fontSize: 12,
        color: Theme.colors.text.muted,
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontFamily: 'Inter-Regular',
        marginBottom: Theme.spacing.m,
        paddingHorizontal: Theme.spacing.m,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Theme.spacing.m,
        borderRadius: Theme.borderRadius.m,
    },
    menuText: {
        color: Theme.colors.text.primary,
        marginLeft: Theme.spacing.m,
        fontSize: 16,
        fontFamily: 'Inter-Regular',
    },
    therapistItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Theme.spacing.m,
        marginBottom: Theme.spacing.xs,
        borderRadius: Theme.borderRadius.m,
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    avatarOuter: {
        position: 'relative',
        width: 34,
        height: 34,
    },
    avatarWrapper: {
        width: 34,
        height: 34,
        borderRadius: 17,
        borderWidth: 1.5,
        borderColor: 'rgba(212, 175, 55, 0.4)',
        overflow: 'hidden',
        backgroundColor: '#333',
    },
    avatar: {
        width: '100%',
        height: '110%',
        top: 1,
    },
    proBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        backgroundColor: Theme.colors.primary,
        borderRadius: 6,
        padding: 2,
    },
    lockOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
    },
    lockedAvatar: {
        opacity: 0.5,
    },
    lockedText: {
        color: Theme.colors.text.muted,
    },
    therapistName: {
        color: Theme.colors.text.primary,
        marginLeft: Theme.spacing.m,
        fontSize: 15,
        fontFamily: 'Inter-Regular',
        lineHeight: 20,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: Theme.spacing.m,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Theme.colors.success,
        marginRight: 4,
    },
    statusText: {
        color: Theme.colors.success,
        fontSize: 12,
        fontFamily: 'Inter-Regular',
    },
    allChats: {
        padding: Theme.spacing.m,
    },
    allChatsText: {
        color: Theme.colors.text.muted,
        fontSize: 14,
    },
    bottomSection: {
        padding: Theme.spacing.l,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    userProfile: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    userInitial: {
        color: Theme.colors.background,
        fontFamily: 'Inter-Bold',
        fontSize: 18,
    },
    userName: {
        color: Theme.colors.text.primary,
        marginLeft: Theme.spacing.m,
        fontSize: 16,
        fontFamily: 'Inter-Regular',
    },
    userEmail: {
        color: Theme.colors.text.muted,
        marginLeft: Theme.spacing.m,
        fontSize: 12,
        marginTop: 2,
    },
    loginButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Theme.spacing.m,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: Theme.borderRadius.m,
    },
    loginText: {
        color: Theme.colors.text.primary,
        marginLeft: Theme.spacing.m,
        fontSize: 16,
        fontFamily: 'Inter-Bold',
    },
    footerLinks: {
        paddingHorizontal: Theme.spacing.m,
        marginTop: Theme.spacing.l,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
        paddingTop: Theme.spacing.l,
    },
    footerLink: {
        paddingVertical: Theme.spacing.s,
    },
    footerLinkText: {
        color: Theme.colors.text.muted,
        fontSize: 13,
        fontFamily: 'Inter-Regular',
    },
    feedbackItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Theme.spacing.m,
        borderRadius: Theme.borderRadius.m,
        backgroundColor: 'rgba(255,255,255,0.03)',
        marginHorizontal: 0,
    },
    feedbackIconWrapper: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Theme.spacing.m,
    },
    feedbackText: {
        color: Theme.colors.text.primary,
        fontSize: 15,
        fontFamily: 'Inter-Regular',
    },
});
