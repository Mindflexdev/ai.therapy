import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Keyboard, Platform, Alert, Animated, Easing, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { Theme } from '../../src/constants/Theme';
import { ChatBubble } from '../../src/components/ChatBubble';
import { SuccessOverlay, SetupOverlay } from '../../src/components/SuccessOverlay';
import { Menu, Phone, Video, Plus, Camera, Mic, ChevronLeft, Square, ArrowUp, Loader } from 'lucide-react-native';

// expo-av and speech are optional — the native module may not be in the dev build.
let Audio: any = null;
let voiceAvailable = false;
let startRecording: any = async () => { throw new Error('Voice recording is not available in this build.'); };
let stopRecording: any = async () => { throw new Error('Voice recording is not available.'); };
let transcribeAudio: any = async () => { throw new Error('Voice recording is not available.'); };
try {
    Audio = require('expo-av').Audio;
    const speech = require('../../src/lib/speech');
    startRecording = speech.startRecording;
    stopRecording = speech.stopRecording;
    transcribeAudio = speech.transcribeAudio;
    voiceAvailable = true;
} catch (e) {
    console.warn('expo-av not available, voice recording disabled');
}
import { useNavigation, useLocalSearchParams, useRouter } from 'expo-router';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useAuth } from '../../src/context/AuthContext';
import { supabase } from '../../src/lib/supabase';
import LoginScreen from './login';

const INITIAL_MESSAGES = [
    { id: '1', text: 'Hello, I am [Name]. How can I support you today?', isUser: false, time: '14:20' },
];

// Hardcoded Einstellungsagent questions — shown locally, no AI call needed.
// After all 4 are answered, the edge function takes over at problemfokus.
const EINSTELLUNGS_QUESTIONS = [
    {
        text: 'How should I come across in our conversation?',
        options: ['Warm and gentle', 'Direct and honest', 'Laid-back and casual'],
    },
    {
        text: 'How deep do you want to go today?',
        options: ['Focus on what I can do', 'Understand why I feel this way', 'Get to the root of it'],
    },
    {
        text: 'When things get uncomfortable, how should I respond?',
        options: ['Ease off, give me room', 'Hold steady, stay with me', 'Push through, don\'t let me avoid it'],
    },
    {
        text: 'What would make this conversation feel worthwhile?',
        options: ['Feeling heard and understood', 'Seeing things differently', 'Something concrete to try'],
    },
];

// AI chat: onboarding uses phase-based prompts via chat-onboarding edge function,
// regular therapy uses chatWithAgent via together-proxy edge function.
import { chatWithAgent, chatOnboarding, ChatMessage } from '../../src/lib/together';

