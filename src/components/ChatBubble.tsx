import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Keyboard } from 'react-native';
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
}

interface Props {
    message: Message;
    onUpgrade?: () => void;
    onQuickReply?: (text: string) => void;
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

export const ChatBubble = React.memo(({ message, onUpgrade, onQuickReply }: Props) => {
    const agentLabel = message.agent
        ? (PHASE_LABELS[message.agent] || message.agent)
        : null;

    const hasButtons = message.upgradeButton || (message.quickReplies && message.quickReplies.length > 0) || (message.challengeOptions && message.challengeOptions.length > 0);
    const isPaywallCard = !!message.paywallSummary;

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
                    <View style={[
                        styles.bubble,
                        message.isUser ? styles.userBubble : styles.therapistBubble
                    ]}>
                        <Text style={styles.text}>{message.text}</Text>
                        <View style={styles.footer}>
                            {agentLabel && (
                                <Text style={styles.agentLabel}>{agentLabel}</Text>
                            )}
                            <Text style={styles.time}>{message.time}</Text>
                            {message.isUser && <Text style={styles.checkmarks}>✓✓</Text>}
                        </View>
                    </View>
                )}

                {/* Upgrade button — Telegram-style filled golden button */}
                {message.upgradeButton && onUpgrade && (
                    <TouchableOpacity style={styles.upgradeButton} onPress={() => { Keyboard.dismiss(); onUpgrade!(); }} activeOpacity={0.7}>
                        <Text style={styles.upgradeButtonText}>Upgrade</Text>
                    </TouchableOpacity>
                )}

                {/* Quick reply buttons — Telegram-style outline buttons */}
                {message.quickReplies && message.quickReplies.length > 0 && onQuickReply && (
                    <View style={styles.quickRepliesContainer}>
                        {message.quickReplies.map((reply, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.quickReplyButton}
                                onPress={() => onQuickReply(reply)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.quickReplyText}>{reply}</Text>
                            </TouchableOpacity>
                        ))}
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
    agentLabel: {
        fontSize: 9,
        color: 'rgba(255,255,255,0.3)',
        fontFamily: 'Inter-Regular',
        marginRight: 8,
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
