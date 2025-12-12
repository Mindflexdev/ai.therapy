import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Character } from './data';

const STORAGE_KEYS = {
    USER_CHARACTERS: '@therapy_ai_user_characters',
    PUBLIC_CHARACTERS: '@therapy_ai_public_characters',
};

export interface UserCharacter extends Character {
    goal?: string;
    createdAt: string;
    isPublic: boolean;
    greeting: string;
    imageDescription?: string;
    therapyStyles?: string[];
}

// Save a newly created character
export const saveCharacter = async (character: UserCharacter): Promise<void> => {
    try {
        // Get existing characters
        const userChars = await getUserCharacters();
        const publicChars = await getPublicCharacters();

        // Add to user's characters
        userChars.push(character);
        await AsyncStorage.setItem(STORAGE_KEYS.USER_CHARACTERS, JSON.stringify(userChars));

        // If public, add to public pool
        if (character.isPublic) {
            publicChars.push(character);
            await AsyncStorage.setItem(STORAGE_KEYS.PUBLIC_CHARACTERS, JSON.stringify(publicChars));
        }

        // Invalidate grouped cache so next fetch gets fresh data
        await AsyncStorage.removeItem('@therapy_ai_grouped_characters');
    } catch (error) {
        console.error('Error saving character:', error);
        throw error;
    }
};

// Get all user's characters (both public and private)
export const getUserCharacters = async (): Promise<UserCharacter[]> => {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_CHARACTERS);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Error getting user characters:', error);
        return [];
    }
};

// Get all public characters (created by all users)
export const getPublicCharacters = async (): Promise<UserCharacter[]> => {
    try {
        // First try to get from local storage (for user created ones not yet synced)
        const localData = await AsyncStorage.getItem(STORAGE_KEYS.PUBLIC_CHARACTERS);
        const localChars = localData ? JSON.parse(localData) : [];

        // Then get from Supabase
        const { data: supabaseChars, error } = await supabase
            .from('characters')
            .select('*')
            .eq('is_public', true);

        if (error) {
            console.error('Error fetching public characters from Supabase:', error);
            return localChars;
        }

        // Merge them (deduplicating by ID if necessary, though IDs should be unique)
        // For now, just returning Supabase chars as primary source + local user chars
        return [...(supabaseChars || []), ...localChars];
    } catch (error) {
        console.error('Error getting public characters:', error);
        return [];
    }
};

// Delete a character
export const deleteCharacter = async (characterId: string): Promise<void> => {
    try {
        const userChars = await getUserCharacters();
        const publicChars = await getPublicCharacters();

        // Remove from user characters
        const updatedUserChars = userChars.filter(c => c.id !== characterId);
        await AsyncStorage.setItem(STORAGE_KEYS.USER_CHARACTERS, JSON.stringify(updatedUserChars));

        // Remove from public if exists
        const updatedPublicChars = publicChars.filter(c => c.id !== characterId);
        await AsyncStorage.setItem(STORAGE_KEYS.PUBLIC_CHARACTERS, JSON.stringify(updatedPublicChars));

        // Invalidate grouped cache
        await AsyncStorage.removeItem('@therapy_ai_grouped_characters');
    } catch (error) {
        console.error('Error deleting character:', error);
        throw error;
    }
};

// Get characters by topic from Supabase
export const getCharactersByTopic = async (topicId: string): Promise<UserCharacter[]> => {
    try {
        const { data, error } = await supabase
            .from('characters')
            .select('*')
            .eq('topic', topicId)
            .eq('is_public', true);

        if (error) {
            console.error('Error fetching characters:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error in getCharactersByTopic:', error);
        return [];
    }
};

// Get all characters grouped by topic from Supabase
export const getAllCharactersGroupedByTopic = async (): Promise<{ topicId: string, characters: UserCharacter[] }[]> => {
    try {
        // 1. Try to get from cache first for immediate display
        const CACHE_KEY = '@therapy_ai_grouped_characters';
        const cachedData = await AsyncStorage.getItem(CACHE_KEY);

        // If we have cached data, we can choosing to return it immediately
        // But we also want to refresh it.
        // For the UI to feel "fast always", we should return cached data if available
        // The calling component might not support a stream/subscription, so let's stick to returning a Promise.
        // However, if we return cached data, the UI won't update with fresh data until next reload.
        // A better approach for "fast always" is:
        // Return cache immediately if valid.
        // But since this function returns a Promise, we can't easily do "value then update".
        // Let's rely on the caller validation or just return cache if present and trigger a background refresh?
        // OR: We just do what we did for auth: Race network vs timeout, if timeout use cache?
        // actually, standard pattern:
        // If cache exists, return it.
        // Background: Fetch new data -> Update Cache.
        // Next app launch gets new data.
        // This makes it extremely fast.

        let initialResult = null;
        if (cachedData) {
            initialResult = JSON.parse(cachedData);
        }

        // 2. Fetch fresh data from Supabase (Optimized Select)
        const fetchPromise = supabase
            .from('characters')
            .select('id, name, image, description, topic, is_public') // Select only needed fields
            .eq('is_public', true)
            .order('topic');

        // If we have cache, we might want to just return it and let the background update happen?
        // But if the cache is empty/old, we want the fresh data.

        // Let's try to fetch. If it takes too long (> 1.5s) and we have cache, return cache.
        // If it's fast, return fresh.

        if (initialResult) {
            // We have cache. Kick off background update and return cache immediately.
            fetchPromise.then(({ data, error }) => {
                if (!error && data) {
                    // Group and save to cache
                    const grouped: Record<string, UserCharacter[]> = {};
                    data.forEach((char: any) => {
                        const topic = char.topic || 'other';
                        if (!grouped[topic]) grouped[topic] = [];
                        grouped[topic].push(char);
                    });
                    const result = Object.keys(grouped).map(topicId => ({
                        topicId,
                        characters: grouped[topicId]
                    }));
                    AsyncStorage.setItem(CACHE_KEY, JSON.stringify(result));
                }
            });
            return initialResult;
        }

        // No cache: Must wait for network
        const { data, error } = await fetchPromise;

        if (error) {
            console.error('Error fetching all characters:', error);
            return [];
        }

        // Group by topic
        const grouped: Record<string, UserCharacter[]> = {};
        data?.forEach((char: any) => {
            const topic = char.topic || 'other'; // Default to 'other' if no topic
            if (!grouped[topic]) {
                grouped[topic] = [];
            }
            grouped[topic].push(char);
        });

        // Convert to array format
        const result = Object.keys(grouped).map(topicId => ({
            topicId,
            characters: grouped[topicId]
        }));

        // Save to cache
        AsyncStorage.setItem(CACHE_KEY, JSON.stringify(result));

        return result;
    } catch (error) {
        console.error('Error in getAllCharactersGroupedByTopic:', error);
        return [];
    }
};

// Clear all data (for testing)
export const clearAllCharacters = async (): Promise<void> => {
    try {
        await AsyncStorage.multiRemove([
            STORAGE_KEYS.USER_CHARACTERS,
            STORAGE_KEYS.PUBLIC_CHARACTERS,
        ]);
    } catch (error) {
        console.error('Error clearing characters:', error);
        throw error;
    }
};
