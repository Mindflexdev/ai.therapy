import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
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

type Step = 'goal' | 'name' | 'characteristics' | 'therapyStyle' | 'image' | 'greeting' | 'visibility' | 'review';

import { ALL_THERAPY_OPTIONS, STYLE_ABBREVIATIONS } from '@/constants/therapy';


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

    const handleNext = () => {
        const steps: Step[] = ['goal', 'name', 'characteristics', 'therapyStyle', 'image', 'greeting', 'visibility', 'review'];
        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex < steps.length - 1) {
            setCurrentStep(steps[currentIndex + 1]);
        }
    };

    const handleBack = () => {
        const steps: Step[] = ['goal', 'name', 'characteristics', 'therapyStyle', 'image', 'greeting', 'visibility', 'review'];
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
        try {
            const result = await generateCharacterImage({
                description: characterData.imageDescription,
                characterName: characterData.name,
            });

            if (result.success && result.imageUrl) {
                setGeneratedImageUrl(result.imageUrl);
                Alert.alert('Success!', 'Your character image has been generated!');
            } else {
                Alert.alert('Generation Failed', result.error || 'Could not generate image. Please try again.');
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
            // Generate unique ID or use existing
            const characterId = editingId || `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

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

            // Save to storage
            await saveCharacter(newCharacter);

            // Show success message
            if (Platform.OS === 'web') {
                window.alert(`${characterData.name} has been ${editingId ? 'updated' : 'created'}${characterData.isPublic ? ' and is now public' : ''}!`);
                router.navigate('/(tabs)');
            } else {
                Alert.alert(
                    'Success!',
                    `${characterData.name} has been ${editingId ? 'updated' : 'created'}${characterData.isPublic ? ' and is now public' : ''}!`,
                    [
                        {
                            text: 'OK',
                            onPress: () => router.navigate('/(tabs)'),
                        },
                    ]
                );
            }
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
                            Tell us what you'd like to work on or achieve with your AI therapist
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
                    </View>
                );

            case 'name':
                return (
                    <View style={styles.stepContainer}>
                        <ThemedText type="title" style={styles.stepTitle}>
                            Name your character
                        </ThemedText>
                        <ThemedText style={styles.stepDescription}>
                            What should we call your character?
                        </ThemedText>
                        <TextInput
                            style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
                            placeholder="Character name..."
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
                            Who is {characterData.name || 'your character'}?
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
                            Conversation inspired by...
                        </ThemedText>
                        <ThemedText style={styles.stepDescription}>
                            Select one or multiple therapy styles for {characterData.name}
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
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                                                        <ThemedText style={[
                                                            styles.therapyStyleName,
                                                            { color: isSelected ? '#fff' : theme.text, flex: 1, marginRight: 8 }
                                                        ]}>
                                                            {style.name}
                                                        </ThemedText>
                                                    </View>

                                                    <TouchableOpacity
                                                        style={[styles.learnMoreButton, { backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : theme.tint + '15', marginBottom: 6 }]}
                                                        onPress={(e) => {
                                                            e.stopPropagation();
                                                            router.push({ pathname: '/therapy-detail-modal', params: { name: style.name } });
                                                        }}
                                                    >
                                                        <IconSymbol name="info.circle" size={14} color={isSelected ? '#fff' : theme.tint} />
                                                        <ThemedText style={[styles.learnMoreText, { color: isSelected ? '#fff' : theme.tint }]}>Learn more</ThemedText>
                                                    </TouchableOpacity>

                                                    <ThemedText style={[
                                                        styles.therapyStyleDescription,
                                                        { color: isSelected ? 'rgba(255,255,255,0.9)' : theme.icon }
                                                    ]}>
                                                        {style.description}
                                                    </ThemedText>
                                                </View>
                                                {isSelected && (
                                                    <IconSymbol name="checkmark.circle.fill" size={24} color="#fff" />
                                                )}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            ))}
                        </View>
                    </View>
                );

            case 'image':
                return (
                    <View style={styles.stepContainer}>
                        {/* Image Preview */}
                        <View style={styles.imagePreviewSection}>
                            <View style={[styles.imagePreviewContainer, { backgroundColor: theme.card, borderColor: theme.icon }]}>
                                {generatedImageUrl ? (
                                    <Image
                                        source={{ uri: generatedImageUrl }}
                                        style={styles.imagePreview}
                                        contentFit="cover"
                                    />
                                ) : characterData.imageDescription ? (
                                    <Image
                                        source={{ uri: '/characters/athena.jpg' }}
                                        style={styles.imagePreview}
                                        contentFit="cover"
                                    />
                                ) : (
                                    <IconSymbol name="person" size={64} color={theme.icon} />
                                )}
                                <TouchableOpacity style={[styles.uploadButton, { backgroundColor: theme.primary }]}>
                                    <IconSymbol name="plus" size={20} color="#fff" />
                                </TouchableOpacity>
                            </View>
                            <ThemedText style={styles.imagePreviewHint}>
                                Upload your own image or describe below for AI generation
                            </ThemedText>
                        </View>

                        <ThemedText type="title" style={styles.stepTitle}>
                            Describe {characterData.name}'s appearance
                        </ThemedText>
                        <ThemedText style={styles.stepDescription}>
                            Describe how your character looks. AI will generate the image for you.
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
                        {/* Generate Image Button */}
                        <TouchableOpacity
                            style={[styles.generateButton, { backgroundColor: theme.primary }]}
                            onPress={handleGenerateImage}
                            disabled={isGeneratingImage || !characterData.imageDescription.trim()}
                        >
                            {isGeneratingImage ? (
                                <ThemedText style={styles.generateButtonText}>Generating...</ThemedText>
                            ) : (
                                <ThemedText style={styles.generateButtonText}>✨ Generate Image</ThemedText>
                            )}
                        </TouchableOpacity>

                        <ThemedText style={styles.helperText}>
                            💡 The more detailed your description, the better the AI-generated image will be!
                        </ThemedText>
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
                            Review your character
                        </ThemedText>
                        <ThemedText style={styles.stepDescription}>
                            Make sure everything looks good before creating
                        </ThemedText>

                        <View style={styles.reviewImageContainer}>
                            <Image
                                source={{ uri: generatedImageUrl || '/characters/athena.jpg' }}
                                style={[styles.reviewImage, { borderColor: theme.card }]}
                                contentFit="cover"
                            />
                            {characterData.imageDescription && (
                                <ThemedText style={styles.imageDescriptionText}>
                                    ≡ƒô¥ {characterData.imageDescription}
                                </ThemedText>
                            )}
                        </View>

                        <View style={[styles.reviewCard, { backgroundColor: theme.card }]}>
                            <View style={styles.reviewRow}>
                                <ThemedText style={styles.reviewLabel}>Name:</ThemedText>
                                <ThemedText type="defaultSemiBold">{characterData.name}</ThemedText>
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
            <View style={[styles.header, { borderBottomColor: theme.icon }]}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <IconSymbol name="chevron.right" size={24} color={theme.text} style={{ transform: [{ rotate: '180deg' }] }} />
                </TouchableOpacity>
                <ThemedText type="defaultSemiBold" style={styles.headerTitle}>
                    {editingId ? 'Edit Character' : 'Create Character'}
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
                            <ThemedText style={styles.buttonText}>{editingId ? 'Save Changes' : 'Create Character!'}</ThemedText>
                        </TouchableOpacity>
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
        width: 120,
        height: 120,
        borderRadius: 60,
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 12,
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
        marginBottom: 24,
    },
    categoryTitle: {
        fontSize: 16,
        marginBottom: 12,
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
});
