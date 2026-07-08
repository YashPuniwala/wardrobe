import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { colors, typography, radii, spacing, shadow } from '@/constants/theme';
import { Icon, iconNames } from '@/components/ui/Icon';
import { Pill } from '@/components/ui/Pill';
import { Card } from '@/components/ui/Card';
import { useOutfitStore, Outfit } from '@/store/useOutfitStore';
import { useWardrobeStore, Garment } from '@/store/useWardrobeStore';
import { useRouter } from 'expo-router';

interface ChatMessage {
  id: string;
  role: 'user' | 'stylist';
  text: string;
}

const cannedResponses = [
  "Based on your wardrobe, I'd pair your cream knit sweater with the wide-leg trousers and white sneakers for a clean, elevated casual look.",
  "For a rainy day like tomorrow, layer your camel coat over the silk blouse and pleated skirt. Add ankle boots to keep it weather-appropriate.",
  "Your color palette leans warm and neutral. Try mixing the linen shirt with the wide-leg trousers for a relaxed weekend outfit.",
  "You haven't worn your wool scarf in a while! It would pair beautifully with the camel coat and ankle boots for a cozy autumn look.",
  "For a smart-casual office look, I'd recommend the silk blouse with the wide-leg trousers and leather tote. Clean and professional.",
];

