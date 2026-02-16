import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const SUPABASE_URL = 'https://tazrriepmnpqoutdxubt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhenJyaWVwbW5wcW91dGR4dWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyMDIyNTEsImV4cCI6MjA4Njc3ODI1MX0.ShLuwWwgJojhWW514IREdjBczGOYvZX6MJKhKUehJYs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: Platform.OS === 'web',
    },
});
