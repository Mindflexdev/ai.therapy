import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, FlatList, Dimensions, ViewToken } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { TOPICS, Topic, Character } from '@/constants/data';
import { getAllCharactersGroupedByTopic, UserCharacter } from '@/constants/storage';

const { width } = Dimensions.get('window');
// Calculate card width: ensure 2 per row, max 200px each
// Section padding (32px) + gap (12px) = 44px total spacing
const calculatedWidth = (width - 44) / 2;
const CARD_WIDTH = Math.min(calculatedWidth, 200); // Max 200px per card

interface TopicSection {
  id: string;
  title: string;
  characters: UserCharacter[];
}

const VIEWABILITY_CONFIG = {
  itemVisiblePercentThreshold: 10
};

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [selectedTopicId, setSelectedTopicId] = useState<string>(TOPICS[0].id);
  const [sections, setSections] = useState<TopicSection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasCreatedCharacters, setHasCreatedCharacters] = useState(false);

  const mainListRef = useRef<FlatList>(null);
  const headerListRef = useRef<FlatList>(null);
  const isManualScroll = useRef(false);

  // Load all characters grouped by topic
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const groupedData = await getAllCharactersGroupedByTopic();

        // Get user's created public characters
        const { getUserCharacters } = await import('@/constants/storage');
        const userChars = await getUserCharacters();
        const publicUserChars = userChars.filter(c => c.isPublic);

        const allSections: TopicSection[] = [];

        // Add "Created" section if user has public characters
        if (publicUserChars.length > 0) {
          setHasCreatedCharacters(true);
          allSections.push({
            id: 'created',
            title: 'Created',
            characters: publicUserChars
          });
        }

        // Map the Supabase data to our Topic structure, preserving the order from TOPICS constant
        const mappedSections: TopicSection[] = TOPICS.map(topic => {
          const foundGroup = groupedData.find(g => g.topicId === topic.id);
          return {
            id: topic.id,
            title: topic.title,
            characters: foundGroup ? foundGroup.characters : []
          };
        }).filter(section => section.characters.length > 0); // Only show topics with characters

        setSections([...allSections, ...mappedSections]);
      } catch (error) {
        console.error('Failed to load characters:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle scroll spy
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && !isManualScroll.current) {
      const firstVisible = viewableItems[0];
      const topicId = firstVisible.item.id;
      setSelectedTopicId(topicId);

      // Also scroll the header to keep the active chip visible
      const index = TOPICS.findIndex(t => t.id === topicId);
      if (index !== -1 && headerListRef.current) {
        headerListRef.current.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
      }
    }
  }).current;

  const handleTopicPress = (topicId: string) => {
    isManualScroll.current = true;
    setSelectedTopicId(topicId);

    const index = sections.findIndex(s => s.id === topicId);
    if (index !== -1 && mainListRef.current) {
      mainListRef.current.scrollToIndex({ index, animated: true, viewPosition: 0 });
    }

    // Reset manual scroll flag after animation
    setTimeout(() => {
      isManualScroll.current = false;
    }, 500);
  };

  const renderTopicChip = ({ item }: { item: Topic }) => {
    const isSelected = item.id === selectedTopicId;
    return (
      <TouchableOpacity
        onPress={() => handleTopicPress(item.id)}
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

  const renderCharacterCard = (item: Character) => (
    <TouchableOpacity
      key={item.id}
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

  const renderSection = ({ item }: { item: TopicSection }) => {
    return (
      <View style={styles.sectionContainer}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>{item.title}</ThemedText>
        <View style={styles.gridContainer}>
          {item.characters.map(char => renderCharacterCard(char))}
        </View>
      </View>
    );
  };

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

      <View style={styles.topicsRow}>
        {/* Create Button or Created Chip */}
        <TouchableOpacity
          onPress={() => hasCreatedCharacters ? handleTopicPress('created') : router.push('/(tabs)/create')}
          style={[
            styles.createChip,
            {
              backgroundColor: (hasCreatedCharacters && selectedTopicId === 'created') ? theme.tint : theme.card,
              borderColor: (hasCreatedCharacters && selectedTopicId === 'created') ? theme.tint : theme.icon,
            },
          ]}>
          {hasCreatedCharacters ? (
            <ThemedText
              style={[
                styles.topicText,
                { color: selectedTopicId === 'created' ? '#fff' : theme.text, fontWeight: selectedTopicId === 'created' ? '600' : '400' },
              ]}>
              Created
            </ThemedText>
          ) : (
            <IconSymbol name="plus" size={20} color={theme.tint} />
          )}
        </TouchableOpacity>

        <FlatList
          ref={headerListRef}
          data={TOPICS}
          renderItem={renderTopicChip}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.topicsContainer}
          style={styles.topicsList}
        />
      </View>

      <FlatList
        ref={mainListRef}
        data={sections}
        renderItem={renderSection}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={VIEWABILITY_CONFIG}
        ListEmptyComponent={
          isLoading ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <ThemedText>Loading characters...</ThemedText>
            </View>
          ) : (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <ThemedText>No characters found.</ThemedText>
            </View>
          )
        }
        contentContainerStyle={{ paddingBottom: 100 }}
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
  topicsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
  },
  createChip: {
    minWidth: 44,
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  topicsContainer: {
    paddingHorizontal: 0,
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
  sectionContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    marginBottom: 12,
    fontSize: 20,
    fontWeight: '600',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  characterCard: {
    width: CARD_WIDTH,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
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
