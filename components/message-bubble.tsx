import { ThemedText } from '@/components/themed-text';
import { Image } from 'expo-image';
import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';

interface MessageBubbleProps {
    text: string;
    isUser: boolean;
    avatarUri?: string;
    theme: any;
}

export const MessageBubble = memo(({ text, isUser, avatarUri, theme }: MessageBubbleProps) => {
    if (isUser) {
        return (
            <View style={styles.userContainer}>
                <View style={[styles.userBubble, { backgroundColor: theme.primary }]}>
                    <ThemedText style={styles.userText}>{text}</ThemedText>
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
                <ThemedText style={styles.aiText}>{text}</ThemedText>
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
});
