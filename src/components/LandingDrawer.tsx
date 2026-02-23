import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Linking } from 'react-native';
import { X, Home, Info, Tag, CircleHelp, Gavel, Lock, FileText, Cookie, ShieldCheck } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Theme } from '../constants/Theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  onNavigate: (section: string) => void;
}

export function LandingDrawer({ visible, onClose, onNavigate }: Props) {
  const router = useRouter();
  const sections = [
    { id: 'hero', label: 'Start', icon: Home },
    { id: 'features', label: 'Features', icon: Info },
    { id: 'pricing', label: 'Pricing', icon: Tag },
    { id: 'faq', label: 'FAQ', icon: CircleHelp },
    { id: 'privacy', label: 'Privacy Policy', icon: Lock },
    { id: 'terms', label: 'Terms of Use', icon: FileText },
    { id: 'cookies', label: 'Cookie Policy', icon: Cookie },
    { id: 'imprint', label: 'Imprint', icon: ShieldCheck },
  ];

  const handleNavigate = (sectionId: string) => {
    if (['privacy', 'terms', 'cookies', 'imprint'].includes(sectionId)) {
      router.push({ pathname: '/(main)/legal', params: { section: sectionId } });
    } else {
      onNavigate(sectionId);
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={styles.drawer}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Navigation</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={Theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.menu}>
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <TouchableOpacity
                  key={section.id}
                  style={styles.menuItem}
                  onPress={() => handleNavigate(section.id)}
                >
                  <Icon size={22} color={Theme.colors.primary} style={{ marginRight: Theme.spacing.m }} />
                  <Text style={styles.menuText}>{section.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  drawer: {
    backgroundColor: Theme.colors.background,
    borderTopLeftRadius: Theme.borderRadius.xl,
    borderTopRightRadius: Theme.borderRadius.xl,
    paddingBottom: Theme.spacing.xxl,
    borderTopWidth: 2,
    borderTopColor: Theme.colors.primary,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: Theme.colors.text.primary,
  },
  menu: {
    padding: Theme.spacing.m,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.m,
    paddingHorizontal: Theme.spacing.l,
    borderRadius: Theme.borderRadius.m,
    marginBottom: Theme.spacing.s,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.primary,
  },
  menuText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: Theme.colors.text.primary,
  },
});
