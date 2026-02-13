import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Theme } from '../../src/constants/Theme';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
    const router = useRouter();

    const showComingSoon = () => {
        Alert.alert('Coming Soon', 'Social login will be available in the next update.');
    };

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <ChevronLeft size={28} color={Theme.colors.primary} />
            </TouchableOpacity>

            <View style={styles.content}>
                <View style={styles.logoSection}>
                    <Text style={styles.logo}>ai.therapy</Text>
                    <Text style={styles.slogan}>not real therapy</Text>
                </View>

                <Text style={styles.title}>Log in if you cant{"\n"}talk to humans{"\n"}right now</Text>

                <View style={styles.form}>
                    {/* Disabled Social Buttons */}
                    <TouchableOpacity style={styles.socialBtn} onPress={showComingSoon} activeOpacity={0.6}>
                        <Text style={styles.socialText}>Continue with Google</Text>
                        <View style={styles.disabledOverlay} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.socialBtn} onPress={showComingSoon} activeOpacity={0.6}>
                        <Text style={styles.socialText}>Continue with Apple</Text>
                        <View style={styles.disabledOverlay} />
                    </TouchableOpacity>

                    <View style={styles.divider}>
                        <View style={styles.line} />
                        <Text style={styles.dividerText}>OR</Text>
                        <View style={styles.line} />
                    </View>

                    <TextInput
                        style={styles.input}
                        placeholder="Enter your email"
                        placeholderTextColor={Theme.colors.text.muted}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/(main)/chat')}>
                        <Text style={styles.primaryBtnText}>Continue with Email</Text>
                    </TouchableOpacity>

                    <Text style={styles.footerNote}>
                        By continuing, you acknowledge our{' '}
                        <Text style={styles.link}>Privacy Policy</Text>.
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    backButton: {
        padding: Theme.spacing.l,
    },
    content: {
        flex: 1,
        paddingHorizontal: Theme.spacing.xl,
        alignItems: 'center',
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: Theme.spacing.xxl,
    },
    logo: {
        fontSize: 28,
        color: Theme.colors.primary,
        fontFamily: 'Playfair-Bold',
    },
    slogan: {
        fontSize: 14,
        color: Theme.colors.text.secondary,
        fontFamily: 'Inter-Regular',
        marginTop: -4,
    },
    title: {
        fontSize: 32,
        color: Theme.colors.text.primary,
        fontFamily: 'Playfair-Bold',
        textAlign: 'center',
        marginBottom: Theme.spacing.xxl,
        lineHeight: 40,
    },
    form: {
        width: '100%',
        alignItems: 'center',
    },
    socialBtn: {
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingVertical: 16,
        borderRadius: Theme.borderRadius.m,
        alignItems: 'center',
        marginBottom: Theme.spacing.m,
        position: 'relative',
        overflow: 'hidden',
    },
    socialText: {
        color: Theme.colors.text.primary,
        fontFamily: 'Inter-Bold',
        fontSize: 16,
    },
    disabledOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: Theme.spacing.l,
        width: '100%',
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    dividerText: {
        color: Theme.colors.text.muted,
        paddingHorizontal: Theme.spacing.m,
        fontSize: 12,
        fontFamily: 'Inter-Bold',
    },
    input: {
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingVertical: 16,
        paddingHorizontal: Theme.spacing.l,
        borderRadius: Theme.borderRadius.m,
        color: Theme.colors.text.primary,
        fontSize: 16,
        marginBottom: Theme.spacing.m,
    },
    primaryBtn: {
        width: '100%',
        backgroundColor: '#FFF',
        paddingVertical: 16,
        borderRadius: Theme.borderRadius.m,
        alignItems: 'center',
        marginTop: Theme.spacing.s,
    },
    primaryBtnText: {
        color: Theme.colors.background,
        fontFamily: 'Inter-Bold',
        fontSize: 16,
    },
    footerNote: {
        color: Theme.colors.text.muted,
        fontSize: 12,
        textAlign: 'center',
        marginTop: Theme.spacing.xl,
        paddingHorizontal: Theme.spacing.l,
        lineHeight: 18,
    },
    link: {
        color: Theme.colors.text.secondary,
        textDecorationLine: 'underline',
    },
});
