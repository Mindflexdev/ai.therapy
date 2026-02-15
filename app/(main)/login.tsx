import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Alert, Modal, Image, useWindowDimensions } from 'react-native';
import { Theme } from '../../src/constants/Theme';
import { X } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';

export default function LoginScreen() {
    const router = useRouter();
    const { showLoginModal, setShowLoginModal } = useAuth();
    const { name, image } = useLocalSearchParams();
    const { height } = useWindowDimensions();
    const isSmallScreen = height < 700;

    const handleContinue = () => {
        setShowLoginModal(false);
        // Navigate to paywall first, passing along the therapist info if present
        router.push({
            pathname: '/(main)/paywall',
            params: { name, image }
        });
    };

    const showComingSoon = () => {
        Alert.alert('Coming Soon', 'Social login will be available in the next update.');
    };

    return (
        <Modal
            visible={showLoginModal}
            transparent={false}
            animationType="fade"
            onRequestClose={() => setShowLoginModal(false)}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setShowLoginModal(false)}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={(e) => e.stopPropagation()}
                    style={styles.modalContent}
                >
                    <SafeAreaView style={styles.container}>
                        <TouchableOpacity onPress={() => setShowLoginModal(false)} style={styles.closeButton}>
                            <X size={24} color={Theme.colors.text.secondary} />
                        </TouchableOpacity>

                        <View style={[styles.content, isSmallScreen && { paddingTop: '10%' }]}>
                <View style={styles.logoSection}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../../assets/logo_ai.png')}
                            style={styles.logoImageSmall}
                            resizeMode="contain"
                        />
                        <Text style={styles.logo}>
                            <Text style={styles.logoWhite}>ai</Text>
                            <Text style={styles.logoDot}>.</Text>
                            <Text style={styles.logoWhite}>therapy</Text>
                        </Text>
                    </View>
                    <Text style={styles.slogan}>not real therapy</Text>
                    <Text style={styles.tagline}>When you can't talk to humans</Text>
                </View>

                <View style={styles.form}>
                    {/* Apple Button */}
                    <TouchableOpacity style={styles.appleSocialBtn} onPress={showComingSoon}>
                        <View style={styles.iconWrapper}>
                            <Svg width="20" height="20" viewBox="0 0 24 24" fill="black">
                                <Path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74.79 0 1.96-.71 3.28-.66 1.13.04 1.98.42 2.61.98-2.19 1.34-1.84 4.5 0 5.25-1.28 2.65-3.08 4.63-4.97 6.66zM13 5.08c-.28 1.99-1.88 3.54-3.9 3.42C8.88 6.43 10.5 4.9 13 5.08z" />
                            </Svg>
                        </View>
                        <Text style={styles.appleBtnText}>Continue with Apple</Text>
                    </TouchableOpacity>

                    {/* Google Button */}
                    <TouchableOpacity style={styles.googleSocialBtn} onPress={showComingSoon}>
                        <View style={styles.iconWrapper}>
                            <Svg width="20" height="20" viewBox="0 0 24 24">
                                <Path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <Path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <Path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <Path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </Svg>
                        </View>
                        <Text style={styles.socialText}>Continue with Google</Text>
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

                    <TouchableOpacity style={styles.primaryBtn} onPress={handleContinue}>
                        <Text style={styles.primaryBtnText}>Continue with Email</Text>
                    </TouchableOpacity>

                    <Text style={styles.footerNote}>
                        By continuing, you acknowledge our{' '}
                        <Text style={styles.link}>Privacy Policy</Text>.
                    </Text>
                </View>
            </View>
        </SafeAreaView>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: Theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '100%',
        height: '100%',
        backgroundColor: Theme.colors.background,
    },
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    closeButton: {
        position: 'absolute',
        top: Theme.spacing.m,
        right: Theme.spacing.m,
        padding: Theme.spacing.s,
        zIndex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: Theme.spacing.xl,
        justifyContent: 'space-between',
        paddingTop: '20%',
        paddingBottom: Theme.spacing.xxl,
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: 0,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: Theme.spacing.xs,
    },
    slogan: {
        fontSize: 12,
        color: Theme.colors.text.secondary,
        fontFamily: 'Inter-Regular',
        textAlign: 'center',
        marginTop: Theme.spacing.xs,
        marginBottom: Theme.spacing.s,
    },
    tagline: {
        fontSize: 20,
        color: Theme.colors.text.primary,
        fontFamily: 'Inter-Regular',
        textAlign: 'center',
    },
    logo: {
        fontSize: 36,
        fontFamily: 'Inter-Bold',
    },
    logoWhite: {
        color: '#FFFFFF',
    },
    logoDot: {
        color: Theme.colors.primary,
    },
    logoImageSmall: {
        width: 48,
        height: 48,
    },
    form: {
        width: '100%',
        alignItems: 'center',
    },
    appleSocialBtn: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        borderRadius: Theme.borderRadius.m,
        flexDirection: 'row',
        paddingHorizontal: Theme.spacing.l,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Theme.spacing.m,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    googleSocialBtn: {
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingVertical: 16,
        borderRadius: Theme.borderRadius.m,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        flexDirection: 'row',
        paddingHorizontal: Theme.spacing.l,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Theme.spacing.m,
    },
    iconWrapper: {
        width: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Theme.spacing.m,
    },
    socialText: {
        color: Theme.colors.text.primary,
        fontFamily: 'Inter-Bold',
        fontSize: 16,
    },
    appleBtnText: {
        color: '#000000',
        fontFamily: 'Inter-Bold',
        fontSize: 16,
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
