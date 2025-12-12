import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Easing,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { saveCharacter, UserCharacter } from '@/constants/storage';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { generateCharacterImage } from '@/lib/webhooks';
import { supabase } from '@/lib/supabase';

type Step = 'goal' | 'name' | 'characteristics' | 'therapyStyle' | 'imageDescription' | 'imageGeneration' | 'greeting' | 'visibility' | 'review';

import { ALL_THERAPY_OPTIONS, STYLE_ABBREVIATIONS } from '@/constants/therapy';

// Professional status messages for image generation
const GENERATION_MESSAGES = [
    { text: 'Crafting your ai.therapist...', icon: '✨' },
    { text: 'Analyzing therapeutic approach...', icon: '🧠' },
    { text: 'Assigning modalities...', icon: '📋' },
    { text: 'Personalizing appearance...', icon: '🎨' },
    { text: 'Almost there...', icon: '🌟' },
];

// Modern animated loading component for image generation
const ImageGeneratingAnimation = ({ theme, characterName }: { theme: typeof Colors.light; characterName?: string }) => {
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(0.8)).current;
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        // Rotation animation for outer ring
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 3000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();

        // Pulse animation for inner circle
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 800,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0.9,
                    duration: 800,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Progress bar animation
        Animated.timing(progressAnim, {
            toValue: 1,
            duration: 15000, // 15 seconds total
            easing: Easing.linear,
            useNativeDriver: false,
        }).start();

        // Cycle through messages
        const messageInterval = setInterval(() => {
            // Fade out
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start(() => {
                setMessageIndex(prev => (prev + 1) % GENERATION_MESSAGES.length);
                // Fade in
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }).start();
            });
        }, 2500);

        return () => clearInterval(messageInterval);
    }, []);

    const rotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    const currentMessage = GENERATION_MESSAGES[messageIndex];

    return (
        <View style={animStyles.container}>
            {/* Outer rotating ring */}
            <Animated.View
                style={[
                    animStyles.outerRing,
                    {
                        borderColor: theme.primary,
                        transform: [{ rotate: rotation }],
                    },
                ]}
            />

            {/* Secondary rotating ring (opposite direction) */}
            <Animated.View
                style={[
                    animStyles.secondaryRing,
                    {
                        borderColor: theme.primary + '40',
                        transform: [{ rotate: rotation }, { scaleX: -1 }],
                    },
                ]}
            />

            {/* Pulsing inner circle */}
            <Animated.View
                style={[
                    animStyles.innerCircle,
                    {
                        backgroundColor: theme.primary + '20',
                        transform: [{ scale: pulseAnim }],
                    },
                ]}
            />

            {/* Center icon with current message emoji */}
            <Animated.View style={[animStyles.iconContainer, { opacity: fadeAnim }]}>
                <ThemedText style={animStyles.centerEmoji}>{currentMessage.icon}</ThemedText>
            </Animated.View>

            {/* Status message */}
            <View style={animStyles.messageContainer}>
                <Animated.View style={{ opacity: fadeAnim }}>
                    <ThemedText style={[animStyles.statusMessage, { color: theme.text }]}>
                        {currentMessage.text}
                    </ThemedText>
                </Animated.View>

                {/* Progress bar */}
                <View style={[animStyles.progressBarContainer, { backgroundColor: theme.card }]}>
                    <Animated.View
                        style={[
                            animStyles.progressBar,
                            {
                                backgroundColor: theme.primary,
                                width: progressWidth,
                            }
                        ]}
                    />
                </View>

                {characterName && (
                    <ThemedText style={[animStyles.characterNameText, { color: theme.icon }]}>
                        Creating {characterName}
                    </ThemedText>
                )}
            </View>
        </View>
    );
};

// Styles for the animation component
const animStyles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        paddingBottom: 60,
    },
    outerRing: {
        position: 'absolute',
        width: 90,
        height: 90,
        borderRadius: 45,
        borderWidth: 3,
        borderStyle: 'dashed',
    },
    secondaryRing: {
        position: 'absolute',
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 2,
        borderStyle: 'dotted',
    },
    innerCircle: {
        position: 'absolute',
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerEmoji: {
        fontSize: 24,
    },
    messageContainer: {
        position: 'absolute',
        bottom: 0,
        alignItems: 'center',
        width: '100%',
        gap: 8,
    },
    statusMessage: {
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center',
    },
    progressBarContainer: {
        width: '80%',
        height: 4,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 2,
    },
    characterNameText: {
        fontSize: 11,
        opacity: 0.7,
    },
});

