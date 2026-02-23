import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Theme } from '../../constants/Theme';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { THERAPISTS } from '../../constants/Therapists';
import React, { useRef } from 'react';

export function Footer() {
  const router = useRouter();

  const { selectTherapist } = useAuth();
  const tapCount = useRef(0);
  const lastTapTime = useRef(0);

  const openLegal = (section?: string) => {
    const url = section 
      ? `https://ai.therapy.free/legal?section=${section}`
      : 'https://ai.therapy.free/legal';
    Linking.openURL(url);
  };

  const handleSecretTap = () => {
    const now = Date.now();
    if (now - lastTapTime.current < 500) {
      tapCount.current += 1;
    } else {
      tapCount.current = 1;
    }
    lastTapTime.current = now;

    if (tapCount.current === 3) {
      tapCount.current = 0;
      if (THERAPISTS.length > 0) {
        const t = THERAPISTS[0];
        selectTherapist(t.id, true);
        router.push({
          pathname: '/(main)/chat',
          params: { name: t.name, image: t.image }
        });
      }
    }
  };

  return (
    <View style={styles.footer}>
      <View style={styles.links}>
        <TouchableOpacity onPress={openLegal}>
          <Text style={styles.link}>Terms</Text>
        </TouchableOpacity>
        <Text style={styles.separator}>•</Text>
        <TouchableOpacity onPress={() => openLegal('privacy')}>
          <Text style={styles.link}>Privacy</Text>
        </TouchableOpacity>
        <Text style={styles.separator}>•</Text>
        <TouchableOpacity onPress={openLegal}>
          <Text style={styles.link}>Cookies</Text>
        </TouchableOpacity>
        <Text style={styles.separator}>•</Text>
        <TouchableOpacity onPress={openLegal}>
          <Text style={styles.link}>Imprint</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={handleSecretTap} activeOpacity={1}>
        <Text style={styles.copyright}>
          @ 2026 Mindflex
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.xxl,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  disclaimer: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    fontStyle: 'italic',
    color: Theme.colors.text.muted,
    textAlign: 'center',
    marginBottom: Theme.spacing.l,
  },
  links: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.m,
  },
  link: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Theme.colors.text.secondary,
    textDecorationLine: 'underline',
  },
  separator: {
    fontSize: 12,
    color: Theme.colors.text.muted,
    marginHorizontal: Theme.spacing.s,
  },
  copyright: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: Theme.colors.text.muted,
  },
});
