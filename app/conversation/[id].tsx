import React, { useState, useRef, useEffect } from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    FlatList,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { TOPICS } from '@/constants/data';

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
}

const WEBHOOK_URL = 'https://mindflex.app.n8n.cloud/webhook-test/b4d0ede8-b771-4c33-aceb-83dcb44b0bf5';

export default function ConversationScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const flatListRef = useRef<FlatList>(null);

    // Find the character
    const character = TOPICS.flatMap((topic) => topic.characters).find((c) => c.id === id);

    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: `Hello! I'm ${character?.name}. ${character?.description} I'm here to support you on your journey. How are you feeling today?`,
            isUser: false,
            timestamp: new Date(),
        },
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const scrollToBottom = () => {
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    const sendMessage = async () => {
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
            // Call n8n webhook
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMsgText,
                    characterName: character?.name,
                    characterDescription: character?.description,
                    sessionId: 'user-session-1', // You might want to generate a real unique ID per user
                    timestamp: new Date().toISOString(),
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Network response was not ok: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const data = await response.json();

            // Expecting the webhook to return { "output": "AI response text" } or similar
            // Adjust this based on your actual n8n workflow output
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
            // Fallback with error details for debugging
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
    };

    const renderMessage = ({ item }: { item: Message }) => {
        if (item.isUser) {
            return (
                <View style={styles.userMessageContainer}>
                    <View style={[styles.userMessageBubble, { backgroundColor: theme.primary }]}>
                        <ThemedText style={styles.userMessageText}>{item.text}</ThemedText>
                    </View>
                </View>
            );
        }

        return (
            <View style={styles.aiMessageContainer}>
                <Image source={{ uri: character?.image }} style={styles.messageAvatar} contentFit="cover" />
                <View style={[styles.aiMessageBubble, { backgroundColor: theme.card }]}>
                    <ThemedText style={styles.aiMessageText}>{item.text}</ThemedText>
                </View>
            </View>
        );
    };

    if (!character) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <ThemedText>Character not found</ThemedText>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <View style={[styles.header, { borderBottomColor: theme.icon }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <IconSymbol name="chevron.right" size={24} color={theme.text} style={{ transform: [{ rotate: '180deg' }] }} />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Image source={{ uri: character.image }} style={styles.headerAvatar} contentFit="cover" />
                    <ThemedText type="defaultSemiBold" style={styles.headerName}>
                        {character.name}
                    </ThemedText>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.headerButton}>
                        <IconSymbol name="magnifyingglass" size={20} color={theme.text} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.feedbackButton, { backgroundColor: theme.primary }]}
                        onPress={() => router.push('/feedback')}
                    >
                        <ThemedText style={styles.feedbackButtonText}>Feedback?</ThemedText>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={[styles.creatorInfo, { backgroundColor: theme.card }]}>
                <ThemedText style={styles.creatorText}>
                    {character.name} was created by @therapy.ai
                </ThemedText>
            </View>

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={100}>
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.messagesList}
                    showsVerticalScrollIndicator={false}
                    ListFooterComponent={
                        isTyping ? (
                            <View style={styles.aiMessageContainer}>
                                <Image source={{ uri: character?.image }} style={styles.messageAvatar} contentFit="cover" />
                                <View style={[styles.aiMessageBubble, { backgroundColor: theme.card, padding: 16 }]}>
                                    <ActivityIndicator size="small" color={theme.text} />
                                </View>
                            </View>
                        ) : null
                    }
                />

                <View style={[styles.inputContainer, { backgroundColor: theme.background, borderTopColor: theme.icon }]}>
                    <TouchableOpacity style={styles.inputButton}>
                        <IconSymbol name="plus" size={24} color={theme.text} />
                    </TouchableOpacity>
                    <TextInput
                        style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
                        placeholder="Message..."
                        placeholderTextColor={theme.icon}
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
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
        gap: 12,
    },
    backButton: {
        padding: 8,
    },
    headerInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    headerName: {
        fontSize: 18,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    headerButton: {
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
    creatorInfo: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        alignItems: 'center',
    },
    creatorText: {
        fontSize: 13,
        opacity: 0.7,
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
    aiMessageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    userMessageContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    userMessageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
        borderTopRightRadius: 4,
    },
    userMessageText: {
        fontSize: 15,
        lineHeight: 20,
        color: '#fff',
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
