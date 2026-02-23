import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Theme } from '../constants/Theme';

interface LogoProps {
    size?: 'small' | 'medium' | 'large';
    showSlogan?: boolean;
}

const SIZES = {
    small: { image: 40, font: 22, sloganFont: 9, sloganOffset: -16, sloganMarginLeft: 48, gap: 8 },
    medium: { image: 52, font: 28, sloganFont: 10, sloganOffset: -18, sloganMarginLeft: 60, gap: 12 },
    large: { image: 60, font: 28, sloganFont: 10, sloganOffset: -20, sloganMarginLeft: 60, gap: 12 },
};

export const Logo = ({ size = 'medium', showSlogan = true }: LogoProps) => {
    const s = SIZES[size];

    return (
        <View style={styles.container}>
            <View style={[styles.logoRow, { gap: s.gap }]}>
                <Image
                    source={require('../../assets/logo_ai.png')}
                    style={{ width: s.image, height: s.image, marginTop: size === 'small' ? 6 : 10 }}
                    resizeMode="contain"
                />
                <Text style={[styles.logoText, { fontSize: s.font }]}>
                    <Text style={styles.logoWhite}>ai</Text>
                    <Text style={styles.logoDot}>.</Text>
                    <Text style={styles.logoWhite}>therapy</Text>
                </Text>
            </View>
            {showSlogan && (
                <Text style={[styles.slogan, { fontSize: s.sloganFont, marginTop: s.sloganOffset, marginLeft: s.sloganMarginLeft }]}>
                    (not real therapy)
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoText: {
        fontFamily: 'Outfit-Regular',
    },
    logoWhite: {
        color: Theme.colors.text.primary,
    },
    logoDot: {
        color: Theme.colors.primary,
    },
    slogan: {
        color: Theme.colors.text.secondary,
        fontFamily: 'Outfit-Regular',
        textAlign: 'center',
    },
});
