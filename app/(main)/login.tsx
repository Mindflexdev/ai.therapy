import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Alert, Modal, Image, useWindowDimensions, ActivityIndicator, Linking } from 'react-native';
import { Theme } from '../../src/constants/Theme';
import { X } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { Footer } from '../../src/components/sections/Footer';

export default function LoginScreen() {
    const router = useRouter();
    const { showLoginModal, setShowLoginModal, loginWithOtp, loginWithGoogle, loginWithApple, isLoggedIn, setPendingTherapist, pendingTherapist } = useAuth();
    const { name } = useLocalSearchParams();
    const { height } = useWindowDimensions();
    const isSmallScreen = height < 700;
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // After successful login (email magic link), navigate to paywall
    useEffect(() => {
        if (isLoggedIn && showLoginModal) {
            setShowLoginModal(false);
            router.push({
                pathname: '/(main)/paywall',
                params: { name }
            });
        }
    }, [isLoggedIn]);

    // loginWithGoogle/loginWithApple already handle setPendingTherapist internally
    // and await the AsyncStorage write before triggering the OAuth redirect
    const handleGoogleLogin = async () => {
        await loginWithGoogle(name as string);
    };

    const handleAppleLogin = async () => {
        await loginWithApple(name as string);
    };

    const handleEmailContinue = async () => {
        setErrorMsg('');
        if (!email.trim()) {
            setErrorMsg('Please enter your email address.');
            return;
        }
        // Save therapist info so the magic link redirect can navigate to chat
        if (name) {
            await setPendingTherapist({
                name: name as string,
                pendingMessage: pendingTherapist?.pendingMessage,
            });
        }
        setIsLoading(true);
        const { error } = await loginWithOtp(email.trim());
        setIsLoading(false);
        if (error) {
            setErrorMsg(error.message);
        } else {
            setEmailSent(true);
        }
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

                        <View style={[styles.content, isSmallScreen && { paddingTop: '5%' }]}>
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
                                <Text style={styles.slogan}>(not real therapy)</Text>
                            </View>

                            <View style={styles.form}>
                                {/* Apple Button */}
                                <TouchableOpacity style={styles.appleSocialBtn} onPress={handleAppleLogin}>
                                    <View style={styles.iconWrapper}>
                                        <Svg width="18" height="18" viewBox="0 0 814 1000" fill="black">
                                            <Path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57.8-155.5-127.4c-58.3-81.3-105.9-207.6-105.9-328.2 0-193.1 125.7-295.6 249.4-295.6 65.7 0 120.5 43.1 161.7 43.1 39.2 0 100.4-45.8 174.7-45.8 28.2 0 130 2.5 197.3 95.2zM554.1 159.4c31.1-36.9 53.1-88.1 53.1-139.4 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.9 32.4-57.1 83.6-57.1 135.6 0 7.8.6 15.6 1.3 18.2 2.5.6 6.4.6 10.2.6 45.8.1 101.7-30.4 141.5-70.7z" />
                                        </Svg>
                                    </View>
                                    <Text style={styles.appleBtnText}>Continue with Apple</Text>
                                </TouchableOpacity>

                                {/* Google Button */}
                                <TouchableOpacity style={styles.googleSocialBtn} onPress={handleGoogleLogin}>
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

                                {emailSent ? (
                                    <View style={styles.emailSentBox}>
                                        <Text style={styles.emailSentTitle}>Check your email</Text>
                                        <Text style={styles.emailSentText}>
                                            We sent a magic link to <Text style={{ color: Theme.colors.text.primary }}>{email}</Text>. Click the link in the email to sign in.
                                        </Text>
                                        <TouchableOpacity onPress={() => { setEmailSent(false); setEmail(''); }} style={styles.emailSentRetry}>
                                            <Text style={styles.emailSentRetryText}>Use a different email</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <>
                                        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Enter your email"
                                            placeholderTextColor={Theme.colors.text.muted}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            value={email}
                                            onChangeText={(t) => { setEmail(t); setErrorMsg(''); }}
                                            editable={!isLoading}
                                        />

                                        <TouchableOpacity style={[styles.primaryBtn, isLoading && { opacity: 0.7 }]} onPress={handleEmailContinue} disabled={isLoading}>
                                            {isLoading ? (
                                                <ActivityIndicator color={Theme.colors.background} />
                                            ) : (
                                                <Text style={styles.primaryBtnText}>Continue with Email</Text>
                                            )}
                                        </TouchableOpacity>
                                    </>
                                )}

                                <Text style={styles.footerNote}>
                                    By exchanging messages with ai.therapy, an AI chatbot, you agree to our{' '}
                                    <Text style={styles.link} onPress={() => { setShowLoginModal(false); router.push({ pathname: '/(main)/legal', params: { section: 'terms' } }); }}>Terms of Use</Text> and acknowledge that you have read our{' '}
                                    <Text style={styles.link} onPress={() => { setShowLoginModal(false); router.push({ pathname: '/(main)/legal', params: { section: 'privacy' } }); }}>Privacy Policy</Text>,{' '}
                                    <Text style={styles.link} onPress={() => { setShowLoginModal(false); router.push({ pathname: '/(main)/legal', params: { section: 'cookies' } }); }}>Cookie Policy</Text>, and{' '}
                                    <Text style={styles.link} onPress={() => { setShowLoginModal(false); router.push({ pathname: '/(main)/legal', params: { section: 'imprint' } }); }}>Imprint</Text>.
                                </Text>
                            </View>

                            <View>
                                <Text style={styles.copyrightText}>
                                    @ 2026 Mindflex
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
        maxWidth: 1500,
        height: '100%',
        backgroundColor: Theme.colors.background,
        alignSelf: 'center',
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
        paddingTop: '15%',
        paddingBottom: Theme.spacing.xxl,
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: Theme.spacing.l,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: Theme.spacing.xs,
    },
    logo: {
        fontSize: 48,
        fontFamily: 'Outfit-Regular',
    },
    slogan: {
        fontSize: 14,
        color: Theme.colors.text.secondary,
        fontFamily: 'Outfit-Regular',
        marginTop: -18,
        marginLeft: 86,
        marginBottom: Theme.spacing.s,
    },
    logoWhite: {
        color: '#FFFFFF',
    },
    logoDot: {
        color: Theme.colors.primary,
    },
    logoImageSmall: {
        width: 86,
        height: 86,
        marginTop: 20,
    },
    form: {
        width: '100%',
        alignItems: 'center',
        marginTop: 32,
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
    errorText: {
        color: Theme.colors.danger,
        fontSize: 14,
        fontFamily: 'Inter-Regular',
        marginBottom: Theme.spacing.m,
        textAlign: 'center',
    },
    emailSentBox: {
        width: '100%',
        backgroundColor: 'rgba(212, 175, 55, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.3)',
        borderRadius: Theme.borderRadius.m,
        padding: Theme.spacing.l,
        alignItems: 'center',
    },
    emailSentTitle: {
        color: Theme.colors.primary,
        fontFamily: 'Inter-Bold',
        fontSize: 18,
        marginBottom: Theme.spacing.s,
    },
    emailSentText: {
        color: Theme.colors.text.secondary,
        fontSize: 14,
        fontFamily: 'Inter-Regular',
        textAlign: 'center',
        lineHeight: 20,
    },
    emailSentRetry: {
        marginTop: Theme.spacing.l,
    },
    emailSentRetryText: {
        color: Theme.colors.text.muted,
        fontSize: 14,
        fontFamily: 'Inter-Regular',
        textDecorationLine: 'underline',
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
    copyrightText: {
        fontSize: 11,
        fontFamily: 'Inter-Regular',
        color: Theme.colors.text.muted,
        textAlign: 'center',
        marginTop: Theme.spacing.l,
    },
});
