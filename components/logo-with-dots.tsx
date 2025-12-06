import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';

interface LogoWithDotsProps {
    fontSize?: number;
    fontWeight?: 'normal' | 'bold' | '600';
    color?: string;
    dotSize?: number;
}

export function LogoWithDots({
    fontSize = 24,
    fontWeight = 'bold',
    color = '#1a1a1a',
    dotSize = 6
}: LogoWithDotsProps) {
    return (
        <View style={styles.container}>
            <ThemedText style={[styles.text, { fontSize, fontWeight, color }]}>
                ai
            </ThemedText>
            <ThemedText style={[styles.text, { fontSize, fontWeight, color: '#5B8FD8' }]}>
                .
            </ThemedText>
            <ThemedText style={[styles.text, { fontSize, fontWeight, color }]}>
                therapy
            </ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    text: {
        letterSpacing: 0.5,
    },
});
