import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Dimensions,
    Animated,
    Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../constants/Theme';
import { THERAPISTS } from '../constants/Therapists';
import { LOCALE, Locale } from '../constants/Locale';
import { Logo } from './Logo';
import { supabase } from '../lib/supabase';

// ─── Locale-aware UI texts ─────────────────────────────────────────────────────

const TEXTS: Record<Locale, {
    welcome: { title: string; subtitle: string; button: string; footer: string };
    bridge: { title: string; subtitle: string; features: string[]; button: string };
    choose: { title: string; subtitle: string; button: string };
    confirm: { companion: string; startButton: string; backButton: string };
}> = {
    en: {
        welcome: {
            title: 'Your space to sort your thoughts.',
            subtitle: 'A companion for your mental health\ndeveloped by psychologists.\nAlways available. Completely private.',
            button: 'Get started',
            footer: 'Free first session \u00B7 No credit card required',
        },
        bridge: {
            title: 'Every journey is personal',
            subtitle: "That's why you'll choose a companion\nwho fits the way you want to be supported.",
            features: [
                'Each one has a different approach',
                'Built on real psychological methods',
                'Adapts to how you communicate',
            ],
            button: 'Meet them',
        },
        choose: {
            title: 'Choose your companion',
            subtitle: 'Who do you want to talk to?',
            button: 'Continue',
        },
        confirm: {
            companion: 'This will be your companion for your journey.',
            startButton: 'Start my journey',
            backButton: 'Choose someone else',
        },
    },
    de: {
        welcome: {
            title: 'Um deine Gedanken zu sortieren.',
            subtitle: 'Ein Begleiter f\u00FCr deine mentale Gesundheit\nentwickelt von Psychologen.\nImmer verf\u00FCgbar. Komplett privat.',
            button: 'Loslegen',
            footer: 'Erste Sitzung kostenlos \u00B7 Keine Kreditkarte n\u00F6tig',
        },
        bridge: {
            title: 'Jeder Weg ist pers\u00F6nlich',
            subtitle: 'Deshalb w\u00E4hlst du einen Begleiter,\nder zu deiner Art der Unterst\u00FCtzung passt.',
            features: [
                'Jeder hat einen anderen Ansatz',
                'Basiert auf echten psychologischen Methoden',
                'Passt sich deiner Kommunikation an',
            ],
            button: 'Lerne sie kennen',
        },
        choose: {
            title: 'W\u00E4hle deinen Begleiter',
            subtitle: 'Mit wem m\u00F6chtest du sprechen?',
            button: 'Weiter',
        },
        confirm: {
            companion: 'Das wird dein Begleiter auf deinem Weg.',
            startButton: 'Meine Reise starten',
            backButton: 'Jemand anderen w\u00E4hlen',
        },
    },
};

const t = TEXTS[LOCALE];

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Custom order for the character selection grid:
// Emily (top-left), Liam (top-right), Sarah (bottom-left), Marcus (bottom-right)
const ONBOARDING_ORDER = ['Emily', 'Liam', 'Sarah', 'Marcus'];
const SORTED_THERAPISTS = [...THERAPISTS].sort(
    (a, b) => ONBOARDING_ORDER.indexOf(a.name) - ONBOARDING_ORDER.indexOf(b.name)
);
// Available width = SCREEN_WIDTH - 48 (24px padding each side) - 12 (gap between cards)
const CARD_WIDTH = (SCREEN_WIDTH - 48 - 12) / 2;
const CARD_IMAGE_HEIGHT = CARD_WIDTH * 1.3; // taller than wide — portrait ratio

type OnboardingStep = 'welcome' | 'bridge' | 'choose' | 'confirm';

interface NativeOnboardingProps {
    onComplete: (therapist: { id: string; name: string }) => void;
    animateEntry?: boolean;
}

