import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, Animated } from 'react-native';
import { Theme } from '../../src/constants/Theme';
import { ChevronDown, Users, MicOff, Volume2, VideoOff, PhoneOff, MoreHorizontal } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
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
    const scale = useRef(new Animated.Value(1)).current;
    const opacity = useRef(new Animated.Value(0.5)).current;

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!isLoggedIn) {
                setShowLoginModal(true);
            } else if (!isPro) {
                router.replace({
                    pathname: '/(main)/paywall',
                    params: { name: therapistName }
                });
            }
        }, 2500);

        return () => clearTimeout(timer);
    }, [isLoggedIn, isPro]);

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
});
