import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { TOPICS, Topic, Character } from '@/constants/data';
import { getPublicCharacters, UserCharacter } from '@/constants/storage';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [selectedTopicId, setSelectedTopicId] = useState<string>(TOPICS[0].id);
  const [userPublicCharacters, setUserPublicCharacters] = useState<UserCharacter[]>([]);

  // Load user-created public characters
  const loadPublicCharacters = async () => {
    const publicChars = await getPublicCharacters();
    setUserPublicCharacters(publicChars);
  };

  // Reload when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadPublicCharacters();
    }, [])
  );

  // Merge default characters with user-created public characters
  const selectedTopic = TOPICS.find((t) => t.id === selectedTopicId) || TOPICS[0];
  const allCharacters = [...selectedTopic.characters, ...userPublicCharacters];

  const renderTopicItem = ({ item }: { item: Topic }) => {
    const isSelected = item.id === selectedTopicId;
    return (
      <TouchableOpacity
        onPress={() => setSelectedTopicId(item.id)}
        style={[
          styles.topicChip,
          {
            backgroundColor: isSelected ? theme.tint : theme.card,
            borderColor: isSelected ? theme.tint : theme.icon,
          },
        ]}>
        <ThemedText
          style={[
            styles.topicText,
            { color: isSelected ? '#fff' : theme.text, fontWeight: isSelected ? '600' : '400' },
          ]}>
          {item.title}
        </ThemedText>
      </TouchableOpacity>
    );
  };

  const renderCharacterItem = ({ item }: { item: Character }) => (
    <TouchableOpacity
      style={[styles.characterCard, { backgroundColor: theme.card }]}
      onPress={() => router.push(`/conversation/${item.id}` as any)}>
      <Image source={{ uri: item.image }} style={styles.characterImage} contentFit="cover" />
      <View style={styles.characterInfo}>
        <ThemedText type="defaultSemiBold" style={styles.characterName}>
          {item.name}
        </ThemedText>
        <ThemedText style={styles.characterDesc} numberOfLines={2}>
          {item.description}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <ThemedText type="title" style={styles.logoText}>
            therapy.ai
          </ThemedText>
          <TouchableOpacity
            style={styles.premiumButton}
            onPress={() => router.push('/subscribe' as any)}>
            <ThemedText style={styles.premiumButtonText}>Get therapy.ai +</ThemedText>
          </TouchableOpacity>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.searchButton}>
            <IconSymbol name="magnifyingglass" size={24} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.feedbackButton, { backgroundColor: theme.primary }]}
            onPress={() => router.push('/feedback')}
          >
            <ThemedText style={styles.feedbackButtonText}>Feedback?</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      <View>
        <FlatList
          data={TOPICS}
          renderItem={renderTopicItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.topicsContainer}
          style={styles.topicsList}
        />
      </View>

      <FlatList
        data={selectedTopic.characters}
        renderItem={renderCharacterItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.characterGrid}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  feedbackButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  feedbackButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  premiumButton: {
    backgroundColor: '#5B8FD8', // Therapeutic blue
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  premiumButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  searchButton: {
    padding: 8,
  },
  topicsList: {
    maxHeight: 60,
  },
  topicsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  topicChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  topicText: {
    fontSize: 14,
  },
  gridContainer: {
    padding: 16,
  },
  characterGrid: {
    gap: 12,
    marginBottom: 12,
  },
  characterCard: {
    flex: 1,
    maxWidth: CARD_WIDTH,
    borderRadius: 16,
    overflow: 'hidden',
  },
  characterImage: {
    width: '100%',
    height: CARD_WIDTH * 1.2, // Portrait aspect ratio
  },
  characterInfo: {
    padding: 12,
  },
  characterName: {
    fontSize: 16,
    marginBottom: 4,
  },
  characterDesc: {
    fontSize: 12,
    opacity: 0.7,
  },
});
