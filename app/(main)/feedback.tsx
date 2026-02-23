import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ScrollView, Platform, KeyboardAvoidingView, Animated, Dimensions, Keyboard } from 'react-native';
import { Theme } from '../../src/constants/Theme';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';

type FeedbackType = 'bug' | 'feature' | 'billing' | 'general';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// --- Confetti Particle ---
const CONFETTI_COLORS = ['#FFD700', '#FF6B6B', '#7CB9FF', '#4ECCA3', '#FF9FF3', '#FECA57', '#FF6348', '#A29BFE'];
const NUM_CONFETTI = 40;

interface ConfettiPiece {
    x: number;
    delay: number;
    color: string;
    size: number;
    rotation: number;
}

const ConfettiParticle = ({ piece, index }: { piece: ConfettiPiece; index: number }) => {
    const fallAnim = useRef(new Animated.Value(-50)).current;
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const swayAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const delay = piece.delay;
        Animated.parallel([
            Animated.timing(fallAnim, {
                toValue: SCREEN_HEIGHT + 50,
                duration: 2800 + Math.random() * 1200,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 2500,
                delay: delay + 800,
                useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
                toValue: piece.rotation,
                duration: 3000,
                delay,
                useNativeDriver: true,
            }),
            Animated.sequence([
                Animated.timing(swayAnim, {
                    toValue: 30,
                    duration: 600,
                    delay,
                    useNativeDriver: true,
                }),
                Animated.timing(swayAnim, {
                    toValue: -30,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(swayAnim, {
                    toValue: 15,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(swayAnim, {
                    toValue: 0,
                    duration: 600,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, []);

    const spin = rotateAnim.interpolate({
        inputRange: [0, 10],
        outputRange: ['0deg', '3600deg'],
    });

    return (
        <Animated.View
            style={{
                position: 'absolute',
                left: piece.x,
                top: 0,
                width: piece.size,
                height: piece.size * 0.6,
                backgroundColor: piece.color,
                borderRadius: 2,
                opacity: fadeAnim,
                transform: [
                    { translateY: fallAnim },
                    { translateX: swayAnim },
                    { rotate: spin },
                ],
            }}
        />
    );
};

// --- Success Screen ---
const SuccessScreen = ({ onDone }: { onDone: () => void }) => {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const textFadeAnim = useRef(new Animated.Value(0)).current;

    const confettiPieces = useRef<ConfettiPiece[]>(
        Array.from({ length: NUM_CONFETTI }, () => ({
            x: Math.random() * SCREEN_WIDTH,
            delay: Math.random() * 600,
            color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
            size: 8 + Math.random() * 8,
            rotation: 2 + Math.random() * 8,
        }))
    ).current;

    useEffect(() => {
        Animated.sequence([
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 4,
                    tension: 60,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ]),
            Animated.timing(textFadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
        ]).start();

        const timer = setTimeout(onDone, 3500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={successStyles.container}>
            {/* Confetti */}
            {confettiPieces.map((piece, i) => (
                <ConfettiParticle key={i} piece={piece} index={i} />
            ))}

            {/* Center content */}
            <Animated.View style={[successStyles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                <Text style={successStyles.checkmark}>✓</Text>
            </Animated.View>

            <Animated.View style={{ opacity: textFadeAnim, alignItems: 'center' }}>
                <Text style={successStyles.title}>Thank you!</Text>
                <Text style={successStyles.subtitle}>
                    Your feedback means the world to us.{'\n'}
                    You're helping shape the future of ai.therapy.
                </Text>
            </Animated.View>
        </View>
    );
};

const successStyles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: Theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    content: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
        shadowColor: Theme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    checkmark: {
        fontSize: 48,
        color: Theme.colors.background,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 28,
        color: Theme.colors.text.primary,
        fontFamily: 'Inter-Bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        color: Theme.colors.text.secondary,
        fontFamily: 'Inter-Regular',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 40,
    },
});

// --- Main Feedback Screen ---
export default function FeedbackScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [feedbackType, setFeedbackType] = useState<FeedbackType>('general');
    const [description, setDescription] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    const feedbackTypes = [
        { id: 'bug' as FeedbackType, label: 'Bug Report', description: 'Report something that isn\'t working correctly.' },
        { id: 'feature' as FeedbackType, label: 'Request', description: 'Suggest an improvement or a new feature.' },
        { id: 'billing' as FeedbackType, label: 'Auth & Billing', description: 'Issues with your account or payments.' },
        { id: 'general' as FeedbackType, label: 'General', description: 'For anything else not covered above.' },
    ];

    const handleSubmit = () => {
        // TODO: submit feedback to backend
        Keyboard.dismiss();
        setShowSuccess(true);
    };

    const handleSuccessDone = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/');
        }
    };

    const RadioButton = ({ selected, onPress, label }: { selected: boolean, onPress: () => void, label: string }) => (
        <TouchableOpacity style={styles.radioContainer} onPress={onPress} activeOpacity={0.7}>
            <View style={[styles.radioButton, selected && styles.radioButtonSelected]}>
                {selected && <View style={styles.radioButtonInner} />}
            </View>
            <Text style={[styles.radioLabel, selected && styles.radioLabelSelected]}>{label}</Text>
        </TouchableOpacity>
    );


    return (
        <SafeAreaView style={styles.container}>
            {showSuccess && <SuccessScreen onDone={handleSuccessDone} />}

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={28} color={Theme.colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Provide Feedback</Text>
                <View style={{ width: 28 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
            <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <View style={styles.innerContainer}>
                    <Text style={styles.sectionTitle}>Feedback Type</Text>
                    <View style={styles.typesGrid}>
                        {feedbackTypes.map((type) => (
                            <RadioButton
                                key={type.id}
                                label={type.label}
                                selected={feedbackType === type.id}
                                onPress={() => setFeedbackType(type.id)}
                            />
                        ))}
                    </View>

                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.typeExplanation}>
                        {feedbackTypes.find(t => t.id === feedbackType)?.description}
                    </Text>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Enter your feedback here..."
                            placeholderTextColor={Theme.colors.text.muted}
                            multiline
                            numberOfLines={6}
                            value={description}
                            onChangeText={setDescription}
                            textAlignVertical="top"
                            onFocus={() => {
                                setTimeout(() => {
                                    scrollViewRef.current?.scrollToEnd({ animated: true });
                                }, 300);
                            }}
                        />
                        <Text style={styles.charCount}>{description.length}/5000</Text>
                    </View>


                    <TouchableOpacity
                        style={[styles.submitButton, !description.trim() && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={!description.trim()}
                    >
                        <Text style={[styles.submitButtonText, !description.trim() && styles.submitButtonTextDisabled]}>Submit</Text>
                    </TouchableOpacity>
                    <Text style={styles.confirmationNote}>
                        Thanks! We're getting on this right away and will email you if we need more details.
                    </Text>
                </View>
            </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Theme.spacing.m,
        paddingVertical: Theme.spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.border,
    },
    backButton: {
        padding: Theme.spacing.s,
    },
    headerTitle: {
        fontSize: 20,
        color: Theme.colors.text.primary,
        fontFamily: 'Inter-Bold',
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 120,
    },
    innerContainer: {
        maxWidth: 1000,
        width: '100%',
        alignSelf: 'center',
        padding: Theme.spacing.xl,
    },
    sectionTitle: {
        fontSize: 16,
        color: Theme.colors.text.primary,
        fontFamily: 'Inter-Bold',
        marginBottom: Theme.spacing.l,
        marginTop: Theme.spacing.l,
    },
    typesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Theme.spacing.m,
        marginBottom: Theme.spacing.l,
    },
    radioContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Theme.spacing.m,
        paddingHorizontal: Theme.spacing.l,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: Theme.borderRadius.m,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        minWidth: '45%',
        flex: 1,
    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: Theme.colors.text.muted,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Theme.spacing.m,
    },
    radioButtonSelected: {
        borderColor: Theme.colors.primary,
    },
    radioButtonInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Theme.colors.primary,
    },
    radioLabel: {
        fontSize: 14,
        color: Theme.colors.text.secondary,
        fontFamily: 'Inter-Regular',
    },
    radioLabelSelected: {
        color: Theme.colors.text.primary,
        fontFamily: 'Inter-Bold',
    },
    typeExplanation: {
        fontSize: 14,
        color: Theme.colors.text.muted,
        fontFamily: 'Inter-Regular',
        marginBottom: Theme.spacing.m,
    },
    inputWrapper: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: Theme.borderRadius.l,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        padding: Theme.spacing.m,
        marginBottom: Theme.spacing.xl,
    },
    textInput: {
        minHeight: 150,
        color: Theme.colors.text.primary,
        fontSize: 16,
        fontFamily: 'Inter-Regular',
        textAlignVertical: 'top',
    },
    charCount: {
        alignSelf: 'flex-end',
        fontSize: 12,
        color: Theme.colors.text.muted,
        marginTop: 8,
    },
    submitButton: {
        backgroundColor: Theme.colors.primary,
        paddingVertical: 18,
        borderRadius: Theme.borderRadius.xl,
        alignItems: 'center',
        shadowColor: Theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    submitButtonDisabled: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        shadowOpacity: 0,
        elevation: 0,
    },
    submitButtonText: {
        color: Theme.colors.background,
        fontSize: 18,
        fontFamily: 'Inter-Bold',
    },
    submitButtonTextDisabled: {
        color: Theme.colors.text.muted,
    },
    confirmationNote: {
        fontSize: 13,
        color: Theme.colors.text.muted,
        textAlign: 'center',
        marginTop: Theme.spacing.l,
        fontFamily: 'Inter-Regular',
        lineHeight: 18,
    },
});
