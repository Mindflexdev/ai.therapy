import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { STYLE_ABBREVIATIONS } from '@/constants/therapy';
import { useRouter } from 'expo-router';
import React, { memo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface TherapyStyleOptionProps {
    style: {
        name: string;
        description: string;
    };
    isSelected: boolean;
    onPress: () => void;
    theme: any;
}

export const TherapyStyleOption = memo(({ style, isSelected, onPress, theme }: TherapyStyleOptionProps) => {
    const router = useRouter();

    const handleLearnMore = (e: any) => {
        e.stopPropagation();
        router.push({ pathname: '/therapy-detail-modal', params: { name: style.name } });
    };

    return (
        <TouchableOpacity
            style={[
                styles.option,
                {
                    backgroundColor: isSelected ? theme.primary : theme.card,
                    borderColor: isSelected ? theme.primary : theme.icon,
                },
            ]}
            onPress={onPress}
        >
            <View style={styles.content}>
                <View style={styles.header}>
                    <ThemedText
                        style={[
                            styles.name,
                            { color: isSelected ? '#fff' : theme.text },
                        ]}
                    >
                        {STYLE_ABBREVIATIONS[style.name] || style.name}
                    </ThemedText>
                    <TouchableOpacity onPress={handleLearnMore}>
                        <IconSymbol
                            name="info.circle"
                            size={18}
                            color={isSelected ? '#fff' : theme.primary}
                        />
                    </TouchableOpacity>
                </View>
                <ThemedText
                    style={[
                        styles.description,
                        { color: isSelected ? 'rgba(255,255,255,0.9)' : theme.icon },
                    ]}
                >
                    {style.description}
                </ThemedText>
            </View>
            {isSelected && (
                <IconSymbol name="checkmark.circle.fill" size={20} color="#fff" />
            )}
        </TouchableOpacity>
    );
});

TherapyStyleOption.displayName = 'TherapyStyleOption';

const styles = StyleSheet.create({
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        gap: 12,
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
    },
    description: {
        fontSize: 13,
        lineHeight: 18,
    },
});
