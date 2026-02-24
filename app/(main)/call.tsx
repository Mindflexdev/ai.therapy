import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, Animated, Modal } from 'react-native';
import { Theme } from '../../src/constants/Theme';
import { ChevronDown, Users, MicOff, Volume2, VideoOff, PhoneOff, MoreHorizontal, Phone, Star } from 'lucide-react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import LoginScreen from './login';

import { THERAPIST_IMAGES } from '../../src/constants/Therapists';

export default function CallScreen() {
    const router = useRouter();
    const { name } = useLocalSearchParams();
    const [isSpeakerActive, setIsSpeakerActive] = useState(false);

    // Fallback to Marcus if no name is provided (shouldn't happen in flow)
    const therapistName = (name as string) || 'Marcus';
    const therapistImage = THERAPIST_IMAGES[therapistName];

    const { isLoggedIn, isPro, showLoginModal, setShowLoginModal } = useAuth();
    const [showComingSoon, setShowComingSoon] = useState(false);
    const scale = useRef(new Animated.Value(1)).current;
    const opacity = useRef(new Animated.Value(0.5)).current;

    // Reset and re-trigger the coming soon modal every time the screen gains focus
    // (useEffect with [] only fires on mount — React Navigation caches the screen)
    useFocusEffect(
        useCallback(() => {
            setShowComingSoon(false);
            const timer = setTimeout(() => {
                setShowComingSoon(true);
            }, 1500);

            return () => clearTimeout(timer);
        }, [])
    );

    useEffect(() => {
        Animated.loop(
            Animated.parallel([
                Animated.sequence([
                    Animated.timing(scale, { toValue: 1.4, duration: 2000, useNativeDriver: true }),
                    Animated.timing(scale, { toValue: 1, duration: 2000, useNativeDriver: true }),
                ]),
                Animated.sequence([
                    Animated.timing(opacity, { toValue: 0, duration: 2000, useNativeDriver: true }),
                    Animated.timing(opacity, { toValue: 0.5, duration: 2000, useNativeDriver: true }),
                ]),
            ])
        ).start();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <ChevronDown size={28} color={Theme.colors.text.primary} />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.name}>{therapistName}</Text>
                    <Text style={styles.status}>Calling...</Text>
                </View>
                <TouchableOpacity>
                    <Users size={24} color={Theme.colors.text.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <View style={styles.imageContainer}>
                    <Animated.View style={[styles.pulseHalo, { transform: [{ scale }], opacity }]} />
                    <View style={styles.staticHalo} />
                    <Image
                        source={therapistImage}
                        style={styles.avatar}
                        defaultSource={require('../../assets/adaptive-icon.png')}
                    />
                </View>
            </View>

            <View style={styles.footer}>
                <View style={styles.controlsRow}>
                    <TouchableOpacity style={styles.controlBtn}>
                        <MoreHorizontal size={24} color={Theme.colors.text.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.controlBtn}>
                        <VideoOff size={24} color={Theme.colors.text.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.controlBtn, isSpeakerActive && styles.activeControlBtn]}
                        onPress={() => setIsSpeakerActive(!isSpeakerActive)}
                    >
                        <Volume2 size={24} color={isSpeakerActive ? Theme.colors.background : Theme.colors.text.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.controlBtn}>
                        <MicOff size={24} color={Theme.colors.text.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.controlBtn, styles.endCallBtn]}
                        onPress={() => router.back()}
                    >
                        <PhoneOff size={28} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Coming Soon Modal */}
            <Modal
                visible={showComingSoon}
                transparent
                animationType="fade"
                onRequestClose={() => { setShowComingSoon(false); router.back(); }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.comingSoonCard}>
                        <View style={styles.comingSoonIcon}>
                            <Phone size={28} color={Theme.colors.primary} />
                        </View>
                        <Text style={styles.comingSoonTitle}>Voice Calls Coming Soon</Text>
                        <Text style={styles.comingSoonText}>
                            We're building real-time voice sessions with your therapist. This feature is currently in production.
                        </Text>
                        <View style={styles.proBadgeRow}>
                            <Star size={14} color={Theme.colors.primary} />
                            <Text style={styles.proBadgeText}>Available first to Pro users</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.comingSoonBtn}
                            onPress={() => { setShowComingSoon(false); router.back(); }}
                        >
                            <Text style={styles.comingSoonBtnText}>Got it</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Login Modal */}
            {showLoginModal && <LoginScreen />}
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
        padding: Theme.spacing.l,
    },
    headerInfo: {
        alignItems: 'center',
    },
    name: {
        color: Theme.colors.text.primary,
        fontFamily: 'Inter-Bold',
        fontSize: 18,
    },
    status: {
        color: Theme.colors.text.muted,
        fontSize: 14,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        width: 200,
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    avatar: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#333',
    },
    staticHalo: {
        position: 'absolute',
        width: 170,
        height: 170,
        borderRadius: 85,
        borderWidth: 2,
        borderColor: Theme.colors.primary,
        opacity: 0.3,
    },
    pulseHalo: {
        position: 'absolute',
        width: 170,
        height: 170,
        borderRadius: 85,
        borderWidth: 4,
        borderColor: Theme.colors.primary,
    },
    footer: {
        paddingBottom: Theme.spacing.xxl,
        paddingHorizontal: Theme.spacing.xl,
    },
    controlsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: Theme.spacing.l,
        borderRadius: Theme.borderRadius.xl,
    },
    controlBtn: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    endCallBtn: {
        backgroundColor: Theme.colors.danger,
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    activeControlBtn: {
        backgroundColor: '#FFF',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    comingSoonCard: {
        backgroundColor: Theme.colors.card,
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        width: '100%',
        maxWidth: 340,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
    },
    comingSoonIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(235,206,128,0.12)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    comingSoonTitle: {
        color: Theme.colors.text.primary,
        fontFamily: 'Inter-Bold',
        fontSize: 20,
        marginBottom: 12,
        textAlign: 'center',
    },
    comingSoonText: {
        color: Theme.colors.text.muted,
        fontSize: 15,
        lineHeight: 22,
        textAlign: 'center',
        marginBottom: 16,
    },
    proBadgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(235,206,128,0.1)',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginBottom: 24,
    },
    proBadgeText: {
        color: Theme.colors.primary,
        fontSize: 13,
        fontFamily: 'Inter-SemiBold',
    },
    comingSoonBtn: {
        backgroundColor: Theme.colors.primary,
        paddingVertical: 14,
        paddingHorizontal: 48,
        borderRadius: 14,
    },
    comingSoonBtnText: {
        color: Theme.colors.background,
        fontFamily: 'Inter-Bold',
        fontSize: 16,
    },
});