// Fullscreen crafting overlay component
const FullscreenCraftingOverlay = ({ theme, characterName }: { theme: typeof Colors.light; characterName?: string }) => {
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(0.9)).current;
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;
    const glowAnim = useRef(new Animated.Value(0.5)).current;
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        // Rotation animation
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 4000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();

        // Pulse animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 1200,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0.95,
                    duration: 1200,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Glow animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, {
                    toValue: 1,
                    duration: 1500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(glowAnim, {
                    toValue: 0.5,
                    duration: 1500,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Progress bar animation
        Animated.timing(progressAnim, {
            toValue: 1,
            duration: 18000,
            easing: Easing.linear,
            useNativeDriver: false,
        }).start();

        // Cycle through messages
        const messageInterval = setInterval(() => {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }).start(() => {
                setMessageIndex(prev => (prev + 1) % GENERATION_MESSAGES.length);
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }).start();
            });
        }, 3000);

        return () => clearInterval(messageInterval);
    }, []);

    const rotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const reverseRotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['360deg', '0deg'],
    });

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    const currentMessage = GENERATION_MESSAGES[messageIndex];

    return (
        <View style={craftingStyles.overlay}>
            <View style={[craftingStyles.container, { backgroundColor: theme.background }]}>
                {/* Large centered profile area */}
                <View style={craftingStyles.profileSection}>
                    {/* Outer glow ring */}
                    <Animated.View
                        style={[
                            craftingStyles.glowRing,
                            {
                                borderColor: theme.primary,
                                opacity: glowAnim,
                                transform: [{ scale: pulseAnim }],
                            },
                        ]}
                    />

                    {/* Rotating outer ring */}
                    <Animated.View
                        style={[
                            craftingStyles.outerRing,
                            {
                                borderColor: theme.primary,
                                transform: [{ rotate: rotation }],
                            },
                        ]}
                    />

                    {/* Counter-rotating middle ring */}
                    <Animated.View
                        style={[
                            craftingStyles.middleRing,
                            {
                                borderColor: theme.primary + '60',
                                transform: [{ rotate: reverseRotation }],
                            },
                        ]}
                    />

                    {/* Inner pulsing circle */}
                    <Animated.View
                        style={[
                            craftingStyles.innerCircle,
                            {
                                backgroundColor: theme.primary + '15',
                                transform: [{ scale: pulseAnim }],
                            },
                        ]}
                    />

                    {/* Center emoji */}
                    <Animated.View style={[craftingStyles.emojiContainer, { opacity: fadeAnim }]}>
                        <ThemedText style={craftingStyles.centerEmoji}>{currentMessage.icon}</ThemedText>
                    </Animated.View>
                </View>

                {/* Status section below */}
                <View style={craftingStyles.statusSection}>
                    {/* Character name */}
                    {characterName && (
                        <ThemedText style={[craftingStyles.characterName, { color: theme.text }]}>
                            {characterName}
                        </ThemedText>
                    )}

                    {/* Status message */}
                    <Animated.View style={{ opacity: fadeAnim }}>
                        <ThemedText style={[craftingStyles.statusMessage, { color: theme.text }]}>
                            {currentMessage.text}
                        </ThemedText>
                    </Animated.View>
                </View>
            </View>
        </View>
    );
};

// Styles for fullscreen crafting overlay
const craftingStyles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    profileSection: {
        width: 200,
        height: 200,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 60,
    },
    glowRing: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        borderWidth: 2,
    },
    outerRing: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
        borderWidth: 3,
        borderStyle: 'dashed',
    },
    middleRing: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        borderStyle: 'dotted',
    },
    innerCircle: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    emojiContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerEmoji: {
        fontSize: 40,
    },
    statusSection: {
        alignItems: 'center',
        gap: 16,
        width: '100%',
    },
    characterName: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 8,
    },
    statusMessage: {
        fontSize: 18,
        fontWeight: '500',
        textAlign: 'center',
    },
});