// Transform second-person ("You are scared") → first-person ("I am scared")
// Used when a user taps a problemstellung challenge card so the message reads naturally.
const transformToFirstPerson = (text: string): string => {
    // Order matters: longer phrases first to avoid partial replacements
    const replacements: [RegExp, string][] = [
        [/\bYou are\b/g, 'I am'],
        [/\byou are\b/g, 'I am'],
        [/\bYou feel\b/g, 'I feel'],
        [/\byou feel\b/g, 'I feel'],
        [/\bYou have\b/g, 'I have'],
        [/\byou have\b/g, 'I have'],
        [/\bYou don't\b/g, "I don't"],
        [/\byou don't\b/g, "I don't"],
        [/\bYou do not\b/g, 'I do not'],
        [/\byou do not\b/g, 'I do not'],
        [/\bYou can't\b/g, "I can't"],
        [/\byou can't\b/g, "I can't"],
        [/\bYou cannot\b/g, 'I cannot'],
        [/\byou cannot\b/g, 'I cannot'],
        [/\bYou were\b/g, 'I was'],
        [/\byou were\b/g, 'I was'],
        [/\bYou've\b/g, "I've"],
        [/\byou've\b/g, "I've"],
        [/\bYou'll\b/g, "I'll"],
        [/\byou'll\b/g, "I'll"],
        [/\bYou would\b/g, 'I would'],
        [/\byou would\b/g, 'I would'],
        [/\bYou could\b/g, 'I could'],
        [/\byou could\b/g, 'I could'],
        [/\bYou should\b/g, 'I should'],
        [/\byou should\b/g, 'I should'],
        [/\bYou need\b/g, 'I need'],
        [/\byou need\b/g, 'I need'],
        [/\bYou want\b/g, 'I want'],
        [/\byou want\b/g, 'I want'],
        [/\bYou think\b/g, 'I think'],
        [/\byou think\b/g, 'I think'],
        [/\bYou know\b/g, 'I know'],
        [/\byou know\b/g, 'I know'],
        [/\bYou seem\b/g, 'I seem'],
        [/\byou seem\b/g, 'I seem'],
        [/\bYou tend\b/g, 'I tend'],
        [/\byou tend\b/g, 'I tend'],
        [/\bYou struggle\b/g, 'I struggle'],
        [/\byou struggle\b/g, 'I struggle'],
        [/\bYou avoid\b/g, 'I avoid'],
        [/\byou avoid\b/g, 'I avoid'],
        [/\bYour\b/g, 'My'],
        [/\byour\b/g, 'my'],
        [/\bYourself\b/g, 'Myself'],
        [/\byourself\b/g, 'myself'],
        // Catch-all for remaining "You <verb>" at start of sentence
        [/\bYou\b/g, 'I'],
        [/\byou\b/g, 'I'],
    ];
    let result = text;
    for (const [pattern, replacement] of replacements) {
        result = result.replace(pattern, replacement);
    }
    return result;
};


import { THERAPIST_IMAGES, THERAPISTS } from '../../src/constants/Therapists';

// --- Input validation constants ---
const MAX_MESSAGE_LENGTH = 2000;
const RATE_LIMIT_MS = 2000; // minimum 2 seconds between messages

// Crisis keywords/phrases for detection (lowercase)
const CRISIS_PATTERNS = [
    'kill myself', 'kill me', 'end my life', 'end it all',
    'suicide', 'suicidal', 'want to die', 'wanna die',
    'don\'t want to live', 'dont want to live',
    'no reason to live', 'better off dead',
    'take my own life', 'taking my life',
    'self harm', 'self-harm', 'hurt myself',
    'nicht mehr leben', 'umbringen', 'selbstmord', 'suizid',
    'lebensmüde',
];

const detectCrisis = (text: string): boolean => {
    const lower = text.toLowerCase();
    return CRISIS_PATTERNS.some(pattern => lower.includes(pattern));
};

// Crisis resources banner component
const CrisisResourcesBanner = ({ onDismiss }: { onDismiss: () => void }) => (
    <View style={crisisBannerStyles.container}>
        <Text style={crisisBannerStyles.title}>💛 You're not alone</Text>
        <Text style={crisisBannerStyles.text}>
            If you're in crisis or need immediate support, please reach out:
        </Text>
        <TouchableOpacity onPress={() => Linking.openURL('tel:08001110111')}>
            <Text style={crisisBannerStyles.link}>🇩🇪 Germany: 0800 111 0 111 (Telefonseelsorge)</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL('tel:08001110222')}>
            <Text style={crisisBannerStyles.link}>🇩🇪 Germany: 0800 111 0 222</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL('https://findahelpline.com')}>
            <Text style={crisisBannerStyles.link}>🌍 International: findahelpline.com</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL('tel:988')}>
            <Text style={crisisBannerStyles.link}>🇺🇸 US: 988 Suicide & Crisis Lifeline</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDismiss} style={crisisBannerStyles.dismissButton}>
            <Text style={crisisBannerStyles.dismissText}>Understood</Text>
        </TouchableOpacity>
    </View>
);

const crisisBannerStyles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(255, 200, 50, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(255, 200, 50, 0.3)',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 12,
        marginVertical: 8,
    },
    title: {
        color: '#FFD700',
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 6,
    },
    text: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 13,
        marginBottom: 8,
        lineHeight: 18,
    },
    link: {
        color: '#7CB9FF',
        fontSize: 14,
        paddingVertical: 4,
        textDecorationLine: 'underline',
    },
    dismissButton: {
        alignSelf: 'flex-end',
        marginTop: 8,
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    dismissText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 13,
    },
});

// Generate a session ID synchronously, then persist/load via AsyncStorage
const generateSessionId = () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export default function ChatScreen() {
    const { name } = useLocalSearchParams();
    const therapistName = (name as string) || 'Marcus';
    const therapistImage = THERAPIST_IMAGES[therapistName];

    const [messages, setMessages] = useState<any[]>([]);
    const [isTyping, setIsTyping] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const recordingRef = useRef<Audio.Recording | null>(null);
    const [inputText, setInputText] = useState('');
    const navigation = useNavigation<DrawerNavigationProp<any>>();
    const router = useRouter();
    const { showLoginModal, setShowLoginModal, isLoggedIn, user, setPendingTherapist, pendingTherapist, clearPendingTherapist, selectedTherapistId, selectTherapist } = useAuth();

    // Keep selectedTherapistId in sync with the therapist we're actually chatting with
    useEffect(() => {
        const currentTherapist = THERAPISTS.find(t => t.name === therapistName);
        if (currentTherapist && currentTherapist.id !== selectedTherapistId) {
            selectTherapist(currentTherapist.id, true);
        }
    }, [therapistName]);
    const sessionId = useRef(generateSessionId());
    const lastSendTime = useRef(0);
    const flatListRef = useRef<FlatList>(null);

    // Audio metering: levels array drives the waveform bars directly
    const NUM_WAVEFORM_BARS = 25;
    const [waveformLevels, setWaveformLevels] = useState<number[]>(new Array(NUM_WAVEFORM_BARS).fill(2));

    // Einstellungsagent: tracks which hardcoded question to show next (0-3).
    // When >= 4, einstellungs is done and we switch to the edge function.
    const [einstellungsIndex, setEinstellungsIndex] = useState(0);
    const einstellungsDone = useRef(false); // ref to survive closures

    // Setup overlay — shown after all 4 einstellungs questions are answered.
    // Two-phase: loading (while AI call runs) → success (when response arrives).
    const [showSetupOverlay, setShowSetupOverlay] = useState(false);
    const [isSetupReady, setIsSetupReady] = useState(false);

    // Onboarding state: new users go through the onboarding flow.
    // Once onboarding completes (paywall phase), isOnboarding becomes false.
    const [isOnboarding, setIsOnboarding] = useState(true);
    const [onboardingPhase, setOnboardingPhase] = useState('onboarding_einstellungs');

    // Auto-scroll to bottom when messages change or typing indicator appears
    useEffect(() => {
        const timer = setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
        return () => clearTimeout(timer);
    }, [messages, isTyping]);

    // Load persisted session ID from AsyncStorage (or save the new one)
    useEffect(() => {
        (async () => {
            try {
                const stored = await AsyncStorage.getItem('chat_session_id');
                if (stored) {
                    sessionId.current = stored;
                } else {
                    await AsyncStorage.setItem('chat_session_id', sessionId.current);
                }
            } catch {}
        })();
    }, []);
    const [showCrisisBanner, setShowCrisisBanner] = useState(false);

    // Fetch existing messages from Supabase on mount
    const fetchMessages = async () => {
        if (!isLoggedIn || !user) return;
        
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('session_id', sessionId.current)
                .eq('character_name', therapistName)
                .order('created_at', { ascending: true });
            
            if (error) {
                console.error('Error fetching messages:', error);
                return;
            }
            
            if (data && data.length > 0) {
                const loadedMessages = data.map((msg: any) => ({
                    id: msg.id.toString(),
                    text: msg.content,
                    isUser: msg.role === 'human',
                    time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                }));
                setMessages(loadedMessages);

                // Detect onboarding state from existing message count.
                // The onboarding has ~10 user messages (einstellungs 2, problemfokus 3,
                // problemstellung 1, loesungsfokus 3, paywall 1). If user has sent 11+
                // user messages, they've passed the paywall and are in regular therapy.
                const userMsgCount = data.filter((m: any) => m.role === 'human').length;
                if (userMsgCount > 23) {
                    setIsOnboarding(false);
                }
            }
        } catch (err) {
            console.error('Error loading messages:', err);
        }
    };

    // Save message to Supabase
    const saveMessage = async (content: string, messageType: 'user' | 'ai') => {
        if (!isLoggedIn || !user) return;
        
        try {
            const { error } = await supabase
                .from('messages')
                .insert({
                    session_id: sessionId.current,
                    role: messageType === 'user' ? 'human' : 'ai',
                    content: content,
                    character_name: therapistName,
                    user_id: user.id,
                });
            
            if (error) {
                console.error('Error saving message:', error);
            }
        } catch (err) {
            console.error('Error saving message:', err);
        }
    };

    // Load messages on mount when logged in
    useEffect(() => {
        if (isLoggedIn) {
            fetchMessages();
        }
    }, [isLoggedIn, user, therapistName]);

    // Restore draft message from pendingTherapist (saved before OAuth redirect)
    // Only auto-send if the user is actually logged in
    // IMPORTANT: Do NOT clear pendingTherapist when not logged in — the user may be
    // about to log in via OAuth, and we need the data to survive the redirect!
    const hasSentDraft = useRef(false);
    useEffect(() => {
        if (isLoggedIn && pendingTherapist?.pendingMessage && !hasSentDraft.current) {
            hasSentDraft.current = true;
            const draftMessage = pendingTherapist.pendingMessage;
            clearPendingTherapist();
            // Wait for the initial therapist greeting to load, then send the draft
            const timer = setTimeout(() => {
                const userMessage = {
                    id: `draft-${Date.now()}`,
                    text: draftMessage,
                    isUser: true,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                };
                setMessages(prev => [...prev, userMessage]);
                // Send to Together AI and get response
                sendMessageToAI(draftMessage);
            }, 1800); // Slightly after the 1500ms greeting delay
            return () => clearTimeout(timer);
        }
    }, [isLoggedIn]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsTyping(false);
            setMessages([{
                id: '1',
                text: `Hi, I'm ${therapistName}! \n\nAlthough I'm not a therapist, I was developed by psychologists – as a companion for your mental health who understands you and adapts to your needs. Unlike ChatGPT, I use various psychological approaches to support you more specifically. The first session with me is currently free. This project lives from people like you. If it helps you, I would be happy about your support. Your trust is important to me: Everything you write here remains private & secure.\n\nDo you want to start your onboarding?`,
                isUser: false,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                agent: 'Greeting',
                quickReplies: ['Yes, let\'s start'],
            }]);
        }, 2500); // Increased delay by 1s as requested
        return () => clearTimeout(timer);
    }, []);


    // Fetch agent system prompt from Supabase (therapy_agents table)
    const fetchAgentPrompt = async (name: string): Promise<string> => {
        try {
            const { data, error } = await supabase
                .from('therapy_agents')
                .select('core_prompt, tone, skills')
                .eq('name', name)
                .single();
            
            if (error || !data) {
                console.error('Error fetching agent:', error);
                // Fallback prompts
                const fallbacks: Record<string, string> = {
                    Marcus: 'You are Marcus, a warm and grounded AI mental health companion with a CBT-influenced approach.',
                    Sarah: 'You are Sarah, an empathetic and gentle AI mental health companion with a trauma-informed approach.',
                    Liam: 'You are Liam, an analytical yet warm AI mental health companion with a behavioral approach.',
                    Emily: 'You are Emily, an AI mental health companion with existential and spiritual depth.',
                };
                return fallbacks[name] || fallbacks.Marcus;
            }

            // Compose system prompt: core_prompt + tone + skills
            let prompt = data.core_prompt;
            if (data.tone) {
                prompt += `\n\nTone: ${data.tone}`;
            }
            if (data.skills && Array.isArray(data.skills) && data.skills.length > 0) {
                const skillDescriptions = data.skills
                    .map((skill: any) => skill.name ? `- ${skill.name}${skill.description ? ': ' + skill.description : ''}` : null)
                    .filter(Boolean)
                    .join('\n');
                if (skillDescriptions) {
                    prompt += `\n\nSkills:\n${skillDescriptions}`;
                }
            }
            return prompt;
        } catch (err) {
            console.error('Error:', err);
            return 'You are a helpful AI mental health companion.';
        }
    };

    // Send message to AI — routes between onboarding and regular therapy
    const sendMessageToAI = async (message: string) => {
        try {
            setIsTyping(true);

            let responseText: string;
            let agentSource: string;
            let onboardingUserMsgCount = 0; // track for lösungsfokus button logic

            if (isOnboarding && einstellungsIndex < EINSTELLUNGS_QUESTIONS.length) {
                // EINSTELLUNGSAGENT: hardcoded questions, no AI call needed.
                // Show the next question with its options after a short delay.
                const nextQ = EINSTELLUNGS_QUESTIONS[einstellungsIndex];
                responseText = nextQ.text;
                agentSource = 'onboarding_einstellungs';

                // Advance to next question
                setEinstellungsIndex(prev => prev + 1);

                // Save AI question to Supabase too
                await saveMessage(responseText, 'ai');

                // Build the message with hardcoded quick replies
                const aiMessage: any = {
                    id: `einst-${Date.now()}`,
                    text: responseText,
                    isUser: false,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    agent: agentSource,
                    quickReplies: nextQ.options,
                };

                setMessages(prev => [...prev, aiMessage]);
                setIsTyping(false);
                return; // Skip the rest — no AI call, no parsing needed

            } else if (isOnboarding) {
                // ONBOARDING FLOW (post-einstellungs): send full history to
                // chat-onboarding edge function for problemfokus and beyond.

                const history: ChatMessage[] = messages.map((msg: any) => ({
                    role: msg.isUser ? 'user' as const : 'assistant' as const,
                    content: msg.text,
                }));

                // Show setup overlay on first edge function call (transition from einstellungs).
                // Phase 1 (loading) shows immediately; phase 2 (success) when AI responds.
                if (!einstellungsDone.current) {
                    einstellungsDone.current = true;
                    setShowSetupOverlay(true);
                    setIsSetupReady(false);
                }

                const result = await chatOnboarding(message, therapistName, history);

                // Flip overlay to success phase (confetti) — einstellungsDone.current
                // tells us if this is the first call where the overlay was shown.
                // We can't rely on showSetupOverlay state (stale in closure).
                setIsSetupReady(true);

                responseText = result.text;
                agentSource = `${result.phase} #${result.userMessageCount}`;
                onboardingUserMsgCount = result.userMessageCount;
                setOnboardingPhase(result.phase);

                console.log(`[onboarding] phase=${result.phase}, userMsgs=${result.userMessageCount}`);
            } else {
                // REGULAR THERAPY: use the therapy agent's core_prompt
                const systemPrompt = await fetchAgentPrompt(therapistName);
                const recentHistory: ChatMessage[] = messages.slice(-20).map((msg: any) => ({
                    role: msg.isUser ? 'user' as const : 'assistant' as const,
                    content: msg.text,
                }));

                const result = await chatWithAgent(message, {
                    name: therapistName,
                    systemPrompt,
                }, recentHistory);
                responseText = result.text;
                agentSource = `${therapistName} Agent`;
            }

            // Parse *..* options from AI response into quick reply buttons
            const parseQuickReplies = (text: string): { cleanText: string; replies: string[] } => {
                const replies: string[] = [];
                // Match lines that are just *text* (allow leading/trailing whitespace)
                const cleanText = text.replace(/^\s*\*([^*]+)\*\s*$/gm, (_, option) => {
                    replies.push(option.trim());
                    return '';
                }).replace(/\n{3,}/g, '\n\n').trim();
                return { cleanText, replies };
            };

            // Parse challenge options from problemstellung: *Title: description*
            const parseChallengeOptions = (text: string): { cleanText: string; challenges: { title: string; description: string; fullText: string }[] } => {
                const challenges: { title: string; description: string; fullText: string }[] = [];
                const cleanText = text.replace(/^\s*\*([^*]+)\*\s*$/gm, (_, content) => {
                    const colonIdx = content.indexOf(':');
                    if (colonIdx > 0) {
                        const title = content.substring(0, colonIdx).trim();
                        const description = content.substring(colonIdx + 1).trim();
                        challenges.push({ title, description, fullText: content.trim() });
                    }
                    return '';
                }).replace(/\n{3,}/g, '\n\n').trim();
                return { cleanText, challenges };
            };

            const isProblemstellung = agentSource.startsWith('onboarding_problemstellung');
            const isLoesungsfokusSetup = agentSource.startsWith('onboarding_loesungsfokus') && onboardingUserMsgCount === 12;
            const showUpgrade = agentSource.startsWith('onboarding_paywall') || agentSource.startsWith('onboarding_sales');

            let displayText = responseText;
            let quickReplies: string[] | undefined;
            let challengeOptions: { title: string; description: string; fullText: string }[] | undefined;

            if (isProblemstellung) {
                // Problemstellung: parse challenge cards + dismiss keyboard
                const parsed = parseChallengeOptions(responseText);
                if (parsed.challenges.length > 0) {
                    displayText = parsed.cleanText;
                    challengeOptions = parsed.challenges;
                }
                Keyboard.dismiss();
            }

            // Lösungsfokus setup: message 12 proposes a therapeutic approach.
            // Also catch retry responses (msg 13+) when user previously said "No, different approach".
            const isLoesungsfokusRetry = agentSource.startsWith('onboarding_loesungsfokus')
                && onboardingUserMsgCount > 12
                && message.toLowerCase().includes('different approach');
            if (isLoesungsfokusSetup || isLoesungsfokusRetry) {
                // Add Yes/No buttons so user can accept or request a different approach
                quickReplies = ['Yes', 'No, different approach'];
                Keyboard.dismiss();
            }

            // Parse paywall summary into structured sections for the card design
            let paywallSummary: { intro: string; sections: { heading: string; bullets: string[] }[] } | undefined;
            if (showUpgrade && agentSource.startsWith('onboarding_paywall')) {
                const lines = responseText.split('\n').map(l => l.trim()).filter(Boolean);
                const introLines: string[] = [];
                const sections: { heading: string; bullets: string[] }[] = [];
                let currentSection: { heading: string; bullets: string[] } | null = null;

                for (const line of lines) {
                    // Detect section headings (e.g. "What we achieved:" or "How we would continue:")
                    if (line.endsWith(':') && !line.startsWith('-') && !line.startsWith('•')) {
                        if (currentSection) sections.push(currentSection);
                        currentSection = { heading: line, bullets: [] };
                    } else if (currentSection && (line.startsWith('- ') || line.startsWith('• '))) {
                        currentSection.bullets.push(line.replace(/^[-•]\s*/, ''));
                    } else if (!currentSection) {
                        introLines.push(line);
                    }
                }
                if (currentSection) sections.push(currentSection);

                if (sections.length > 0) {
                    paywallSummary = {
                        intro: introLines.join('\n'),
                        sections,
                    };
                    displayText = ''; // card replaces the text
                }
                Keyboard.dismiss();
            }

            // Add AI response to messages
            const aiMessage: any = {
                id: `ai-${Date.now()}`,
                text: displayText,
                isUser: false,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                agent: agentSource,
                ...(showUpgrade && { upgradeButton: true }),
                ...(quickReplies && { quickReplies }),
                ...(challengeOptions && { challengeOptions }),
                ...(paywallSummary && { paywallSummary }),
            };

            setMessages(prev => [...prev, aiMessage]);
            saveMessage(responseText, 'ai');
        } catch (error: any) {
            console.error('Error sending message to AI:', error);
            const errorText = 'I apologize, but I am having trouble connecting right now. Please try again in a moment.';
            const errorMessage = {
                id: `error-${Date.now()}`,
                text: errorText,
                isUser: false,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages(prev => [...prev, errorMessage]);
            saveMessage(errorText, 'ai');
        } finally {
            setIsTyping(false);
        }
    };

    // Quick reply: user taps a button option — send it as their message
    const handleQuickReply = (text: string) => {
        if (!isLoggedIn) {
            setPendingTherapist({ name: therapistName, pendingMessage: text });
            setShowLoginModal(true);
            return;
        }

        Keyboard.dismiss();
        lastSendTime.current = Date.now();

        // Check if this was a challengeOption tap (problemstellung) — transform "You" → "I"
        const isChallengeOption = messages.some(msg =>
            msg.challengeOptions?.some((c: any) => c.fullText === text)
        );
        const displayText = isChallengeOption ? transformToFirstPerson(text) : text;

        const userMessage = {
            id: `qr-${Date.now()}`,
            text: displayText,
            isUser: true,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        // Remove quick replies AND challenge options from the message that was tapped (so buttons disappear)
        setMessages(prev => {
            const updated = prev.map(msg =>
                (msg.quickReplies || msg.challengeOptions)
                    ? { ...msg, quickReplies: undefined, challengeOptions: undefined }
                    : msg
            );
            return [...updated, userMessage];
        });

        saveMessage(displayText, 'user');
        sendMessageToAI(displayText);
    };

    const handleSend = () => {
        if (inputText.trim()) {
            const messageText = inputText.trim();

            // Length validation
            if (messageText.length > MAX_MESSAGE_LENGTH) {
                Alert.alert(
                    'Message too long',
                    `Please keep your message under ${MAX_MESSAGE_LENGTH} characters. Current: ${messageText.length}`,
                );
                return;
            }

            // Rate limiting
            const now = Date.now();
            if (now - lastSendTime.current < RATE_LIMIT_MS) {
                Alert.alert('Please wait', 'Please wait a moment before sending another message.');
                return;
            }

            // Check if user is logged in before sending
            if (!isLoggedIn) {
                setPendingTherapist({ name: therapistName, pendingMessage: messageText });
                setShowLoginModal(true);
                return;
            }

            // Crisis detection — surface resources but don't block
            if (detectCrisis(messageText)) {
                setShowCrisisBanner(true);
            }

            lastSendTime.current = now;

            const userMessage = {
                id: Date.now().toString(),
                text: messageText,
                isUser: true,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            
            setMessages(prev => [...prev, userMessage]);
            setInputText('');
            
            // Save user message to database BEFORE sending to AI
            saveMessage(messageText, 'user');
            
            // Send to Together AI and get response
            sendMessageToAI(messageText);
        }
    };

    // --- Voice recording handlers ---
    const handleStartRecording = async () => {
        try {
            const recording = await startRecording((metering: number) => {
                // Normalize dBFS (-60..0) to bar height (2..30px) and push into sliding window
                const clamped = Math.max(-60, Math.min(0, metering));
                const normalized = (clamped + 60) / 60;
                const height = 2 + normalized * 28;
                setWaveformLevels(prev => [...prev.slice(1), height]);
            });
            recordingRef.current = recording;
            setIsRecording(true);
        } catch (err: any) {
            console.error('Failed to start recording:', err);
            Alert.alert('Microphone Error', err.message || 'Could not start recording. Please check microphone permissions.');
        }
    };

    const handleCancelRecording = async () => {
        try {
            if (recordingRef.current) {
                await stopRecording(recordingRef.current);
                recordingRef.current = null;
            }
        } catch (err) {
            console.error('Error cancelling recording:', err);
        }
        setIsRecording(false);
        setWaveformLevels(new Array(NUM_WAVEFORM_BARS).fill(2));
    };

    const handleSendRecording = async () => {
        if (!recordingRef.current) return;

        setIsRecording(false);
        setIsTranscribing(true);
        setWaveformLevels(new Array(NUM_WAVEFORM_BARS).fill(2));

        try {
            const { uri, mimeType } = await stopRecording(recordingRef.current);
            recordingRef.current = null;

            const text = await transcribeAudio(uri, mimeType);
            if (text) {
                // Put transcribed text in the input so user can review/edit before sending
                setInputText(text);
            }
        } catch (err: any) {
            console.error('Transcription failed:', err);
            Alert.alert('Transcription Error', err.message || 'Could not transcribe audio. Please try again.');
        } finally {
            setIsTranscribing(false);
        }
    };

    const showComingSoon = () => {
        Alert.alert('Coming Soon', 'This feature is currently under development.');
    };

    const TypingBubble = () => (
        <View style={{
            alignSelf: 'flex-start',
            backgroundColor: Theme.colors.bubbles.therapist,
            borderRadius: Theme.borderRadius.l,
            borderBottomLeftRadius: 4,
            padding: Theme.spacing.m,
            marginLeft: Theme.spacing.m,
            marginBottom: Theme.spacing.m,
            marginTop: Theme.spacing.m,
        }}>
            <Text style={{ color: Theme.colors.text.secondary, fontSize: 12 }}>typing...</Text>
        </View>
    );

    const VoiceWaveform = () => (
        <View style={styles.waveformContainer}>
            {waveformLevels.map((height, i) => (
                <View
                    key={i}
                    style={[
                        styles.waveformBar,
                        { height }
                    ]}
                />
            ))}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.iconButton}>
                        <Menu size={24} color={Theme.colors.text.primary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.profileInfo} onPress={() => navigation.navigate('profile', { name: therapistName, image: therapistImage })}>
                        <View style={styles.avatarWrapper}>
                            <Image
                                source={therapistImage}
                                style={styles.avatar}
                                defaultSource={require('../../assets/adaptive-icon.png')}
                            />
                        </View>
                        <View>
                            <Text style={styles.name}>{therapistName}</Text>
                            <Text style={styles.status}>online</Text>
                        </View>
                    </TouchableOpacity>

                    <View style={styles.headerRight}>
                        <TouchableOpacity onPress={() => navigation.navigate('call', { name: therapistName, image: therapistImage })} style={styles.iconButton}>
                            <Phone size={22} color={Theme.colors.text.primary} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Chat Area */}
                <View style={styles.chatArea}>
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={(item) => item.id}
                        keyboardShouldPersistTaps="always"
                        renderItem={({ item }) => (
                            <ChatBubble
                                message={item}
                                onUpgrade={() => router.push('/(main)/paywall')}
                                onQuickReply={handleQuickReply}
                            />
                        )}
                        contentContainerStyle={styles.messageList}
                        ListFooterComponent={isTyping ? <TypingBubble /> : null}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
                    />
                </View>

                {/* Crisis Resources Banner */}
                {showCrisisBanner && (
                    <CrisisResourcesBanner onDismiss={() => setShowCrisisBanner(false)} />
                )}

                {/* Character count warning */}
                {inputText.length > MAX_MESSAGE_LENGTH * 0.9 && (
                    <Text style={{
                        color: inputText.length > MAX_MESSAGE_LENGTH ? '#FF6B6B' : 'rgba(255,255,255,0.4)',
                        fontSize: 11,
                        textAlign: 'right',
                        paddingHorizontal: 16,
                        paddingBottom: 2,
                    }}>
                        {inputText.length}/{MAX_MESSAGE_LENGTH}
                    </Text>
                )}

                {/* Input Bar */}
                <View style={styles.inputBar}>
                    {isRecording ? (
                        <View style={styles.recordingRow}>
                            <TouchableOpacity onPress={handleCancelRecording} style={styles.stopButton}>
                                <Square size={16} color={Theme.colors.text.primary} fill={Theme.colors.text.primary} />
                            </TouchableOpacity>

                            <View style={styles.recordingWaveformWrapper}>
                                <VoiceWaveform />
                            </View>

                            <TouchableOpacity
                                onPress={handleSendRecording}
                                style={styles.recordingSendButton}
                            >
                                <ArrowUp size={20} color={Theme.colors.background} strokeWidth={3} />
                            </TouchableOpacity>
                        </View>
                    ) : isTranscribing ? (
                        <View style={styles.transcribingRow}>
                            <Text style={styles.transcribingText}>Transcribing...</Text>
                        </View>
                    ) : (
                        <>
                            <TouchableOpacity onPress={showComingSoon} style={styles.inputExtrasButton}>
                                <Plus size={24} color={Theme.colors.text.primary} />
                            </TouchableOpacity>

                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Message..."
                                    placeholderTextColor={Theme.colors.text.muted}
                                    value={inputText}
                                    onChangeText={setInputText}
                                    multiline
                                    maxLength={MAX_MESSAGE_LENGTH + 100} // soft buffer beyond limit
                                />
                            </View>

                            <View style={styles.rightIconsContainer}>
                                {!inputText.trim() && (
                                    <TouchableOpacity onPress={showComingSoon} style={styles.inputExtrasButton}>
                                        <Camera size={24} color={Theme.colors.text.primary} />
                                    </TouchableOpacity>
                                )}

                                <TouchableOpacity
                                    onPress={inputText.trim() ? handleSend : (voiceAvailable ? handleStartRecording : showComingSoon)}
                                    style={[styles.micButton, inputText.trim() && styles.recordingSendButton]}
                                >
                                    {inputText.trim() ? (
                                        <ArrowUp size={20} color={Theme.colors.background} strokeWidth={3} />
                                    ) : (
                                        <Mic size={24} color={Theme.colors.text.primary} />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            </KeyboardAvoidingView>

            {/* Login Modal */}
            {showLoginModal && <LoginScreen />}

            {/* Setup overlay — two-phase: loading (pulsing) → success (confetti).
                Shows after einstellungs, loading while AI runs, confetti when response arrives. */}
            {showSetupOverlay && (
                <SetupOverlay
                    therapistName={therapistName}
                    isReady={isSetupReady}
                    onDone={() => setShowSetupOverlay(false)}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Theme.spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.border,
    },
    iconButton: {
        padding: Theme.spacing.s,
    },
    profileInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: Theme.spacing.s,
    },
    avatarWrapper: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#333',
        marginRight: Theme.spacing.m,
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    name: {
        color: Theme.colors.text.primary,
        fontFamily: 'Inter-Bold',
        fontSize: 16,
    },
    status: {
        color: Theme.colors.success,
        fontSize: 12,
    },
    headerRight: {
        flexDirection: 'row',
    },
    chatArea: {
        flex: 1,
    },
    messageList: {
        paddingVertical: Theme.spacing.m,
    },
    inputBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Theme.spacing.s,
        paddingHorizontal: Theme.spacing.m,
        backgroundColor: Theme.colors.background,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    inputExtrasButton: {
        padding: Theme.spacing.xs,
    },
    rightIconsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 0,
    },
    transcribingRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 44,
    },
    transcribingText: {
        color: Theme.colors.text.muted,
        fontSize: 14,
        fontFamily: 'Inter-Regular',
    },
    recordingRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: Theme.spacing.m,
    },
    stopButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    recordingWaveformWrapper: {
        flex: 1,
        height: 44,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 22,
        justifyContent: 'center',
        paddingHorizontal: Theme.spacing.l,
    },
    recordingSendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    waveformContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: 3,
    },
    waveformBar: {
        width: 3,
        backgroundColor: Theme.colors.primary,
        borderRadius: 2,
    },
    inputContainer: {
        flex: 1,
        marginHorizontal: Theme.spacing.s,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 22,
        paddingHorizontal: Theme.spacing.m,
        paddingVertical: 6,
        minHeight: 40,
        maxHeight: 100,
        justifyContent: 'center',
    },
    input: {
        color: Theme.colors.text.primary,
        fontSize: 16,
        fontFamily: 'Inter-Regular',
        maxHeight: 80,
        padding: 0,
        margin: 0,
    },
    micButton: {
        padding: Theme.spacing.s,
        minWidth: 40,
        alignItems: 'center',
    },
    sendText: {
        color: Theme.colors.primary,
        fontFamily: 'Inter-Bold',
        fontSize: 16,
    }
});
