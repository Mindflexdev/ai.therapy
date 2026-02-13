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

export const CustomDrawer = (props: DrawerContentComponentProps) => {
    const isLoggedIn = false; // Placeholder for login state

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.logo}>ai.therapy</Text>
                <TouchableOpacity style={styles.newChat}>
                    <MessageSquare size={20} color={Theme.colors.primary} />
                </TouchableOpacity>
            </View>

            <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContent}>
                <View style={styles.section}>
                    <TouchableOpacity style={styles.menuItem}>
                        <Folder size={20} color={Theme.colors.text.secondary} />
                        <Text style={styles.menuText}>Projects</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem}>
                        <Archive size={20} color={Theme.colors.text.secondary} />
                        <Text style={styles.menuText}>Artifacts</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>Recently Used</Text>
                <View style={styles.section}>
                    {THERAPISTS.map((t) => (
                        <TouchableOpacity key={t.id} style={styles.therapistItem} onPress={() => props.navigation.navigate('paywall')}>
                            <View style={styles.avatarWrapper}>
                                <Image source={t.image} style={styles.avatar} defaultSource={require('../../assets/adaptive-icon.png')} />
                                <View style={styles.proBadge}>
                                    <Crown size={10} color={Theme.colors.background} />
                                </View>
                            </View>
                            <Text style={styles.therapistName} numberOfLines={1}>{t.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity style={styles.allChats}>
                    <Text style={styles.allChatsText}>All Chats {'>'}</Text>
                </TouchableOpacity>
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
    therapistName: {
        color: Theme.colors.text.primary,
        marginLeft: Theme.spacing.m,
        fontSize: 15,
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
