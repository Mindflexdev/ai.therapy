import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { Theme } from '../../constants/Theme';

export function FAQSection() {
  const faqs = [
    { q: 'is this real therapy?', a: "no, it's AI conversation support" },
    { q: 'is it private?', a: 'yes, fully encrypted' },
    { q: "what if i'm in crisis?", a: 'call 988 or emergency services' },
    { q: 'can i delete my data?', a: 'anytime' },
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.title}>FAQ</Text>

      <View style={styles.faqList}>
        {faqs.map((faq, index) => (
          <FAQItem key={index} question={faq.q} answer={faq.a} />
        ))}
      </View>
    </View>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      style={styles.faqItem}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.7}
    >
      <View style={styles.questionRow}>
        <Text style={styles.question}>{question}</Text>
        {expanded ? (
          <ChevronUp size={20} color={Theme.colors.primary} />
        ) : (
          <ChevronDown size={20} color={Theme.colors.text.secondary} />
        )}
      </View>

      {expanded && (
        <Text style={styles.answer}>{answer}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: Theme.spacing.m,
    paddingVertical: Theme.spacing.xxl,
    backgroundColor: 'rgba(235, 206, 128, 0.05)',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: Theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
  },
  faqList: {
    maxWidth: 700,
    alignSelf: 'center',
    width: '100%',
  },
  faqItem: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: Theme.borderRadius.m,
    padding: Theme.spacing.m,
    marginBottom: Theme.spacing.m,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  question: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: Theme.colors.text.primary,
    flex: 1,
  },
  answer: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Theme.colors.text.secondary,
    marginTop: Theme.spacing.m,
    lineHeight: 20,
  },
});
