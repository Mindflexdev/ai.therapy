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
import { ProfileService } from '@/lib/profile-service';

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

// ... (imports remain the same, adding AsyncStorage for Favorites)
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard'; // Ensure this is installed or use substitute
// Note: If expo-clipboard is not available, we might need a simple alert fallback or use React Native's Clipboard
import { Clipboard as RNClipboard } from 'react-native';

const FAVORITES_KEY = '@therapy_ai_favorites';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const [selectedTopicId, setSelectedTopicId] = useState<string>(TOPICS[0].id);
  const [sections, setSections] = useState<TopicSection[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Lazy Loading State
  const allSectionsRef = useRef<TopicSection[]>([]);
  const renderedCountRef = useRef(0);

  const [isLoading, setIsLoading] = useState(false);
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

  // Load Favorites & User ID
  useEffect(() => {
    const init = async () => {
      // Favorites
      try {
        const favs = await AsyncStorage.getItem(FAVORITES_KEY);
        if (favs) setFavorites(JSON.parse(favs));
      } catch (e) { console.error('Error loading favorites', e); }

      // User ID
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUserId(session.user.id);
      }

      // Onboarding check
      if (session?.user) {
        const { data } = await supabase.from('users').select('onboarding_completed').eq('id', session.user.id).single();
        if (data && !data.onboarding_completed) setShowOnboarding(true);
      }
    };
    init();
  }, []);

  const toggleFavorite = async (charId: string) => {
    const newFavs = favorites.includes(charId)
      ? favorites.filter(id => id !== charId)
      : [...favorites, charId];

    setFavorites(newFavs);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavs));

    // If currently viewing favorites, reload/filter
    if (selectedTopicId === 'favorites') {
      // Provide immediate feedback in UI if needed
    }
  };

  const loadMoreSections = useCallback(() => {
    if (searchQuery.trim() !== '') return;

    const total = allSectionsRef.current.length;
    const current = renderedCountRef.current;

    if (current >= total) return;

    // Load next batch
    const nextBatchSize = 2;
    const nextSections = allSectionsRef.current.slice(0, current + nextBatchSize);

    renderedCountRef.current = nextSections.length;
    setSections(nextSections);
    console.log(`📜 Lazy loaded: ${current} -> ${nextSections.length} sections`);
  }, [searchQuery]);

  // Load user goals, sort topics, and load characters - reload when tab becomes active
  useFocusEffect(
    useCallback(() => {
      const loadEverything = async () => {
        console.log('🏠 Home tab focused - progressive loading...');

        // Refresh User ID just in case
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        setCurrentUserId(userId || null);

        setIsLoading(true);

        try {
          // 1. Fetch Local User Characters
          const userChars = await getUserCharacters();

          // Split into Private & Public
          const privateChars = userChars.filter(c => c.isPublic === false);
          const publicChars = userChars.filter(c => c.isPublic === true); // Explicit true

          // 2. Fetch Grouped Data (Goals etc)
          let finalSortedTopics = TOPICS;
          let groupedData: { topicId: string, characters: UserCharacter[] }[] = [];

          if (userId) {
            const [userGoalsData, gd] = await Promise.all([
              supabase.from('users').select('user_goals').eq('id', userId).single(),
              getAllCharactersGroupedByTopic(false)
            ]);
            groupedData = gd;

            if (userGoalsData.data?.user_goals) {
              const goals = userGoalsData.data.user_goals;
              setUserGoals(goals);
              // Sort topics... (same logic)
              const userGoalTopics = TOPICS.filter(topic =>
                goals.some((goal: string) => topic.id.toLowerCase() === goal.toLowerCase() || topic.title.toLowerCase() === goal.toLowerCase())
              );
              const otherTopics = TOPICS.filter(topic =>
                !goals.some((goal: string) => topic.id.toLowerCase() === goal.toLowerCase() || topic.title.toLowerCase() === goal.toLowerCase())
              );
              finalSortedTopics = [...userGoalTopics, ...otherTopics];
              setSortedTopics(finalSortedTopics);
            }
          } else {
            // Guest mode fallback
            groupedData = await getAllCharactersGroupedByTopic(false);
          }

          // 3. Construct Sections
          const allSections: TopicSection[] = [];

          // Favorites Section (always available filters)
          // We don't necessarily render it as a section unless selected, but let's build the "All Sections" list naturally

          // Main Topics
          const mappedSections = finalSortedTopics.map(topic => {
            const foundGroup = groupedData.find(g => g.topicId === topic.id);
            // Fallback to static data if no server data
            const staticChars = topic.characters;
            // Merge unique? Or just use server if available?
            // Current logic uses foundGroup OR empty. 
            // FIX: We should use static data as base if server fails or is empty, to prevent "No characters".
            // But currently MOCK data is in TOPICS.
            const chars = foundGroup && foundGroup.characters.length > 0 ? foundGroup.characters : (staticChars as UserCharacter[]);

            return {
              id: topic.id,
              title: topic.title,
              characters: chars
            };
          }).filter(s => s.characters.length > 0);

          allSections.push(...mappedSections);

          // Add Private & Public Sections at the END
          if (privateChars.length > 0) {
            allSections.push({ id: 'private', title: 'Private', characters: privateChars });
          }
          if (publicChars.length > 0) {
            allSections.push({ id: 'public-created', title: 'Public', characters: publicChars });
          }

          allSectionsRef.current = allSections;

          // Initial Render Logic
          // If a topic is selected, render it + neighbors. 
          // Default: Render top 3
          const initialBatch = allSections.slice(0, 3);
          setSections(initialBatch);
          renderedCountRef.current = initialBatch.length;

        } catch (error) {
          console.error('Error loading home:', error);
        } finally {
          setIsLoading(false);
        }
      };

      loadEverything();
    }, [])
  );

  // Filter sections based on search query OR Selected Topic (if it's Favorites)
  useEffect(() => {
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      // Filter diverse sections
      const filtered = allSectionsRef.current.map(section => ({
        ...section,
        characters: section.characters.filter(char => char.name.toLowerCase().includes(query))
      })).filter(s => s.characters.length > 0);
      setFilteredSections(filtered);
      return;
    }

    // View Filtering Logic
    if (selectedTopicId === 'favorites') {
      // Collect ALL characters from all sections
      const allChars = allSectionsRef.current.flatMap(s => s.characters);
      // Dedupe
      const uniqueChars = Array.from(new Map(allChars.map(c => [c.id, c])).values());
      const favChars = uniqueChars.filter(c => favorites.includes(c.id));
      setFilteredSections([{
        id: 'favorites',
        title: 'Favorites',
        characters: favChars
      }]);
    } else {
      // Standard View: Show 'sections' (lazy loaded)
      // BUT we need to support "Private" and "Public" filter buttons too potentially?
      // Actually, "Private" and "Public" act as anchors to scroll to specific sections.
      setFilteredSections(sections);
    }
  }, [searchQuery, sections, selectedTopicId, favorites]);


  // Scroll Spy (Only if NOT 'favorites' view)
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (selectedTopicId === 'favorites') return;
    if (viewableItems.length > 0 && !isManualScroll.current) {
      const firstVisible = viewableItems[0];
      const topicId = firstVisible.item.id;
      // Don't auto-select 'favorites' if scrolling regular list
      if (topicId) setSelectedTopicId(topicId);
    }
  }).current;

  const handleTopicPress = (topicId: string) => {
    setSelectedTopicId(topicId);

    if (topicId === 'favorites') return; // Handled by useEffect filter

    // Scroll Logic
    isManualScroll.current = true;

    const fullIndex = allSectionsRef.current.findIndex(s => s.id === topicId);
    if (fullIndex !== -1) {
      // Check if rendered
      let renderIndex = sections.findIndex(s => s.id === topicId);
      if (renderIndex === -1) {
        // Load up to this point
        const newBatch = allSectionsRef.current.slice(0, fullIndex + 2);
        setSections(newBatch);
        renderedCountRef.current = newBatch.length;
        renderIndex = fullIndex; // It will be at this index in the new list
      }

      setTimeout(() => {
        mainListRef.current?.scrollToIndex({ index: renderIndex, animated: true, viewPosition: 0 }); // 0 = Top
      }, 100);
    }

    setTimeout(() => isManualScroll.current = false, 1000);
  };

  const renderTopicChip = useCallback(({ item, isSpecialType }: { item: any, isSpecialType?: 'favorites' | 'private' | 'public' }) => {
    const isSelected = item.id === selectedTopicId;

    // Special Styles
    if (isSpecialType === 'favorites') {
      return (
        <TouchableOpacity
          onPress={() => handleTopicPress('favorites')}
          style={[styles.createChip, { // Reusing createChip style for circular/icon button
            backgroundColor: isSelected ? theme.tint : theme.card,
            borderColor: isSelected ? theme.tint : theme.icon,
            marginRight: 8
          }]}>
          <IconSymbol name="star.fill" size={20} color={isSelected ? '#fff' : theme.tint} />
        </TouchableOpacity>
      );
    }

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
  }, [selectedTopicId, theme]);

  const handleShare = (char: Character) => {
    setActiveMenuId(null);
    setShareCharacter(char);
  };

  const handleCopyLink = async (charId: string) => {
    const link = `https://ai.therapy/c/${charId}`;
    if (Platform.OS === 'web') {
      navigator.clipboard.writeText(link);
      alert('Link copied to clipboard!');
    } else {
      RNClipboard.setString(link);
      // Native toast/alert
    }
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
    // ... Existing delete logic ...
    // Reuse existing function body logic, but refreshed for new structure
    if (!deleteConfirmation) return;
    try {
      await deleteCharacter(deleteConfirmation.id);
      // Quick/Dirty reload: Just filter out from current sections
      const newSections = sections.map(s => ({
        ...s,
        characters: s.characters.filter(c => c.id !== deleteConfirmation.id)
      })).filter(s => s.characters.length > 0);
      setSections(newSections);
      // Also update allSectionsRef
      allSectionsRef.current = allSectionsRef.current.map(s => ({
        ...s,
        characters: s.characters.filter(c => c.id !== deleteConfirmation.id)
      })).filter(s => s.characters.length > 0);

    } catch (e) { console.error(e); }
    finally { setDeleteConfirmation(null); }
  };

  const renderCharacterCard = useCallback((item: Character, index: number, sectionId?: string) => {
    // Determine permissions
    // item must be cast to UserCharacter to check user_id if we have it, or we rely on 'created' section context?
    // Better: Check ownership explicitly if available.
    // If the character has a 'user_id' field, check it. Static characters usually don't.
    const isOwner = (item as any).user_id === currentUserId;
    const isFav = favorites.includes(item.id);

    return (
      <Animated.View
        key={item.id}
        entering={FadeInDown.delay(index * 100).springify().damping(12)}
      >
        <TouchableOpacity
          style={[styles.characterCard, { backgroundColor: theme.card }]}
          onPress={() => router.push(`/conversation/${item.id}` as any)}>

          <Image
            source={{ uri: item.image }}
            style={styles.characterImage}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={300}
          />

          {/* Menu Button - Shows for EVERYONE now (Fav/Share), but items differ */}
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
                {/* Favorite */}
                <TouchableOpacity style={styles.menuItem} onPress={(e) => { e.stopPropagation(); toggleFavorite(item.id); setActiveMenuId(null); }}>
                  <IconSymbol name={isFav ? "star.fill" : "star"} size={16} color={isFav ? theme.tint : theme.text} />
                  <ThemedText style={styles.menuText}>{isFav ? 'Unfavorite' : 'Favorite'}</ThemedText>
                </TouchableOpacity>

                {/* Share */}
                <TouchableOpacity style={styles.menuItem} onPress={(e) => { e.stopPropagation(); handleShare(item); }}>
                  <IconSymbol name="square.and.arrow.up" size={16} color={theme.text} />
                  <ThemedText style={styles.menuText}>Share</ThemedText>
                </TouchableOpacity>

                {/* Remix - Always visible */}
                <TouchableOpacity style={styles.menuItem} onPress={(e) => {
                  e.stopPropagation();
                  setActiveMenuId(null);
                  router.push({
                    pathname: '/(tabs)/create',
                    params: { remixMode: 'true', characterData: JSON.stringify(item) }
                  } as any);
                }}>
                  <IconSymbol name="shuffle" size={16} color={theme.text} />
                  <ThemedText style={styles.menuText}>Remix</ThemedText>
                </TouchableOpacity>

                {/* Edit/Delete - OWNER ONLY */}
                {isOwner && (
                  <>
                    <TouchableOpacity style={styles.menuItem} onPress={(e) => { e.stopPropagation(); handleEdit(item); }}>
                      <IconSymbol name="pencil" size={16} color={theme.text} />
                      <ThemedText style={styles.menuText}>Edit</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={(e) => { e.stopPropagation(); handleDeleteRequest(item); }}>
                      <IconSymbol name="trash" size={16} color="#FF3B30" />
                      <ThemedText style={[styles.menuText, { color: '#FF3B30' }]}>Delete</ThemedText>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}
          </View>

          {/* Private Indicator - STRICT CHECK */}
          {/* Only show if explicitly false. Static content is undefined/true usually. */}
          {(item as any).isPublic === false && (
            <View style={styles.privateBadge}>
              <IconSymbol name="lock.fill" size={12} color="#fff" />
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
    )
  }, [theme, router, activeMenuId, favorites, currentUserId]);


  // Construct Header List Data
  // [Favorites] ... [Topics] ... [Private] [Public]
  const headerData = [
    { id: 'favorites', title: '', isSpecial: true },
    ...sortedTopics,
    { id: 'private', title: 'Private', isSpecial: false }, // Treated as topic
    { id: 'public-created', title: 'Public', isSpecial: false }
  ];

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
          data={headerData}
          renderItem={({ item }) => renderTopicChip({
            item,
            isSpecialType: item.id === 'favorites' ? 'favorites' : undefined
          })}
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
        renderItem={({ item }) => (
          <View style={styles.sectionContainer}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>{item.title}</ThemedText>
            <View style={styles.gridContainer}>
              {item.characters.map((char, index) => renderCharacterCard(char, index, item.id))}
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={VIEWABILITY_CONFIG}
        onEndReached={loadMoreSections}
        onEndReachedThreshold={0.5}
        initialNumToRender={2}
        windowSize={3}
        maxToRenderPerBatch={2}
        removeClippedSubviews={Platform.OS === 'android'}
        ListEmptyComponent={
          isLoading ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <ThemedText>Loading ai.therapists...</ThemedText>
            </View>
          ) : (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <ThemedText>No ai.therapists found.</ThemedText>
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
              <ThemedText type="defaultSemiBold" style={{ marginTop: 12, textAlign: 'center' }}>{shareCharacter.name}</ThemedText>
              <ThemedText style={styles.shareDesc}>{shareCharacter.description}</ThemedText>
            </View>

            <View style={{ flexDirection: 'row', gap: 12, width: '100%', alignItems: 'center', marginTop: 16 }}>
              <View style={[styles.linkContainer, { backgroundColor: theme.background, flex: 1 }]}>
                <ThemedText style={styles.linkText} numberOfLines={1}>
                  https://ai.therapy/c/{shareCharacter.id}
                </ThemedText>
              </View>
              <TouchableOpacity style={styles.copyButton} onPress={() => handleCopyLink(shareCharacter.id)}>
                <IconSymbol name="doc.on.doc" size={16} color="#fff" />
                <ThemedText style={styles.copyButtonText}>Copy</ThemedText>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      )}

      {/* Delete Modal - (Same as before) */}
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

      {/* Onboarding Modal - (Same as before) */}
      <OnboardingModal
        visible={showOnboarding}
        onComplete={async () => {
          setShowOnboarding(false);
          // Reload page logic or just set state
          // For simplicity, we just close it, let FocusEffect handle reload next time or trigger re-fetch
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
  privateBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20, // Match menuButton
    padding: 8,       // Match menuButton
    zIndex: 10,
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
