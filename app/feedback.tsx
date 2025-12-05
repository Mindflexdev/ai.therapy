import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function FeedbackScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const email = 'hello@ai.therapy';
    const whatsappUrl = 'https://api.whatsapp.com/send?phone=4915223885561&text=Hey!%20I%E2%80%99m%20using%20ai.therapy%20and%20I%E2%80%99ve%20got%20a%20question%20or%20some%20feedback%20%F0%9F%92%AC';

    const handleCopyEmail = async () => {
        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(email);
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = email;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            }
            Alert.alert('Copied!', 'Email address copied to clipboard');
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const handleWhatsApp = () => {
        Linking.openURL(whatsappUrl);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            {/* Simple Back Button */}
            <TouchableOpacity onPress={() => router.back()} style={styles.simpleBackButton}>
                <IconSymbol name="chevron.right" size={28} color={theme.text} style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.maxWidthContainer}>
                    {/* Appreciation Message */}
                    <View style={styles.messageContainer}>
                        <ThemedText style={styles.emoji}>🎉</ThemedText>
                        <ThemedText type="title" style={styles.title}>
                            Awesome that you're sending us feedback!
                        </ThemedText>
                        <ThemedText style={[styles.subtitle, { color: theme.icon }]}>
                            We'd love to hear from you. Choose your preferred way to reach out:
                        </ThemedText>
                    </View>

                    {/* Email Option */}
                    <View style={styles.optionContainer}>
                        <View style={styles.optionHeaderRow}>
                            <ThemedText type="defaultSemiBold" style={styles.optionTitle}>
                                Send us an email
                            </ThemedText>
                            <ThemedText style={styles.responseTimeText}>
                                Usually answered within 48h
                            </ThemedText>
                        </View>
                        <View style={[styles.emailContainer, { backgroundColor: theme.card }]}>
                            <ThemedText style={[styles.emailText, { color: theme.primary }]}>
                                {email}
                            </ThemedText>
                            <TouchableOpacity
                                style={[styles.copyButton, { backgroundColor: theme.primary }]}
                                onPress={handleCopyEmail}
                            >
                                <IconSymbol name="doc.on.doc" size={18} color="#fff" />
                                <ThemedText style={styles.copyButtonText}>Copy</ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* WhatsApp Option */}
                    <View style={styles.optionContainer}>
                        <View style={styles.optionHeaderRow}>
                            <ThemedText type="defaultSemiBold" style={styles.optionTitle}>
                                Message us on WhatsApp
                            </ThemedText>
                            <ThemedText style={styles.responseTimeText}>
                                Usually answered within 12h
                            </ThemedText>
                        </View>
                        <TouchableOpacity
                            style={[styles.whatsappButton, { backgroundColor: '#25D366' }]}
                            onPress={handleWhatsApp}
                        >
                            <ThemedText style={styles.whatsappButtonText}>
                                Message us on WhatsApp
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    simpleBackButton: {
        padding: 16,
        alignSelf: 'flex-start',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 24,
        paddingTop: 0,
    },
    maxWidthContainer: {
        width: '100%',
        maxWidth: 500,
        alignSelf: 'center',
        gap: 32,
    },
    messageContainer: {
        alignItems: 'center',
        gap: 12,
        paddingVertical: 20,
    },
    emoji: {
        fontSize: 48,
        marginBottom: 8,
    },
    title: {
        fontSize: 24,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 22,
    },
    optionContainer: {
        gap: 12,
    },
    optionTitle: {
        fontSize: 16,
    },
    optionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
        flexWrap: 'wrap',
        gap: 8,
    },
    responseTimeText: {
        fontSize: 12,
        color: '#8E8E93',
        fontWeight: '500',
    },
    emailContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        gap: 12,
    },
    emailText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
    },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
    },
    copyButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    whatsappButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: 16,
        borderRadius: 12,
    },
    whatsappLogo: {
        width: 28,
        height: 28,
    },
    whatsappButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
