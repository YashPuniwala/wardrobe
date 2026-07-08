import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { colors, typography, radii, spacing, shadow } from '@/constants/theme';
import { Icon, iconNames } from '@/components/ui/Icon';

const faqs = [
  {
    id: '1',
    question: 'How do I add a garment to my wardrobe?',
    answer: 'Tap the center "+" button, then choose "Take Photo" to capture a new item with your camera, or "Choose from Wardrobe" to build an outfit from existing items.',
  },
  {
    id: '2',
    question: 'How does the AI Stylist work?',
    answer: 'The AI Stylist analyzes your wardrobe items, color palette, and style preferences to suggest outfit combinations. Chat with it anytime from the Stylist tab.',
  },
  {
    id: '3',
    question: 'Can I plan outfits for specific days?',
    answer: 'Yes! Use the Planner feature to assign outfits to days of the week so you always know what to wear.',
  },
  {
    id: '4',
    question: 'What is the color palette feature?',
    answer: 'Your Palette shows colors that complement your style profile. Tap any color to see which garments in your wardrobe match it.',
  },
  {
    id: '5',
    question: 'How do I favorite an outfit or garment?',
    answer: 'Tap the heart icon on any outfit card or garment. Favorited items appear in the Favorites filter on the Outfits tab.',
  },
  {
    id: '6',
    question: 'Is my data synced across devices?',
    answer: 'Currently, your wardrobe and outfits are stored locally on your device. Cloud sync is coming in a future update.',
  },
];

export default function HelpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <Icon name={iconNames.arrowBack} size={22} color={colors.onSurface} />
          </Pressable>
          <Text style={styles.title}>Help & Support</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
          <View style={styles.introCard}>
            <View style={styles.introIcon}>
              <Icon name={iconNames.help} size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.introTitle}>How can we help?</Text>
              <Text style={styles.introSubtitle}>Browse common questions below</Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>FREQUENTLY ASKED</Text>
          <View style={styles.faqList}>
            {faqs.map((faq) => {
              const isExpanded = expandedId === faq.id;
              return (
                <Pressable
                  key={faq.id}
                  onPress={() => setExpandedId(isExpanded ? null : faq.id)}
                  style={styles.faqItem}
                >
                  <View style={styles.faqHeader}>
                    <Text style={styles.faqQuestion}>{faq.question}</Text>
                    <View style={[styles.chevronWrap, isExpanded && styles.chevronRotated]}>
                      <Icon name={iconNames.chevronRight} size={20} color={colors.outline} />
                    </View>
                  </View>
                  {isExpanded && <Text style={styles.faqAnswer}>{faq.answer}</Text>}
                </Pressable>
              );
            })}
          </View>

          <View style={styles.contactCard}>
            <Icon name={iconNames.mail} size={20} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.contactTitle}>Still need help?</Text>
              <Text style={styles.contactSub}>Reach us at support@fits.app</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenMargin,
    paddingTop: 8,
    paddingBottom: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...typography.h2 },
  scroll: { paddingHorizontal: spacing.screenMargin },
  introCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.lg,
    padding: 16,
    marginBottom: 24,
    ...shadow.soft,
  },
  introIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  introTitle: { ...typography.h2, fontSize: 16 },
  introSubtitle: { ...typography.bodySm, color: colors.onSurfaceVariant, marginTop: 2 },
  sectionLabel: {
    ...typography.label,
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
    marginBottom: 8,
  },
  faqList: { gap: 8 },
  faqItem: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.lg,
    padding: 16,
    ...shadow.soft,
  },
  faqHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  faqQuestion: { ...typography.bodyLg, fontFamily: 'Inter_500Medium', flex: 1 },
  chevronWrap: { transform: [{ rotate: '0deg' }] },
  chevronRotated: { transform: [{ rotate: '90deg' }] },
  faqAnswer: { ...typography.bodySm, color: colors.onSurfaceVariant, marginTop: 10, lineHeight: 20 },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.lg,
    padding: 16,
    marginTop: 24,
  },
  contactTitle: { ...typography.bodyLg, fontFamily: 'Inter_600SemiBold' },
  contactSub: { ...typography.bodySm, color: colors.onSurfaceVariant, marginTop: 2 },
});
