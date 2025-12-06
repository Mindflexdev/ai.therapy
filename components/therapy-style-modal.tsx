import { ThemedText } from '@/components/themed-text';
import { TherapyStyleOption } from '@/components/therapy-style-option';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ALL_THERAPY_OPTIONS } from '@/constants/therapy';
import React, { memo, useCallback } from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface TherapyStyleModalProps {
    visible: boolean;
    activeStyle: string;
    onClose: () => void;
    onSelectStyle: (styleName: string) => void;
    theme: any;
}

export const TherapyStyleModal = memo(({
    visible,
    activeStyle,
    onClose,
    onSelectStyle,
    theme,
}: TherapyStyleModalProps) => {
    const handleStylePress = useCallback((styleName: string) => {
        // Toggle selection: if same style, revert to default
        if (activeStyle === styleName) {
            onSelectStyle('Integrative Therapy (AI decides)');
        } else {
            onSelectStyle(styleName);
        }
        onClose();
    }, [activeStyle, onSelectStyle, onClose]);

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
                        <ThemedText type="title" style={styles.title}>
                            Select Therapy Style
                        </ThemedText>
                        <TouchableOpacity onPress={onClose}>
                            <IconSymbol name="xmark.circle.fill" size={24} color={theme.icon} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                        {ALL_THERAPY_OPTIONS.map((category) => (
                            <View key={category.category} style={styles.category}>
                                <ThemedText type="defaultSemiBold" style={styles.categoryTitle}>
                                    {category.category}
                                </ThemedText>
                                {category.styles.map((style) => (
                                    <TherapyStyleOption
                                        key={style.name}
                                        style={style}
                                        isSelected={activeStyle === style.name}
                                        onPress={() => handleStylePress(style.name)}
                                        theme={theme}
                                    />
                                ))}
                            </View>
                        ))}
                        <View style={styles.spacer} />
                    </ScrollView>

                    {/* Selected style preview */}
                    <View style={[styles.preview, { backgroundColor: theme.primary }]}>
                        <ThemedText style={styles.previewText}>{activeStyle}</ThemedText>
                    </View>

                    {/* Continue button */}
                    <TouchableOpacity
                        style={[styles.continueButton, { backgroundColor: theme.primary }]}
                        onPress={onClose}
                    >
                        <ThemedText style={styles.continueText}>Continue</ThemedText>
                    </TouchableOpacity>
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
        height: '90%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 18,
    },
    scroll: {
        padding: 20,
    },
    category: {
        marginBottom: 24,
    },
    categoryTitle: {
        fontSize: 14,
        marginBottom: 12,
        opacity: 0.7,
        textTransform: 'uppercase',
    },
    spacer: {
        height: 40,
    },
    preview: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    previewText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    continueButton: {
        marginHorizontal: 16,
        marginVertical: 12,
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
