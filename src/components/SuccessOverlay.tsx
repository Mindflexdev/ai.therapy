import React, { useRef, useEffect, useState } from 'react';
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

// --- Two-phase Setup Overlay (loading → success) ---
// Phase 1: pulsing circle + "Setting up your 24/7 support..."
// Phase 2: checkmark + confetti + "Setup Complete" (auto-dismisses after 1.8s)
interface SetupOverlayProps {
    therapistName: string;
    isReady: boolean;       // flip to true when AI response arrives
    onDone: () => void;     // called when the whole overlay should dismiss
}

export const SetupOverlay = ({ therapistName, isReady, onDone }: SetupOverlayProps) => {
    const pulseAnim = useRef(new Animated.Value(0.6)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const textFadeAnim = useRef(new Animated.Value(0)).current;

    // Success phase animations
    const successScaleAnim = useRef(new Animated.Value(0)).current;
    const successFadeAnim = useRef(new Animated.Value(0)).current;
    const successTextFadeAnim = useRef(new Animated.Value(0)).current;

    const confettiPieces = useRef<ConfettiPiece[]>(
        Array.from({ length: NUM_CONFETTI }, () => ({
            x: Math.random() * SCREEN_WIDTH,
            delay: Math.random() * 600,
            color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
            size: 8 + Math.random() * 8,
            rotation: 2 + Math.random() * 8,
        }))
    ).current;

    const [showSuccess, setShowSuccess] = useState(false);
    const hasTriggeredSuccess = useRef(false);

    // Loading phase: fade in + start pulsing
    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start();

        Animated.timing(textFadeAnim, {
            toValue: 1,
            duration: 600,
            delay: 200,
            useNativeDriver: true,
        }).start();

        // Pulse loop
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 0.6, duration: 800, useNativeDriver: true }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, []);

    // When AI response arrives → switch to success phase
    useEffect(() => {
        if (isReady && !hasTriggeredSuccess.current) {
            hasTriggeredSuccess.current = true;
            setShowSuccess(true);

            // Animate success in
            Animated.sequence([
                Animated.parallel([
                    Animated.spring(successScaleAnim, {
                        toValue: 1,
                        friction: 4,
                        tension: 60,
                        useNativeDriver: true,
                    }),
                    Animated.timing(successFadeAnim, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.timing(successTextFadeAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]).start();

            // Dismiss after 1.8s
            setTimeout(onDone, 1800);
        }
    }, [isReady]);

    return (
        <View style={styles.container}>
            {showSuccess ? (
                <>
                    {confettiPieces.map((piece, i) => (
                        <ConfettiParticle key={i} piece={piece} />
                    ))}
                    <Animated.View style={[styles.checkmarkCircle, { opacity: successFadeAnim, transform: [{ scale: successScaleAnim }] }]}>
                        <Text style={styles.checkmark}>✓</Text>
                    </Animated.View>
                    <Animated.View style={{ opacity: successTextFadeAnim, alignItems: 'center' }}>
                        <Text style={styles.title}>Setup Complete</Text>
                        <Text style={styles.subtitle}>{`${therapistName} is now personalised to you.\nYour 24/7 support is ready.`}</Text>
                    </Animated.View>
                </>
            ) : (
                <>
                    <Animated.View style={[styles.loadingCircle, { opacity: fadeAnim, transform: [{ scale: pulseAnim }] }]}>
                        <Text style={styles.loadingIcon}>⚙️</Text>
                    </Animated.View>
                    <Animated.View style={{ opacity: textFadeAnim, alignItems: 'center' }}>
                        <Text style={styles.loadingTitle}>Setting up your 24/7 support...</Text>
                        <Text style={styles.subtitle}>{`Personalising ${therapistName} to your preferences`}</Text>
                    </Animated.View>
                </>
            )}
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
    loadingCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(235, 206, 128, 0.15)',
        borderWidth: 2,
        borderColor: 'rgba(235, 206, 128, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    loadingIcon: {
        fontSize: 40,
    },
    loadingTitle: {
        fontSize: 22,
        color: Theme.colors.text.primary,
        fontFamily: 'Inter-Bold',
        marginBottom: 12,
        textAlign: 'center',
    },
});
