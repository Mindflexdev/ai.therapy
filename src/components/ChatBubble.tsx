import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Theme } from '../constants/Theme';

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    time: string;
}

interface Props {
    message: Message;
}

export const ChatBubble = ({ message }: Props) => {
    return (
        <View style={[
            styles.container,
            message.isUser ? styles.userContainer : styles.therapistContainer
        ]}>
            <View style={[
                styles.bubble,
                message.isUser ? styles.userBubble : styles.therapistBubble
            ]}>
                <Text style={styles.text}>{message.text}</Text>
                <View style={styles.footer}>
                    <Text style={styles.time}>{message.time}</Text>
                    {message.isUser && <Text style={styles.checkmarks}>✓✓</Text>}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: Theme.spacing.m,
        marginVertical: Theme.spacing.xs,
        flexDirection: 'row',
    },
    userContainer: {
        justifyContent: 'flex-end',
    },
    therapistContainer: {
        justifyContent: 'flex-start',
    },
    bubble: {
        maxWidth: '80%',
        padding: Theme.spacing.m,
        borderRadius: Theme.borderRadius.l,
    },
    userBubble: {
        backgroundColor: Theme.colors.bubbles.user,
        borderBottomRightRadius: 4,
    },
    therapistBubble: {
        backgroundColor: Theme.colors.bubbles.therapist,
        borderBottomLeftRadius: 4,
    },
    text: {
        color: '#E0E0E0',
        fontSize: 16,
        fontFamily: 'Inter-Regular',
        lineHeight: 22,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 4,
    },
    time: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.4)',
        fontFamily: 'Inter-Regular',
    },
    checkmarks: {
        fontSize: 10,
        color: Theme.colors.primary,
        marginLeft: 4,
    },
});