export default function StylistScreen() {
  const router = useRouter();
  const { outfits, toggleFavorite } = useOutfitStore();
  const { items } = useWardrobeStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'stylist',
      text: "Hi! I'm your AI Stylist. Ask me for outfit ideas, styling tips, or what to wear for a specific occasion.",
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { id: `u${Date.now()}`, role: 'user', text: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = cannedResponses[Math.floor(Math.random() * cannedResponses.length)];
      const stylistMsg: ChatMessage = { id: `s${Date.now()}`, role: 'stylist', text: response };
      setMessages((prev) => [...prev, stylistMsg]);
      setIsTyping(false);
    }, 1500);
  };

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, isTyping]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>AI Stylist</Text>
            <Text style={styles.subtitle}>Your personal fashion advisor</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable style={styles.iconButton}>
              <Icon name={iconNames.gridView} size={20} color={colors.onSurface} />
            </Pressable>
            <Pill
              label="72°"
              icon={<Icon name={iconNames.wbSunny} size={14} color={colors.onSurface} />}
            />
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.chat}
          contentContainerStyle={{ paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}
          {isTyping && (
            <View style={[styles.bubble, styles.stylistBubble]}>
              <View style={styles.typingRow}>
                <View style={styles.typingDot} />
                <View style={styles.typingDot} />
                <View style={styles.typingDot} />
              </View>
            </View>
          )}

          <View style={styles.sectionGap}>
            <Text style={styles.sectionLabel}>RECOMMENDED FOR YOU</Text>
          </View>

          {outfits.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12, paddingTop: 8 }}
            >
              {outfits.slice(0, 4).map((outfit) => (
                <RecommendationCard
                  key={outfit.id}
                  outfit={outfit}
                  items={items}
                  onPress={() => router.push(`/dressing-room/${outfit.id}`)}
                  onFavorite={() => toggleFavorite(outfit.id)}
                />
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Icon name={iconNames.pending} size={40} color={colors.outlineVariant} />
              <Text style={styles.emptyTitle}>No recommendations yet</Text>
              <Text style={styles.emptySubtitle}>
                Add more items to your wardrobe for personalized suggestions
              </Text>
            </View>
          )}

          <View style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <View style={styles.statsIcon}>
                <Icon name={iconNames.pieChart} size={18} color={colors.primary} />
              </View>
              <Text style={styles.statsTitle}>Wardrobe Usage</Text>
            </View>
            <View style={styles.statsBars}>
              {[
                { label: 'Tops', value: 0.3, color: colors.primary },
                { label: 'Bottoms', value: 0.2, color: colors.tertiary },
                { label: 'Shoes', value: 0.2, color: colors.secondary },
                { label: 'Accessories', value: 0.15, color: colors.primaryContainer },
                { label: 'Outerwear', value: 0.1, color: colors.outline },
              ].map((stat) => (
                <View key={stat.label} style={styles.statBar}>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  <View style={styles.statBarTrack}>
                    <View style={[styles.statBarFill, { width: `${stat.value * 100}%`, backgroundColor: stat.color }]} />
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
          <View style={styles.inputWrap}>
            <View style={{ marginLeft: 4 }}>
              <Icon name={iconNames.autoFixHigh} size={20} color={colors.outline} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Ask your stylist…"
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={200}
            />
            <Pressable onPress={sendMessage} disabled={!input.trim()} style={styles.sendButton}>
              <Icon name={iconNames.send} size={18} color={input.trim() ? colors.onPrimary : colors.outline} />
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <View style={[styles.bubbleRow, isUser && styles.userRow]}>
      {!isUser && (
        <View style={styles.stylistAvatar}>
          <Icon name={iconNames.autoFixHigh} size={16} color={colors.onPrimary} />
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.stylistBubble]}>
        <Text style={[styles.bubbleText, isUser && styles.userBubbleText]}>{message.text}</Text>
      </View>
    </View>
  );
}

function RecommendationCard({
  outfit,
  items,
  onPress,
  onFavorite,
}: {
  outfit: Outfit;
  items: Garment[];
  onPress: () => void;
  onFavorite: () => void;
}) {
  const top = items.find((i) => i.id === outfit.slots.top);
  const bottom = items.find((i) => i.id === outfit.slots.bottom);
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => (scale.value = withTiming(0.97, { duration: 100 }))}
      onPressOut={() => (scale.value = withTiming(1, { duration: 150 }))}
      style={[styles.recCard, animatedStyle]}
    >
      <View style={styles.recImage}>
        {top && <View style={[styles.recLayer, { backgroundColor: top.color, height: '40%' }]} />}
        {bottom && (
          <View style={[styles.recLayer, { backgroundColor: bottom.color, height: '35%' }]} />
        )}
      </View>
      <View style={styles.recFooter}>
        <View style={{ flex: 1 }}>
          <Text style={styles.recName} numberOfLines={1}>{outfit.name}</Text>
          <Text style={styles.recTag}>AI Recommended</Text>
        </View>
        <Pressable onPress={onFavorite} hitSlop={8}>
          <Icon
            name={outfit.favorite ? iconNames.favorite : iconNames.favoriteBorder}
            size={18}
            color={outfit.favorite ? colors.primary : colors.outline}
          />
        </Pressable>
      </View>
    </AnimatedPressable>
  );
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.screenMargin,
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: { ...typography.h1, fontSize: 28 },
  subtitle: { ...typography.bodySm, color: colors.onSurfaceVariant, marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chat: { flex: 1, paddingHorizontal: spacing.screenMargin },
  bubbleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  userRow: { justifyContent: 'flex-end' },
  stylistAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    maxWidth: '80%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radii.lg,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  stylistBubble: {
    backgroundColor: colors.surfaceContainerLowest,
    borderBottomLeftRadius: 4,
    ...shadow.soft,
  },
  bubbleText: { ...typography.bodySm, color: colors.onSurface },
  userBubbleText: { color: colors.onPrimary },
  typingRow: { flexDirection: 'row', gap: 4, paddingVertical: 4 },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.outline,
  },
  sectionGap: { marginTop: 24, marginBottom: 8 },
  sectionLabel: {
    ...typography.label,
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
  },
  recCard: {
    width: 160,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceContainerLowest,
    overflow: 'hidden',
    ...shadow.soft,
  },
  recImage: {
    width: '100%',
    aspectRatio: 0.8,
    backgroundColor: colors.surfaceContainer,
  },
  recLayer: { width: '100%' },
  recFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 8,
  },
  recName: { ...typography.caption, fontFamily: 'Inter_600SemiBold' },
  recTag: { ...typography.label, fontSize: 10, color: colors.tertiary, marginTop: 2 },
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyTitle: { ...typography.h2, fontSize: 18 },
  emptySubtitle: { ...typography.bodySm, color: colors.onSurfaceVariant, textAlign: 'center' },
  statsCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.lg,
    padding: 16,
    marginTop: 24,
    ...shadow.soft,
  },
  statsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  statsIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsTitle: { ...typography.h2, fontSize: 16 },
  statsBars: { gap: 10 },
  statBar: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statLabel: { ...typography.caption, width: 80 },
  statBarTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceContainerHigh,
    overflow: 'hidden',
  },
  statBarFill: { height: '100%', borderRadius: 4 },
  inputBar: {
    paddingHorizontal: spacing.screenMargin,
    paddingTop: 12,
    backgroundColor: colors.surfaceContainerLowest,
    borderTopColor: colors.outlineVariant,
    borderTopWidth: 1,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  input: {
    flex: 1,
    ...typography.bodySm,
    paddingVertical: 10,
    paddingHorizontal: 8,
    maxHeight: 80,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
