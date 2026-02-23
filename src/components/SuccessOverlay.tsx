import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Theme } from '../constants/Theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// --- Confetti ---
const CONFETTI_COLORS = ['#FFD700', '#FF6B6B', '#7CB9FF', '#4ECCA3', '#FF9FF3', '#FECA57', '#FF6348', '#A29BFE'];
const NUM_CONFETTI = 40;

interface ConfettiPiece {
    x: number;
    delay: number;
    color: string;
    size: number;
    rotation: number;
}

const ConfettiParticle = ({ piece }: { piece: ConfettiPiece }) => {
    const fallAnim = useRef(new Animated.Value(-50)).current;
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const swayAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const delay = piece.delay;
        Animated.parallel([
            Animated.timing(fallAnim, {
                toValue: SCREEN_HEIGHT + 50,
                duration: 2800 + Math.random() * 1200,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 2500,
                delay: delay + 800,
                useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
                toValue: piece.rotation,
                duration: 3000,
                delay,
                useNativeDriver: true,
            }),
            Animated.sequence([
                Animated.timing(swayAnim, { toValue: 30, duration: 600, delay, useNativeDriver: true }),
                Animated.timing(swayAnim, { toValue: -30, duration: 600, useNativeDriver: true }),
                Animated.timing(swayAnim, { toValue: 15, duration: 600, useNativeDriver: true }),
                Animated.timing(swayAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
            ]),
        ]).start();
    }, []);

    const spin = rotateAnim.interpolate({
        inputRange: [0, 10],
        outputRange: ['0deg', '3600deg'],
    });

    return (
        <Animated.View
            style={{
                position: 'absolute',
                left: piece.x,
                top: 0,
                width: piece.size,
                height: piece.size * 0.6,
                backgroundColor: piece.color,
                borderRadius: 2,
                opacity: fadeAnim,
                transform: [
                    { translateY: fallAnim },
                    { translateX: swayAnim },
                    { rotate: spin },
                ],
            }}
        />
    );
};

// --- Success Overlay ---
interface SuccessOverlayProps {
    title: string;
    subtitle: string;
    onDone: () => void;
    showConfetti?: boolean;
    duration?: number;
}

export const SuccessOverlay = ({ title, subtitle, onDone, showConfetti = false, duration = 3500 }: SuccessOverlayProps) => {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const textFadeAnim = useRef(new Animated.Value(0)).current;

    const confettiPieces = useRef<ConfettiPiece[]>(
        showConfetti
            ? Array.from({ length: NUM_CONFETTI }, () => ({
                x: Math.random() * SCREEN_WIDTH,
                delay: Math.random() * 600,
                color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
                size: 8 + Math.random() * 8,
                rotation: 2 + Math.random() * 8,
            }))
            : []
    ).current;

    useEffect(() => {
        Animated.sequence([
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 4,
                    tension: 60,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]),
            Animated.timing(textFadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start();

        const timer = setTimeout(onDone, duration);
        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            {showConfetti && confettiPieces.map((piece, i) => (
                <ConfettiParticle key={i} piece={piece} />
            ))}

            <Animated.View style={[styles.checkmarkCircle, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                <Text style={styles.checkmark}>✓</Text>
            </Animated.View>

            <Animated.View style={{ opacity: textFadeAnim, alignItems: 'center' }}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: Theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    checkmarkCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
        shadowColor: Theme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    checkmark: {
        fontSize: 48,
        color: Theme.colors.background,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 28,
        color: Theme.colors.text.primary,
        fontFamily: 'Inter-Bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        color: Theme.colors.text.secondary,
        fontFamily: 'Inter-Regular',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 40,
    },
});