export function NativeOnboarding({ onComplete, animateEntry }: NativeOnboardingProps) {
    const [step, setStep] = useState<OnboardingStep>('welcome');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const fadeAnim = useRef(new Animated.Value(1)).current;

    // Entry animation: welcome screen scrolls up from below, synced with splash slide-up
    const entryTranslateY = useRef(new Animated.Value(animateEntry ? 0 : SCREEN_HEIGHT)).current;

    useEffect(() => {
        if (animateEntry) {
            Animated.timing(entryTranslateY, {
                toValue: 0,
                duration: 1200,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }).start();
        }
    }, [animateEntry]);

    const selectedTherapist = THERAPISTS.find(t => t.id === selectedId);

    const animateTransition = (nextStep: OnboardingStep) => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            setStep(nextStep);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        });
    };

    const handleContinue = () => animateTransition('bridge');
    const handleBridgeContinue = () => animateTransition('choose');
    const handleSelect = (id: string) => setSelectedId(id);
    const handleNext = () => {
        if (selectedId) animateTransition('confirm');
    };
    const handleBack = () => {
        setSelectedId(null);
        animateTransition('choose');
    };
    const handleConfirm = () => {
        if (selectedTherapist) {
            // Increment global choice counter (fire-and-forget)
            supabase.rpc('increment_character_choice', { char_name: selectedTherapist.name }).then(({ error }) => {
                if (error) console.warn('Could not increment choice counter:', error.message);
            });
            onComplete({ id: selectedTherapist.id, name: selectedTherapist.name });
        }
    };

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: entryTranslateY }] }]}>
            {step === 'welcome' && <WelcomeScreen onContinue={handleContinue} />}
            {step === 'bridge' && <BridgeScreen onContinue={handleBridgeContinue} />}
            {step === 'choose' && (
                <ChooseScreen
                    selectedId={selectedId}
                    onSelect={handleSelect}
                    onNext={handleNext}
                />
            )}
            {step === 'confirm' && selectedTherapist && (
                <ConfirmScreen
                    therapist={selectedTherapist}
                    onBack={handleBack}
                    onConfirm={handleConfirm}
                />
            )}
        </Animated.View>
    );
}

// ─── Screen 1: Welcome ─────────────────────────────────────────────────────────

function WelcomeScreen({ onContinue }: { onContinue: () => void }) {
    return (
        <View style={styles.screen}>
            {/* Logo pinned near the top */}
            <View style={styles.welcomeLogoArea}>
                <Logo size="large" />
            </View>

            {/* Title + divider + subtitle centered as one block */}
            <View style={styles.welcomeContent}>
                <Text style={styles.welcomeTitle}>{t.welcome.title}</Text>

                <View style={styles.welcomeDivider} />

                <Text style={styles.welcomeSubtitle}>
                    {t.welcome.subtitle}
                </Text>
            </View>

            <View style={styles.bottomArea}>
                <TouchableOpacity style={styles.primaryButton} onPress={onContinue} activeOpacity={0.8}>
                    <Text style={styles.primaryButtonText}>{t.welcome.button}</Text>
                </TouchableOpacity>
                <Text style={styles.footerNote}>{t.welcome.footer}</Text>
            </View>
        </View>
    );
}

// ─── Screen 1.5: Bridge ──────────────────────────────────────────────────────────

