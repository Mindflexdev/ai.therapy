import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import { useFocusEffect } from 'expo-router';

// Define the Session type matching our new DB table
interface ChatSession {
    id: string;
    character_id: string;
    character_name?: string; // We might need to join/fetch this
    character_image?: string; // We might need to join/fetch this
    last_message: string;
    last_message_at: string;
    active_therapy_styles?: string[];
}

export default function ChatScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch sessions from Supabase
    const fetchSessions = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { data, error } = await supabase
                .from('chat_sessions')
                .select('*')
                .eq('user_id', session.user.id)
                .order('last_message_at', { ascending: false });

            if (error) throw error;

            // Enrich sessions with character data (name/image) 
            // Since we store character_id, we need to fetch their details or join.
            // For now, let's fetch characters separately or assume we have a cache.
            // Optimization: In a real app, use a Join. Here, we'll fetch characters.
            const characterIds = [...new Set(data.map(s => s.character_id))];
            let characterMap: Record<string, any> = {};

            if (characterIds.length > 0) {
                const { data: chars } = await supabase
                    .from('characters')
                    .select('id, name, image')
                    .in('id', characterIds);

                if (chars) {
                    chars.forEach(c => { characterMap[c.id] = c; });
                }
            }

            const enrichedSessions = data.map(s => ({
                ...s,
                character_name: characterMap[s.character_id]?.name || 'Unknown Character',
                character_image: characterMap[s.character_id]?.image,
            }));

            setSessions(enrichedSessions);
        } catch (error) {
            console.error('Error fetching chats:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    // Refresh when tab comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchSessions();
        }, [])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchSessions();
    }, []);

    const renderChatItem = ({ item }: { item: ChatSession }) => {
        const timeString = new Date(item.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return (
            <TouchableOpacity
                style={[styles.chatItem, { backgroundColor: theme.background }]}
                onPress={() => router.push(`/conversation/${item.character_id}` as any)}>
                <Image
                    source={{ uri: item.character_image || 'https://via.placeholder.com/150' }}
                    style={styles.avatar}
                    contentFit="cover"
                />
                <View style={styles.chatInfo}>
                    <ThemedText type="defaultSemiBold" style={styles.characterName}>
                        {item.character_name || item.character_id}
                    </ThemedText>
                    <ThemedText style={styles.lastMessage} numberOfLines={1}>
                        {item.last_message || 'Start a conversation...'}
                    </ThemedText>
                </View>
                <ThemedText style={styles.timestamp}>{timeString}</ThemedText>
            </TouchableOpacity>
        )
    };

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

            {isLoading && sessions.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <FlatList
                    data={sessions}
                    renderItem={renderChatItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.chatList}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <View style={{ padding: 20, alignItems: 'center' }}>
                            <ThemedText style={{ opacity: 0.6 }}>No active chats yet.</ThemedText>
                        </View>
                    }
                />
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
