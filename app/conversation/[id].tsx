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
    Modal,
    ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { TOPICS } from '@/constants/data';
import { supabase } from '@/lib/supabase';
import { createJWT } from '@/lib/jwt';
import { ALL_THERAPY_OPTIONS } from '@/constants/therapy';

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

    // Fetch character from Supabase
    useEffect(() => {
        const fetchCharacter = async () => {
            try {
                const { data, error } = await supabase
                    .from('characters')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
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

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // Initialize greeting message when character loads
    useEffect(() => {
        if (character) {
            if (messages.length === 0) {
                const greeting = character.greeting || `Hello! I'm ${character.name}. ${character.description} I'm here to support you on your journey. How are you feeling today?`;
                setMessages([{
                    id: '1',
                    text: greeting,
                    isUser: false,
                    timestamp: new Date(),
                }]);
            }
        }
    }, [character]);

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
            // Create JWT token for authentication
            const token = await createJWT({
                userId: 'user-session-1', // You might want to use real user ID here
                action: 'chat_message',
            });

            // Call n8n webhook
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

    // Show loading state
    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
                <View style={[styles.header, { borderBottomColor: theme.icon }]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <IconSymbol name="chevron.right" size={24} color={theme.text} style={{ transform: [{ rotate: '180deg' }] }} />
                    </TouchableOpacity>
                </View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <ThemedText style={{ marginTop: 16 }}>Loading character...</ThemedText>
                </View>
            </SafeAreaView>
        );
    }

    // Show error state
    if (!character) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
                <View style={[styles.header, { borderBottomColor: theme.icon }]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <IconSymbol name="chevron.right" size={24} color={theme.text} style={{ transform: [{ rotate: '180deg' }] }} />
                    </TouchableOpacity>
                </View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                    <ThemedText type="title" style={{ marginBottom: 8 }}>Character not found</ThemedText>
                    <ThemedText style={{ textAlign: 'center', opacity: 0.7 }}>
                        This character doesn't exist or couldn't be loaded.
                    </ThemedText>
                    <TouchableOpacity
                        style={{ backgroundColor: theme.primary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 20, marginTop: 24 }}
                        onPress={() => router.back()}
                    >
                        <ThemedText style={{ color: '#fff', fontWeight: '600' }}>Go Back</ThemedText>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <View style={[styles.header, { borderBottomColor: theme.icon }]}>
                {/* Left: Back Button */}
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <IconSymbol name="chevron.right" size={24} color={theme.text} style={{ transform: [{ rotate: '180deg' }] }} />
                    </TouchableOpacity>
                </View>

                {/* Center: Style Selector */}
                <View style={styles.headerCenter}>
                    <TouchableOpacity
                        style={[styles.styleSelector, { backgroundColor: theme.card }]}
                        onPress={() => setIsStyleModalVisible(true)}
                    >
                        <IconSymbol name="sparkles" size={14} color={theme.primary} />
                        <ThemedText style={styles.styleSelectorText} numberOfLines={1}>
                            {activeTherapyStyle.split('(')[0].trim()}
                        </ThemedText>
                        <IconSymbol name="chevron.down" size={12} color={theme.icon} />
                    </TouchableOpacity>
                </View>

                {/* Right: Feedback Button */}
                <View style={styles.headerRight}>
                    <TouchableOpacity
                        style={[styles.feedbackButton, { backgroundColor: theme.primary }]}
                        onPress={() => router.push('/feedback')}
                    >
                        <ThemedText style={styles.feedbackButtonText}>Feedback</ThemedText>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Sub-header for Character Info */}
            <View style={[styles.characterBar, { backgroundColor: theme.background, borderBottomColor: `rgba(${theme.text}, 0.1)` }]}>
                <Image source={{ uri: character.image }} style={styles.headerAvatar} contentFit="cover" />
                <View>
                    <ThemedText type="defaultSemiBold" style={styles.headerName}>
                        {character.name}
                    </ThemedText>
                    <ThemedText style={styles.creatorText}>
                        @therapy.ai
                    </ThemedText>
                </View>
            </View>

            <Modal
                visible={isStyleModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsStyleModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: theme.icon }]}>
                            <ThemedText type="title" style={{ fontSize: 18 }}>Select Therapy Style</ThemedText>
                            <TouchableOpacity onPress={() => setIsStyleModalVisible(false)}>
                                <IconSymbol name="xmark.circle.fill" size={24} color={theme.icon} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                            {ALL_THERAPY_OPTIONS.map((category) => (
                                <View key={category.category} style={styles.modalCategory}>
                                    <ThemedText type="defaultSemiBold" style={styles.modalCategoryTitle}>
                                        {category.category}
                                    </ThemedText>
                                    {category.styles.map((style) => {
                                        const isSelected = activeTherapyStyle === style.name;
                                        return (
                                            <TouchableOpacity
                                                key={style.name}
                                                style={[
                                                    styles.modalOption,
                                                    {
                                                        backgroundColor: isSelected ? theme.primary : theme.card,
                                                        borderColor: isSelected ? theme.primary : theme.icon
                                                    }
                                                ]}
                                                onPress={() => {
                                                    setActiveTherapyStyle(style.name);
                                                    setIsStyleModalVisible(false);
                                                }}
                                            >
                                                <View style={{ flex: 1 }}>
                                                    <ThemedText style={[
                                                        styles.modalOptionName,
                                                        { color: isSelected ? '#fff' : theme.text }
                                                    ]}>
                                                        {style.name}
                                                    </ThemedText>
                                                    <ThemedText style={[
                                                        styles.modalOptionDesc,
                                                        { color: isSelected ? 'rgba(255,255,255,0.9)' : theme.icon }
                                                    ]}>
                                                        {style.description}
                                                    </ThemedText>
                                                </View>
                                                {isSelected && (
                                                    <IconSymbol name="checkmark.circle.fill" size={20} color="#fff" />
                                                )}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            ))}
                            <View style={{ height: 40 }} />
                        </ScrollView>
                    </View>
                </View>
            </Modal>

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
    characterBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 12,
        borderBottomWidth: 1,
    },
    headerAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },
    headerName: {
        fontSize: 16,
    },
    creatorText: {
        fontSize: 13,
        opacity: 0.7,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        height: '70%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
    },
    modalScroll: {
        padding: 20,
    },
    modalCategory: {
        marginBottom: 24,
    },
    modalCategoryTitle: {
        fontSize: 14,
        marginBottom: 12,
        opacity: 0.7,
        textTransform: 'uppercase',
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        gap: 12,
    },
    modalOptionName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    modalOptionDesc: {
        fontSize: 13,
        lineHeight: 18,
    },
    // Message Styles
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
    // Input Styles
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
