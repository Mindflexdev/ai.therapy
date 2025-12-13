import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const N8N_WEBHOOK_URL = 'https://mindflex.app.n8n.cloud/webhook/2b9dd8c6-5463-48b5-aa02-f8dad1aabdd4';

export const PROFILE_CACHE_KEYS = {
    ANALYTICS: 'profile_analytics_cache',
    USER_DATA: 'profile_user_data_cache',
    LAST_FETCH: 'profile_last_fetch_timestamp'
};

export interface AnalyticsData {
    id: string;
    value: number;
    status: string;
    trend: string;
    key_insight?: string;
    sub_dimensions?: any[];
}

export const ProfileService = {
    /**
     * Fetches user profile data (name, avatar, message count)
     * silent: if true, suppresses errors
     */
    fetchUserData: async (silent = false) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return null;

            const { data, error } = await supabase
                .from('users')
                .select('message_count, full_name, avatar_url, preferred_language')
                .eq('id', session.user.id)
                .single();

            if (data && !error) {
                const userData = {
                    messageCount: data.message_count || 0,
                    userName: data.full_name || session.user.email || 'User',
                    avatarUrl: data.avatar_url,
                    language: data.preferred_language
                };

                // Cache immediately
                AsyncStorage.setItem(PROFILE_CACHE_KEYS.USER_DATA, JSON.stringify(userData));
                return userData;
            }
        } catch (e) {
            if (!silent) console.error('ProfileService: Error fetching user data', e);
        }
        return null;
    },

    /**
     * Fetches analytics data (from Supabase cache mostly)
     * Does NOT trigger n8n analysis unless explicitly requested (expensive)
     */
    prefetchAnalytics: async (silent = false) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            // Check Supabase 'user_analytics' table
            const { data: existingData, error } = await supabase
                .from('user_analytics')
                .select('*')
                .eq('user_id', session.user.id)
                .single();

            if (existingData) {
                // Process similar to profile.tsx logic
                // (Simplified for prefetch: just caching the raw result isn't enough because UI expects processed 'trackingData')
                // For now, let's just Cache the DB result if we want, OR
                // more importantly, we might just want to 'warm' the Supabase connection.

                // Ideally, we replicate the parsing logic here to allow full background update.
                // For "Eager Prefetching", even just getting it into HTTP cache or Supabase client cache helps.

                // Let's do a lightweight parse to update AsyncStorage
                let trackingData = null;
                let insight = "Welcome back!";
                let lastUpdated = existingData.last_updated_at;

                if (existingData.output) {
                    trackingData = existingData.output.tracking_data;
                    insight = existingData.output.daily_insight || insight;
                } else if (existingData.current_scores) {
                    trackingData = existingData.current_scores;
                    insight = existingData.current_insight || insight;
                }

                if (trackingData) {
                    // Process trends (simplified: skip trend calc for prefetch or do it if we have previous)
                    // To keep it safe, let's just cache what we have. 
                    // The UI creates the "trend" strings. We can store raw data if we change the keys,
                    // but to stay compatible with current UI:

                    // We will skip complex Transfrom here to avoid code duplication bugs.
                    // The Strategy 2 is sending a request.
                }
            }
        } catch (e) {
            if (!silent) console.warn('ProfileService: Prefetch error', e);
        }
    }
};
