import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PENDING_THERAPIST_KEY = 'pendingTherapist';

type PendingTherapist = { name: string; pendingMessage?: string } | null;

type AuthContextType = {
    isLoggedIn: boolean;
    user: User | null;
    session: Session | null;
    selectedTherapistId: string | null;
    showLoginModal: boolean;
    loading: boolean;
    pendingTherapist: PendingTherapist;
    loginWithOtp: (email: string) => Promise<{ error: any }>;
    loginWithGoogle: (therapistName?: string) => Promise<void>;
    logout: () => Promise<void>;
    selectTherapist: (id: string) => void;
    setShowLoginModal: (show: boolean) => void;
    setPendingTherapist: (therapist: PendingTherapist) => void;
    clearPendingTherapist: () => void;
};

const AuthContext = createContext<AuthContextType>({
    isLoggedIn: false,
    user: null,
    session: null,
    selectedTherapistId: null,
    showLoginModal: false,
    loading: true,
    pendingTherapist: null,
    loginWithOtp: async () => ({ error: null }),
    loginWithGoogle: async () => {},
    logout: async () => {},
    selectTherapist: () => {},
    setShowLoginModal: () => {},
    setPendingTherapist: () => {},
    clearPendingTherapist: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedTherapistId, setSelectedTherapistId] = useState<string | null>(null);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [pendingTherapist, setPendingTherapistState] = useState<PendingTherapist>(null);

    const setPendingTherapist = (therapist: PendingTherapist) => {
        setPendingTherapistState(therapist);
        if (therapist) {
            AsyncStorage.setItem(PENDING_THERAPIST_KEY, JSON.stringify(therapist));
        } else {
            AsyncStorage.removeItem(PENDING_THERAPIST_KEY);
        }
    };

    const clearPendingTherapist = () => {
        setPendingTherapistState(null);
        AsyncStorage.removeItem(PENDING_THERAPIST_KEY);
    };

    useEffect(() => {
        // On app load, check for pending therapist from before OAuth redirect
        AsyncStorage.getItem(PENDING_THERAPIST_KEY).then((value) => {
            if (value) {
                setPendingTherapistState(JSON.parse(value));
            }
        });

        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                if (session) {
                    setShowLoginModal(false);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const loginWithOtp = async (email: string) => {
        const { error } = await supabase.auth.signInWithOtp({ email });
        return { error };
    };

    const loginWithGoogle = async (therapistName?: string) => {
        // Save pending therapist before OAuth redirect (page will fully reload)
        // Preserve any existing pendingMessage (draft from chat input)
        if (therapistName) {
            setPendingTherapist({
                name: therapistName,
                pendingMessage: pendingTherapist?.pendingMessage,
            });
        }
        const redirectTo = Platform.OS === 'web'
            ? window.location.origin
            : 'ai-therapy://';
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo },
        });
        if (error) {
            console.error('Google login error:', error.message);
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setSelectedTherapistId(null);
    };

    const selectTherapist = (id: string) => setSelectedTherapistId(id);

    return (
        <AuthContext.Provider value={{
            isLoggedIn: !!session,
            user,
            session,
            selectedTherapistId,
            showLoginModal,
            loading,
            pendingTherapist,
            loginWithOtp,
            loginWithGoogle,
            logout,
            selectTherapist,
            setShowLoginModal,
            setPendingTherapist,
            clearPendingTherapist,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
