import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { ThemedText } from './themed-text';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const MESSAGES = [
    "Analyzing your psychological profile",
    "Based on your chats",
    "Across 8 dimensions"
];

interface AnalysisLoadingProps {
    theme: any;
    onComplete?: () => void;
}

export function AnalysisLoading({ theme, onComplete }: AnalysisLoadingProps) {
    const [countdown, setCountdown] = useState(60);
    const [messageIndex, setMessageIndex] = useState(0);
    const progressAnim = useRef(new Animated.Value(0)).current;
    const messageOpacity = useRef(new Animated.Value(1)).current;

    const radius = 80;
    const strokeWidth = 8;
    const circumference = 2 * Math.PI * radius;

    useEffect(() => {
        // Countdown timer
        const countdownInterval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(countdownInterval);
                    onComplete?.();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Message rotation (every 5 seconds)
        const messageInterval = setInterval(() => {
            // Fade out
            Animated.timing(messageOpacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                // Change message
                setMessageIndex(prev => (prev + 1) % MESSAGES.length);
                // Fade in
                Animated.timing(messageOpacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }).start();
            });
        }, 5000);

        // Progress animation
        Animated.timing(progressAnim, {
            toValue: 1,
            duration: 60000, // 60 seconds
            useNativeDriver: true,
        }).start();

        return () => {
            clearInterval(countdownInterval);
            clearInterval(messageInterval);
        };
    }, []);

    // Calculate stroke dash offset for circular progress
    const strokeDashoffset = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, circumference],
    });

    return (
        <View style={styles.container}>
            <View style={styles.circleContainer}>
                <Svg width={radius * 2 + strokeWidth} height={radius * 2 + strokeWidth}>
                    {/* Background circle */}
                    <Circle
                        cx={radius + strokeWidth / 2}
                        cy={radius + strokeWidth / 2}
                        r={radius}
                        stroke={theme.card}
                        strokeWidth={strokeWidth}
                        fill="none"
                    />
                    {/* Animated progress circle */}
                    <AnimatedCircle
                        cx={radius + strokeWidth / 2}
                        cy={radius + strokeWidth / 2}
                        r={radius}
                        stroke={theme.primary}
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        rotation="-90"
                        origin={`${radius + strokeWidth / 2}, ${radius + strokeWidth / 2}`}
                    />
                </Svg>

                {/* Countdown number in center */}
                <View style={styles.countdownContainer}>
                    <ThemedText type="title" style={[styles.countdownText, { color: theme.primary }]}>
                        {countdown}
                    </ThemedText>
                    <ThemedText style={[styles.secondsText, { color: theme.icon }]}>
                        seconds
                    </ThemedText>
                </View>
            </View>

            {/* Rotating message */}
            <Animated.View style={{ opacity: messageOpacity, marginTop: 32 }}>
                <ThemedText style={[styles.messageText, { color: theme.text }]}>
                    {MESSAGES[messageIndex]}
                </ThemedText>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    circleContainer: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    countdownContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    countdownText: {
        fontSize: 48,
        fontWeight: 'bold',
    },
    secondsText: {
        fontSize: 14,
        marginTop: 4,
    },
    messageText: {
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '500',
    },
});
