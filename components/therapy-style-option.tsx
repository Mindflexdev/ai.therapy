import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
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
    onLearnMore?: (styleName: string) => void;
}

export const TherapyStyleOption = memo(({ style, isSelected, onPress, theme, onLearnMore }: TherapyStyleOptionProps) => {
    const router = useRouter();

    const handleLearnMore = (e: any) => {
        e.stopPropagation();
        if (onLearnMore) {
            onLearnMore(style.name);
        } else {
            router.push({ pathname: '/therapy-detail-modal', params: { name: style.name } });
        }
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
                        {style.name}
                    </ThemedText>
                </View>

                {/* Learn More Button */}
                <TouchableOpacity
                    style={[
                        styles.learnMoreButton,
                        {
                            backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : (theme.tint ? theme.tint + '15' : '#ccc'),
                            marginBottom: 8
                        }
                    ]}
                    onPress={handleLearnMore}
                >
                    <IconSymbol
                        name="info.circle"
                        size={14}
                        color={isSelected ? '#fff' : theme.tint}
                    />
                    <ThemedText
                        style={[
                            styles.learnMoreText,
                            { color: isSelected ? '#fff' : theme.tint }
                        ]}
                    >
                        Learn more
                    </ThemedText>
                </TouchableOpacity>

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
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    learnMoreButton: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 12,
        gap: 6,
    },
    learnMoreText: {
        fontSize: 12,
        fontWeight: '500',
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
    },
});
