import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ImageBackground, Platform } from 'react-native';
import { Theme } from '../constants/Theme';
import { BlurView } from 'expo-blur';

interface Therapist {
    id: string;
    name: string;
    image: any;
}

interface Props {
    therapist: Therapist;
    isSelected: boolean;
    onSelect: () => void;
}

export const TherapistCard = ({ therapist, isSelected, onSelect }: Props) => {
    const [isHovered, setIsHovered] = useState(false);
    const isWeb = Platform.OS === 'web';

    return (
        <View style={styles.container}>
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={onSelect}
                // @ts-ignore - web-only props
                onMouseEnter={isWeb ? () => setIsHovered(true) : undefined}
                onMouseLeave={isWeb ? () => setIsHovered(false) : undefined}
                style={styles.touchable}
            >
                <View style={[styles.imageWrapper, isSelected && styles.selectedContainer]}>
                    <ImageBackground
                        source={require('../../assets/background.png')}
                        style={styles.cardBackground}
                        resizeMode="cover"
                    >
                        <Image source={therapist.image} style={styles.image} defaultSource={require('../../assets/adaptive-icon.png')} />
                        {(isSelected || isHovered) && (
                            <View style={styles.glowEffect} />
                        )}
                        <View style={styles.nameOverlay}>
                            <Text style={styles.name}>{therapist.name}</Text>
                        </View>
                    </ImageBackground>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '45%',
        aspectRatio: 0.75,
        alignItems: 'center',
    },
    touchable: {
        width: '100%',
        height: '100%',
    },
    selectedContainer: {
        borderColor: Theme.colors.primary,
        borderWidth: 2,
    },
    imageWrapper: {
        width: '100%',
        height: '100%',
        borderRadius: Theme.borderRadius.l,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#1E1E1E',
        borderWidth: 0.5,
        borderColor: 'rgba(235, 206, 128, 0.3)',
    },
    cardBackground: {
        width: '100%',
        height: '100%',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    glowEffect: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(235, 206, 128, 0.15)',
        borderWidth: 1.5,
        borderColor: Theme.colors.primary,
        borderRadius: Theme.borderRadius.l,
        shadowColor: Theme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 12,
        zIndex: 2,
    },
    nameOverlay: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingVertical: Theme.spacing.m,
        paddingHorizontal: Theme.spacing.l,
        zIndex: 1,
    },
    name: {
        color: Theme.colors.text.primary,
        fontFamily: 'Inter-Bold',
        fontSize: 18,
        textAlign: 'center',
    },
});
