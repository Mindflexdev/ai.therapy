import { AppState, Platform } from 'react-native';
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Polyfill window for Supabase in case it's missing (e.g. SSR)
if (typeof window === 'undefined') {
    // @ts-ignore
    global.window = {
        location: {
            href: '',
            origin: '',
            search: '',
        },
        navigator: {
            userAgent: 'node',
        },
    };
}

const supabaseUrl = 'https://cxzzakslsiynhjeyhejo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4enpha3Nsc2l5bmhqZXloZWpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4Mzk3ODcsImV4cCI6MjA4MDQxNTc4N30.ve5Vijc954mg-OVHwj3HCF1cfE3Lkm2zMECWUlJWE7Y';

// Custom storage adapter to handle SSR/Node environments
const storageAdapter = {
    getItem: (key: string) => {
        if (typeof window === 'undefined') return null;
        return AsyncStorage.getItem(key);
    },
    setItem: (key: string, value: string) => {
        if (typeof window === 'undefined') return;
        return AsyncStorage.setItem(key, value);
    },
    removeItem: (key: string) => {
        if (typeof window === 'undefined') return;
        return AsyncStorage.removeItem(key);
    },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: storageAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true, // CRITICAL: Must be true for OAuth to work!
    },
});

// Tells Supabase Auth to continuously refresh the session automatically
// if the app is in the foreground. When this is added, you will continue
// to receive `onAuthStateChange` events with the `TOKEN_REFRESHED` or
// `SIGNED_OUT` event if the user's session is terminated. This should
// only be registered once.
AppState.addEventListener('change', (state) => {
    if (state === 'active') {
        supabase.auth.startAutoRefresh();
    } else {
        supabase.auth.stopAutoRefresh();
    }
});
