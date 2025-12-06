# App Refactoring Plan - Performance & Optimization

## Overview
Refactor the therapy.ai app to improve performance and reduce bundle size while maintaining all existing design and functionality.

## Key Optimization Areas

### 1. Component Optimization
- [ ] Extract reusable components (TherapyStyleSelector, MessageBubble, etc.)
- [ ] Implement React.memo for expensive components
- [ ] Use useCallback for event handlers
- [ ] Use useMemo for computed values

### 2. Code Splitting & Lazy Loading
- [ ] Lazy load modals (therapy-detail-modal, feedback)
- [ ] Lazy load heavy screens (create-character, conversation)
- [ ] Dynamic imports for large dependencies

### 3. State Management
- [ ] Reduce unnecessary re-renders
- [ ] Optimize context usage
- [ ] Implement proper dependency arrays

### 4. Data Fetching
- [ ] Add caching for Supabase queries
- [ ] Implement request deduplication
- [ ] Add stale-while-revalidate pattern

### 5. Bundle Size
- [ ] Remove unused dependencies
- [ ] Tree-shake imports
- [ ] Optimize image assets

### 6. Rendering Performance
- [ ] Virtualize long lists (FlatList optimization)
- [ ] Debounce expensive operations
- [ ] Optimize StyleSheet usage

## Implementation Priority
1. Extract reusable components (HIGH IMPACT)
2. Memoization of expensive renders (HIGH IMPACT)
3. Lazy loading of modals (MEDIUM IMPACT)
4. Data fetching optimization (MEDIUM IMPACT)
5. Bundle size reduction (LOW-MEDIUM IMPACT)

## Files to Refactor
1. app/conversation/[id].tsx - Heavy component, needs memoization
2. app/create-character.tsx - Large file, extract components
3. components/ - Create new reusable components
4. lib/ - Add caching utilities
