import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { colors, typography, radii, spacing, shadow } from '@/constants/theme';
import { Icon, iconNames } from '@/components/ui/Icon';
import { useWardrobeStore, Garment } from '@/store/useWardrobeStore';
import { launchGarmentCamera } from '@/utils/camera';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const modelSilhouette = 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function TryOnScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { items } = useWardrobeStore();
  const [selectedGarment, setSelectedGarment] = useState<Garment | null>(null);
  const [modelImage, setModelImage] = useState<string | null>(null);

  const handleTakeSelfie = async () => {
    const uri = await launchGarmentCamera();
    if (uri) {
      setModelImage(uri);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <Icon name={iconNames.arrowBack} size={22} color={colors.onSurface} />
          </Pressable>
          <Text style={styles.title}>AI Try On</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.previewArea}>
            <Image
              source={{ uri: modelImage || modelSilhouette }}
              style={styles.modelImage}
              resizeMode="cover"
            />
            {selectedGarment && (
              <View style={styles.overlayContainer}>
                <Image
                  source={{ uri: selectedGarment.imageUri }}
                  style={styles.garmentOverlay}
                  resizeMode="contain"
                />
                <View style={styles.overlayLabel}>
                  <Text style={styles.overlayLabelText}>{selectedGarment.name}</Text>
                </View>
              </View>
            )}
            {!selectedGarment && (
              <View style={styles.previewPlaceholder}>
                <Icon name={iconNames.checkroom} size={32} color={colors.onPrimary} />
                <Text style={styles.previewPlaceholderText}>Pick a garment below</Text>
              </View>
            )}
            <Pressable onPress={handleTakeSelfie} style={styles.selfieButton}>
              <Icon name={iconNames.photoCamera} size={18} color={colors.onPrimary} />
              <Text style={styles.selfieButtonText}>
                {modelImage ? 'Retake Selfie' : 'Use Your Selfie'}
              </Text>
            </Pressable>
          </View>

          <Text style={styles.sectionTitle}>Choose a garment</Text>
          <View style={styles.garmentGrid}>
            {items.map((item) => (
              <GarmentTile
                key={item.id}
                garment={item}
                selected={selectedGarment?.id === item.id}
                onPress={() =>
                  setSelectedGarment(selectedGarment?.id === item.id ? null : item)
                }
              />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function GarmentTile({
  garment,
  selected,
  onPress,
}: {
  garment: Garment;
  selected: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => (scale.value = withTiming(0.95, { duration: 100 }))}
      onPressOut={() => (scale.value = withTiming(1, { duration: 150 }))}
      style={[styles.garmentTile, animatedStyle]}
    >
      <View style={[styles.garmentTileImage, selected && styles.garmentTileSelected]}>
        <Image
          source={{ uri: garment.imageUri }}
          style={styles.garmentImage}
          resizeMode="cover"
        />
        {selected && (
          <View style={styles.selectedBadge}>
            <Icon name={iconNames.check} size={14} color={colors.onPrimary} />
          </View>
        )}
      </View>
      <Text style={styles.garmentTileName} numberOfLines={1}>
        {garment.name}
      </Text>
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
  scroll: { paddingHorizontal: spacing.screenMargin, paddingBottom: 40 },
  previewArea: {
    width: '100%',
    height: SCREEN_WIDTH * 1.1,
    borderRadius: radii.xl,
    backgroundColor: colors.surfaceContainer,
    overflow: 'hidden',
    position: 'relative',
    ...shadow.soft,
  },
  modelImage: {
    width: '100%',
    height: '100%',
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  garmentOverlay: {
    width: '70%',
    height: '50%',
  },
  overlayLabel: {
    position: 'absolute',
    bottom: 60,
    backgroundColor: 'rgba(34, 26, 24, 0.7)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
  },
  overlayLabelText: {
    ...typography.caption,
    color: colors.surfaceContainerLowest,
    fontFamily: 'Inter_600SemiBold',
  },
  previewPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  previewPlaceholderText: {
    ...typography.bodySm,
    color: colors.onPrimary,
    fontFamily: 'Inter_600SemiBold',
  },
  selfieButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(150, 70, 60, 0.9)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radii.pill,
  },
  selfieButtonText: {
    ...typography.caption,
    color: colors.onPrimary,
    fontFamily: 'Inter_600SemiBold',
  },
  sectionTitle: {
    ...typography.h2,
    fontSize: 18,
    marginTop: 24,
    marginBottom: 12,
  },
  garmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  garmentTile: { width: '31.5%' },
  garmentTileImage: {
    width: '100%',
    aspectRatio: 0.8,
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainerLow,
  },
  garmentTileSelected: {
    borderWidth: 3,
    borderColor: colors.primary,
  },
  garmentImage: { width: '100%', height: '100%' },
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
  garmentTileName: {
    ...typography.caption,
    marginTop: 6,
    textAlign: 'center',
  },
});
