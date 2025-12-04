import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

type Message = {
    id: string;
    text: string;
    sender: 'user' | 'therapyai';
    timestamp: Date;
};

export default function FeedbackScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Hi! 👋 Thanks for reaching out. How can we help you today?',
            sender: 'therapyai',
            timestamp: new Date(),
        },
    ]);
    const [inputText, setInputText] = useState('');

    const handleSend = () => {
        if (inputText.trim()) {
            const newMessage: Message = {
                id: Date.now().toString(),
                text: inputText,
                sender: 'user',
                timestamp: new Date(),
            };
            setMessages([...messages, newMessage]);
            setInputText('');

            // Auto-reply after a delay
            setTimeout(() => {
                const reply: Message = {
                    id: (Date.now() + 1).toString(),
                    text: 'Thanks for your message! Our team will get back to you soon. In the meantime, you can also email us at hello@therapy.ai',
                    sender: 'therapyai',
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, reply]);
            }, 1000);
        }
    };

    const renderMessage = (message: Message) => {
        const isUser = message.sender === 'user';
        return (
            <View
                key={message.id}
                style={[
                    styles.messageContainer,
                    isUser ? styles.userMessageContainer : styles.aiMessageContainer,
                ]}
            >
                {!isUser && (
                    <Image
                        source={{ uri: '/icon.png' }}
                        style={styles.avatar}
                        contentFit="cover"
                    />
                )}
                <View
                    style={[
                        styles.messageBubble,
                        isUser
                            ? [styles.userBubble, { backgroundColor: theme.primary }]
                            : [styles.aiBubble, { backgroundColor: theme.card }],
                    ]}
                >
                    <ThemedText style={[styles.messageText, isUser && { color: '#fff' }]}>
                        {message.text}
                    </ThemedText>
                </View>
                {isUser && (
                    <Image
                        source={{ uri: '/characters/Dr. Morpheus.jpg' }}
                        style={styles.avatar}
                        contentFit="cover"
                    />
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.icon }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <IconSymbol name="chevron.right" size={24} color={theme.text} style={{ transform: [{ rotate: '180deg' }] }} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Image
                        source={{ uri: '/icon.png' }}
                        style={styles.headerAvatar}
                        contentFit="cover"
                    />
                    <View>
                        <ThemedText type="defaultSemiBold" style={styles.headerTitle}>
                            Therapy.AI Support
                        </ThemedText>
                        <ThemedText style={styles.headerSubtitle}>
                            Usually replies within 24 hours
                        </ThemedText>
                    </View>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                {/* Messages */}
                <ScrollView
                    style={styles.messagesContainer}
                    contentContainerStyle={styles.messagesContent}
                    showsVerticalScrollIndicator={false}
                >
                    {messages.map(renderMessage)}
                </ScrollView>

                {/* Input */}
                <View style={[styles.inputContainer, { backgroundColor: theme.card, borderTopColor: theme.icon }]}>
                    <TextInput
                        style={[styles.input, { color: theme.text }]}
                        placeholder="Type your message..."
                        placeholderTextColor={theme.icon}
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                        maxLength={500}
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, { backgroundColor: theme.primary }]}
                        onPress={handleSend}
                        disabled={!inputText.trim()}
                    >
                        <IconSymbol name="paperplane.fill" size={20} color="#fff" />
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
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 8,
    },
    headerCenter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    headerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    headerTitle: {
        fontSize: 16,
    },
    headerSubtitle: {
        fontSize: 12,
        opacity: 0.6,
    },
    messagesContainer: {
        flex: 1,
    },
    messagesContent: {
        padding: 16,
        gap: 16,
    },
    messageContainer: {
        flexDirection: 'row',
        gap: 8,
        maxWidth: '80%',
    },
    userMessageContainer: {
        alignSelf: 'flex-end',
        flexDirection: 'row-reverse',
    },
    aiMessageContainer: {
        alignSelf: 'flex-start',
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    messageBubble: {
        padding: 12,
        borderRadius: 18,
        maxWidth: '100%',
    },
    userBubble: {
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 12,
        gap: 12,
        borderTopWidth: 1,
    },
    input: {
        flex: 1,
        fontSize: 15,
        maxHeight: 100,
        paddingVertical: 8,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