export default function CreateCharacterScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const [currentStep, setCurrentStep] = useState<Step>('goal');
    const [characterData, setCharacterData] = useState({
        goal: '',
        name: '',
        characteristics: '',
        therapyStyles: ['Integrative Therapy (AI decides)'] as string[], // Preselect Integrative
        imageDescription: '',
        greeting: '',
        isPublic: true,
    });
    const [isCreating, setIsCreating] = useState(false);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
    const [supabaseCharacterId, setSupabaseCharacterId] = useState<string | null>(null); // UUID from Supabase

    const params = useLocalSearchParams();
    const [editingId, setEditingId] = useState<string | null>(null);

    // Initial load for edit mode
    React.useEffect(() => {
        if (params.editMode === 'true' && params.characterData) {
            try {
                const charData = JSON.parse(params.characterData as string) as UserCharacter;
                setCharacterData({
                    goal: charData.goal || '',
                    name: charData.name,
                    characteristics: charData.description,
                    therapyStyles: charData.therapyStyles || [],
                    imageDescription: charData.imageDescription || '',
                    greeting: charData.greeting || '',
                    isPublic: charData.isPublic || false,
                });
                setGeneratedImageUrl(charData.image);
                setEditingId(charData.id);
            } catch (e) {
                console.error("Failed to parse character data for editing", e);
            }
        }
    }, [params]);

    // Preload image when entering review step
    React.useEffect(() => {
        if (currentStep === 'review' && generatedImageUrl) {
            Image.prefetch(generatedImageUrl);
        }
    }, [currentStep, generatedImageUrl]);

    const handleNext = async () => {
        const steps: Step[] = ['goal', 'name', 'greeting', 'therapyStyle', 'visibility', 'characteristics', 'imageDescription', 'imageGeneration', 'review'];
        const currentIndex = steps.indexOf(currentStep);

        // Auto-generate image when moving from imageDescription to imageGeneration
        if (currentStep === 'imageDescription' && characterData.imageDescription.trim()) {
            setCurrentStep('imageGeneration');
            setIsGeneratingImage(true);
            try {
                console.log('🎨 Starting automatic image generation...');

                // Get authenticated user ID
                const { data: { user } } = await supabase.auth.getUser();
                const userId = user?.id;

                const result = await generateCharacterImage({
                    description: characterData.imageDescription,
                    characterName: characterData.name,
                    greeting: characterData.greeting,
                    therapyStyles: characterData.therapyStyles,
                    goal: characterData.goal,
                    characteristics: characterData.characteristics,
                    isPublic: characterData.isPublic,
                    userId: userId,
                });
                console.log('🎨 Image generation result:', result);
                if (result.success && result.imageUrl) {
                    // Preload image before showing
                    await Image.prefetch(result.imageUrl);
                    setGeneratedImageUrl(result.imageUrl);
                    // Store the Supabase character ID if returned
                    if (result.characterId) {
                        setSupabaseCharacterId(result.characterId);
                    }
                    console.log('✅ Image URL set:', result.imageUrl);
                    console.log('✅ Character ID:', result.characterId);
                } else {
                    console.error('❌ Image generation failed:', result.error);
                    // Show the actual error message from the server
                    Alert.alert(
                        'Unable to Create Character',
                        result.error || 'Could not generate image. Please try again.'
                    );
                }
            } catch (error) {
                console.error('❌ Error generating image:', error);
                Alert.alert('Error', 'Failed to generate image. Please try again.');
            } finally {
                setIsGeneratingImage(false);
            }
            return; // Don't proceed to next step automatically, we already moved to imageGeneration
        }

        if (currentIndex < steps.length - 1) {
            setCurrentStep(steps[currentIndex + 1]);
        }
    };

    const handleBack = () => {
        const steps: Step[] = ['goal', 'name', 'greeting', 'therapyStyle', 'visibility', 'characteristics', 'imageDescription', 'imageGeneration', 'review'];
        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex > 0) {
            setCurrentStep(steps[currentIndex - 1]);
        } else {
            // When backing out from the first step, go to home tab
            router.navigate('/(tabs)');
        }
    };

    const handleGenerateImage = async () => {
        if (!characterData.imageDescription.trim()) {
            Alert.alert('Missing Description', 'Please describe how your character looks first.');
            return;
        }

        setIsGeneratingImage(true);
        setGeneratedImageUrl(''); // Clear previous image
        try {
            // Get authenticated user ID
            const { data: { user } } = await supabase.auth.getUser();
            const userId = user?.id;

            const result = await generateCharacterImage({
                description: characterData.imageDescription,
                characterName: characterData.name,
                greeting: characterData.greeting,
                therapyStyles: characterData.therapyStyles,
                goal: characterData.goal,
                characteristics: characterData.characteristics,
                isPublic: characterData.isPublic,
                userId: userId,
            });

            if (result.success && result.imageUrl) {
                // Preload image before showing
                await Image.prefetch(result.imageUrl);
                setGeneratedImageUrl(result.imageUrl);
            } else {
                Alert.alert(
                    'Unable to Create Character',
                    result.error || 'Could not generate image. Please try again.'
                );
            }
        } catch (error) {
            console.error('Error generating image:', error);
            Alert.alert('Error', 'Failed to generate image. Please check your connection and try again.');
        } finally {
            setIsGeneratingImage(false);
        }
    };

    const handleCreate = async () => {
        if (isCreating) return;

        setIsCreating(true);
        try {
            // Use Supabase character ID if available, otherwise generate local ID
            const characterId = supabaseCharacterId || editingId || `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            // Create character object
            const newCharacter: UserCharacter = {
                id: characterId,
                name: characterData.name,
                image: generatedImageUrl || '/characters/athena.jpg', // Placeholder until AI generates image
                imageDescription: characterData.imageDescription,
                description: characterData.characteristics,
                goal: characterData.goal,
                therapyStyles: characterData.therapyStyles,
                type: 'human', // Default type
                createdAt: editingId ? (JSON.parse(params.characterData as string).createdAt) : new Date().toISOString(),
                isPublic: characterData.isPublic,
                greeting: characterData.greeting,
            };

            // Save to storage (includes Supabase sync)
            await saveCharacter(newCharacter);

            // Navigate directly to chat with the new character
            router.push(`/conversation/${characterId}`);
        } catch (error) {
            console.error('Error creating character:', error);
            Alert.alert('Error', 'Failed to create character. Please try again.');
        } finally {
            setIsCreating(false);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 'goal':
                return (
                    <View style={styles.stepContainer}>
                        <ThemedText type="title" style={styles.stepTitle}>
                            What's your goal?
                        </ThemedText>
                        <ThemedText style={styles.stepDescription}>
                            Tell us what you'd like to work on or achieve with your ai<ThemedText style={{ color: '#5B8FD9' }}>.</ThemedText>therapist
                        </ThemedText>
                        <TextInput
                            style={[styles.textArea, { backgroundColor: theme.card, color: theme.text }]}
                            placeholder="e.g., I want to manage my anxiety better, improve my relationships, build confidence..."
                            placeholderTextColor={theme.icon}
                            value={characterData.goal}
                            onChangeText={(text) => setCharacterData({ ...characterData, goal: text })}
                            multiline
                            numberOfLines={4}
                        />
                        <ThemedText style={styles.disclaimerText}>
                            Disclaimer: ai<ThemedText style={{ color: '#5B8FD9' }}>.</ThemedText>therapy is a creative mental-wellness platform and not a therapeutic service. All ai<ThemedText style={{ color: '#5B8FD9' }}>.</ThemedText>therapists are fictional AI characters. Their role titles ("Therapist," "Psychologist," "Dr.," "Coach," etc.) are used solely for imaginative portrayal and have no professional, clinical, or medical meaning. The therapeutic approaches and modalities mentioned on the platform (e.g., CBT, ACT, DBT, Psychodynamic, Schema, Gestalt, MBCT, etc.) are used exclusively for inspired, model-like purposes and do not constitute real therapeutic application. Neither the ai<ThemedText style={{ color: '#5B8FD9' }}>.</ThemedText>therapy platform nor its AI characters hold qualifications or licenses to practice medicine or psychotherapy. No promise of healing is made. Everything they say is intended for inspiration, reflection, and everyday support—not for diagnosis, treatment, or therapy.
                        </ThemedText>
                    </View>
                );

            case 'name':
                return (
                    <View style={styles.stepContainer}>
                        <ThemedText type="title" style={styles.stepTitle}>
                            Name your ai<ThemedText style={{ color: '#5B8FD9' }}>.</ThemedText>therapist
                        </ThemedText>
                        <ThemedText style={styles.stepDescription}>
                            What should we call your ai<ThemedText style={{ color: '#5B8FD9' }}>.</ThemedText>therapist?
                        </ThemedText>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
                            placeholder="ai.therapist"
                            placeholderTextColor={theme.icon}
                            value={characterData.name}
                            onChangeText={(text) => setCharacterData({ ...characterData, name: text })}
                        />
                    </View>
                );

            case 'characteristics':
                return (
                    <View style={styles.stepContainer}>
                        <ThemedText type="title" style={styles.stepTitle}>
                            Who is {characterData.name || 'your ai.therapist'}?
                        </ThemedText>
                        <ThemedText style={styles.stepDescription}>
                            Describe their personality, expertise, and characteristics
                        </ThemedText>
                        <TextInput
                            style={[styles.textArea, { backgroundColor: theme.card, color: theme.text }]}
                            placeholder="e.g., A wise and patient therapist specializing in anxiety and stress management..."
                            placeholderTextColor={theme.icon}
                            value={characterData.characteristics}
                            onChangeText={(text) => setCharacterData({ ...characterData, characteristics: text })}
                            multiline
                            numberOfLines={6}
                        />
                    </View>
                );

            case 'therapyStyle':
                const toggleTherapyStyle = (styleName: string) => {
                    const integrativeName = 'Integrative Therapy (AI decides)';

                    if (characterData.therapyStyles.includes(styleName)) {
                        // Deselecting a style
                        const newStyles = characterData.therapyStyles.filter(s => s !== styleName);
                        // If no styles left, revert to Integrative
                        setCharacterData({
                            ...characterData,
                            therapyStyles: newStyles.length === 0 ? [integrativeName] : newStyles
                        });
                    } else {
                        // Selecting a new style
                        if (styleName === integrativeName) {
                            // If selecting Integrative, clear all others
                            setCharacterData({ ...characterData, therapyStyles: [integrativeName] });
                        } else {
                            // If selecting any other style, remove Integrative and add the new one
                            const newStyles = characterData.therapyStyles
                                .filter(s => s !== integrativeName)
                                .concat(styleName);
                            setCharacterData({ ...characterData, therapyStyles: newStyles });
                        }
                    }
                };

                const isAutomatic = characterData.therapyStyles.length === 0;

                return (
                    <View style={styles.stepContainer}>
                        <ThemedText type="title" style={styles.stepTitle}>
                            What's {characterData.name || 'your ai.therapist'}'s style?
                        </ThemedText>

                        <View style={styles.therapyStylesContainer}>
                            {ALL_THERAPY_OPTIONS.map((category) => (
                                <View key={category.category} style={styles.categorySection}>
                                    <ThemedText type="defaultSemiBold" style={styles.categoryTitle}>
                                        {category.category}
                                    </ThemedText>
                                    {category.styles.map((style) => {
                                        const isSelected = characterData.therapyStyles.includes(style.name);
                                        return (
                                            <TouchableOpacity
                                                key={style.name}
                                                style={[
                                                    styles.therapyStyleButton,
                                                    {
                                                        backgroundColor: isSelected ? theme.primary : theme.card,
                                                        borderColor: isSelected ? theme.primary : theme.icon
                                                    }
                                                ]}
                                                onPress={() => toggleTherapyStyle(style.name)}
                                            >
                                                <View style={styles.therapyStyleContent}>
                                                    <ThemedText style={[
                                                        styles.therapyStyleName,
                                                        { color: isSelected ? '#fff' : theme.text, marginBottom: 4 }
                                                    ]}>
                                                        {style.name}
                                                    </ThemedText>

                                                    <ThemedText style={[
                                                        styles.therapyStyleDescription,
                                                        { color: isSelected ? 'rgba(255,255,255,0.9)' : theme.icon, marginBottom: 6 }
                                                    ]}>
                                                        {style.description}
                                                    </ThemedText>

                                                    <TouchableOpacity
                                                        style={[styles.learnMoreButton, { backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : theme.tint + '15' }]}
                                                        onPress={(e) => {
                                                            e.stopPropagation();
                                                            router.push({ pathname: '/therapy-detail-modal', params: { name: style.name } });
                                                        }}
                                                    >
                                                        <IconSymbol name="info.circle" size={14} color={isSelected ? '#fff' : theme.tint} />
                                                        <ThemedText style={[styles.learnMoreText, { color: isSelected ? '#fff' : theme.tint }]}>Learn more</ThemedText>
                                                    </TouchableOpacity>
                                                </View>
                                                {isSelected && (
                                                    <View style={styles.checkmarkContainer}>
                                                        <IconSymbol name="checkmark.circle.fill" size={24} color="#fff" />
                                                    </View>
                                                )}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            ))}
                        </View>
                    </View>
                );

            case 'imageDescription':
                return (
                    <View style={styles.stepContainer}>
                        <ThemedText type="title" style={styles.stepTitle}>
                            Describe {characterData.name || 'your ai.therapist'}'s appearance
                        </ThemedText>
                        <ThemedText style={styles.stepDescription}>
                            💡 The more detailed your description, the better the AI-generated image will be!
                        </ThemedText>
                        <TextInput
                            style={[styles.textArea, { backgroundColor: theme.card, color: theme.text }]}
                            placeholder="e.g., A warm, middle-aged woman with kind eyes, wearing professional attire..."
                            placeholderTextColor={theme.icon}
                            value={characterData.imageDescription}
                            onChangeText={(text) => setCharacterData({ ...characterData, imageDescription: text })}
                            multiline
                            numberOfLines={4}
                        />
                    </View>
                );

            case 'imageGeneration':
                return (
                    <View style={styles.stepContainer}>
                        {/* Title and description */}
                        <ThemedText type="title" style={styles.stepTitle}>
                            {generatedImageUrl
                                ? `Meet ${characterData.name || 'your ai.therapist'}!`
                                : 'Image generation failed'}
                        </ThemedText>
                        <ThemedText style={styles.stepDescription}>
                            {generatedImageUrl
                                ? 'Looking good! Continue to the next step, or regenerate if you\'d like a different look.'
                                : 'Something went wrong. Please try again.'}
                        </ThemedText>

                        {/* Large character image showcase */}
                        <View style={styles.characterShowcase}>
                            <View style={[styles.characterShowcaseImage, { backgroundColor: theme.card, borderColor: theme.primary }]}>
                                {generatedImageUrl ? (
                                    <Image
                                        source={{ uri: generatedImageUrl }}
                                        style={styles.imagePreview}
                                        contentFit="cover"
                                    />
                                ) : (
                                    <View style={styles.emptyImageState}>
                                        <IconSymbol name="sparkles" size={64} color={theme.primary} />
                                        <ThemedText style={[styles.emptyImageText, { color: theme.icon }]}>No image yet</ThemedText>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Regenerate button below image */}
                        <TouchableOpacity
                            style={[styles.regenerateButtonSmall, { borderColor: theme.primary }]}
                            onPress={handleGenerateImage}
                        >
                            <ThemedText style={[styles.regenerateButtonTextSmall, { color: theme.primary }]}>🔄 Regenerate</ThemedText>
                        </TouchableOpacity>
                    </View>
                );

            case 'greeting':
                return (
                    <View style={styles.stepContainer}>
                        <ThemedText type="title" style={styles.stepTitle}>
                            How does {characterData.name} greet you?
                        </ThemedText>
                        <ThemedText style={styles.stepDescription}>
                            Write the first message your character will send
                        </ThemedText>
                        <TextInput
                            style={[styles.textArea, { backgroundColor: theme.card, color: theme.text }]}
                            placeholder={`e.g., Hello! I'm ${characterData.name || 'your character'}. I'm here to help you...`}
                            placeholderTextColor={theme.icon}
                            value={characterData.greeting}
                            onChangeText={(text) => setCharacterData({ ...characterData, greeting: text })}
                            multiline
                            numberOfLines={6}
                        />
                    </View>
                );

            case 'visibility':
                return (
                    <View style={styles.stepContainer}>
                        <ThemedText type="title" style={styles.stepTitle}>
                            Who can chat with {characterData.name}?
                        </ThemedText>
                        <ThemedText style={styles.stepDescription}>
                            Choose the visibility of your character
                        </ThemedText>
                        <TouchableOpacity
                            style={[
                                styles.visibilityOption,
                                { backgroundColor: theme.card, borderColor: characterData.isPublic ? theme.primary : 'transparent' },
                            ]}
                            onPress={() => setCharacterData({ ...characterData, isPublic: true })}>
                            <View style={styles.visibilityContent}>
                                <IconSymbol name="house.fill" size={32} color={theme.text} />
                                <View style={styles.visibilityText}>
                                    <ThemedText type="defaultSemiBold">Public</ThemedText>
                                    <ThemedText style={styles.visibilityDescription}>
                                        Anyone can find and chat with this character
                                    </ThemedText>
                                </View>
                            </View>
                            {characterData.isPublic && (
                                <IconSymbol name="chevron.right" size={24} color={theme.primary} />
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.visibilityOption,
                                { backgroundColor: theme.card, borderColor: !characterData.isPublic ? theme.primary : 'transparent' },
                            ]}
                            onPress={() => setCharacterData({ ...characterData, isPublic: false })}>
                            <View style={styles.visibilityContent}>
                                <IconSymbol name="person" size={32} color={theme.text} />
                                <View style={styles.visibilityText}>
                                    <ThemedText type="defaultSemiBold">Private</ThemedText>
                                    <ThemedText style={styles.visibilityDescription}>
                                        Only you can chat with this character
                                    </ThemedText>
                                </View>
                            </View>
                            {!characterData.isPublic && (
                                <IconSymbol name="chevron.right" size={24} color={theme.primary} />
                            )}
                        </TouchableOpacity>
                    </View>
                );

            case 'review':
                return (
                    <View style={styles.stepContainer}>
                        <ThemedText type="title" style={styles.stepTitle}>
                            Review your ai<ThemedText style={{ color: '#5B8FD9' }}>.</ThemedText>therapist
                        </ThemedText>
                        <ThemedText style={styles.stepDescription}>
                            Make sure everything looks good before creating
                        </ThemedText>

                        <View style={styles.reviewImageContainer}>
                            <Image
                                source={{ uri: generatedImageUrl || '/characters/athena.jpg' }}
                                style={[styles.reviewImage, { borderColor: theme.primary }]}
                                contentFit="cover"
                            />
                        </View>

                        <View style={[styles.reviewCard, { backgroundColor: theme.card }]}>
                            <View style={styles.reviewRow}>
                                <ThemedText style={styles.reviewLabel}>Name:</ThemedText>
                                <ThemedText type="defaultSemiBold">{characterData.name}</ThemedText>
                            </View>
                            <View style={styles.reviewRow}>
                                <ThemedText style={styles.reviewLabel}>Goal:</ThemedText>
                                <ThemedText style={styles.reviewValue}>{characterData.goal}</ThemedText>
                            </View>
                            <View style={styles.reviewRow}>
                                <ThemedText style={styles.reviewLabel}>Characteristics:</ThemedText>
                                <ThemedText style={styles.reviewValue}>{characterData.characteristics}</ThemedText>
                            </View>
                            <View style={styles.reviewRow}>
                                <ThemedText style={styles.reviewLabel}>Greeting:</ThemedText>
                                <ThemedText style={styles.reviewValue}>{characterData.greeting}</ThemedText>
                            </View>
                            <View style={styles.reviewRow}>
                                <ThemedText style={styles.reviewLabel}>Therapy Styles:</ThemedText>
                                <ThemedText style={styles.reviewValue}>
                                    {characterData.therapyStyles.length > 0
                                        ? characterData.therapyStyles.map(s => STYLE_ABBREVIATIONS[s] || s).join(', ')
                                        : 'Integrative'}
                                </ThemedText>
                            </View>
                            <View style={styles.reviewRow}>
                                <ThemedText style={styles.reviewLabel}>Visibility:</ThemedText>
                                <ThemedText type="defaultSemiBold">
                                    {characterData.isPublic ? 'Public' : 'Private'}
                                </ThemedText>
                            </View>
                        </View>
                    </View>
                );

            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            {/* Fullscreen crafting overlay */}
            {isGeneratingImage && (
                <FullscreenCraftingOverlay theme={theme} characterName={characterData.name} />
            )}

            <View style={[styles.header, { borderBottomColor: theme.icon }]}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <IconSymbol name="chevron.right" size={24} color={theme.text} style={{ transform: [{ rotate: '180deg' }] }} />
                </TouchableOpacity>
                <ThemedText type="defaultSemiBold" style={styles.headerTitle}>
                    {editingId ? 'Edit ai.therapist' : 'Create ai.therapist'}
                </ThemedText>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}>
                    {renderStepContent()}
                </ScrollView>

                <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.icon }]}>
                    {/* Show selected therapy styles when on therapy style step */}
                    {currentStep === 'therapyStyle' && characterData.therapyStyles.length > 0 && (
                        <View style={styles.selectedStylesPreviewSimple}>
                            <ThemedText style={[styles.selectedStylesPreviewTextSimple, { color: theme.text }]}>
                                Selected: <ThemedText type="defaultSemiBold">{characterData.therapyStyles.map(s => STYLE_ABBREVIATIONS[s] || s).join(', ')}</ThemedText>
                            </ThemedText>
                        </View>
                    )}

                    {currentStep === 'review' ? (
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: theme.primary }]}
                            onPress={handleCreate}>
                            <ThemedText style={styles.buttonText}>{editingId ? 'Save Changes' : 'Create!'}</ThemedText>
                        </TouchableOpacity>
                    ) : currentStep === 'imageGeneration' && isGeneratingImage ? (
                        <View style={[styles.button, { backgroundColor: theme.card }]}>
                            <ThemedText style={[styles.buttonText, { color: theme.icon }]}>Please wait...</ThemedText>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: theme.primary }]}
                            onPress={handleNext}>
                            <ThemedText style={styles.buttonText}>Continue</ThemedText>
                        </TouchableOpacity>
                    )}
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    flex: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
    },
    scrollContent: {
        padding: 24,
    },
    stepContainer: {
        gap: 16,
    },
    stepTitle: {
        fontSize: 28,
        marginBottom: 8,
    },
    stepDescription: {
        fontSize: 16,
        opacity: 0.7,
        marginBottom: 8,
    },
    input: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 12,
        fontSize: 16,
    },
    textArea: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 12,
        fontSize: 16,
        minHeight: 150,
        textAlignVertical: 'top',
    },
    imagePicker: {
        height: 200,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    imagePickerText: {
        fontSize: 16,
        opacity: 0.7,
    },
    helperText: {
        fontSize: 14,
        opacity: 0.7,
        marginTop: 16,
    },
    visibilityOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 2,
    },
    visibilityContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        flex: 1,
    },
    visibilityText: {
        flex: 1,
        gap: 4,
    },
    visibilityDescription: {
        fontSize: 14,
        opacity: 0.7,
    },
    reviewCard: {
        padding: 20,
        borderRadius: 12,
        gap: 16,
    },
    reviewRow: {
        gap: 8,
    },
    reviewLabel: {
        fontSize: 14,
        opacity: 0.7,
    },
    reviewValue: {
        fontSize: 15,
        lineHeight: 22,
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
    },
    button: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    reviewImageContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    reviewImage: {
        width: 180,
        height: 180,
        borderRadius: 90,
        borderWidth: 4,
    },
    imageDescriptionText: {
        fontSize: 13,
        opacity: 0.7,
        marginTop: 12,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    therapyStylesContainer: {
        marginTop: 16,
    },
    therapyStyleButton: {
        position: 'relative',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: 10,
        paddingHorizontal: 14,
        paddingBottom: 32,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 2,
    },
    therapyStyleText: {
        fontSize: 15,
        flex: 1,
    },
    automaticButton: {
        marginTop: 12,
        borderWidth: 3,
    },
    categorySection: {
        marginBottom: 16,
    },
    categoryTitle: {
        fontSize: 16,
        marginBottom: 8,
        opacity: 0.8,
    },
    therapyStyleContent: {
        flex: 1,
        gap: 4,
        marginRight: 12,
    },
    therapyStyleName: {
        fontSize: 15,
        fontWeight: '600',
    },
    therapyStyleDescription: {
        fontSize: 13,
        lineHeight: 18,
    },
    learnMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    learnMoreText: {
        fontSize: 12,
        fontWeight: '600',
    },
    imagePreviewSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    centeredText: {
        textAlign: 'center',
    },
    characterShowcase: {
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 16,
    },
    characterShowcaseImage: {
        width: 220,
        height: 220,
        borderRadius: 110,
        borderWidth: 4,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    imagePreviewContainer: {
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 3,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
    },
    imagePreview: {
        width: '100%',
        height: '100%',
    },
    uploadButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#000',
    },
    generateButton: {
        marginTop: 16,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    generateButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    imagePreviewHint: {
        fontSize: 13,
        opacity: 0.7,
        marginTop: 12,
        textAlign: 'center',
    },
    selectedStylesContainer: {
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        marginBottom: 12,
    },
    selectedStylesText: {
        fontSize: 14,
        fontWeight: '600',
    },
    // Fixed selected styles preview above Continue button
    selectedStylesPreviewSimple: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        alignItems: 'center',
        marginBottom: 4,
    },
    selectedStylesPreviewTextSimple: {
        fontSize: 14,
        textAlign: 'center',
    },
    checkmarkContainer: {
        position: 'absolute',
        bottom: 12,
        right: 12,
    },
    disclaimerText: {
        fontSize: 11,
        opacity: 0.6,
        marginTop: 16,
        lineHeight: 16,
        textAlign: 'left',
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        opacity: 0.7,
    },
    emptyImageState: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    emptyImageText: {
        fontSize: 12,
        textAlign: 'center',
        paddingHorizontal: 8,
    },
    generateButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    regenerateButton: {
        marginTop: 16,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        backgroundColor: 'transparent',
    },
    regenerateButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    regenerateButtonSmall: {
        marginTop: 16,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        borderWidth: 1,
        backgroundColor: 'transparent',
        alignSelf: 'center',
    },
    regenerateButtonTextSmall: {
        fontSize: 14,
        fontWeight: '500',
    },
});