function BridgeScreen({ onContinue }: { onContinue: () => void }) {
    return (
        <View style={styles.screen}>
            <View style={styles.bridgeContent}>
                <Text style={styles.bridgeEmoji}>🤝</Text>
                <Text style={styles.bridgeTitle}>{t.bridge.title}</Text>
                <Text style={styles.bridgeSubtitle}>
                    {t.bridge.subtitle}
                </Text>

                <View style={styles.bridgeDivider} />

                <View style={styles.bridgeFeatures}>
                    {t.bridge.features.map((feat, i) => (
                        <Text key={i} style={styles.bridgeFeature}>{feat}</Text>
                    ))}
                </View>
            </View>

            <View style={styles.bottomArea}>
                <TouchableOpacity style={styles.primaryButton} onPress={onContinue} activeOpacity={0.8}>
                    <Text style={styles.primaryButtonText}>{t.bridge.button}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// ─── Screen 2: Choose Character ─────────────────────────────────────────────────

function ChooseScreen({
    selectedId,
    onSelect,
    onNext,
}: {
    selectedId: string | null;
    onSelect: (id: string) => void;
    onNext: () => void;
}) {
    return (
        <View style={styles.screen}>
            <View style={styles.chooseHeader}>
                <Text style={styles.chooseTitle}>{t.choose.title}</Text>
                <View style={styles.chooseDivider} />
                <Text style={styles.chooseSubtitle}>
                    {t.choose.subtitle}
                </Text>
            </View>

            <View style={styles.characterGrid}>
                {SORTED_THERAPISTS.map((t) => {
                    const isSelected = t.id === selectedId;
                    return (
                        <TouchableOpacity
                            key={t.id}
                            style={[
                                styles.characterCard,
                                isSelected && styles.characterCardSelected,
                            ]}
                            onPress={() => onSelect(t.id)}
                            activeOpacity={0.8}
                        >
                            <View style={styles.characterImageWrapper}>
                                <Image
                                    source={t.image}
                                    style={styles.characterImage}
                                    resizeMode="cover"
                                />
                                {/* Gradient overlay for name readability */}
                                <LinearGradient
                                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                                    style={styles.imageGradient}
                                />
                                <Text style={styles.characterName}>{t.name}</Text>
                            </View>
                            {isSelected && (
                                <View style={styles.selectedIndicator}>
                                    <Text style={styles.selectedCheck}>✓</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>

            <View style={styles.bottomArea}>
                <TouchableOpacity
                    style={[styles.primaryButton, !selectedId && styles.buttonDisabled]}
                    onPress={onNext}
                    disabled={!selectedId}
                    activeOpacity={0.8}
                >
                    <Text style={[styles.primaryButtonText, !selectedId && styles.buttonTextDisabled]}>
                        {t.choose.button}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// ─── Screen 3: Confirm Choice ───────────────────────────────────────────────────

function ConfirmScreen({
    therapist,
    onBack,
    onConfirm,
}: {
    therapist: { id: string; name: string; image: any; philosophy?: string };
    onBack: () => void;
    onConfirm: () => void;
}) {
    return (
        <View style={styles.confirmScreen}>
            {/* Full-width hero image — cover for full bleed, top-aligned so heads show */}
            <View style={styles.confirmImageContainer}>
                <Image
                    source={therapist.image}
                    style={styles.confirmImage}
                    resizeMode="cover"
                />
                <LinearGradient
                    colors={['transparent', 'rgba(38,38,36,0.6)', Theme.colors.background]}
                    locations={[0.4, 0.75, 1]}
                    style={styles.confirmGradient}
                />
            </View>

            {/* Info section over the gradient */}
            <View style={styles.confirmInfo}>
                <Text style={styles.confirmName}>{therapist.name}</Text>
                {therapist.philosophy && (
                    <Text style={styles.confirmPhilosophy}>"{therapist.philosophy}"</Text>
                )}
                <View style={styles.confirmDivider} />
                <Text style={styles.confirmWarning}>
                    {t.confirm.companion}
                </Text>
            </View>

            <View style={styles.confirmBottomArea}>
                <TouchableOpacity style={styles.primaryButton} onPress={onConfirm} activeOpacity={0.8}>
                    <Text style={styles.primaryButtonText}>{t.confirm.startButton}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryButton} onPress={onBack} activeOpacity={0.7}>
                    <Text style={styles.secondaryButtonText}>{t.confirm.backButton}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// ─── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    screen: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: Theme.spacing.l,
        paddingTop: 80,
        paddingBottom: 40,
    },

    // ── Welcome ──────────────────────────────────────────
    welcomeLogoArea: {
        alignItems: 'center',
        paddingTop: 20,
    },
    welcomeContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    welcomeTitle: {
        fontSize: 28,
        fontFamily: 'Playfair-Bold',
        color: Theme.colors.text.primary,
        letterSpacing: 0.3,
        textAlign: 'center',
    },
    welcomeDivider: {
        width: 40,
        height: 1,
        backgroundColor: Theme.colors.primary,
        marginTop: 20,
        marginBottom: 20,
        opacity: 0.5,
    },
    welcomeSubtitle: {
        fontSize: 15,
        fontFamily: 'Inter-Regular',
        color: Theme.colors.text.secondary,
        textAlign: 'center',
        lineHeight: 24,
        letterSpacing: 0.2,
    },
    footerNote: {
        fontSize: 12,
        fontFamily: 'Inter-Regular',
        color: Theme.colors.text.muted,
        textAlign: 'center',
        marginTop: 8,
    },

    // ── Bridge ───────────────────────────────────────────
    bridgeContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Theme.spacing.l,
    },
    bridgeEmoji: {
        fontSize: 48,
        marginBottom: 24,
    },
    bridgeTitle: {
        fontSize: 26,
        fontFamily: 'Playfair-Bold',
        color: Theme.colors.text.primary,
        textAlign: 'center',
        letterSpacing: 0.3,
    },
    bridgeSubtitle: {
        fontSize: 15,
        fontFamily: 'Inter-Regular',
        color: Theme.colors.text.secondary,
        textAlign: 'center',
        marginTop: Theme.spacing.m,
        lineHeight: 24,
    },
    bridgeDivider: {
        width: 40,
        height: 1,
        backgroundColor: Theme.colors.primary,
        marginVertical: 28,
        opacity: 0.5,
    },
    bridgeFeatures: {
        alignItems: 'center',
        gap: 12,
    },
    bridgeFeature: {
        fontSize: 14,
        fontFamily: 'Inter-Regular',
        color: Theme.colors.text.muted,
        textAlign: 'center',
    },

    // ── Choose ───────────────────────────────────────────
    chooseHeader: {
        alignItems: 'center',
        marginBottom: Theme.spacing.l,
        marginTop: Theme.spacing.m,
    },
    chooseTitle: {
        fontSize: 26,
        fontFamily: 'Playfair-Bold',
        color: Theme.colors.text.primary,
        letterSpacing: 0.3,
    },
    chooseDivider: {
        width: 40,
        height: 1,
        backgroundColor: Theme.colors.primary,
        marginTop: 12,
        marginBottom: 4,
        opacity: 0.5,
    },
    chooseSubtitle: {
        fontSize: 14,
        fontFamily: 'Inter-Regular',
        color: Theme.colors.text.secondary,
        marginTop: Theme.spacing.s,
    },
    characterGrid: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignContent: 'center',
        rowGap: 12,
    },
    characterCard: {
        width: CARD_WIDTH,
        borderRadius: Theme.borderRadius.l,
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: 'rgba(212, 175, 55, 0.25)',
    },
    characterCardSelected: {
        borderWidth: 2,
        borderColor: Theme.colors.primary,
        shadowColor: Theme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 6,
    },
    characterImageWrapper: {
        width: '100%',
        height: CARD_IMAGE_HEIGHT,
        position: 'relative',
    },
    characterImage: {
        width: '100%',
        height: '100%',
    },
    imageGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '50%',
    },
    characterName: {
        position: 'absolute',
        bottom: 14,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 18,
        fontFamily: 'Inter-Bold',
        color: '#FFFFFF',
        textShadowColor: 'rgba(0,0,0,0.6)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    selectedIndicator: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: Theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    selectedCheck: {
        color: Theme.colors.background,
        fontSize: 15,
        fontWeight: 'bold',
    },

    // ── Confirm ──────────────────────────────────────────
    confirmScreen: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    confirmImageContainer: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT * 0.55,
        backgroundColor: Theme.colors.background,
        overflow: 'hidden',
    },
    confirmImage: {
        width: '100%',
        height: '115%', // slightly taller than container so cover shows the top
        top: 0, // anchor to top so head is visible, bottom gets cropped/faded
    },
    confirmGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '50%',
    },
    confirmInfo: {
        alignItems: 'center',
        paddingHorizontal: Theme.spacing.l,
        marginTop: -40,
    },
    confirmName: {
        fontSize: 34,
        fontFamily: 'Playfair-Bold',
        color: Theme.colors.text.primary,
        letterSpacing: 0.5,
    },
    confirmPhilosophy: {
        fontSize: 14,
        fontFamily: 'Inter-Regular',
        fontStyle: 'italic',
        color: Theme.colors.primary,
        textAlign: 'center',
        marginTop: 10,
        lineHeight: 20,
        paddingHorizontal: Theme.spacing.m,
        opacity: 0.9,
    },
    confirmDivider: {
        width: 30,
        height: 1,
        backgroundColor: Theme.colors.primary,
        marginVertical: 14,
        opacity: 0.6,
    },
    confirmWarning: {
        fontSize: 14,
        fontFamily: 'Inter-Regular',
        color: Theme.colors.text.secondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    confirmBottomArea: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingHorizontal: Theme.spacing.l,
        paddingBottom: 40,
        gap: 12,
    },

    // ── Buttons ──────────────────────────────────────────
    bottomArea: {
        gap: 12,
        paddingTop: Theme.spacing.l,
    },
    primaryButton: {
        backgroundColor: Theme.colors.primary,
        paddingVertical: 16,
        borderRadius: Theme.borderRadius.xl,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: Theme.colors.background,
        fontSize: 17,
        fontFamily: 'Inter-Bold',
        letterSpacing: 0.3,
    },
    buttonDisabled: {
        backgroundColor: 'rgba(235,206,128,0.15)',
    },
    buttonTextDisabled: {
        color: 'rgba(38,38,36,0.4)',
    },
    secondaryButton: {
        paddingVertical: 14,
        borderRadius: Theme.borderRadius.xl,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: Theme.colors.text.secondary,
        fontSize: 15,
        fontFamily: 'Inter-Regular',
    },
});
