import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, Keyboard } from 'react-native';
import { CheckCheck } from 'lucide-react-native';
import { Theme } from '../constants/Theme';

export interface ChallengeOption {
    title: string;
    description: string;
    fullText: string; // sent as user message on tap
}

export interface PaywallSection {
    heading: string;
    bullets: string[];
}

export interface PaywallSummary {
    intro: string;
    sections: PaywallSection[];
}

export interface ReplyTo {
    id: string;
    text: string;
    isUser: boolean;
}

export interface Message {
    id: string;
    text: string;
    isUser: boolean;
    time: string;
    agent?: string;
    upgradeButton?: boolean;
    quickReplies?: string[];
    challengeOptions?: ChallengeOption[];
    paywallSummary?: PaywallSummary;
    reaction?: string;
    replyTo?: ReplyTo;
}

interface Props {
    message: Message;
    onUpgrade?: () => void;
    onQuickReply?: (text: string) => void;
    onLongPress?: (message: Message) => void;
}

// Human-readable labels for onboarding phase keys
const PHASE_LABELS: Record<string, string> = {
    'onboarding_einstellungs': 'Einstellungs Agent',
    'onboarding_problemfokus': 'Problemfokus Agent',
    'onboarding_problemstellung': 'Problemstellung Agent',
    'onboarding_loesungsfokus': 'Lösungsfokus Agent',
    'onboarding_paywall': 'Paywall Agent',
    'onboarding_sales': 'Sales Agent',
};

