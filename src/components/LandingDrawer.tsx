import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { X } from 'lucide-react-native';
import { Theme } from '../constants/Theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  onNavigate: (section: string) => void;
}

export function LandingDrawer({ visible, onClose, onNavigate }: Props) {
  const sections = [
    { id: 'hero', label: 'Start' },
    { id: 'features', label: 'Features' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'faq', label: 'FAQ' },
  ];

  const handleNavigate = (sectionId: string) => {
    onNavigate(sectionId);
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
            {sections.map((section) => (
              <TouchableOpacity
                key={section.id}
                style={styles.menuItem}
                onPress={() => handleNavigate(section.id)}
              >
                <Text style={styles.menuText}>{section.label}</Text>
              </TouchableOpacity>
            ))}
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
    borderTopLeftRadius: Theme.borderRadius.l,
    borderTopRightRadius: Theme.borderRadius.l,
    paddingBottom: Theme.spacing.xxl,
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
    paddingVertical: Theme.spacing.m,
    paddingHorizontal: Theme.spacing.l,
    borderRadius: Theme.borderRadius.m,
    marginBottom: Theme.spacing.s,
  },
  menuText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: Theme.colors.text.primary,
  },
});
