import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { colors, typography, radii, spacing, shadow } from '@/constants/theme';
import { Icon, iconNames } from '@/components/ui/Icon';
import { Pill } from '@/components/ui/Pill';
import { useWardrobeStore, Garment, GarmentCategory } from '@/store/useWardrobeStore';
import { useOutfitStore, OutfitSlot } from '@/store/useOutfitStore';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const categories: { id: GarmentCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'tops', label: 'Tops' },
  { id: 'bottoms', label: 'Bottoms' },
  { id: 'shoes', label: 'Shoes' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'outerwear', label: 'Outerwear' },
];

const slotLabels: Record<keyof OutfitSlot, string> = {
  top: 'Top',
  bottom: 'Bottom',
  shoes: 'Shoes',
  accessory: 'Accessory',
  outerwear: 'Outerwear',
};

export default function Step1Screen() {
  const router = useRouter();
  const { ai } = useLocalSearchParams();
  const { items, toggleFavorite } = useWardrobeStore();
  const { draft, setDraftSlot, clearDraft } = useOutfitStore();
  const [filter, setFilter] = useState<GarmentCategory | 'all'>('all');

  useEffect(() => {
    if (ai) {
      setDraftSlot('top', 'g1');
      setDraftSlot('bottom', 'g2');
      setDraftSlot('shoes', 'g3');
      setDraftSlot('accessory', 'g7');
    }
    return () => {
      if (!ai) clearDraft();
    };
  }, []);

  const filteredItems = filter === 'all' ? items : items.filter((i) => i.category === filter);

  const isSlotFilled = (slot: keyof OutfitSlot) => draft[slot] !== undefined;
  const requiredSlotsFilled = isSlotFilled('top') && isSlotFilled('bottom') && isSlotFilled('shoes');

  const handleGarmentPress = (item: Garment) => {
    const slotMap: Record<GarmentCategory, keyof OutfitSlot> = {
      tops: 'top',
      bottoms: 'bottom',
      shoes: 'shoes',
      accessories: 'accessory',
      outerwear: 'outerwear',
    };
    const slot = slotMap[item.category];
    if (draft[slot] === item.id) {
      setDraftSlot(slot, undefined);
    } else {
      setDraftSlot(slot, item.id);
    }
  };

  const renderItem = ({ item }: { item: Garment }) => {
    const slotMap: Record<GarmentCategory, keyof OutfitSlot> = {
      tops: 'top',
      bottoms: 'bottom',
      shoes: 'shoes',
      accessories: 'accessory',
      outerwear: 'outerwear',
    };
    const slot = slotMap[item.category];
    const isSelected = draft[slot] === item.id;

    return (
      <GarmentCard
        item={item}
        selected={isSelected}
        onPress={() => handleGarmentPress(item)}
        onFavorite={() => toggleFavorite(item.id)}
      />
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <Icon name={iconNames.arrowBack} size={22} color={colors.onSurface} />
          </Pressable>
          <Text style={styles.title}>Step 1: Pick Items</Text>
          <View style={styles.headerActions}>
            <Pressable style={styles.iconButton}>
              <Icon name={iconNames.calendarToday} size={20} color={colors.onSurface} />
            </Pressable>
            <Pressable style={styles.iconButton}>
              <Icon name={iconNames.photoCamera} size={20} color={colors.onSurface} />
            </Pressable>
          </View>
        </View>

        <View style={styles.slotsRow}>
          {(Object.keys(slotLabels) as (keyof OutfitSlot)[]).map((slot) => (
            <View
              key={slot}
              style={[styles.slotChip, isSlotFilled(slot) && styles.slotChipFilled]}
            >
              <Text
                style={[
                  styles.slotChipText,
                  isSlotFilled(slot) && styles.slotChipTextFilled,
                ]}
              >
                {slotLabels[slot]}
              </Text>
              {isSlotFilled(slot) && (
                <Icon name={iconNames.check} size={12} color={colors.onPrimary} />
              )}
            </View>
          ))}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {categories.map((cat) => (
            <Pill
              key={cat.id}
              label={cat.label}
              active={filter === cat.id}
              onPress={() => setFilter(cat.id)}
            />
          ))}
        </ScrollView>

        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.gridRow}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.footer}>
          <Pressable style={styles.floatingAction}>
            <Icon name={iconNames.autoAwesome} size={20} color={colors.primary} />
          </Pressable>
          <Pressable
            onPress={() => router.push('/create-outfit/step-2')}
            disabled={!requiredSlotsFilled}
            style={[
              styles.nextButton,
              !requiredSlotsFilled && styles.nextButtonDisabled,
            ]}
          >
            <Text style={styles.nextButtonText}>Next</Text>
            <Icon name={iconNames.arrowForward} size={20} color={colors.onPrimary} />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

function GarmentCard({
  item,
  selected,
  onPress,
  onFavorite,
}: {
  item: Garment;
  selected: boolean;
  onPress: () => void;
  onFavorite: () => void;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => (scale.value = withTiming(0.96, { duration: 100 }))}
      onPressOut={() => (scale.value = withTiming(1, { duration: 150 }))}
      style={[styles.garmentCard, animatedStyle]}
    >
      <View style={[styles.garmentImage, { backgroundColor: item.color }, selected && styles.garmentImageSelected]}>
        <Text style={styles.garmentEmoji}>
          {item.category === 'tops' ? '👕' : item.category === 'bottoms' ? '👖' : item.category === 'shoes' ? '👟' : item.category === 'outerwear' ? '🧥' : '👜'}
        </Text>
        {selected && (
          <View style={styles.selectedBadge}>
            <Icon name={iconNames.check} size={14} color={colors.onPrimary} />
          </View>
        )}
      </View>
      <Text style={styles.garmentName} numberOfLines={1}>
        {item.name}
      </Text>
      <Pressable onPress={onFavorite} style={styles.heartIcon} hitSlop={8}>
        <Icon
          name={item.favorite ? iconNames.favorite : iconNames.favoriteBorder}
          size={16}
          color={item.favorite ? colors.primary : colors.outline}
        />
      </Pressable>
    </AnimatedPressable>
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
    paddingBottom: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...typography.h2, fontSize: 18 },
  headerActions: { flexDirection: 'row', gap: 8 },
  slotsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: spacing.screenMargin,
    paddingBottom: 12,
    flexWrap: 'wrap',
  },
  slotChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 9999,
    backgroundColor: colors.surfaceContainerLow,
  },
  slotChipFilled: { backgroundColor: colors.primary },
  slotChipText: { ...typography.label, color: colors.onSurfaceVariant },
  slotChipTextFilled: { color: colors.onPrimary },
  filterRow: { paddingHorizontal: spacing.screenMargin, gap: 8, paddingBottom: 12 },
  grid: { paddingHorizontal: spacing.screenMargin, paddingBottom: 120 },
  gridRow: { gap: 12, marginBottom: 12 },
  garmentCard: { flex: 1, maxWidth: '33.3%' },
  garmentImage: {
    width: '100%',
    aspectRatio: 0.8,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
  garmentImageSelected: {
    borderWidth: 3,
    borderColor: colors.primary,
  },
  garmentEmoji: { fontSize: 36 },
  garmentName: {
    ...typography.caption,
    marginTop: 6,
    textAlign: 'center',
  },
  heartIcon: { position: 'absolute', top: 8, right: 8 },
  selectedBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.screenMargin,
    paddingVertical: 12,
    backgroundColor: colors.surfaceContainerLowest,
    borderTopColor: colors.outlineVariant,
    borderTopWidth: 1,
  },
  floatingAction: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 9999,
    paddingVertical: 16,
  },
  nextButtonDisabled: { opacity: 0.4 },
  nextButtonText: { ...typography.bodyLg, fontFamily: 'Inter_600SemiBold', color: colors.onPrimary },
});
