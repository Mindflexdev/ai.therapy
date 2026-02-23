import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  withRepeat,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Theme } from '../constants/Theme';

interface SplashAnimationProps {
  onComplete: () => void;
}

const BRAND_TEXT = 'ai.therapy';
const CHAR_COUNT = BRAND_TEXT.length; // 10
const CHAR_DELAY = 120; // ms per character
const TYPING_START = 1200; // when typing begins after logo fade
const TYPING_DURATION = CHAR_COUNT * CHAR_DELAY; // 1200ms
const DISCLAIMER_START = TYPING_START + TYPING_DURATION + 200; // 2600ms
const TRANSITION_START = DISCLAIMER_START + 800; // 3400ms
const TOTAL_DURATION = TRANSITION_START + 900; // ~4300ms

export function SplashAnimation({ onComplete }: SplashAnimationProps) {
  const [visibleChars, setVisibleChars] = useState(0);
  const [animationDone, setAnimationDone] = useState(false);
  const completionRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Phase 1: Logo fade in
  const logoScale = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);

  // Phase 2: Cursor blink
  const cursorOpacity = useSharedValue(0);

  // Phase 3: Typing effect
  const typedCharCount = useSharedValue(0);

  // Phase 3b: Gold dot glow
  const dotScale = useSharedValue(1);

  // Phase 4: Disclaimer
  const disclaimerOpacity = useSharedValue(0);

  // Phase 5: Transition out
  const contentTranslateY = useSharedValue(0);
  const contentScale = useSharedValue(1);
  const contentOpacity = useSharedValue(1);
  const overlayOpacity = useSharedValue(1);

  // Sync typedCharCount (UI thread) → visibleChars (JS thread)
  useAnimatedReaction(
    () => Math.floor(typedCharCount.value),
    (current, previous) => {
      if (current !== previous) {
        runOnJS(setVisibleChars)(current);
      }
    }
  );

  const finishAnimation = useCallback(() => {
    if (animationDone) return;
    setAnimationDone(true);
    onComplete();
  }, [onComplete, animationDone]);

  useEffect(() => {
    // Phase 1: Logo fade in + scale (0–800ms)
    logoOpacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
    logoScale.value = withSpring(1, {
      damping: 15,
      stiffness: 80,
      mass: 0.8,
    });

    // Phase 2: Cursor appears and starts blinking (from 900ms)
    // Cursor blinks throughout the typing phase
    cursorOpacity.value = withDelay(
      900,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 0 }),
          withTiming(1, { duration: 400 }),
          withTiming(0, { duration: 100 }),
          withTiming(0, { duration: 300 }),
        ),
        -1, // infinite repeat
        false,
      )
    );

    // Phase 3: Typing (1200ms – 2400ms)
    typedCharCount.value = withDelay(
      TYPING_START,
      withTiming(CHAR_COUNT, {
        duration: TYPING_DURATION,
        easing: Easing.linear,
      })
    );

    // Phase 3b: Dot glow when the dot appears (char index 2)
    dotScale.value = withDelay(
      TYPING_START + 2 * CHAR_DELAY,
      withSequence(
        withTiming(1.4, { duration: 120, easing: Easing.out(Easing.cubic) }),
        withTiming(1, { duration: 250, easing: Easing.inOut(Easing.cubic) })
      )
    );

    // Phase 4: Disclaimer just appears (2600ms) — simple fade, no typing
    disclaimerOpacity.value = withDelay(
      DISCLAIMER_START,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) })
    );

    // Hide cursor when typing is done
    // We'll handle this via the cursorVisible check in render

    // Phase 5: Transition out (3400ms–4300ms)
    contentTranslateY.value = withDelay(
      TRANSITION_START,
      withTiming(-100, { duration: 800, easing: Easing.inOut(Easing.cubic) })
    );
    contentScale.value = withDelay(
      TRANSITION_START,
      withTiming(0.65, { duration: 800, easing: Easing.inOut(Easing.cubic) })
    );
    contentOpacity.value = withDelay(
      TRANSITION_START,
      withTiming(0, { duration: 700, easing: Easing.in(Easing.cubic) })
    );
    overlayOpacity.value = withDelay(
      TRANSITION_START,
      withTiming(0, { duration: 800, easing: Easing.in(Easing.cubic) })
    );

    completionRef.current = setTimeout(finishAnimation, TOTAL_DURATION);
    return () => {
      if (completionRef.current) clearTimeout(completionRef.current);
    };
  }, []);

  const handleSkip = useCallback(() => {
    if (animationDone) return;
    if (completionRef.current) clearTimeout(completionRef.current);
    // Accelerated exit
    contentTranslateY.value = withTiming(-100, { duration: 300, easing: Easing.inOut(Easing.cubic) });
    contentScale.value = withTiming(0.65, { duration: 300, easing: Easing.inOut(Easing.cubic) });
    contentOpacity.value = withTiming(0, { duration: 250, easing: Easing.in(Easing.cubic) });
    overlayOpacity.value = withTiming(0, { duration: 300, easing: Easing.in(Easing.cubic) });
    setTimeout(finishAnimation, 350);
  }, [animationDone, finishAnimation]);

  // Animated styles
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const cursorAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cursorOpacity.value,
  }));

  const dotAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dotScale.value }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [
      { translateY: contentTranslateY.value },
      { scale: contentScale.value },
    ],
  }));

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const disclaimerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: disclaimerOpacity.value,
  }));

  // Show cursor from when it first appears until typing is done
  const showCursor = visibleChars < CHAR_COUNT;

  return (
    <Animated.View
      style={[styles.overlay, overlayAnimatedStyle]}
      pointerEvents={animationDone ? 'none' : 'auto'}
    >
      <Pressable style={styles.pressable} onPress={handleSkip}>
        <Animated.View style={[styles.content, contentAnimatedStyle]}>
          {/* Brain logo */}
          <Animated.Image
            source={require('../../assets/logo_ai.png')}
            style={[styles.logo, logoAnimatedStyle]}
            resizeMode="contain"
          />

          {/* Brand text — only render visible chars + cursor */}
          <View style={styles.brandTextRow}>
            {BRAND_TEXT.split('').map((char, index) => {
              if (index >= visibleChars) return null; // don't render untyped chars at all
              const isDot = char === '.';

              const charElement = (
                <Text
                  key={`char-${index}`}
                  style={[
                    styles.brandChar,
                    isDot ? styles.brandCharGold : styles.brandCharWhite,
                  ]}
                >
                  {char}
                </Text>
              );

              if (isDot) {
                return (
                  <Animated.View key={index} style={dotAnimatedStyle}>
                    {charElement}
                  </Animated.View>
                );
              }

              return charElement;
            })}
            {/* Blinking cursor — appears after last typed char */}
            {showCursor && (
              <Animated.View style={[styles.cursor, cursorAnimatedStyle]} />
            )}
          </View>

          {/* Disclaimer — just fades in, no typing */}
          <Animated.Text style={[styles.disclaimer, disclaimerAnimatedStyle]}>
            (not real therapy)
          </Animated.Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  pressable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  brandTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
  },
  brandTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandChar: {
    fontSize: 36,
    fontFamily: 'Outfit-Regular',
    letterSpacing: 0.5,
  },
  brandCharWhite: {
    color: Theme.colors.text.primary,
  },
  brandCharGold: {
    color: Theme.colors.primary,
  },
  cursor: {
    width: 2,
    height: 32,
    backgroundColor: Theme.colors.primary,
    marginLeft: 2,
  },
  disclaimer: {
    fontSize: 14,
    fontFamily: 'Outfit-Regular',
    color: Theme.colors.text.muted,
    marginTop: Theme.spacing.xs,
    letterSpacing: 0.3,
  },
});
