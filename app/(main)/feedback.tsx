import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ScrollView, Platform } from 'react-native';
import { Theme } from '../../src/constants/Theme';
import { ChevronLeft, X, Check, Circle, AlertCircle, Lightbulb, User, Settings as SettingsIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';

type FeedbackType = 'bug' | 'feature' | 'billing' | 'general';

export default function FeedbackScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [feedbackType, setFeedbackType] = useState<FeedbackType>('general');
    const [description, setDescription] = useState('');

    const feedbackTypes = [
        { id: 'bug' as FeedbackType, label: 'Bug Report', description: 'Report something that isn\'t working correctly.' },
        { id: 'feature' as FeedbackType, label: 'Feature Request', description: 'Suggest an improvement or a new feature.' },
        { id: 'billing' as FeedbackType, label: 'Auth and Billing', description: 'Issues with your account or payments.' },
        { id: 'general' as FeedbackType, label: 'General Feedback', description: 'For any feedback that does not fit into the above categories.' },
    ];

    const handleSubmit = () => {
        // Logic to submit feedback would go here
        // TODO: submit feedback to backend
        router.back();
    };

    const RadioButton = ({ selected, onPress, label }: { selected: boolean, onPress: () => void, label: string }) => (
        <TouchableOpacity style={styles.radioContainer} onPress={onPress} activeOpacity={0.7}>
            <View style={[styles.radioButton, selected && styles.radioButtonSelected]}>
                {selected && <View style={styles.radioButtonInner} />}
            </View>
            <Text style={[styles.radioLabel, selected && styles.radioLabelSelected]}>{label}</Text>
        </TouchableOpacity>
    );


    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={28} color={Theme.colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Provide Feedback</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <View style={styles.innerContainer}>
                    <Text style={styles.sectionTitle}>Feedback Type</Text>
                    <View style={styles.typesGrid}>
                        {feedbackTypes.map((type) => (
                            <RadioButton
                                key={type.id}
                                label={type.label}
                                selected={feedbackType === type.id}
                                onPress={() => setFeedbackType(type.id)}
                            />
                        ))}
                    </View>

                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.typeExplanation}>
                        {feedbackTypes.find(t => t.id === feedbackType)?.description}
                    </Text>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Enter your feedback here..."
                            placeholderTextColor={Theme.colors.text.muted}
                            multiline
                            numberOfLines={6}
                            value={description}
                            onChangeText={setDescription}
                            textAlignVertical="top"
                        />
                        <Text style={styles.charCount}>{description.length}/5000</Text>
                    </View>


                    <TouchableOpacity
                        style={[styles.submitButton, !description.trim() && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={!description.trim()}
                    >
                        <Text style={[styles.submitButtonText, !description.trim() && styles.submitButtonTextDisabled]}>Submit</Text>
                    </TouchableOpacity>
                    <Text style={styles.confirmationNote}>
                        Thanks! We’re getting on this right away and will email you if we need more details.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Theme.spacing.m,
        paddingVertical: Theme.spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.border,
    },
    backButton: {
        padding: Theme.spacing.s,
    },
    headerTitle: {
        fontSize: 20,
        color: Theme.colors.text.primary,
        fontFamily: 'Inter-Bold',
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: Theme.spacing.xxl,
    },
    innerContainer: {
        maxWidth: 1000,
        width: '100%',
        alignSelf: 'center',
        padding: Theme.spacing.xl,
    },
    sectionTitle: {
        fontSize: 16,
        color: Theme.colors.text.primary,
        fontFamily: 'Inter-Bold',
        marginBottom: Theme.spacing.l,
        marginTop: Theme.spacing.l,
    },
    typesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Theme.spacing.m,
        marginBottom: Theme.spacing.l,
    },
    radioContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Theme.spacing.m,
        paddingHorizontal: Theme.spacing.l,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: Theme.borderRadius.m,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        minWidth: '45%',
        flex: 1,
    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: Theme.colors.text.muted,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Theme.spacing.m,
    },
    radioButtonSelected: {
        borderColor: Theme.colors.primary,
    },
    radioButtonInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Theme.colors.primary,
    },
    radioLabel: {
        fontSize: 14,
        color: Theme.colors.text.secondary,
        fontFamily: 'Inter-Regular',
    },
    radioLabelSelected: {
        color: Theme.colors.text.primary,
        fontFamily: 'Inter-Bold',
    },
    typeExplanation: {
        fontSize: 14,
        color: Theme.colors.text.muted,
        fontFamily: 'Inter-Regular',
        marginBottom: Theme.spacing.m,
    },
    inputWrapper: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: Theme.borderRadius.l,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        padding: Theme.spacing.m,
        marginBottom: Theme.spacing.xl,
    },
    textInput: {
        minHeight: 150,
        color: Theme.colors.text.primary,
        fontSize: 16,
        fontFamily: 'Inter-Regular',
        textAlignVertical: 'top',
    },
    charCount: {
        alignSelf: 'flex-end',
        fontSize: 12,
        color: Theme.colors.text.muted,
        marginTop: 8,
    },
    submitButton: {
        backgroundColor: Theme.colors.primary,
        paddingVertical: 18,
        borderRadius: Theme.borderRadius.xl,
        alignItems: 'center',
        shadowColor: Theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    submitButtonDisabled: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        shadowOpacity: 0,
        elevation: 0,
    },
    submitButtonText: {
        color: Theme.colors.background,
        fontSize: 18,
        fontFamily: 'Inter-Bold',
    },
    submitButtonTextDisabled: {
        color: Theme.colors.text.muted,
    },
    confirmationNote: {
        fontSize: 13,
        color: Theme.colors.text.muted,
        textAlign: 'center',
        marginTop: Theme.spacing.l,
        fontFamily: 'Inter-Regular',
        lineHeight: 18,
    },
});
