import { ThemedText } from '@/components/themed-text';
import { TherapyStyleOption } from '@/components/therapy-style-option';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ALL_THERAPY_OPTIONS, STYLE_ABBREVIATIONS } from '@/constants/therapy';
import React, { memo, useCallback } from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface TherapyStyleModalProps {
    visible: boolean;
    activeStyles: string[];
    onClose: () => void;
    onSelectStyles: (styles: string[]) => void;
    onLearnMore: (styleName: string) => void;
    theme: any;
}

export const TherapyStyleModal = memo(({
    visible,
    activeStyles,
    onClose,
    onSelectStyles,
    onLearnMore,
    theme,
}: TherapyStyleModalProps) => {

    // Logic EXACTLY matching create-character.tsx
    const handleStylePress = useCallback((styleName: string) => {
        const integrativeName = 'Integrative Therapy (AI decides)';

        if (activeStyles.includes(styleName)) {
            // Deselecting a style
            const newStyles = activeStyles.filter(s => s !== styleName);
            // If no styles left, revert to Integrative
            onSelectStyles(newStyles.length === 0 ? [integrativeName] : newStyles);
        } else {
            // Selecting a new style
            if (styleName === integrativeName) {
                // If selecting Integrative, clear all others
                onSelectStyles([integrativeName]);
            } else {
                // If selecting any other style, remove Integrative and add the new one
                const newStyles = activeStyles
                    .filter(s => s !== integrativeName)
                    .concat(styleName);
                onSelectStyles(newStyles);
            }
        }
    }, [activeStyles, onSelectStyles]);

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.content, { backgroundColor: theme.background }]}>
                    <View style={[styles.header, { borderBottomColor: theme.icon }]}>
                        <TouchableOpacity onPress={onClose} style={styles.backButton}>
                            <IconSymbol name="chevron.down" size={24} color={theme.text} />
                        </TouchableOpacity>
                        <ThemedText type="defaultSemiBold" style={styles.headerTitle}>
                            Select Therapy Style
                        </ThemedText>
                        <View style={{ width: 40 }} />
                    </View>

                    <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                        <View style={styles.stepContainer}>
                            <ThemedText type="title" style={styles.stepTitle}>
                                Conversation inspired by...
                            </ThemedText>
                            <ThemedText style={styles.stepDescription}>
                                Select one or multiple therapy styles for this session
                            </ThemedText>

                            <View style={styles.therapyStylesContainer}>
                                {ALL_THERAPY_OPTIONS.map((category) => (
                                    <View key={category.category} style={styles.categorySection}>
                                        <ThemedText type="defaultSemiBold" style={styles.categoryTitle}>
                                            {category.category}
                                        </ThemedText>
                                        {category.styles.map((style) => (
                                            <TherapyStyleOption
                                                key={style.name}
                                                style={style}
                                                isSelected={activeStyles.includes(style.name)}
                                                onPress={() => handleStylePress(style.name)}
                                                theme={theme}
                                                onLearnMore={onLearnMore}
                                            />
                                        ))}
                                    </View>
                                ))}
                            </View>
                        </View>
                        <View style={styles.spacer} />
                    </ScrollView>

                    {/* Footer with Preview and Continue */}
                    <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.icon }]}>
                        {/* Fixed selected styles preview above Continue button */}
                        <View style={styles.selectedStylesPreviewSimple}>
                            <ThemedText style={[styles.selectedStylesPreviewTextSimple, { color: theme.text }]}>
                                Selected: <ThemedText type="defaultSemiBold">{activeStyles.map(s => STYLE_ABBREVIATIONS[s] || s).join(', ')}</ThemedText>
                            </ThemedText>
                        </View>

                        <TouchableOpacity
                            style={[styles.continueButton, { backgroundColor: theme.primary }]}
                            onPress={onClose}
                        >
                            <ThemedText style={styles.continueText}>Continue</ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
});

TherapyStyleModal.displayName = 'TherapyStyleModal';

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    content: {
        height: '92%', // Matches the tall modal feel
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
    },
    scroll: {
        padding: 24,
    },
    stepContainer: {
        gap: 16,
    },
    stepTitle: {
        fontSize: 28,
        marginBottom: 8,
    },
    stepDescription: {
        fontSize: 16,
        opacity: 0.7,
        marginBottom: 8,
    },
    therapyStylesContainer: {
        marginTop: 16,
    },
    categorySection: {
        marginBottom: 24,
    },
    categoryTitle: {
        fontSize: 16,
        marginBottom: 12,
        opacity: 0.8,
    },
    spacer: {
        height: 100, // Extra space for footer
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        borderTopWidth: 1,
        paddingBottom: 34, // Safe area padding
    },
    selectedStylesPreviewSimple: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        alignItems: 'center',
        marginBottom: 4,
    },
    selectedStylesPreviewTextSimple: {
        fontSize: 14,
        textAlign: 'center',
    },
    continueButton: {
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    continueText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});
