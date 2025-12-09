import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { ThemedText } from './themed-text';

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
            useNativeDriver: false,
        }).start();

        return () => {
            clearInterval(countdownInterval);
            clearInterval(messageInterval);
        };
    }, []);

    // Calculate progress percentage
    const progressPercentage = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 100],
    });

    return (
        <View style={styles.container}>
            <View style={styles.circleContainer}>
                {/* Simple circular progress using border */}
                <View style={[styles.circle, { borderColor: theme.card }]}>
                    <Animated.View
                        style={[
                            styles.progressCircle,
                            {
                                borderColor: theme.primary,
                                transform: [{
                                    rotate: progressPercentage.interpolate({
                                        inputRange: [0, 100],
                                        outputRange: ['0deg', '360deg']
                                    })
                                }]
                            }
                        ]}
                    />
                </View>

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
        width: 180,
        height: 180,
    },
    circle: {
        width: 180,
        height: 180,
        borderRadius: 90,
        borderWidth: 8,
        position: 'absolute',
    },
    progressCircle: {
        width: 180,
        height: 180,
        borderRadius: 90,
        borderWidth: 8,
        borderRightColor: 'transparent',
        borderBottomColor: 'transparent',
        position: 'absolute',
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
