import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export function LoadingDots() {
    const dot1 = React.useRef(new Animated.Value(0)).current;
    const dot2 = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animate = () => {
            Animated.loop(
                Animated.sequence([
                    Animated.parallel([
                        Animated.timing(dot1, {
                            toValue: 1,
                            duration: 400,
                            useNativeDriver: true,
                        }),
                        Animated.timing(dot2, {
                            toValue: 0,
                            duration: 400,
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.parallel([
                        Animated.timing(dot1, {
                            toValue: 0,
                            duration: 400,
                            useNativeDriver: true,
                        }),
                        Animated.timing(dot2, {
                            toValue: 1,
                            duration: 400,
                            useNativeDriver: true,
                        }),
                    ]),
                ])
            ).start();
        };
        animate();
    }, []);

    const dot1Scale = dot1.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.5],
    });

    const dot2Scale = dot2.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.5],
    });

    return (
        <View style={styles.dotsContainer}>
            <Animated.View
                style={[
                    styles.dot,
                    {
                        transform: [{ scale: dot1Scale }],
                    },
                ]}
            />
            <Animated.View
                style={[
                    styles.dot,
                    {
                        transform: [{ scale: dot2Scale }],
                    },
                ]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    dotsContainer: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 40,
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#5B8FD8',
    },
});
