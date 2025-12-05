import AsyncStorage from '@react-native-async-storage/async-storage';
import { Character } from './data';
import { supabase } from '@/lib/supabase';

const STORAGE_KEYS = {
    USER_CHARACTERS: '@therapy_ai_user_characters',
    PUBLIC_CHARACTERS: '@therapy_ai_public_characters',
};

export interface UserCharacter extends Character {
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
        const { data, error } = await supabase
            .from('characters')
            .select('*')
            .eq('is_public', true)
            .order('topic'); // Order by topic to group them easily

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
        return Object.keys(grouped).map(topicId => ({
            topicId,
            characters: grouped[topicId]
        }));
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
