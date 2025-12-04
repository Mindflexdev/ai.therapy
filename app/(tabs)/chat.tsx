import React from 'react';
import { StyleSheet, View, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { MOCK_CHATS, ChatConversation } from '@/constants/data';

export default function ChatScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const renderChatItem = ({ item }: { item: ChatConversation }) => (
        <TouchableOpacity
            style={[styles.chatItem, { backgroundColor: theme.background }]}
            onPress={() => router.push(`/conversation/${item.characterId}` as any)}>
            <Image source={{ uri: item.characterImage }} style={styles.avatar} contentFit="cover" />
            <View style={styles.chatInfo}>
                <ThemedText type="defaultSemiBold" style={styles.characterName}>
                    {item.characterName}
                </ThemedText>
                <ThemedText style={styles.lastMessage} numberOfLines={1}>
                    {item.lastMessage}
                </ThemedText>
            </View>
            <ThemedText style={styles.timestamp}>{item.timestamp}</ThemedText>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <View style={styles.header}>
                <ThemedText type="title" style={styles.title}>
                    Chats
                </ThemedText>
                <View style={styles.headerIcons}>
                    <TouchableOpacity style={styles.iconButton}>
                        <IconSymbol name="magnifyingglass" size={24} color={theme.text} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={[styles.searchContainer, { backgroundColor: theme.card }]}>
                <IconSymbol name="magnifyingglass" size={20} color={theme.icon} />
                <TextInput
                    style={[styles.searchInput, { color: theme.text }]}
                    placeholder="Search"
                    placeholderTextColor={theme.icon}
                />
            </View>

            <FlatList
                data={MOCK_CHATS}
                renderItem={renderChatItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.chatList}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    headerIcons: {
        flexDirection: 'row',
        gap: 16,
    },
    iconButton: {
        padding: 8,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 24,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    chatList: {
        paddingHorizontal: 16,
    },
    chatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 12,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    chatInfo: {
        flex: 1,
        gap: 4,
    },
    characterName: {
        fontSize: 16,
    },
    lastMessage: {
        fontSize: 14,
        opacity: 0.7,
    },
    timestamp: {
        fontSize: 12,
        opacity: 0.5,
    },
});
