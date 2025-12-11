import { ThemedText } from '@/components/themed-text';
import { Image } from 'expo-image';
import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface MessageBubbleProps {
    text: string;
    isUser: boolean;
    avatarUri?: string;
    theme: any;
}

// Parse text with asterisks for roleplay actions
const parseRoleplayText = (text: string, isUser: boolean) => {
    const parts: React.ReactNode[] = [];
    let currentIndex = 0;

    // Regex to match text between asterisks: *text*
    const asteriskRegex = /\*([^*]+)\*/g;
    let match;

    while ((match = asteriskRegex.exec(text)) !== null) {
        // Add text before the match
        if (match.index > currentIndex) {
            parts.push(
                <Text key={`text-${currentIndex}`}>
                    {text.substring(currentIndex, match.index)}
                </Text>
            );
        }

        // Add the italic text (content between asterisks)
        parts.push(
            <Text key={`italic-${match.index}`} style={styles.roleplayAction}>
                {match[1]}
            </Text>
        );

        currentIndex = match.index + match[0].length;
    }

    // Add remaining text after last match
    if (currentIndex < text.length) {
        parts.push(
            <Text key={`text-${currentIndex}`}>
                {text.substring(currentIndex)}
            </Text>
        );
    }

    return parts.length > 0 ? parts : text;
};

export const MessageBubble = memo(({ text, isUser, avatarUri, theme }: MessageBubbleProps) => {
    // Bulletproof message cleaning - multiple methods to ensure metadata never shows
    let cleanText = text;

    // Method 1: Extract everything after "Message:" if present
    if (cleanText.includes('Message:')) {
        cleanText = cleanText.split('Message:').slice(1).join('Message:');
    }

    // Method 2: Remove any remaining metadata patterns
    cleanText = cleanText.replace(/^=?Talking to:[^M]*Message:/gi, '');
    cleanText = cleanText.replace(/^=?\(Talking to[^)]*\)\s*/gi, '');

    // Method 3: Remove any leading "=Talking" patterns
    cleanText = cleanText.replace(/^=?Talking[^:]*:[^:]*:/gi, '');

    // Method 4: Remove any orphaned closing parenthesis at the start
    cleanText = cleanText.replace(/^\)\s*/g, '');

    // Final cleanup: trim whitespace
    cleanText = cleanText.trim();

    const formattedText = parseRoleplayText(cleanText, isUser);

    if (isUser) {
        return (
            <View style={styles.userContainer}>
                <View style={[styles.userBubble, { backgroundColor: theme.primary }]}>
                    <Text style={styles.userText}>{formattedText}</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.aiContainer}>
            {avatarUri && (
                <Image source={{ uri: avatarUri }} style={styles.avatar} contentFit="cover" />
            )}
            <View style={[styles.aiBubble, { backgroundColor: theme.card }]}>
                <ThemedText style={styles.aiText}>{formattedText}</ThemedText>
            </View>
        </View>
    );
});

MessageBubble.displayName = 'MessageBubble';

const styles = StyleSheet.create({
    userContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    userBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
        borderTopRightRadius: 4,
    },
    userText: {
        fontSize: 15,
        lineHeight: 20,
        color: '#fff',
    },
    aiContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        maxWidth: '80%',
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    aiBubble: {
        flex: 1,
        padding: 12,
        borderRadius: 16,
        borderTopLeftRadius: 4,
    },
    aiText: {
        fontSize: 15,
        lineHeight: 20,
    },
    roleplayAction: {
        fontStyle: 'italic',
        opacity: 0.85,
    },
});
