import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, radii, spacing, shadow } from '@/constants/theme';
import { Icon, iconNames } from '@/components/ui/Icon';
import { useWardrobeStore } from '@/store/useWardrobeStore';
import { useOutfitDraftStore } from '@/store/useOutfitDraftStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const silhouetteImage = Image.resolveAssetSource(require('@/assets/images/men-top1.webp')).uri;

export default function DressingRoomPreviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { items } = useWardrobeStore();
  const { selectedItemIds } = useOutfitDraftStore();
  const [loaded, setLoaded] = useState(false);

  const selectedGarments = selectedItemIds
    .map((id) => items.find((i) => i.id === id))
    .filter(Boolean);

  const tops = selectedGarments.filter((g) => g!.category === 'tops');
  const bottoms = selectedGarments.filter((g) => g!.category === 'bottoms');
  const shoes = selectedGarments.filter((g) => g!.category === 'shoes');
  const outerwear = selectedGarments.filter((g) => g!.category === 'outerwear');
  const accessories = selectedGarments.filter((g) => g!.category === 'accessories');

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/create-outfit/save-outfit');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <Icon name={iconNames.arrowBack} size={22} color={colors.onSurface} />
          </Pressable>
          <Text style={styles.title}>Dressing Room</Text>
          <Pressable onPress={handleNext} style={styles.nextPill}>
            <Text style={styles.nextPillText}>Next</Text>
            <Icon name={iconNames.arrowForward} size={16} color={colors.onPrimary} />
          </Pressable>
        </View>

        <View style={styles.previewArea}>
          <Image source={{ uri: silhouetteImage }} style={styles.silhouetteImage} resizeMode="cover" />
          <View style={styles.silhouetteOverlay} />

          {/* Garment layers positioned on silhouette */}
          {loaded && (
            <>
              {outerwear.map((g, i) => (
                <GarmentOnModel key={g!.id} garment={g!} top={20 + i * 10} left={SCREEN_WIDTH * 0.25} width={SCREEN_WIDTH * 0.5} height={SCREEN_WIDTH * 0.35} />
              ))}
              {tops.map((g, i) => (
                <GarmentOnModel key={g!.id} garment={g!} top={60 + i * 10} left={SCREEN_WIDTH * 0.28} width={SCREEN_WIDTH * 0.44} height={SCREEN_WIDTH * 0.3} />
              ))}
              {bottoms.map((g, i) => (
                <GarmentOnModel key={g!.id} garment={g!} top={180 + i * 10} left={SCREEN_WIDTH * 0.3} width={SCREEN_WIDTH * 0.4} height={SCREEN_WIDTH * 0.28} />
              ))}
              {shoes.map((g, i) => (
                <GarmentOnModel key={g!.id} garment={g!} top={300 + i * 10} left={SCREEN_WIDTH * 0.3} width={SCREEN_WIDTH * 0.4} height={SCREEN_WIDTH * 0.15} />
              ))}
              {accessories.map((g, i) => (
                <GarmentOnModel key={g!.id} garment={g!} top={10 + i * 10} left={SCREEN_WIDTH * 0.35} width={SCREEN_WIDTH * 0.3} height={SCREEN_WIDTH * 0.15} />
              ))}
            </>
          )}

          {!loaded && (
            <View style={styles.loadingOverlay}>
              <Text style={styles.loadingText}>Placing garments…</Text>
            </View>
          )}
        </View>

        <View style={styles.garmentList}>
          <Text style={styles.sectionLabel}>SELECTED ({selectedGarments.length})</Text>
          <View style={styles.garmentChips}>
            {selectedGarments.map((g) => (
              <View key={g!.id} style={styles.garmentChip}>
                <Image source={{ uri: g!.imageUri }} style={styles.garmentChipImage} resizeMode="cover" />
                <Text style={styles.garmentChipName} numberOfLines={1}>{g!.name}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Icon name={iconNames.arrowBack} size={18} color={colors.onSurface} />
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
          <Pressable onPress={handleNext} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Next</Text>
            <Icon name={iconNames.arrowForward} size={18} color={colors.onPrimary} />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

function GarmentOnModel({ garment, top, left, width, height }: { garment: any; top: number; left: number; width: number; height: number }) {
  return (
    <View style={[styles.garmentOnModel, { top, left, width, height }]}>
      <Image source={{ uri: garment.imageUri }} style={styles.garmentOnModelImage} resizeMode="contain" />
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
  nextPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  nextPillText: { ...typography.bodySm, fontFamily: 'Inter_600SemiBold', color: colors.onPrimary },
  previewArea: {
    flex: 1,
    margin: 20,
    borderRadius: radii.xl,
    backgroundColor: colors.surfaceContainer,
    overflow: 'hidden',
    position: 'relative',
    ...shadow.soft,
  },
  silhouetteImage: { width: '100%', height: '100%' },
  silhouetteOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(34, 26, 24, 0.1)' },
  garmentOnModel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  garmentOnModelImage: { width: '100%', height: '100%', opacity: 0.92 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 248, 247, 0.6)',
  },
  loadingText: { ...typography.bodyLg, color: colors.onSurfaceVariant, fontFamily: 'Inter_600SemiBold' },
  garmentList: { paddingHorizontal: spacing.screenMargin, paddingBottom: 12 },
  sectionLabel: { ...typography.label, color: colors.onSurfaceVariant, letterSpacing: 1, marginBottom: 8 },
  garmentChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  garmentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.pill,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  garmentChipImage: { width: 24, height: 24, borderRadius: 12 },
  garmentChipName: { ...typography.caption, fontSize: 11, maxWidth: 80 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.screenMargin,
    paddingTop: 12,
    backgroundColor: colors.surfaceContainerLowest,
    borderTopColor: colors.outlineVariant,
    borderTopWidth: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceContainerLow,
  },
  backButtonText: { ...typography.bodyLg, fontFamily: 'Inter_600SemiBold', color: colors.onSurfaceVariant },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: 14,
  },
  saveButtonText: { ...typography.bodyLg, fontFamily: 'Inter_600SemiBold', color: colors.onPrimary },
});
