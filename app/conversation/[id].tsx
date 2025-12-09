import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
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
import { ALL_THERAPY_OPTIONS, STYLE_ABBREVIATIONS } from '@/constants/therapy';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { createCacheKey, queryCache } from '@/lib/query-cache';
import { generateSessionId } from '@/lib/session';
import { supabase } from '@/lib/supabase';

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
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [soundLevel, setSoundLevel] = useState(0);
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // Cleanup recording on unmount
    useEffect(() => {
        return () => {
            if (recording) {
                stopRecording();
            }
        };
    }, []);

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
                    return data;
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

    // Load messages from "memory" table on mount (Session Persistence)
    useEffect(() => {
        const loadHistory = async () => {
            if (!session?.user?.id || !character) return;

            setIsLoading(true);
            const sessionId = generateSessionId(session.user.id, character.id); // Use Character ID for stability

            // 1. Fetch Chat History from 'memory' (n8n writes here)
            // n8n memory format: { session_id, message: "JSON_STRING" }
            const { data: memoryData, error } = await supabase
                .from('memory')
                .select('*')
                .eq('session_id', sessionId)
                .order('created_at', { ascending: true });

            if (error) {
                console.error('Error fetching memory:', error);
            }

            if (memoryData && memoryData.length > 0) {
                const parsedMessages: Message[] = memoryData.map((row: any) => {
                    try {
                        let msgContent;
                        if (typeof row.message === 'string') {
                            msgContent = JSON.parse(row.message);
                        } else {
                            msgContent = row.message; // Already an object (jsonb)
                        }

                        // LangChain format: { type: 'human' | 'ai', content: 'text' }
                        return {
                            id: row.id.toString(),
                            text: msgContent.content || '',
                            isUser: msgContent.type === 'human',
                            timestamp: new Date(row.created_at),
                        };
                    } catch (e) {
                        console.error('Parse error for row:', row.id, e);
                        return null;
                    }
                }).filter((msg: any) => msg !== null && msg.text); // Filter out bad parses

                // Strip prefix from all messages
                // Format: =(Talking to Fearless Wolf | Style: Integrative Therapy (AI decides)) text
                const cleanMessages = parsedMessages.map(msg => ({
                    ...msg,
                    text: msg.text.replace(/^=?\(Talking to [^)]+\)\s*/, '').trim()
                }));

                // Prepare greeting (system message at start)
                const greetingText = character.greeting ||
                    `Hello! I'm ${character.name}. ${character.description} I'm here to support you on your journey. How are you feeling today?`;

                const greetingMsg: Message = {
                    id: '0', // Consistent ID for greeting
                    text: greetingText,
                    isUser: false,
                    timestamp: new Date(0), // Oldest
                };

                // Combine: [Greeting, ...History]
                // We map history to ensure no duplicates if n8n saved the greeting (unlikely)
                setMessages([greetingMsg, ...cleanMessages]);
            } else {
                // No history? Set initial greeting
                const greeting = character.greeting ||
                    `Hello! I'm ${character.name}. ${character.description} I'm here to support you on your journey. How are you feeling today?`;

                setMessages([{
                    id: '1',
                    text: greeting,
                    isUser: false,
                    timestamp: new Date(),
                }]);
            }

            // 2. Fetch Active Therapy Styles from 'chat_sessions'
            const { data: sessionData } = await supabase
                .from('chat_sessions')
                .select('active_therapy_styles')
                .eq('user_id', session.user.id)
                .eq('character_id', character.id)
                .single();

            if (sessionData?.active_therapy_styles) {
                setActiveTherapyStyles(sessionData.active_therapy_styles);
            } else if (character.therapyStyles && character.therapyStyles.length > 0 && messages.length === 0) {
                // Default handling only if new chat
                setActiveTherapyStyles(character.therapyStyles);
            }

            setIsLoading(false);
        };

        loadHistory();
    }, [session, character]);

    // Memoized scroll function
    const scrollToBottom = useCallback(() => {
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }, []);

    // Audio Functions
    const startRecording = async () => {
        try {
            console.log('Requesting permissions..');
            const permission = await Audio.requestPermissionsAsync();
            if (permission.status !== 'granted') {
                alert('Permission to access microphone is required!');
                return;
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            console.log('Starting recording..');
            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );

            setRecording(recording);
            setIsRecording(true);

            // Metering updates
            recording.setOnRecordingStatusUpdate((status) => {
                if (status.metering) {
                    // Normalize roughly -160dB to 0dB range to 0-1
                    // Typical metering is -160 (silence) to 0 (loud)
                    const level = Math.max(0, (status.metering + 160) / 160);
                    setSoundLevel(level);
                }
            });

        } catch (err) {
            console.error('Failed to start recording', err);
        }
    };

    const stopRecording = async () => {
        if (!recording) return;

        console.log('Stopping recording..');
        setIsRecording(false);
        try {
            await recording.stopAndUnloadAsync();
        } catch (error) {
            // Ignore errors if already unloaded
        }

        const uri = recording.getURI();
        setRecording(null);
        console.log('Recording stopped and stored at', uri);

        if (uri) {
            uploadAudio(uri);
        }
    };

    const cancelRecording = async () => {
        if (!recording) return;
        setIsRecording(false);
        try {
            await recording.stopAndUnloadAsync();
        } catch (error) { }
        setRecording(null);
    };

    const uploadAudio = async (uri: string) => {
        setIsTranscribing(true);
        try {
            const currentUserId = session?.user?.id || 'anonymous';
            const sessionId = generateSessionId(currentUserId, id); // Use character ID from route

            // Handle Web vs Mobile
            let responseData;

            if (Platform.OS === 'web') {
                // Web: Fetch blob -> FormData -> fetch()
                const response = await fetch(uri);
                const blob = await response.blob();

                const formData = new FormData();
                // @ts-ignore - 'file' is correct for React Native / Web FormData
                formData.append('file', blob, 'recording.m4a');

                const uploadRes = await fetch(AUDIO_WEBHOOK_URL, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${session?.access_token}`,
                        // Do NOT set Content-Type header manually for FormData, browser does it with boundary
                    },
                    body: formData,
                });

                if (!uploadRes.ok) throw new Error(`Upload failed: ${uploadRes.status}`);
                responseData = await uploadRes.json();

            } else {
                // Mobile: Use FileSystem.uploadAsync
                const fileInfo = await FileSystem.getInfoAsync(uri);
                if (!fileInfo.exists) throw new Error("File does not exist");

                const uploadResult = await FileSystem.uploadAsync(AUDIO_WEBHOOK_URL, uri, {
                    httpMethod: 'POST',
                    uploadType: FileSystem.FileSystemUploadType.MULTIPART,
                    headers: {
                        'Authorization': `Bearer ${session?.access_token}`,
                    },
                    fieldName: 'file',
                    mimeType: 'audio/m4a',
                });

                if (uploadResult.status !== 200) {
                    throw new Error(`Upload failed: ${uploadResult.status}`);
                }
                responseData = JSON.parse(uploadResult.body);
            }

            const transcription = responseData.text || responseData.transcription || responseData.output;

            if (transcription) {
                // Auto-send the transcribed text
                sendMessage(transcription);
            }

        } catch (error) {
            console.error("Transcription error:", error);
            alert("Could not transcribe audio.");
        } finally {
            setIsTranscribing(false);
        }
    };

    // Memoized send message function
    const sendMessage = useCallback(async (textOverride?: string) => {
        const textToSend = typeof textOverride === 'string' ? textOverride : inputText;
        if (textToSend.trim() === '' || isTyping) return;

        const userMsgText = textToSend.trim();
        const newMessage: Message = {
            id: Date.now().toString(),
            text: userMsgText,
            isUser: true,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, newMessage]);
        setInputText('');
        setIsTyping(true);
        scrollToBottom();

        try {
            const currentUserId = session?.user?.id || 'anonymous';

            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`,
                },
                body: JSON.stringify({
                    message: userMsgText,
                    characterName: character?.name,
                    characterDescription: activeTherapyStyles.includes('Integrative Therapy (AI decides)')
                        ? `${character?.description}\n\n[IMPORTANT: Conduct this session using an integrative approach. You have access to all therapy styles and should adapt your approach based on the user's needs and the conversation context.]`
                        : `${character?.description}\n\n[IMPORTANT: Conduct this session using ${activeTherapyStyles.join(', ')} style(s).]`,
                    therapyStyle: activeTherapyStyles.join(', '),
                    ...(activeTherapyStyles.includes('Integrative Therapy (AI decides)')
                        ? {
                            therapyStyles: ALL_THERAPY_OPTIONS
                                .flatMap(c => c.styles.map(s => s.name))
                                .join(', ')
                        }
                        : { therapyStyles: activeTherapyStyles.join(', ') }),
                    sessionId: generateSessionId(currentUserId, character?.id || ''), // New Session Logic
                    user: userData || { id: currentUserId },
                    timestamp: new Date().toISOString(),
                }),
            });

            // Sync with 'chat_sessions' table for the list view
            if (session?.user) {
                const { error: upsertError } = await supabase
                    .from('chat_sessions')
                    .upsert({
                        user_id: session.user.id,
                        character_id: character?.id,
                        last_message: userMsgText,
                        last_message_at: new Date().toISOString(),
                        active_therapy_styles: activeTherapyStyles
                    }, { onConflict: 'user_id, character_id' });

                if (upsertError) console.error("Error updating chat list:", upsertError);
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Webhook error: ${response.status} ${response.statusText}. ${errorText}`);
            }

            const data = await response.json();
            const aiText = data.output || data.text || data.response || data.message || "I'm listening...";

            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: typeof aiText === 'string' ? aiText : JSON.stringify(aiText),
                isUser: false,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, aiResponse]);
        } catch (error: any) {
            console.error('Error sending message:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            const fallbackResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: `I'm having trouble connecting right now. Debug Error: ${errorMessage}`,
                isUser: false,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, fallbackResponse]);
        } finally {
            setIsTyping(false);
            scrollToBottom();
        }
    }, [inputText, isTyping, character, activeTherapyStyles, scrollToBottom, session, userData]);

    // Memoized render function
    const renderMessage = useCallback(({ item }: { item: Message }) => (
        <MessageBubble
            text={item.text}
            isUser={item.isUser}
            avatarUri={!item.isUser ? character?.image : undefined}
            theme={theme}
        />
    ), [character?.image, theme]);

    // Memoized key extractor
    const keyExtractor = useCallback((item: Message) => item.id, []);

    // Memoized callbacks
    const handleStyleModalClose = useCallback(() => setIsStyleModalVisible(false), []);
    const handleStyleModalOpen = useCallback(() => setIsStyleModalVisible(true), []);
    const handleBack = useCallback(() => router.back(), [router]);
    const handleFeedback = useCallback(() => router.push('/feedback'), [router]);

    // Open the detail popup (this will show on top of style modal if both are open)
    const handleLearnMore = useCallback((styleName: string) => {
        setDetailStyleName(styleName);
    }, []);

    const handleDetailPopupClose = useCallback(() => {
        setDetailStyleName(null);
    }, []);

    // Memoized key press handler
    const handleKeyPress = useCallback((e: any) => {
        if (Platform.OS === 'web' && e.nativeEvent.key === 'Enter' && !(e.nativeEvent as any).shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }, [sendMessage]);

    // Memoized typing indicator
    const typingIndicator = useMemo(() => {
        if (!isTyping) return null;
        return (
            <View style={styles.aiMessageContainer}>
                <Image source={{ uri: character?.image }} style={styles.messageAvatar} contentFit="cover" />
                <View style={[styles.aiMessageBubble, { backgroundColor: theme.card, padding: 16 }]}>
                    <ActivityIndicator size="small" color={theme.text} />
                </View>
            </View>
        );
    }, [isTyping, character?.image, theme]);

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
                    <ThemedText type="title" style={styles.errorTitle}>Character not found</ThemedText>
                    <ThemedText style={styles.errorText}>
                        This character doesn't exist or couldn't be loaded.
                    </ThemedText>
                    <TouchableOpacity
                        style={[styles.errorButton, { backgroundColor: theme.primary }]}
                        onPress={handleBack}
                    >
                        <ThemedText style={styles.errorButtonText}>Go Back</ThemedText>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <View style={[styles.header, { borderBottomColor: theme.icon }]}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={handleBack} style={[styles.backButton, { flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
                        <IconSymbol name="chevron.right" size={24} color={theme.text} style={{ transform: [{ rotate: '180deg' }] }} />
                        {character && (
                            <ThemedText type="defaultSemiBold" style={{ fontSize: 16 }}>{character.name}</ThemedText>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.headerCenter}>
                    <TouchableOpacity
                        style={[styles.styleSelector, { backgroundColor: theme.card }]}
                        onPress={handleStyleModalOpen}
                    >
                        <IconSymbol name="sparkles" size={14} color={theme.primary} />
                        <ThemedText style={styles.styleSelectorText} numberOfLines={1}>
                            {activeTherapyStyles.map(s => STYLE_ABBREVIATIONS[s] || s).join(', ')}
                        </ThemedText>
                        <IconSymbol name="chevron.down" size={12} color={theme.icon} />
                    </TouchableOpacity>
                </View>

                <View style={styles.headerRight}>
                    <TouchableOpacity
                        style={[styles.feedbackButton, { backgroundColor: theme.primary }]}
                        onPress={handleFeedback}
                    >
                        <ThemedText style={styles.feedbackButtonText}>Feedback</ThemedText>
                    </TouchableOpacity>
                </View>
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
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={keyExtractor}
                    contentContainerStyle={styles.messagesList}
                    showsVerticalScrollIndicator={false}
                    ListFooterComponent={typingIndicator}
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
});
