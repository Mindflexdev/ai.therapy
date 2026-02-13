import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Theme } from '../../src/constants/Theme';
import { ChatBubble } from '../../src/components/ChatBubble';
import { Menu, Phone, Video, Plus, Camera, Mic, ChevronLeft } from 'lucide-react-native';
import { useNavigation } from 'expo-router';
import { DrawerNavigationProp } from '@react-navigation/drawer';

const INITIAL_MESSAGES = [
    { id: '1', text: 'Hello, I am Marcus. How can I support you today?', isUser: false, time: '14:20' },
];

export default function ChatScreen() {
    const [messages, setMessages] = useState(INITIAL_MESSAGES);
    const [inputText, setInputText] = useState('');
    const navigation = useNavigation<DrawerNavigationProp<any>>();

    const handleSend = () => {
        if (inputText.trim()) {
            const newMessage = {
                id: Date.now().toString(),
                text: inputText,
                isUser: true,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages([...messages, newMessage]);
            setInputText('');

            // Navigate to login after first message as requested
            setTimeout(() => {
                navigation.navigate('login');
            }, 1000);
        }
    };

    const showComingSoon = () => {
        Alert.alert('Coming Soon', 'This feature is currently under development.');
    };

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

                    <TouchableOpacity style={styles.profileInfo} onPress={() => navigation.navigate('profile')}>
                        <View style={styles.avatarWrapper}>
                            <Image
                                source={null}
                                style={styles.avatar}
                                defaultSource={require('../../assets/adaptive-icon.png')}
                            />
                        </View>
                        <View>
                            <Text style={styles.name}>Marcus Thorne</Text>
                            <Text style={styles.status}>online</Text>
                        </View>
                    </TouchableOpacity>

                    <View style={styles.headerRight}>
                        <TouchableOpacity onPress={showComingSoon} style={styles.iconButton}>
                            <Video size={22} color={Theme.colors.text.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('call')} style={styles.iconButton}>
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
