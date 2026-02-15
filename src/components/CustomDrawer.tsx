import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, Linking } from 'react-native';
import { DrawerContentComponentProps, DrawerContentScrollView } from '@react-navigation/drawer';
import { Theme } from '../constants/Theme';
import { LogIn, Crown, MessageSquare, ExternalLink } from 'lucide-react-native';
import { THERAPISTS } from '../constants/Therapists';

import { useAuth } from '../context/AuthContext';
import { Lock } from 'lucide-react-native';

export const CustomDrawer = (props: DrawerContentComponentProps) => {
    const { isLoggedIn, selectedTherapistId } = useAuth();

    const isUnlocked = (t: any) => {
        // Unlocked if logged in OR if it's the selected therapist
        return isLoggedIn || (t.id === selectedTherapistId);
    };

    const handleTherapistPress = (t: any) => {
        if (isUnlocked(t)) {
            props.navigation.navigate('chat', { name: t.name, image: t.image });
        } else {
            props.navigation.navigate('paywall', { name: t.name, image: t.image });
        }
    };

    const handleLinkPress = (url: string) => {
        // Placeholder for now, could be Linking.openURL(url)
        console.log('Opening:', url);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.brandingContainer}>
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
                    <Text style={styles.slogan}>not real therapy</Text>
                </View>
            </View>

            <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionTitle}>Available</Text>
                <View style={styles.section}>
                    {THERAPISTS.map((t) => {
                        const unlocked = isUnlocked(t);
                        return (
                            <TouchableOpacity key={t.id} style={styles.therapistItem} onPress={() => handleTherapistPress(t)}>
                                <View style={styles.avatarWrapper}>
                                    <Image source={t.image} style={[styles.avatar, !unlocked && styles.lockedAvatar]} defaultSource={require('../../assets/adaptive-icon.png')} />
                                    {unlocked ? (
                                        <View style={styles.proBadge}>
                                            <Crown size={10} color={Theme.colors.background} />
                                        </View>
                                    ) : (
                                        <View style={styles.lockOverlay}>
                                            <Lock size={12} color="#FFF" />
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

                <View style={styles.footerLinks}>
                    <TouchableOpacity style={styles.footerLink} onPress={() => handleLinkPress('terms')}>
                        <Text style={styles.footerLinkText}>Terms of Service</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.footerLink} onPress={() => handleLinkPress('privacy')}>
                        <Text style={styles.footerLinkText}>Privacy Policy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.footerLink} onPress={() => handleLinkPress('feedback')}>
                        <Text style={styles.footerLinkText}>Feedback</Text>
                    </TouchableOpacity>
                </View>
            </DrawerContentScrollView>

            <View style={styles.bottomSection}>
                {isLoggedIn ? (
                    <TouchableOpacity style={styles.userProfile} onPress={() => props.navigation.navigate('settings')}>
                        <View style={styles.userAvatar}>
                            <Text style={styles.userInitial}>M</Text>
                        </View>
                        <View>
                            <Text style={styles.userName}>Moritz</Text>
                            <Text style={styles.userEmail}>moritz.t@example.com</Text>
                        </View>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.loginButton} onPress={() => props.navigation.navigate('login')}>
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
        alignItems: 'flex-start',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    slogan: {
        fontSize: 10,
        color: Theme.colors.text.secondary,
        fontFamily: 'Inter-Regular',
        marginTop: 2,
        marginLeft: 32,
    },
    logoImage: {
        width: 24,
        height: 24,
    },
    logo: {
        fontSize: 20,
        fontFamily: 'Inter-Bold',
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
    avatarWrapper: {
        position: 'relative',
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#333',
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
        borderRadius: 16,
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
    }
});
