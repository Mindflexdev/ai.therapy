import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Theme } from '../../src/constants/Theme';
import { ChevronLeft, Phone, Search, Image as ImageIcon, Star, Bell, Lock } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { THERAPIST_IMAGES } from '../../src/constants/Therapists';

export default function ProfileScreen() {
    const router = useRouter();
    const { name } = useLocalSearchParams();

    const therapistName = (name as string) || 'Marcus';
    const therapistImage = THERAPIST_IMAGES[therapistName];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={28} color={Theme.colors.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Contact Info</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.profileSection}>
                    <View style={styles.haloWrapper}>
                        <View style={styles.halo} />
                        <Image
                            source={therapistImage}
                            style={styles.largeAvatar}
                            defaultSource={require('../../assets/adaptive-icon.png')}
                        />
                    </View>
                    <Text style={styles.name}>{therapistName}</Text>
                    <Text style={styles.details}>Available for 24/7 Support</Text>
                    <Text style={styles.quote}>"Human connection is the first step toward healing, even in the digital age."</Text>
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.actionBtn}>
                        <Phone size={24} color={Theme.colors.primary} />
                        <Text style={styles.actionText}>Audio</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn}>
                        <Search size={24} color={Theme.colors.primary} />
                        <Text style={styles.actionText}>Search</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.menuSection}>
                    <TouchableOpacity style={styles.menuRow}>
                        <View style={styles.rowLeft}>
                            <ImageIcon size={20} color={Theme.colors.text.muted} />
                            <Text style={styles.rowLabel}>Media, Links, Docs</Text>
                        </View>
                        <Text style={styles.rowValue}>195</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuRow}>
                        <View style={styles.rowLeft}>
                            <Star size={20} color={Theme.colors.text.muted} />
                            <Text style={styles.rowLabel}>Starred Messages</Text>
                        </View>
                        <Text style={styles.rowValue}>None</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuRow}>
                        <View style={styles.rowLeft}>
                            <Bell size={20} color={Theme.colors.text.muted} />
                            <Text style={styles.rowLabel}>Notifications</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.menuSection}>
                    <TouchableOpacity style={styles.menuRow}>
                        <View style={styles.rowLeft}>
                            <Lock size={20} color={Theme.colors.text.muted} />
                            <Text style={styles.rowLabel}>Lock Chat</Text>
                        </View>
                    </TouchableOpacity>
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
        padding: Theme.spacing.m,
    },
    backButton: {
        padding: Theme.spacing.s,
    },
    headerTitle: {
        color: Theme.colors.text.primary,
        fontFamily: 'Playfair-Bold',
        fontSize: 20,
    },
    scrollContent: {
        alignItems: 'center',
        paddingBottom: Theme.spacing.xxl,
    },
    profileSection: {
        alignItems: 'center',
        marginTop: Theme.spacing.l,
        paddingHorizontal: Theme.spacing.xl,
    },
    haloWrapper: {
        width: 160,
        height: 160,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    halo: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: 2,
        borderColor: Theme.colors.primary,
        borderRadius: 80,
        opacity: 0.5,
    },
    largeAvatar: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: '#333',
    },
    name: {
        color: Theme.colors.text.primary,
        fontFamily: 'Playfair-Bold',
        fontSize: 28,
        marginTop: Theme.spacing.l,
    },
    details: {
        color: Theme.colors.text.muted,
        fontFamily: 'Inter-Regular',
        fontSize: 16,
        marginTop: 4,
    },
    quote: {
        color: Theme.colors.text.secondary,
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: Theme.spacing.l,
        lineHeight: 20,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        marginTop: Theme.spacing.xl,
        gap: Theme.spacing.l,
    },
    actionBtn: {
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: Theme.spacing.m,
        borderRadius: Theme.borderRadius.m,
        width: 90,
    },
    actionText: {
        color: Theme.colors.primary,
        fontFamily: 'Inter-Regular',
        fontSize: 12,
        marginTop: 8,
    },
    menuSection: {
        width: '90%',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: Theme.borderRadius.m,
        marginTop: Theme.spacing.xl,
        overflow: 'hidden',
    },
    menuRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Theme.spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rowLabel: {
        color: Theme.colors.text.primary,
        marginLeft: Theme.spacing.m,
        fontSize: 16,
    },
    rowValue: {
        color: Theme.colors.text.muted,
        fontSize: 14,
    },
});
