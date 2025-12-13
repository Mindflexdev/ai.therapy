
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View,
    FlatList,
    TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { MessageBubble } from '@/components/message-bubble';
import { getPublicCharacters } from '@/constants/storage';
import { Character } from '@/constants/data';
import { createJWT } from '@/lib/jwt';
import { supabase } from '@/lib/supabase';

// Helper to get character by ID from public list + static
const fetchPublicCharacter = async (id: string): Promise<Character | null> => {
    // 1. Try public fetch
    const publicChars = await getPublicCharacters();
    let char = publicChars.find(c => c.id === id);

    // 2. If not found, try direct single query (if we had a direct fetch function)
    if (!char) {
        // Fallback: Fetch directly from Supabase public chars
        const { data } = await supabase.from('characters').select('*').eq('id', id).eq('is_public', true).single();
        if (data) {
            char = {
                id: data.id,
                name: data.name,
                image: data.image_url,
                description: data.description,
                // Map snake_case to camelCase
                therapyStyles: data.therapy_styles,
                goal: data.goal,
                type: 'ai',
                createdAt: data.created_at,
                isPublic: true,
                rating: 0,
                greeting: data.greeting
            };
        }
    }
    return char || null;
};

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
}

const MAX_FREE_MESSAGES = 3;

export default function PreviewChatScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const [character, setCharacter] = useState<Character | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [inputText, setInputText] = useState('');
    const [isSending, setIsSending] = useState(false);

    // Limit State
    const [userMessageCount, setUserMessageCount] = useState(0);
    const [showSignUpModal, setShowSignUpModal] = useState(false);

    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        const loadChar = async () => {
            if (typeof id === 'string') {
                try {
                    const char = await fetchPublicCharacter(id);
                    if (char) {
                        setCharacter(char);
                        // Initial Greeting
                        setMessages([{
                            id: 'init-greeting',
                            text: char.greeting || `Hello! I'm ${char.name}. How can I help you today?`,
                            isUser: false,
                            timestamp: new Date()
                        }]);
                    } else {
                        Alert.alert('Not Found', 'Character not found.', [{ text: 'Go Home', onPress: () => router.push('/') }]);
                    }
                } catch (e) {
                    console.error(e);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        loadChar();
    }, [id]);

    const handleSendMessage = async () => {
        if (!inputText.trim() || isSending || !character) return;

        // CHECK LIMIT
        if (userMessageCount >= MAX_FREE_MESSAGES) {
            setShowSignUpModal(true);
            return;
        }

        const userMsgText = inputText.trim();
        setInputText('');
        setIsSending(true);

        // Add user message
        const newMessages = [...messages, {
            id: Date.now().toString(),
            text: userMsgText,
            isUser: true,
            timestamp: new Date()
        }];
        setMessages(newMessages);

        // Increment count
        setUserMessageCount(prev => prev + 1);

        try {
            // Generate AI Response (Stateless/One-off for preview)
            // We pass simplified history
            const historyForAi = newMessages.map(m => ({
                role: m.isUser ? 'user' as const : 'model' as const,
                parts: [{ text: m.text }]
            }));

            const responseText = await generateChatResponse(
                character,
                historyForAi,
                userMsgText,
                character.therapyStyles || [] // Use character's deafult styles
            );

            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                text: responseText,
                isUser: false,
                timestamp: new Date()
            }]);

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                text: "I'm having trouble connecting right now. Please try again.",
                isUser: false,
                timestamp: new Date()
            }]);
        } finally {
            setIsSending(false);
        }
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={theme.tint} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.icon + '20' }]}>
                <TouchableOpacity onPress={() => router.push('/sign-in')} style={styles.backButton}>
                    <IconSymbol name="chevron.left" size={28} color={theme.tint} />
                    <ThemedText style={{ color: theme.tint, marginLeft: 4 }}>Sign In</ThemedText>
                </TouchableOpacity>
                <View style={styles.headerTitle}>
                    <Image source={{ uri: character?.image }} style={styles.headerImage} />
                    <View>
                        <ThemedText type="defaultSemiBold">{character?.name}</ThemedText>
                        <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>Preview Session</ThemedText>
                    </View>
                </View>
            </View>

            {/* Chat Area */}
            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <MessageBubble
                        message={item}
                        characterImage={character?.image}
                        showTimestamp={true}
                    />
                )}
                contentContainerStyle={styles.messagesList}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            {/* Input Area */}
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
                <View style={[styles.inputContainer, { backgroundColor: theme.card, borderTopColor: theme.icon + '20' }]}>
                    <TextInput
                        style={[styles.input, { color: theme.text, backgroundColor: theme.background }]}
                        placeholder="Type a message..."
                        placeholderTextColor={theme.icon}
                        value={inputText}
                        onChangeText={setInputText}
                        onSubmitEditing={handleSendMessage}
                        returnKeyType="send"
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, { backgroundColor: theme.tint, opacity: (!inputText.trim() || isSending) ? 0.5 : 1 }]}
                        onPress={handleSendMessage}
                        disabled={!inputText.trim() || isSending}
                    >
                        {isSending ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <IconSymbol name="paperplane.fill" size={20} color="#fff" />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            {/* Sign Up Modal */}
            {showSignUpModal && (
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                        <Image source={{ uri: character?.image }} style={styles.modalImage} />
                        <ThemedText type="subtitle" style={{ textAlign: 'center', marginTop: 16 }}>
                            Continue with {character?.name}?
                        </ThemedText>

                        <ThemedText style={{ textAlign: 'center', opacity: 0.8, marginTop: 8, marginBottom: 24 }}>
                            {character?.name} can help you achieve your goal: <ThemedText type="defaultSemiBold">{character?.goal}</ThemedText>.
                            Sign up to save your progress and unlock unlimited messages.
                        </ThemedText>

                        <TouchableOpacity
                            style={[styles.primaryButton, { backgroundColor: theme.tint }]}
                            onPress={() => router.push('/sign-in')}
                        >
                            <ThemedText style={{ color: '#fff', fontWeight: 'bold' }}>Sign Up for Free</ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{ padding: 16 }}
                            onPress={() => router.push('/')}
                        >
                            <ThemedText style={{ color: theme.icon }}>Maybe later</ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    headerTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    headerImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    messagesList: {
        padding: 16,
        paddingBottom: 32,
    },
    inputContainer: {
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
    },
    input: {
        flex: 1,
        height: 44,
        borderRadius: 22,
        paddingHorizontal: 16,
        fontSize: 16,
        marginRight: 8,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalOverlay: {
        position: 'absolute',
        top: 0, bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        width: '100%',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    modalImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: '#fff',
    },
    primaryButton: {
        width: '100%',
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
