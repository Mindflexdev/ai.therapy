import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { THERAPY_DETAILS } from '@/constants/therapy-details';
import React from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface TherapyDetailPopupProps {
    visible: boolean;
    therapyName: string | null;
    onClose: () => void;
    theme: any;
}

export const TherapyDetailPopup = ({ visible, therapyName, onClose, theme }: TherapyDetailPopupProps) => {
    if (!therapyName) return null;

    const details = THERAPY_DETAILS[therapyName];

    if (!details) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.contentContainer, { backgroundColor: theme.background }]}>
                    {/* Header */}
                    <View style={[styles.header, { borderBottomColor: theme.icon + '20' }]}>
                        <TouchableOpacity onPress={onClose} style={styles.headerButton}>
                            <IconSymbol name="chevron.down" size={28} color={theme.text} />
                        </TouchableOpacity>
                        <ThemedText type="defaultSemiBold" style={styles.headerTitle} numberOfLines={1}>
                            Learn More
                        </ThemedText>
                        <View style={{ width: 40 }} />
                    </View>

                    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                        {/* Hero Section */}
                        <View style={styles.heroSection}>
                            <View style={[styles.emojiContainer, { backgroundColor: theme.card }]}>
                                <ThemedText style={styles.emoji}>{details.emoji}</ThemedText>
                            </View>
                            <ThemedText type="title" style={styles.title}>{details.name}</ThemedText>
                            <ThemedText style={[styles.tagline, { color: theme.icon }]}>"{details.tagline}"</ThemedText>
                        </View>

                        {/* Core Philosophy */}
                        <View style={[styles.section, { backgroundColor: theme.card }]}>
                            <View style={styles.sectionHeader}>
                                <IconSymbol name="brain" size={20} color={theme.primary} />
                                <ThemedText type="subtitle" style={styles.sectionTitle}>What is it?</ThemedText>
                            </View>
                            <ThemedText style={styles.sectionText}>{details.corePhilosophy}</ThemedText>
                        </View>

                        {/* History */}
                        <View style={[styles.section, { backgroundColor: theme.card }]}>
                            <View style={styles.sectionHeader}>
                                <IconSymbol name="clock.fill" size={20} color={theme.primary} />
                                <ThemedText type="subtitle" style={styles.sectionTitle}>Origins</ThemedText>
                            </View>
                            <View style={styles.historyRow}>
                                <ThemedText type="defaultSemiBold">Inventor:</ThemedText>
                                <ThemedText>{details.history.inventor}</ThemedText>
                            </View>
                            <View style={styles.historyRow}>
                                <ThemedText type="defaultSemiBold">Era:</ThemedText>
                                <ThemedText>{details.history.year}</ThemedText>
                            </View>
                            <View style={styles.divider} />
                            <ThemedText style={styles.sectionText}>{details.history.context}</ThemedText>
                        </View>

                        {/* Benefits */}
                        <View style={[styles.section, { backgroundColor: theme.card }]}>
                            <View style={styles.sectionHeader}>
                                <IconSymbol name="heart" size={20} color="#FF3B30" />
                                <ThemedText type="subtitle" style={styles.sectionTitle}>Best For</ThemedText>
                            </View>
                            <View style={styles.tagsContainer}>
                                {details.whatItHelps.map((item, index) => (
                                    <View key={index} style={[styles.tag, { backgroundColor: theme.background, borderColor: theme.icon + '40' }]}>
                                        <ThemedText style={styles.tagText}>{item}</ThemedText>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Techniques */}
                        <View style={[styles.section, { backgroundColor: theme.card }]}>
                            <View style={styles.sectionHeader}>
                                <IconSymbol name="list.bullet" size={20} color={theme.primary} />
                                <ThemedText type="subtitle" style={styles.sectionTitle}>Key Techniques</ThemedText>
                            </View>
                            <View style={styles.listContainer}>
                                {details.techniques.map((item, index) => (
                                    <View key={index} style={styles.listItem}>
                                        <View style={[styles.bullet, { backgroundColor: theme.primary }]} />
                                        <ThemedText style={styles.sectionText}>{item}</ThemedText>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Fun Fact */}
                        <View style={[styles.section, { backgroundColor: theme.tint + '15', borderWidth: 1, borderColor: theme.tint }]}>
                            <View style={styles.sectionHeader}>
                                <IconSymbol name="sparkles" size={20} color={theme.tint} />
                                <ThemedText type="subtitle" style={[styles.sectionTitle, { color: theme.tint }]}>Did you know?</ThemedText>
                            </View>
                            <ThemedText style={styles.sectionText}>{details.interestingFact}</ThemedText>
                        </View>

                        <View style={{ height: 40 }} />

                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    contentContainer: {
        height: '92%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    headerButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 17,
    },
    content: {
        padding: 20,
        gap: 20,
    },
    heroSection: {
        alignItems: 'center',
        marginBottom: 10,
    },
    emojiContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    emoji: {
        fontSize: 40,
    },
    title: {
        fontSize: 24,
        textAlign: 'center',
        maxWidth: '90%',
        marginBottom: 8,
    },
    tagline: {
        fontSize: 16,
        textAlign: 'center',
        fontStyle: 'italic',
        paddingHorizontal: 20,
    },
    section: {
        borderRadius: 16,
        padding: 20,
        gap: 12,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 4,
    },
    sectionTitle: {
        fontSize: 18,
    },
    sectionText: {
        fontSize: 15,
        lineHeight: 24,
        opacity: 0.9,
    },
    historyRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        paddingBottom: 8,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(0,0,0,0.05)',
        marginVertical: 4,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
    },
    tagText: {
        fontSize: 13,
    },
    listContainer: {
        gap: 8,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
});
