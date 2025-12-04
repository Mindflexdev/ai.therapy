import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

export default function PlayerScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0.3); // Mock progress

    // Fallback data if params are missing
    const title = params.title || 'Train Dreams: An Immersive Audio Journey';
    const author = params.author || 'Netflix';
    const narrator = params.narrator || 'Cast of "Train Dreams"';
    const image = params.image || 'https://images.unsplash.com/photo-1448375240586-dfd8f3793371?q=80&w=2670&auto=format&fit=crop';
    const duration = params.duration || '22:10';

    return (
        <View style={styles.container}>
            {/* Background Image */}
            <Image source={{ uri: image as string }} style={styles.backgroundImage} contentFit="cover" />

            {/* Dark Overlay for readability */}
            <LinearGradient
                colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
                style={styles.gradient}
            />

            <SafeAreaView style={styles.content}>
                {/* Header Controls */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                        <IconSymbol name="chevron.down" size={28} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerRight}>
                        <TouchableOpacity style={styles.iconButton}>
                            <IconSymbol name="arrow.down.circle" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Main Content Area */}
                <View style={styles.mainContent}>
                    {/* Optional Promo/Upsell Card (mimicking the screenshot's "Free listens" box) */}
                    <View style={styles.promoCard}>
                        <ThemedText style={styles.promoText}>You get 3 free listens, on us.</ThemedText>
                        <ThemedText style={styles.promoSubtext}>Start a free 7-day trial for full access.</ThemedText>
                        <TouchableOpacity style={styles.promoButton}>
                            <ThemedText style={styles.promoButtonText}>Learn More</ThemedText>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.infoContainer}>
                        <ThemedText type="title" style={styles.title}>{title}</ThemedText>
                        <ThemedText style={styles.description}>
                            An immersive session designed to help you relax and find clarity.
                            Guided by your personal AI companion.
                        </ThemedText>

                        <View style={styles.metadataRow}>
                            <View>
                                <ThemedText style={styles.metadataLabel}>NARRATOR</ThemedText>
                                <ThemedText style={styles.metadataValue}>{narrator}</ThemedText>
                            </View>
                            <View>
                                <ThemedText style={styles.metadataLabel}>AUTHOR</ThemedText>
                                <ThemedText style={styles.metadataValue}>{author}</ThemedText>
                            </View>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                        <TouchableOpacity style={styles.actionCircle}>
                            <IconSymbol name="heart" size={24} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionCircle}>
                            <IconSymbol name="square.and.arrow.up" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Playback Controls */}
                    <View style={styles.controlsContainer}>
                        <View style={styles.controlsRow}>
                            <TouchableOpacity>
                                <IconSymbol name="gobackward.15" size={32} color="#fff" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setIsPlaying(!isPlaying)}
                                style={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: 40,
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                            >
                                <IconSymbol
                                    name={isPlaying ? "pause.fill" : "play.fill"}
                                    size={40}
                                    color="#fff"
                                />
                            </TouchableOpacity>

                            <TouchableOpacity>
                                <IconSymbol name="goforward.15" size={32} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        {/* Progress Bar */}
                        <View style={styles.progressContainer}>
                            <Slider
                                style={styles.slider}
                                minimumValue={0}
                                maximumValue={1}
                                value={progress}
                                minimumTrackTintColor="#fff"
                                maximumTrackTintColor="rgba(255,255,255,0.3)"
                                thumbTintColor="#fff"
                            />
                            <View style={styles.timeRow}>
                                <ThemedText style={styles.timeText}>0:01</ThemedText>
                                <ThemedText style={styles.timeText}>{duration}</ThemedText>
                            </View>
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    backgroundImage: {
        ...StyleSheet.absoluteFillObject,
        width: width,
        height: height,
    },
    gradient: {
        ...StyleSheet.absoluteFillObject,
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    headerRight: {
        flexDirection: 'row',
        gap: 16,
    },
    iconButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
    },
    mainContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    promoCard: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 40,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
    },
    promoText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    promoSubtext: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        marginBottom: 16,
    },
    promoButton: {
        backgroundColor: '#fff',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 24,
        width: '100%',
        alignItems: 'center',
    },
    promoButtonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
    },
    infoContainer: {
        marginBottom: 32,
    },
    title: {
        color: '#fff',
        fontSize: 28,
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 34,
    },
    description: {
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 32,
    },
    metadataRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    metadataLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        letterSpacing: 1,
        marginBottom: 4,
        textAlign: 'center',
    },
    metadataValue: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 24,
        marginBottom: 40,
    },
    actionCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    controlsContainer: {
        gap: 24,
    },
    controlsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    progressContainer: {
        gap: 8,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    timeText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        fontVariant: ['tabular-nums'],
    },
});
