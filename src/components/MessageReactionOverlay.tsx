import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Modal,
    Vibration,
} from 'react-native';
import { Copy, Reply } from 'lucide-react-native';
import { Theme } from '../constants/Theme';

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

interface MessageReactionOverlayProps {
    visible: boolean;
    messageText: string;
    onReact: (emoji: string) => void;
    onReply: () => void;
    onCopy: () => void;
    onClose: () => void;
}

export const MessageReactionOverlay = ({
    visible,
    messageText,
    onReact,
    onReply,
    onCopy,
    onClose,
}: MessageReactionOverlayProps) => {
    if (!visible) return null;

    const previewText = messageText.length > 120
        ? messageText.substring(0, 120) + '...'
        : messageText;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.content}>
                            {/* Emoji reaction row */}
                            <View style={styles.emojiRow}>
                                {REACTION_EMOJIS.map((emoji) => (
                                    <TouchableOpacity
                                        key={emoji}
                                        style={styles.emojiButton}
                                        onPress={() => onReact(emoji)}
                                        activeOpacity={0.6}
                                    >
                                        <Text style={styles.emoji}>{emoji}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Message preview */}
                            <View style={styles.messagePreview}>
                                <Text style={styles.previewText}>{previewText}</Text>
                            </View>

                            {/* Action buttons */}
                            <View style={styles.actionsRow}>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={onReply}
                                    activeOpacity={0.7}
                                >
                                    <Reply size={20} color={Theme.colors.text.primary} />
                                    <Text style={styles.actionLabel}>Reply</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={onCopy}
                                    activeOpacity={0.7}
                                >
                                    <Copy size={20} color={Theme.colors.text.primary} />
                                    <Text style={styles.actionLabel}>Copy</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    content: {
        width: '100%',
        alignItems: 'center',
    },
    emojiRow: {
        flexDirection: 'row',
        backgroundColor: 'rgba(40, 40, 40, 0.95)',
        borderRadius: 28,
        paddingHorizontal: 8,
        paddingVertical: 8,
        marginBottom: 16,
        gap: 2,
    },
    emojiButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emoji: {
        fontSize: 26,
    },
    messagePreview: {
        backgroundColor: Theme.colors.bubbles.therapist,
        borderRadius: Theme.borderRadius.l,
        borderTopLeftRadius: 4,
        paddingHorizontal: 14,
        paddingVertical: 10,
        maxWidth: '90%',
        marginBottom: 16,
    },
    previewText: {
        color: '#E0E0E0',
        fontSize: 15,
        fontFamily: 'Inter-Regular',
        lineHeight: 21,
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(40, 40, 40, 0.95)',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    actionLabel: {
        color: Theme.colors.text.primary,
        fontSize: 15,
        fontFamily: 'Inter-Regular',
    },
});