export const ChatBubble = React.memo(({ message, onUpgrade, onQuickReply, onLongPress }: Props) => {
    const agentLabel = message.agent
        ? (PHASE_LABELS[message.agent] || message.agent)
        : null;

    // Multi-select for einstellungs questions
    const isEinstellungs = message.agent === 'onboarding_einstellungs';
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

    const toggleOption = (option: string) => {
        setSelectedOptions(prev =>
            prev.includes(option)
                ? prev.filter(o => o !== option)
                : [...prev, option]
        );
    };

    const handleMultiSelectSend = () => {
        if (selectedOptions.length > 0 && onQuickReply) {
            onQuickReply(selectedOptions.join(', '));
        }
    };

    const hasButtons = message.upgradeButton || (message.quickReplies && message.quickReplies.length > 0) || (message.challengeOptions && message.challengeOptions.length > 0);
    const isPaywallCard = !!message.paywallSummary;

    // Long press only on AI messages, not greetings
    const isLongPressable = !message.isUser && message.agent !== 'Greeting' && onLongPress;

    const handleLongPress = () => {
        if (isLongPressable) {
            onLongPress!(message);
        }
    };

    // Reply quote snippet (truncated)
    const replyPreview = message.replyTo
        ? (message.replyTo.text.length > 80
            ? message.replyTo.text.substring(0, 80) + '...'
            : message.replyTo.text)
        : null;

    const BubbleWrapper = isLongPressable ? Pressable : View;
    const wrapperProps = isLongPressable
        ? { onLongPress: handleLongPress, delayLongPress: 400 }
        : {};

    return (
        <View style={[
            styles.container,
            message.isUser ? styles.userContainer : styles.therapistContainer
        ]}>
            <View style={{ width: (hasButtons || isPaywallCard) ? '90%' : undefined, maxWidth: '90%' }}>
                {isPaywallCard && message.paywallSummary ? (
                    /* Paywall summary card — structured session recap */
                    <View style={styles.paywallCard}>
                        <Text style={styles.paywallIntro}>{message.paywallSummary.intro}</Text>
                        {message.paywallSummary.sections.map((section, sIdx) => (
                            <View key={sIdx} style={styles.paywallSection}>
                                <Text style={styles.paywallHeading}>{section.heading}</Text>
                                {section.bullets.map((bullet, bIdx) => (
                                    <View key={bIdx} style={styles.paywallBulletRow}>
                                        <Text style={styles.paywallBulletDot}>
                                            {sIdx === 0 ? '✓' : sIdx === 1 ? '→' : '✨'}
                                        </Text>
                                        <Text style={styles.paywallBulletText}>{bullet}</Text>
                                    </View>
                                ))}
                            </View>
                        ))}
                        <View style={styles.footer}>
                            {agentLabel && (
                                <Text style={styles.agentLabel}>{agentLabel}</Text>
                            )}
                            <Text style={styles.time}>{message.time}</Text>
                        </View>
                    </View>
                ) : (
                    /* Regular message bubble */
                    <BubbleWrapper {...wrapperProps}>
                        <View style={[
                            styles.bubble,
                            message.isUser ? styles.userBubble : styles.therapistBubble
                        ]}>
                            {/* Reply-to quote (WhatsApp-style colored bar) */}
                            {message.replyTo && replyPreview && (
                                <View style={[
                                    styles.replyQuote,
                                    message.replyTo.isUser ? styles.replyQuoteUser : styles.replyQuoteAi,
                                ]}>
                                    <Text style={styles.replyQuoteAuthor}>
                                        {message.replyTo.isUser ? 'You' : 'Therapist'}
                                    </Text>
                                    <Text style={styles.replyQuoteText} numberOfLines={2}>
                                        {replyPreview}
                                    </Text>
                                </View>
                            )}
                            <Text style={styles.text}>{message.text}</Text>
                            <View style={styles.footer}>
                                {agentLabel && (
                                    <Text style={styles.agentLabel}>{agentLabel}</Text>
                                )}
                                <Text style={styles.time}>{message.time}</Text>
                                {message.isUser && (
                                    <CheckCheck
                                        size={16}
                                        color={Theme.colors.primary}
                                        strokeWidth={2.5}
                                        style={styles.checkmarks}
                                    />
                                )}
                            </View>
                        </View>
                    </BubbleWrapper>
                )}

                {/* Reaction badge — small emoji pill below the bubble */}
                {message.reaction && (
                    <View style={[
                        styles.reactionBadge,
                        message.isUser ? styles.reactionBadgeUser : styles.reactionBadgeAi,
                    ]}>
                        <Text style={styles.reactionEmoji}>{message.reaction}</Text>
                    </View>
                )}

                {/* Upgrade button — Telegram-style filled golden button */}
                {message.upgradeButton && onUpgrade && (
                    <TouchableOpacity style={styles.upgradeButton} onPress={() => { Keyboard.dismiss(); onUpgrade!(); }} activeOpacity={0.7}>
                        <Text style={styles.upgradeButtonText}>Upgrade</Text>
                    </TouchableOpacity>
                )}

                {/* Quick reply buttons — multi-select for einstellungs, single-tap for others */}
                {message.quickReplies && message.quickReplies.length > 0 && onQuickReply && (
                    <View style={styles.quickRepliesContainer}>
                        {message.quickReplies.map((reply, index) => {
                            const isSelected = isEinstellungs && selectedOptions.includes(reply);
                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.quickReplyButton,
                                        isSelected && styles.quickReplyButtonSelected,
                                    ]}
                                    onPress={() => isEinstellungs ? toggleOption(reply) : onQuickReply(reply)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[
                                        styles.quickReplyText,
                                        isSelected && styles.quickReplyTextSelected,
                                    ]}>{reply}</Text>
                                </TouchableOpacity>
                            );
                        })}
                        {isEinstellungs && selectedOptions.length > 0 && (
                            <TouchableOpacity
                                style={styles.multiSelectSendButton}
                                onPress={handleMultiSelectSend}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.multiSelectSendText}>Continue</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {/* Challenge option cards — for problemstellung */}
                {message.challengeOptions && message.challengeOptions.length > 0 && onQuickReply && (
                    <View style={styles.quickRepliesContainer}>
                        {message.challengeOptions.map((challenge, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.challengeCard}
                                onPress={() => onQuickReply(challenge.fullText)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.challengeTitle}>{challenge.title}</Text>
                                <Text style={styles.challengeDescription}>{challenge.description}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>
        </View>
    );
});

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
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: Theme.borderRadius.l,
    },
    userBubble: {
        backgroundColor: Theme.colors.bubbles.user,
        borderTopRightRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(212, 175, 55, 0.2)',
    },
    therapistBubble: {
        backgroundColor: Theme.colors.bubbles.therapist,
        borderTopLeftRadius: 4,
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
        marginTop: 2,
    },
    time: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.45)',
        fontFamily: 'Inter-Bold',
    },
    checkmarks: {
        marginLeft: 3,
    },
    agentLabel: {
        fontSize: 9,
        color: 'rgba(255,255,255,0.3)',
        fontFamily: 'Inter-Regular',
        marginRight: 8,
    },
    // Reply-to quote (inside bubble, WhatsApp-style)
    replyQuote: {
        borderLeftWidth: 3,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.06)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginBottom: 6,
    },
    replyQuoteUser: {
        borderLeftColor: Theme.colors.primary,
    },
    replyQuoteAi: {
        borderLeftColor: 'rgba(255,255,255,0.3)',
    },
    replyQuoteAuthor: {
        color: Theme.colors.primary,
        fontSize: 12,
        fontFamily: 'Inter-Bold',
        marginBottom: 2,
    },
    replyQuoteText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 13,
        fontFamily: 'Inter-Regular',
        lineHeight: 17,
    },
    // Reaction badge
    reactionBadge: {
        position: 'absolute',
        bottom: -10,
        backgroundColor: 'rgba(30, 30, 30, 0.95)',
        borderRadius: 12,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    reactionBadgeUser: {
        right: 8,
    },
    reactionBadgeAi: {
        left: 8,
    },
    reactionEmoji: {
        fontSize: 16,
    },
    upgradeButton: {
        backgroundColor: Theme.colors.primary,
        paddingVertical: 12,
        borderRadius: Theme.borderRadius.m,
        alignItems: 'center',
        marginTop: 6,
    },
    upgradeButtonText: {
        color: Theme.colors.background,
        fontFamily: 'Inter-Bold',
        fontSize: 15,
    },
    quickRepliesContainer: {
        marginTop: 6,
        gap: 4,
    },
    quickReplyButton: {
        backgroundColor: 'rgba(235, 206, 128, 0.12)',
        borderWidth: 1,
        borderColor: 'rgba(235, 206, 128, 0.25)',
        paddingVertical: 11,
        paddingHorizontal: 14,
        borderRadius: Theme.borderRadius.m,
        alignItems: 'center',
    },
    quickReplyText: {
        color: Theme.colors.primary,
        fontFamily: 'Inter-Regular',
        fontSize: 14,
    },
    quickReplyButtonSelected: {
        backgroundColor: 'rgba(235, 206, 128, 0.25)',
        borderColor: Theme.colors.primary,
    },
    quickReplyTextSelected: {
        fontFamily: 'Inter-Bold',
    },
    multiSelectSendButton: {
        backgroundColor: Theme.colors.primary,
        paddingVertical: 11,
        paddingHorizontal: 14,
        borderRadius: Theme.borderRadius.m,
        alignItems: 'center',
        marginTop: 4,
    },
    multiSelectSendText: {
        color: Theme.colors.background,
        fontFamily: 'Inter-Bold',
        fontSize: 14,
    },
    challengeCard: {
        backgroundColor: 'rgba(235, 206, 128, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(235, 206, 128, 0.25)',
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: Theme.borderRadius.m,
    },
    challengeTitle: {
        color: Theme.colors.primary,
        fontFamily: 'Inter-Bold',
        fontSize: 14,
        marginBottom: 4,
    },
    challengeDescription: {
        color: 'rgba(255,255,255,0.7)',
        fontFamily: 'Inter-Regular',
        fontSize: 13,
        lineHeight: 18,
    },
    // Paywall summary card styles
    paywallCard: {
        backgroundColor: 'rgba(235, 206, 128, 0.06)',
        borderWidth: 1,
        borderColor: 'rgba(235, 206, 128, 0.2)',
        borderRadius: Theme.borderRadius.l,
        padding: 18,
    },
    paywallIntro: {
        color: '#E0E0E0',
        fontSize: 15,
        fontFamily: 'Inter-Regular',
        lineHeight: 22,
        marginBottom: 16,
    },
    paywallSection: {
        marginBottom: 14,
    },
    paywallHeading: {
        color: Theme.colors.primary,
        fontSize: 14,
        fontFamily: 'Inter-Bold',
        marginBottom: 8,
    },
    paywallBulletRow: {
        flexDirection: 'row',
        marginBottom: 6,
        paddingRight: 8,
    },
    paywallBulletDot: {
        color: Theme.colors.primary,
        fontSize: 13,
        width: 22,
        marginTop: 1,
    },
    paywallBulletText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        fontFamily: 'Inter-Regular',
        lineHeight: 20,
        flex: 1,
    },
});
