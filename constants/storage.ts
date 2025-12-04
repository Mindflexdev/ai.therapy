import AsyncStorage from '@react-native-async-storage/async-storage';
import { Character } from './data';

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
        const data = await AsyncStorage.getItem(STORAGE_KEYS.PUBLIC_CHARACTERS);
        return data ? JSON.parse(data) : [];
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
