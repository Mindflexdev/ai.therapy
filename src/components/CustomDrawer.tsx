import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { DrawerContentComponentProps, DrawerContentScrollView } from '@react-navigation/drawer';
import { Theme } from '../constants/Theme';
import { MessageSquare, Folder, Archive, Settings, LogIn, Crown } from 'lucide-react-native';

const THERAPISTS = [
    { id: '1', name: 'Marcus', image: require('../../assets/characters/marcus.jpg') },
    { id: '2', name: 'Sarah', image: require('../../assets/characters/sarah.jpg') },
    { id: '3', name: 'Liam', image: require('../../assets/characters/liam.jpg') },
    { id: '4', name: 'Emily', image: require('../../assets/characters/emily.jpg') },
];

import { useAuth } from '../context/AuthContext';
import { Lock } from 'lucide-react-native';

export const CustomDrawer = (props: DrawerContentComponentProps) => {
    const { isLoggedIn } = useAuth();

    const handleTherapistPress = (t: any) => {
        if (isLoggedIn) {
            props.navigation.navigate('chat', { name: t.name, image: t.image });
        } else {
            props.navigation.navigate('paywall', { name: t.name, image: t.image });
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.logo}>ai.therapy</Text>
            </View>

            <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionTitle}>Available</Text>
                <View style={styles.section}>
                    {THERAPISTS.map((t) => (
                        <TouchableOpacity key={t.id} style={styles.therapistItem} onPress={() => handleTherapistPress(t)}>
                            <View style={styles.avatarWrapper}>
                                <Image source={t.image} style={[styles.avatar, !isLoggedIn && styles.lockedAvatar]} defaultSource={require('../../assets/adaptive-icon.png')} />
                                {isLoggedIn ? (
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
                                <Text style={[styles.therapistName, !isLoggedIn && styles.lockedText]} numberOfLines={1}>{t.name}</Text>
                                <View style={styles.statusRow}>
                                    <View style={styles.statusDot} />
                                    <Text style={styles.statusText}>online</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </DrawerContentScrollView>

            <View style={styles.bottomSection}>
                {isLoggedIn ? (
                    <TouchableOpacity style={styles.userProfile} onPress={() => props.navigation.navigate('settings')}>
                        <View style={styles.userAvatar}>
                            <Text style={styles.userInitial}>M</Text>
                        </View>
                        <Text style={styles.userName}>Moritz</Text>
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
    logo: {
        fontSize: 20,
        color: Theme.colors.text.primary,
        fontFamily: 'Playfair-Bold',
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
});
