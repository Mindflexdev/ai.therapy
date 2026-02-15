import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { Theme } from '../../src/constants/Theme';
import { ChatBubble } from '../../src/components/ChatBubble';
import { Menu, Phone, Video, Plus, Camera, Mic, ChevronLeft } from 'lucide-react-native';
import { useNavigation, useLocalSearchParams } from 'expo-router';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useAuth } from '../../src/context/AuthContext';
import LoginScreen from './login';

const INITIAL_MESSAGES = [
    { id: '1', text: 'Hello, I am [Name]. How can I support you today?', isUser: false, time: '14:20' },
];


import { THERAPIST_IMAGES } from '../../src/constants/Therapists';

export default function ChatScreen() {
    const { name } = useLocalSearchParams();
    const therapistName = (name as string) || 'Marcus';
    const therapistImage = THERAPIST_IMAGES[therapistName];

    const [messages, setMessages] = useState<any[]>([]);
    const [isTyping, setIsTyping] = useState(true);
    const [inputText, setInputText] = useState('');
    const navigation = useNavigation<DrawerNavigationProp<any>>();
    const { showLoginModal, setShowLoginModal, isLoggedIn } = useAuth();

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsTyping(false);
            setMessages([{
                id: '1',
                text: `Hi, I'm ${therapistName}! \n\nAlthough I'm not a therapist, I was developed by psychologists – as a companion for your mental health who understands you and adapts to your needs. Unlike ChatGPT, I use various psychological approaches to support you more specifically. The first session with me is currently free. This project lives from people like you. If it helps you, I would be happy about your support. Your trust is important to me: Everything you write here remains private & encrypted.\n\nWhat do you want support with?`,
                isUser: false,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        }, 1500); // Slightly shorter delay for better UX
        return () => clearTimeout(timer);
    }, []);


    const handleSend = () => {
        if (inputText.trim()) {
            // Check if user is logged in before sending
            if (!isLoggedIn) {
                setShowLoginModal(true);
                return;
            }

            const newMessage = {
                id: Date.now().toString(),
                text: inputText,
                isUser: true,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages(prev => [...prev, newMessage]);
            setInputText('');
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
                        data={messages}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => <ChatBubble message={item} />}
                        contentContainerStyle={styles.messageList}
                        ListFooterComponent={isTyping ? <TypingBubble /> : null}
                    />
                </View>

                {/* Input Bar */}
                <View style={styles.inputBar}>
                    <TouchableOpacity onPress={showComingSoon}>
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
                        />
                    </View>

                    <TouchableOpacity onPress={showComingSoon}>
                        <Camera size={24} color={Theme.colors.text.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={inputText.trim() ? handleSend : showComingSoon} style={styles.micButton}>
                        {inputText.trim() ? (
                            <Text style={styles.sendText}>Send</Text>
                        ) : (
                            <Mic size={24} color={Theme.colors.text.primary} />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            {/* Login Modal */}
            {showLoginModal && <LoginScreen />}
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
        padding: Theme.spacing.m,
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    inputContainer: {
        flex: 1,
        marginHorizontal: Theme.spacing.m,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: Theme.borderRadius.xl,
        paddingHorizontal: Theme.spacing.m,
        paddingVertical: 8,
        minHeight: 40,
    },
    input: {
        color: Theme.colors.text.primary,
        fontSize: 16,
        fontFamily: 'Inter-Regular',
    },
    micButton: {
        marginLeft: Theme.spacing.s,
    },
    sendText: {
        color: Theme.colors.primary,
        fontFamily: 'Inter-Bold',
        fontSize: 16,
    }
});
