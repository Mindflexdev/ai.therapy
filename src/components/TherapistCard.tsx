import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
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
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onSelect}
            style={[
                styles.container,
                isSelected && styles.selectedContainer
            ]}
        >
            <View style={styles.imageWrapper}>
                <Image source={therapist.image} style={styles.image} defaultSource={require('../../assets/adaptive-icon.png')} />
                {isSelected && (
                    <View style={styles.glowEffect} />
                )}
            </View>
            <Text style={styles.name}>{therapist.name}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '45%',
        aspectRatio: 0.8,
        marginBottom: Theme.spacing.l,
        alignItems: 'center',
    },
    selectedContainer: {
        // Selection feedback handled by glowEffect
    },
    imageWrapper: {
        width: '100%',
        height: '80%',
        borderRadius: Theme.borderRadius.l,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#1E1E1E',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    glowEffect: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: 3,
        borderColor: Theme.colors.primary,
        borderRadius: Theme.borderRadius.l,
        shadowColor: Theme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 15,
    },
    name: {
        color: Theme.colors.text.primary,
        fontFamily: 'Inter-Bold',
        marginTop: Theme.spacing.s,
        fontSize: 16,
        textAlign: 'center',
    },
});
