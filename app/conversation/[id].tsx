import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
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
import { TherapyStyleModal } from '@/components/therapy-style-modal';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { TOPICS } from '@/constants/data';
import { Colors } from '@/constants/theme';
import { ALL_THERAPY_OPTIONS, STYLE_ABBREVIATIONS } from '@/constants/therapy';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { createJWT } from '@/lib/jwt';
import { createCacheKey, queryCache } from '@/lib/query-cache';
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

export default function ConversationScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const flatListRef = useRef<FlatList>(null);

    const [character, setCharacter] = useState<Character | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTherapyStyle, setActiveTherapyStyle] = useState('Integrative Therapy (AI decides)');
    const [isStyleModalVisible, setIsStyleModalVisible] = useState(false);
    const [inputText, setInputText] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);

    // Ensure a therapy style is always selected
    useEffect(() => {
        if (!activeTherapyStyle) {
            setActiveTherapyStyle('Integrative Therapy (AI decides)');
        }
    }, [activeTherapyStyle]);

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

    // Set initial greeting and therapy style
    useEffect(() => {
        if (character && messages.length === 0) {
            if (character.therapyStyles && character.therapyStyles.length > 0) {
                setActiveTherapyStyle(character.therapyStyles[0]);
            }

            const greeting = character.greeting ||
                `Hello! I'm ${character.name}. ${character.description} I'm here to support you on your journey. How are you feeling today?`;

            setMessages([{
                id: '1',
                text: greeting,
                isUser: false,
                timestamp: new Date(),
            }]);
        }
    }, [character]);

    // Memoized scroll function
    const scrollToBottom = useCallback(() => {
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }, []);

    // Memoized send message function
    const sendMessage = useCallback(async () => {
        if (inputText.trim() === '' || isTyping) return;

        const userMsgText = inputText.trim();
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
            const token = await createJWT({
                userId: 'user-session-1',
                action: 'chat_message',
            });

            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    message: userMsgText,
                    characterName: character?.name,
                    characterDescription: `${character?.description}\n\n[IMPORTANT: Conduct this session using ${activeTherapyStyle} style.]`,
                    therapyStyle: activeTherapyStyle,
                    ...(activeTherapyStyle === 'Integrative Therapy (AI decides)'
                        ? { therapyStyles: ALL_THERAPY_OPTIONS.flatMap(c => c.styles.map(s => s.name)).join(', ') }
                        : {}),
                    sessionId: 'user-session-1',
                    timestamp: new Date().toISOString(),
                }),
            });

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
    }, [inputText, isTyping, character, activeTherapyStyle, scrollToBottom]);

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
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <IconSymbol name="chevron.right" size={24} color={theme.text} style={{ transform: [{ rotate: '180deg' }] }} />
                    </TouchableOpacity>
                </View>

                <View style={styles.headerCenter}>
                    <TouchableOpacity
                        style={[styles.styleSelector, { backgroundColor: theme.card }]}
                        onPress={handleStyleModalOpen}
                    >
                        <IconSymbol name="sparkles" size={14} color={theme.primary} />
                        <ThemedText style={styles.styleSelectorText} numberOfLines={1}>
                            {STYLE_ABBREVIATIONS[activeTherapyStyle] || activeTherapyStyle}
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

            <TherapyStyleModal
                visible={isStyleModalVisible}
                activeStyle={activeTherapyStyle}
                onClose={handleStyleModalClose}
                onSelectStyle={setActiveTherapyStyle}
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
                    <TouchableOpacity style={styles.inputButton}>
                        <IconSymbol name="plus" size={24} color={theme.text} />
                    </TouchableOpacity>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: theme.card,
                                color: theme.text,
                                paddingVertical: 10,
                            },
                        ]}
                        placeholder="Message..."
                        placeholderTextColor={theme.icon}
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                        onKeyPress={handleKeyPress}
                    />
                    <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
                        <IconSymbol name="paperplane.fill" size={24} color={theme.primary} />
                    </TouchableOpacity>
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
