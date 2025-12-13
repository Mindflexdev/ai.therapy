import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Easing,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MessageBubble } from '@/components/message-bubble';
import { ThemedText } from '@/components/themed-text';
import { TherapyDetailPopup } from '@/components/therapy-detail-popup';
import { TherapyStyleModal } from '@/components/therapy-style-modal';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { TOPICS } from '@/constants/data';
import { Colors } from '@/constants/theme';
import { ALL_THERAPY_OPTIONS, STYLE_ABBREVIATIONS, ABBREVIATION_TO_FULL } from '@/constants/therapy';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { createCacheKey, queryCache } from '@/lib/query-cache';
import { generateSessionId } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { deleteCharacter } from '@/constants/storage';

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
}

interface Character {
    id: string;
    name: string;
    image: string;
    description: string;
    greeting?: string;
    therapyStyles?: string[];
}

const WEBHOOK_URL = 'https://mindflex.app.n8n.cloud/webhook/b4d0ede8-b771-4c33-aceb-83dcb44b0bf5';
const AUDIO_WEBHOOK_URL = 'https://mindflex.app.n8n.cloud/webhook/63d418a6-cafe-43e7-b1c6-84405a761a32';

export default function ConversationScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const flatListRef = useRef<FlatList>(null);

    const [character, setCharacter] = useState<Character | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTherapyStyles, setActiveTherapyStyles] = useState<string[]>(['Integrative Therapy (AI decides)']);
    const [isStyleModalVisible, setIsStyleModalVisible] = useState(false);

    // State for the Detail Popup (Learn More)
    const [detailStyleName, setDetailStyleName] = useState<string | null>(null);

    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);

    const [userData, setUserData] = useState<any>(null);
    const [session, setSession] = useState<any>(null);

    // Audio State
    // Audio Hooks Stubbed (Crash Fix)
    // const audioRecorder = useAudioRecorder(RecordingPresets.LowQuality);
    const audioRecorder = {
        isRecording: false,
        recordAsync: async () => { alert("Audio recording coming soon to Web!"); },
        stopAsync: async () => { },
        uri: null
    };
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    // Use audioState.amplitude (if available) or fallback
    const soundLevel = 0; // audioState?.amplitude ?? 0;
    const pulseAnim = useRef(new Animated.Value(1)).current;



    // Animation Loop
    useEffect(() => {
        if (isRecording) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.2 + (soundLevel * 0.1), // minimal pulse + sound level
                        duration: 500,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 500,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
        }
    }, [isRecording, soundLevel]);

    // Fetch user data and session
    useEffect(() => {
        const fetchUserAndSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);

            if (session?.user) {
                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (data) {
                    setUserData(data);
                } else if (error) {
                    console.log('Error fetching user data:', error);
                }
            }
        };
        fetchUserAndSession();
    }, []);

    // Ensure a therapy style is always selected
    useEffect(() => {
        if (activeTherapyStyles.length === 0) {
            setActiveTherapyStyles(['Integrative Therapy (AI decides)']);
        }
    }, [activeTherapyStyles]);

    // Fetch character with caching
    useEffect(() => {
        const fetchCharacter = async () => {
            try {
                const cacheKey = createCacheKey('characters', { id });
                const data = await queryCache.get(cacheKey, async () => {
                    const { data, error } = await supabase
                        .from('characters')
                        .select('*')
                        .eq('id', id)
                        .single();

                    if (error) throw error;

                    // Map snake_case to camelCase
                    return {
                        ...data,
                        isPublic: data.is_public,
                        therapyStyles: data.therapy_styles,
                        imageDescription: data.image_description,
                    };
                });

                setCharacter(data);
            } catch (error) {
                console.error('Error fetching character:', error);
                // Fallback to TOPICS if Supabase fails
                const fallbackChar = TOPICS.flatMap((topic) => topic.characters).find((c) => c.id === id);
                if (fallbackChar) {
                    setCharacter(fallbackChar as Character);
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchCharacter();
    }, [id]);

    const handleDeleteAndGoHome = async () => {
        try {
            await deleteCharacter(id);
            router.replace('/(tabs)');
        } catch (error) {
            console.error('Error deleting character:', error);
            // Even if error, go home
            router.replace('/(tabs)');
        }
    };

    // ... (rest of the file)

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
                <View style={[styles.header, { borderBottomColor: theme.icon }]}>
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <IconSymbol name="chevron.right" size={24} color={theme.text} style={{ transform: [{ rotate: '180deg' }] }} />
                    </TouchableOpacity>
                </View>
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <ThemedText style={styles.loadingText}>Loading character...</ThemedText>
                </View>
            </SafeAreaView>
        );
    }

    if (!character) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
                <View style={[styles.header, { borderBottomColor: theme.icon }]}>
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <IconSymbol name="chevron.right" size={24} color={theme.text} style={{ transform: [{ rotate: '180deg' }] }} />
                    </TouchableOpacity>
                </View>
                <View style={styles.errorContent}>
                    <ThemedText type="title" style={styles.errorTitle}>ai.therapist not found</ThemedText>
                    <ThemedText style={styles.errorText}>
                        This ai.therapist doesn't exist or couldn't be loaded.
                    </ThemedText>
                    {/* Delete Button */}
                    <TouchableOpacity
                        style={[styles.errorButton, { backgroundColor: '#FF3B30' }]}
                        onPress={handleDeleteAndGoHome}
                    >
                        <ThemedText style={styles.errorButtonText}>Delete</ThemedText>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <View style={[styles.header, { borderBottomColor: theme.icon }]}>
                <TouchableOpacity onPress={handleBack} style={[styles.backButton, { flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 8 }]}>
                    <IconSymbol name="chevron.right" size={24} color={theme.text} style={{ transform: [{ rotate: '180deg' }] }} />
                    {character && (
                        <ThemedText type="defaultSemiBold" numberOfLines={1} style={{ fontSize: 16, flex: 1 }}>{character.name}</ThemedText>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.styleSelector, { backgroundColor: theme.card, marginLeft: 8 }]}
                    onPress={handleStyleModalOpen}
                >
                    <IconSymbol name="sparkles" size={14} color={theme.primary} />
                    <ThemedText style={styles.styleSelectorText} numberOfLines={1}>
                        {activeTherapyStyles.map(s => STYLE_ABBREVIATIONS[s] || s).join(', ')}
                    </ThemedText>
                    <IconSymbol name="chevron.down" size={12} color={theme.icon} />
                </TouchableOpacity>
            </View>

            {/* Therapy Style Modal (Main Selection) */}
            <TherapyStyleModal
                visible={isStyleModalVisible}
                activeStyles={activeTherapyStyles}
                onClose={handleStyleModalClose}
                onSelectStyles={setActiveTherapyStyles}
                onLearnMore={handleLearnMore}
                theme={theme}
            />

            {/* Therapy Detail Popup (Learn More) - Renders on top */}
            <TherapyDetailPopup
                visible={!!detailStyleName}
                therapyName={detailStyleName}
                onClose={handleDetailPopupClose}
                theme={theme}
            />

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={100}
            >
                {/* Disclaimer Moved to ListHeaderComponent */}

                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={keyExtractor}
                    contentContainerStyle={styles.messagesList}
                    showsVerticalScrollIndicator={false}
                    ListFooterComponent={typingIndicator}
                    ListHeaderComponent={disclaimerHeader}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={10}
                    updateCellsBatchingPeriod={50}
                    initialNumToRender={15}
                    windowSize={10}
                />

                <View style={[styles.inputContainer, { backgroundColor: theme.background, borderTopColor: theme.icon }]}>
                    {isRecording ? (
                        <TouchableOpacity onPress={cancelRecording} style={styles.inputButton}>
                            <IconSymbol name="xmark.circle.fill" size={24} color={Colors.light.icon} />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={styles.inputButton}>
                            <IconSymbol name="plus" size={24} color={theme.text} />
                        </TouchableOpacity>
                    )}

                    {isRecording ? (
                        <View style={[
                            styles.input,
                            {
                                backgroundColor: theme.card,
                                height: 50,
                                justifyContent: 'center',
                                alignItems: 'center',
                                overflow: 'hidden'
                            },
                        ]}>
                            <ThemedText style={{ color: theme.primary, opacity: 0.8 }}>Recording...</ThemedText>
                            {/* Pulse Animation Background */}
                            <Animated.View
                                style={{
                                    position: 'absolute',
                                    right: 20,
                                    width: 10,
                                    height: 10,
                                    borderRadius: 5,
                                    backgroundColor: theme.primary,
                                    opacity: 0.5,
                                    transform: [{ scale: pulseAnim }]
                                }}
                            />
                        </View>
                    ) : (
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: theme.card,
                                    color: theme.text,
                                    paddingVertical: 10,
                                },
                            ]}
                            placeholder={isTranscribing ? "Transcribing..." : "Message..."}
                            placeholderTextColor={theme.icon}
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                            editable={!isTranscribing}
                            onKeyPress={handleKeyPress}
                        />
                    )}

                    {/* Right Button: Send or Mic */}
                    {inputText.trim() !== '' ? (
                        <TouchableOpacity onPress={sendMessage} style={styles.sendButton} disabled={isTranscribing}>
                            {isTranscribing ? (
                                <ActivityIndicator size="small" color={theme.primary} />
                            ) : (
                                <IconSymbol name="paperplane.fill" size={24} color={theme.primary} />
                            )}
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            onPress={isRecording ? stopRecording : startRecording}
                            style={styles.sendButton}
                            disabled={isTranscribing}
                        >
                            {isTranscribing ? (
                                <ActivityIndicator size="small" color={theme.primary} />
                            ) : isRecording ? (
                                // Up arrow icon or similar to indicate "Send Audio"
                                <IconSymbol name="arrow.up.circle.fill" size={28} color={theme.primary} />
                            ) : (
                                <IconSymbol name="mic.fill" size={24} color={theme.text} />
                            )}
                        </TouchableOpacity>
                    )}
                </View>

                {/* Persistent Mini Disclaimer */}
                <View style={styles.miniDisclaimerContainer}>
                    <ThemedText style={styles.miniDisclaimerText}>
                        ai.therapy is not a therapeutic service.
                    </ThemedText>
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
        paddingHorizontal: 8,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    headerLeft: {
        flex: 1,
        alignItems: 'flex-start',
    },
    headerCenter: {
        flex: 2,
        alignItems: 'center',
    },
    headerRight: {
        flex: 1,
        alignItems: 'flex-end',
    },
    backButton: {
        padding: 8,
    },
    feedbackButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    feedbackButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    styleSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        gap: 6,
        marginHorizontal: 8,
    },
    styleSelectorText: {
        fontSize: 13,
        fontWeight: '600',
        maxWidth: 150,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
    },
    errorContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    errorTitle: {
        marginBottom: 8,
    },
    errorText: {
        textAlign: 'center',
        opacity: 0.7,
    },
    errorButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 20,
        marginTop: 24,
    },
    errorButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    messagesList: {
        padding: 16,
        gap: 16,
    },
    aiMessageContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        maxWidth: '80%',
    },
    messageAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    aiMessageBubble: {
        flex: 1,
        padding: 12,
        borderRadius: 16,
        borderTopLeftRadius: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 12,
        paddingVertical: 8,
        gap: 8,
        borderTopWidth: 1,
    },
    inputButton: {
        padding: 8,
    },
    input: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        fontSize: 16,
        maxHeight: 100,
    },
    sendButton: {
        padding: 8,
    },
    disclaimerBanner: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 12,
        marginHorizontal: 12,
        marginTop: 8,
        marginBottom: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        alignItems: 'flex-start',
    },
    disclaimerText: {
        flex: 1,
        fontSize: 11,
        lineHeight: 16,
        color: '#666',
        textAlign: 'center',
    },
    miniDisclaimerContainer: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: '#f9f9f9',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        alignItems: 'center',
    },
    miniDisclaimerText: {
        fontSize: 9,
        color: '#999',
        textAlign: 'center',
    },
});
