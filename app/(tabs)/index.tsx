import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, Platform, Pressable, StyleSheet, TextInput, TouchableOpacity, View, ViewToken } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { LogoWithDots } from '@/components/logo-with-dots';
import { OnboardingModal } from '@/components/onboarding-modal';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Character, Topic, TOPICS } from '@/constants/data';
import { deleteCharacter, getAllCharactersGroupedByTopic, getUserCharacters, UserCharacter } from '@/constants/storage';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';

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
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSections, setFilteredSections] = useState<TopicSection[]>([]);
  const [userGoals, setUserGoals] = useState<string[]>([]);
  const [sortedTopics, setSortedTopics] = useState<Topic[]>(TOPICS);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Menu & Modal States
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [shareCharacter, setShareCharacter] = useState<Character | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<Character | null>(null);

  const mainListRef = useRef<FlatList>(null);
  const headerListRef = useRef<FlatList>(null);
  const isManualScroll = useRef(false);
  const hasCheckedOnboarding = useRef(false);

  // Check onboarding status
  useEffect(() => {
    const checkOnboarding = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from('users')
          .select('onboarding_completed')
          .eq('id', session.user.id)
          .single();

        if (data && !data.onboarding_completed) {
          setShowOnboarding(true);
        }
      }
    };
    checkOnboarding();
  }, []);

  // Load user goals, sort topics, and load characters - reload when tab becomes active
  useFocusEffect(
    useCallback(() => {
      const loadEverything = async () => {
        console.log('🏠 Home tab focused - progressive loading...');

        // Phase 1: Immediate Local Load (Created Section)
        try {
          const userChars = await getUserCharacters();
          const publicUserChars = userChars.filter(c => c.isPublic);
          const initialSections: TopicSection[] = [];

          if (publicUserChars.length > 0) {
            setHasCreatedCharacters(true);
            initialSections.push({
              id: 'created',
              title: 'Created',
              characters: publicUserChars
            });
            // FLASH: Show Created immediately
            setSections(initialSections);
          } else {
            setHasCreatedCharacters(false);
            // If no created chars, we might want to show a skeleton or just wait, 
            // but let's clear sections to be safe or keep empty if it was empty.
            setSections([]);
          }

          // Phase 2: Background Network Fetch
          setIsLoading(initialSections.length === 0); // Only show spinner if we have NOTHING to show

          const { data: { session } } = await supabase.auth.getSession();
          let finalSortedTopics = TOPICS;

          if (session) {
            // Parallel fetch: Goals + Grouped Data
            const [userGoalsData, groupedData] = await Promise.all([
              supabase.from('users').select('user_goals').eq('id', session.user.id).single(),
              getAllCharactersGroupedByTopic(false)
            ]);

            // Process Goals & Sorting
            if (userGoalsData.data?.user_goals && userGoalsData.data.user_goals.length > 0) {
              const goals = userGoalsData.data.user_goals;
              setUserGoals(goals);

              const userGoalTopics = TOPICS.filter(topic =>
                goals.some((goal: string) => topic.id.toLowerCase() === goal.toLowerCase() || topic.title.toLowerCase() === goal.toLowerCase())
              );
              const otherTopics = TOPICS.filter(topic =>
                !goals.some((goal: string) => topic.id.toLowerCase() === goal.toLowerCase() || topic.title.toLowerCase() === goal.toLowerCase())
              );
              finalSortedTopics = [...userGoalTopics, ...otherTopics];
              setSortedTopics(finalSortedTopics); // Update header chips
            }

            // Map Topics
            const mappedSections: TopicSection[] = finalSortedTopics.map(topic => {
              const foundGroup = groupedData.find(g => g.topicId === topic.id);
              return {
                id: topic.id,
                title: topic.title,
                characters: foundGroup ? foundGroup.characters : []
              };
            }).filter(section => section.characters.length > 0);

            // Phase 3: Merge & Update
            // We re-fetch userChars to be purely safe if something changed in split second, 
            // but usually we just append mappedSections to the initialSections.

            // To be robust: Re-construct the full list
            const allSections: TopicSection[] = [];
            if (publicUserChars.length > 0) {
              allSections.push({
                id: 'created',
                title: 'Created',
                characters: publicUserChars
              });
            }

            setSections([...allSections, ...mappedSections]);
          }

        } catch (error) {
          console.error('❌ Error loading characters:', error);
        } finally {
          setIsLoading(false);
        }
      };

      loadEverything();
    }, [])
  );

  // Filter sections based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSections(sections);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = sections.map(section => ({
        ...section,
        characters: section.characters.filter(char =>
          char.name.toLowerCase().includes(query)
        )
      })).filter(section => section.characters.length > 0);
      setFilteredSections(filtered);
    }
  }, [searchQuery, sections]);

  // Handle scroll spy
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && !isManualScroll.current) {
      const firstVisible = viewableItems[0];
      const topicId = firstVisible.item.id;
      setSelectedTopicId(topicId);

      // Auto-scroll disabled per user request to prevent jumping
      // const index = sortedTopics.findIndex(t => t.id === topicId);
      // if (index > 0 && headerListRef.current) {
      //   headerListRef.current.scrollToIndex({ index: index + 1, animated: true, viewPosition: 0.5 });
      // }
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

  const renderTopicChip = useCallback(({ item }: { item: Topic }) => {
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
  }, [selectedTopicId, theme, handleTopicPress]);

  const handleShare = (char: Character) => {
    setActiveMenuId(null);
    setShareCharacter(char);
  };

  const handleEdit = (char: Character) => {
    setActiveMenuId(null);
    router.push({
      pathname: '/(tabs)/create',
      params: { editMode: 'true', characterData: JSON.stringify(char) }
    } as any);
  };

  const handleDeleteRequest = (char: Character) => {
    setActiveMenuId(null);
    setDeleteConfirmation(char);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation) return;

    try {
      await deleteCharacter(deleteConfirmation.id);

      // Reload data logic (duplicated for now, could be refactored)
      setIsLoading(true);
      const groupedData = await getAllCharactersGroupedByTopic();
      const userChars = await getUserCharacters();
      const publicUserChars = userChars.filter(c => c.isPublic);

      const allSections: TopicSection[] = [];
      if (publicUserChars.length > 0) {
        setHasCreatedCharacters(true);
        allSections.push({ id: 'created', title: 'Created', characters: publicUserChars });
      } else {
        setHasCreatedCharacters(false);
      }

      const mappedSections = TOPICS.map(topic => {
        const foundGroup = groupedData.find(g => g.topicId === topic.id);
        return { id: topic.id, title: topic.title, characters: foundGroup ? foundGroup.characters : [] };
      }).filter(s => s.characters.length > 0);

      setSections([...allSections, ...mappedSections]);
    } catch (error) {
      console.error('Delete failed', error);
    } finally {
      setIsLoading(false);
      setDeleteConfirmation(null);
    }
  };

  const renderCharacterCard = useCallback((item: Character, index: number, sectionId?: string) => (
    <Animated.View
      key={item.id}
      entering={FadeInDown.delay(index * 100).springify().damping(12)}
    >
      <TouchableOpacity
        style={[styles.characterCard, { backgroundColor: theme.card }]}
        onPress={() => {
          console.log('Opening conversation with:', item.id);
          router.push(`/conversation/${item.id}` as any);
        }}>
        <Image
          source={{ uri: item.image }}
          style={styles.characterImage}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={300}
        />
        {sectionId === 'created' && (
          <View style={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={(e) => {
                e.stopPropagation();
                setActiveMenuId(activeMenuId === item.id ? null : item.id);
              }}
            >
              <IconSymbol name="ellipsis.vertical" size={20} color="#fff" />
            </TouchableOpacity>

            {activeMenuId === item.id && (
              <View style={[styles.menuDropdown, { backgroundColor: theme.card }]}>
                <TouchableOpacity style={styles.menuItem} onPress={(e) => { e.stopPropagation(); handleShare(item); }}>
                  <IconSymbol name="square.and.arrow.up" size={16} color={theme.text} />
                  <ThemedText style={styles.menuText}>Share</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={(e) => { e.stopPropagation(); handleEdit(item); }}>
                  <IconSymbol name="pencil" size={16} color={theme.text} />
                  <ThemedText style={styles.menuText}>Edit</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={(e) => { e.stopPropagation(); handleDeleteRequest(item); }}>
                  <IconSymbol name="trash" size={16} color="#FF3B30" />
                  <ThemedText style={[styles.menuText, { color: '#FF3B30' }]}>Delete</ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        <View style={styles.characterInfo}>
          <ThemedText type="defaultSemiBold" style={styles.characterName}>
            {item.name}
          </ThemedText>
          <ThemedText style={styles.characterDesc} numberOfLines={2}>
            {item.description}
          </ThemedText>
        </View>
      </TouchableOpacity>
    </Animated.View>
  ), [theme, router, activeMenuId]);

  const renderSection = useCallback(({ item }: { item: TopicSection }) => {
    return (
      <View style={styles.sectionContainer}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>{item.title}</ThemedText>
        <View style={styles.gridContainer}>
          {item.characters.map((char, index) => renderCharacterCard(char, index, item.id))}
        </View>
      </View>
    );
  }, [renderCharacterCard]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <LogoWithDots fontSize={24} />
          <TouchableOpacity
            style={styles.premiumButton}
            onPress={() => router.push('/subscribe' as any)}>
            <ThemedText style={styles.premiumButtonText}>Get ai.therapy +</ThemedText>
          </TouchableOpacity>
        </View>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.topicsRow}>
        <FlatList
          ref={headerListRef}
          data={[
            { id: 'create-or-created', title: hasCreatedCharacters ? 'Created' : '+', isSpecial: true },
            ...sortedTopics
          ]}
          renderItem={({ item }) => {
            if ((item as any).isSpecial) {
              const isSelected = hasCreatedCharacters && selectedTopicId === 'created';
              return (
                <TouchableOpacity
                  onPress={() => hasCreatedCharacters ? handleTopicPress('created') : router.push('/(tabs)/create')}
                  style={[
                    styles.createChip,
                    {
                      backgroundColor: isSelected ? theme.tint : theme.card,
                      borderColor: isSelected ? theme.tint : theme.icon,
                    },
                  ]}>
                  {hasCreatedCharacters ? (
                    <ThemedText
                      style={[
                        styles.topicText,
                        { color: isSelected ? '#fff' : theme.text, fontWeight: isSelected ? '600' : '400' },
                      ]}>
                      Created
                    </ThemedText>
                  ) : (
                    <IconSymbol name="plus" size={20} color={theme.tint} />
                  )}
                </TouchableOpacity>
              );
            }
            return renderTopicChip({ item: item as Topic });
          }}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.topicsContainer}
          style={styles.topicsList}
        />
      </View>

      <FlatList
        ref={mainListRef}
        data={filteredSections}
        renderItem={renderSection}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={VIEWABILITY_CONFIG}
        // Performance Tuning
        initialNumToRender={2}
        windowSize={3}
        maxToRenderPerBatch={2}
        removeClippedSubviews={Platform.OS === 'android'}
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

      {/* Share Modal */}
      {shareCharacter && (
        <Pressable style={styles.modalOverlay} onPress={() => setShareCharacter(null)}>
          <Pressable style={[styles.modalContent, { backgroundColor: theme.card }]} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle">Share Character</ThemedText>
              <TouchableOpacity onPress={() => setShareCharacter(null)}>
                <IconSymbol name="xmark.circle.fill" size={24} color={theme.icon} />
              </TouchableOpacity>
            </View>

            <View style={styles.shareProfile}>
              <Image source={{ uri: shareCharacter.image }} style={styles.shareImage} />
              <ThemedText type="defaultSemiBold" style={{ marginTop: 12 }}>{shareCharacter.name}</ThemedText>
              <ThemedText style={styles.shareDesc}>{shareCharacter.description}</ThemedText>
            </View>

            <View style={{ flexDirection: 'row', gap: 12, width: '100%', alignItems: 'center' }}>
              <View style={[styles.linkContainer, { backgroundColor: theme.background, flex: 1 }]}>
                <ThemedText style={styles.linkText} numberOfLines={1}>
                  https://ai.therapy/c/{shareCharacter.id}
                </ThemedText>
              </View>
              <TouchableOpacity style={styles.copyButton}>
                <IconSymbol name="doc.on.doc" size={16} color="#fff" />
                <ThemedText style={styles.copyButtonText}>Copy</ThemedText>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      )}

      {/* Delete Modal */}
      {deleteConfirmation && (
        <Pressable style={styles.modalOverlay} onPress={() => setDeleteConfirmation(null)}>
          <Pressable style={[styles.modalContent, { backgroundColor: theme.card }]} onPress={(e) => e.stopPropagation()}>
            <ThemedText type="subtitle" style={{ marginBottom: 12 }}>Delete Character?</ThemedText>
            <ThemedText style={{ marginBottom: 24, textAlign: 'center', opacity: 0.8 }}>
              Are you sure you want to delete "{deleteConfirmation.name}"? This action cannot be undone.
            </ThemedText>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.background }]}
                onPress={() => setDeleteConfirmation(null)}
              >
                <ThemedText>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#FF3B30' }]}
                onPress={confirmDelete}
              >
                <ThemedText style={{ color: '#fff', fontWeight: '600' }}>Delete</ThemedText>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      )}

      {/* Onboarding Modal */}
      <OnboardingModal
        visible={showOnboarding}
        onComplete={async () => {
          setShowOnboarding(false);
          // Reload data to show sorted topics
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            const { data } = await supabase
              .from('users')
              .select('user_goals')
              .eq('id', session.user.id)
              .single();

            if (data?.user_goals && data.user_goals.length > 0) {
              console.log('Reloading with user goals:', data.user_goals);
              setUserGoals(data.user_goals);
              const userGoalTopics = TOPICS.filter(topic =>
                data.user_goals.some((goal: string) =>
                  topic.id.toLowerCase() === goal.toLowerCase()
                )
              );
              const otherTopics = TOPICS.filter(topic =>
                !data.user_goals.some((goal: string) =>
                  topic.id.toLowerCase() === goal.toLowerCase()
                )
              );
              const newSortedTopics = [...userGoalTopics, ...otherTopics];
              console.log('New sorted topics:', newSortedTopics.map(t => t.id));
              setSortedTopics(newSortedTopics);

              // Force reload sections with new sorting
              const groupedData = await getAllCharactersGroupedByTopic();
              const userChars = await getUserCharacters();
              const publicUserChars = userChars.filter(c => c.isPublic);

              const allSections: TopicSection[] = [];
              if (publicUserChars.length > 0) {
                setHasCreatedCharacters(true);
                allSections.push({ id: 'created', title: 'Created', characters: publicUserChars });
              }

              const mappedSections = newSortedTopics.map(topic => {
                const foundGroup = groupedData.find(g => g.topicId === topic.id);
                return { id: topic.id, title: topic.title, characters: foundGroup ? foundGroup.characters : [] };
              }).filter(s => s.characters.length > 0);

              setSections([...allSections, ...mappedSections]);
            }
          }
        }}
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
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: 44,
    ...Platform.select({
      web: {
        outlineStyle: 'none' as any,
      }
    })
  },
  searchCloseButton: {
    padding: 4,
    marginLeft: 8,
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
  menuButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  menuDropdown: {
    position: 'absolute',
    top: 36,
    right: 0,
    width: 150,
    borderRadius: 12,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  menuText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  modalContent: {
    width: '85%',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  shareProfile: {
    alignItems: 'center',
    marginBottom: 24,
  },
  shareImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  shareDesc: {
    textAlign: 'center',
    fontSize: 13,
    opacity: 0.7,
    marginTop: 4,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  linkText: {
    flex: 1,
    paddingHorizontal: 4,
    fontSize: 13,
    opacity: 0.6,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#5B8FD8',
    borderRadius: 8,
  },
  copyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  characterInfo: {
    padding: 12,
  },
  characterName: {
    marginBottom: 4,
  },
  characterDesc: {
    fontSize: 12,
    opacity: 0.7,
  },
});
