import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { colors, typography, radii, spacing, shadow } from '@/constants/theme';
import { Icon, iconNames } from '@/components/ui/Icon';
import { useOutfitStore, Outfit } from '@/store/useOutfitStore';
import { useWardrobeStore, Garment } from '@/store/useWardrobeStore';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function DressingRoomScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { outfits, getOutfit } = useOutfitStore();
  const { items } = useWardrobeStore();
  const [currentIndex, setCurrentIndex] = useState(() => {
    const idx = outfits.findIndex((o) => o.id === id);
    return idx >= 0 ? idx : 0;
  });

  const currentOutfit = outfits[currentIndex];
  const isEmpty = !currentOutfit || outfits.length === 0;

  const goPrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
    else if (outfits.length > 0) setCurrentIndex(outfits.length - 1);
  };

  const goNext = () => {
    if (currentIndex < outfits.length - 1) setCurrentIndex(currentIndex + 1);
    else if (outfits.length > 0) setCurrentIndex(0);
  };

  const getGarment = (gid?: string) => items.find((i) => i.id === gid);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <Icon name={iconNames.arrowBack} size={22} color={colors.onSurface} />
          </Pressable>
          <Text style={styles.title}>Dressing Room</Text>
          <Pressable style={styles.iconButton}>
            <Icon name={iconNames.gridView} size={20} color={colors.onSurface} />
          </Pressable>
        </View>

        {isEmpty ? (
          <EmptyDressingRoom onCreate={() => router.push('/create-outfit/choose-method')} />
        ) : (
          <>
            <View style={styles.navRow}>
              <Pressable onPress={goPrev} style={styles.navArrow}>
                <Icon name={iconNames.chevronLeft} size={28} color={colors.onSurface} />
              </Pressable>
              <Text style={styles.counter}>
                {currentIndex + 1} / {outfits.length}
              </Text>
              <Pressable onPress={goNext} style={styles.navArrow}>
                <Icon name={iconNames.chevronRight} size={28} color={colors.onSurface} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
              <View style={styles.outfitDisplay}>
                {currentOutfit && (
                  <>
                    <Text style={styles.outfitName}>{currentOutfit.name}</Text>
                    {currentOutfit.occasion && (
                      <Text style={styles.outfitOccasion}>{currentOutfit.occasion}</Text>
                    )}
                    <View style={styles.outfitLayers}>
                      {(['outerwear', 'top', 'bottom', 'shoes', 'accessory'] as const).map((slot) => {
                        const gid = currentOutfit.slots[slot];
                        const garment = getGarment(gid);
                        if (!garment) return null;
                        return (
                          <OutfitLayer
                            key={slot}
                            garment={garment}
                            slotLabel={slot}
                            onEdit={() => router.push('/create-outfit/step-2')}
                          />
                        );
                      })}
                    </View>
                  </>
                )}
              </View>

              <Pressable
                onPress={() => router.push('/create-outfit/step-2')}
                style={styles.editButton}
              >
                <Icon name={iconNames.autoFixHigh} size={18} color={colors.onPrimary} />
                <Text style={styles.editButtonText}>Edit this look</Text>
              </Pressable>
            </ScrollView>

            <View style={[styles.bottomNav, { paddingBottom: insets.bottom + 8 }]}>
              <Pressable style={styles.bottomNavItem}>
                <Icon name={iconNames.person} size={24} color={colors.onSurfaceVariant} />
              </Pressable>
              <Pressable style={styles.bottomNavItem}>
                <Icon name={iconNames.checkroom} size={24} color={colors.primary} />
              </Pressable>
              <Pressable
                onPress={() => router.push('/create-outfit/choose-method')}
                style={styles.bottomNavAdd}
              >
                <Icon name={iconNames.add} size={28} color={colors.onPrimary} />
              </Pressable>
              <Pressable
                onPress={() => router.push('/(tabs)/stylist')}
                style={styles.bottomNavItem}
              >
                <Icon name={iconNames.autoFixHigh} size={24} color={colors.onSurfaceVariant} />
              </Pressable>
              <Pressable
                onPress={() => router.push('/(tabs)/profile')}
                style={styles.bottomNavItem}
              >
                <Icon name={iconNames.person} size={24} color={colors.onSurfaceVariant} />
              </Pressable>
            </View>
          </>
        )}
      </SafeAreaView>
    </View>
  );
}

function EmptyDressingRoom({ onCreate }: { onCreate: () => void }) {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Icon name={iconNames.checkroom} size={48} color={colors.outlineVariant} />
      </View>
      <Text style={styles.emptyTitle}>Your dressing room is empty</Text>
      <Text style={styles.emptySubtitle}>
        Create your first outfit to start curating looks
      </Text>
      <Pressable onPress={onCreate} style={styles.emptyButton}>
        <Icon name={iconNames.add} size={20} color={colors.onPrimary} />
        <Text style={styles.emptyButtonText}>Create Outfit</Text>
      </Pressable>
    </View>
  );
}

function OutfitLayer({
  garment,
  slotLabel,
  onEdit,
}: {
  garment: Garment;
  slotLabel: string;
  onEdit: () => void;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      onPress={onEdit}
      onPressIn={() => (scale.value = withTiming(0.97, { duration: 100 }))}
      onPressOut={() => (scale.value = withTiming(1, { duration: 150 }))}
      style={[styles.layer, animatedStyle]}
    >
      <View style={[styles.layerColor, { backgroundColor: garment.color }]}>
        <Text style={styles.layerEmoji}>
          {garment.category === 'tops' ? '👕' : garment.category === 'bottoms' ? '👖' : garment.category === 'shoes' ? '👟' : garment.category === 'outerwear' ? '🧥' : '👜'}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.layerSlot}>{slotLabel}</Text>
        <Text style={styles.layerName}>{garment.name}</Text>
      </View>
      <Icon name={iconNames.chevronRight} size={20} color={colors.outline} />
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
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenMargin,
    paddingVertical: 12,
  },
  navArrow: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counter: { ...typography.bodyLg, fontFamily: 'Inter_600SemiBold' },
  scroll: { paddingHorizontal: spacing.screenMargin, paddingBottom: 120 },
  outfitDisplay: { alignItems: 'center', paddingTop: 16 },
  outfitName: { ...typography.h1, fontSize: 24 },
  outfitOccasion: { ...typography.bodySm, color: colors.onSurfaceVariant, marginTop: 4 },
  outfitLayers: { width: '100%', gap: 12, marginTop: 24 },
  layer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.lg,
    padding: 16,
    ...shadow.soft,
  },
  layerColor: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  layerEmoji: { fontSize: 24 },
  layerSlot: { ...typography.label, color: colors.onSurfaceVariant, textTransform: 'capitalize' },
  layerName: { ...typography.bodyLg, fontFamily: 'Inter_500Medium', marginTop: 2 },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 9999,
    paddingVertical: 14,
    marginTop: 24,
  },
  editButtonText: { ...typography.bodyLg, fontFamily: 'Inter_600SemiBold', color: colors.onPrimary },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 12 },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { ...typography.h2, fontSize: 20, textAlign: 'center' },
  emptySubtitle: { ...typography.bodySm, color: colors.onSurfaceVariant, textAlign: 'center' },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 9999,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  emptyButtonText: { ...typography.bodyLg, fontFamily: 'Inter_600SemiBold', color: colors.onPrimary },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.surfaceContainerLowest,
    borderTopColor: colors.outlineVariant,
    borderTopWidth: 1,
    paddingTop: 12,
  },
  bottomNavItem: { padding: 8 },
  bottomNavAdd: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -24,
    ...shadow.soft,
    elevation: 6,
  },
});
