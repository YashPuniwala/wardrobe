import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { colors, typography, radii, spacing, shadow } from '@/constants/theme';
import { Icon, iconNames } from '@/components/ui/Icon';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useWardrobeStore, Garment } from '@/store/useWardrobeStore';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const paletteColors = [
  { id: 'c1', name: 'Warm Cream', hex: '#e8d5c4' },
  { id: 'c2', name: 'Camel', hex: '#c4a882' },
  { id: 'c3', name: 'Terracotta', hex: '#96463c' },
  { id: 'c4', name: 'Olive', hex: '#6b6b3a' },
  { id: 'c5', name: 'Navy', hex: '#2a3a5c' },
  { id: 'c6', name: 'Charcoal', hex: '#3a3a3a' },
  { id: 'c7', name: 'Soft White', hex: '#f5f0eb' },
  { id: 'c8', name: 'Mocha', hex: '#6b4e3a' },
  { id: 'c9', name: 'Sage', hex: '#9caf88' },
  { id: 'c10', name: 'Dusty Rose', hex: '#c4a0a0' },
  { id: 'c11', name: 'Mustard', hex: '#c4a02a' },
  { id: 'c12', name: 'Forest', hex: '#2a5c3a' },
];

export default function YourPaletteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { favoriteColors, toggleColor, isColorFavorite } = useFavoritesStore();
  const { items } = useWardrobeStore();
  const [selectedColor, setSelectedColor] = useState<(typeof paletteColors)[0] | null>(null);

  const matchingGarments = selectedColor
    ? items.filter((i) => i.color.toLowerCase() === selectedColor.hex.toLowerCase())
    : [];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <Icon name={iconNames.arrowBack} size={22} color={colors.onSurface} />
          </Pressable>
          <Text style={styles.title}>Your Palette</Text>
          <Pressable style={styles.iconButton}>
            <Icon name={iconNames.gridView} size={20} color={colors.onSurface} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.introCard}>
            <View style={styles.introIcon}>
              <Icon name={iconNames.palette} size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.introTitle}>Your best colors</Text>
              <Text style={styles.introSubtitle}>
                Curated based on your style profile and wardrobe
              </Text>
            </View>
          </View>

          <View style={styles.swatchGrid}>
            {paletteColors.map((color) => (
              <ColorSwatch
                key={color.id}
                color={color}
                isFavorite={isColorFavorite(color.hex)}
                onToggle={() => toggleColor(color.hex)}
                onPress={() => setSelectedColor(color)}
              />
            ))}
          </View>
        </ScrollView>

        <View style={[styles.bottomNav, { paddingBottom: insets.bottom + 8 }]}>
          <Pressable onPress={() => router.push('/(tabs)/stylist')} style={styles.bottomNavItem}>
            <Icon name={iconNames.autoFixHigh} size={24} color={colors.onSurfaceVariant} />
          </Pressable>
          <Pressable onPress={() => router.push('/(tabs)/wardrobe')} style={styles.bottomNavItem}>
            <Icon name={iconNames.checkroom} size={24} color={colors.onSurfaceVariant} />
          </Pressable>
          <Pressable
            onPress={() => router.push('/create-outfit/choose-method')}
            style={styles.bottomNavAdd}
          >
            <Icon name={iconNames.addCircle} size={32} color={colors.onPrimary} />
          </Pressable>
          <Pressable onPress={() => router.push('/(tabs)/outfits')} style={styles.bottomNavItem}>
            <Icon name={iconNames.autoAwesome} size={24} color={colors.onSurfaceVariant} />
          </Pressable>
          <Pressable onPress={() => router.push('/(tabs)/profile')} style={styles.bottomNavItem}>
            <Icon name={iconNames.person} size={24} color={colors.onSurfaceVariant} />
          </Pressable>
        </View>
      </SafeAreaView>

      <BottomSheet visible={!!selectedColor} onClose={() => setSelectedColor(null)}>
        <ColorDetailSheet
          color={selectedColor}
          garments={matchingGarments}
          isFavorite={selectedColor ? isColorFavorite(selectedColor.hex) : false}
          onToggle={() => selectedColor && toggleColor(selectedColor.hex)}
        />
      </BottomSheet>
    </View>
  );
}

function ColorSwatch({
  color,
  isFavorite,
  onToggle,
  onPress,
}: {
  color: (typeof paletteColors)[0];
  isFavorite: boolean;
  onToggle: () => void;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => (scale.value = withTiming(0.95, { duration: 100 }))}
      onPressOut={() => (scale.value = withTiming(1, { duration: 150 }))}
      style={[styles.swatch, animatedStyle]}
    >
      <View style={[styles.swatchColor, { backgroundColor: color.hex }]}>
        <Pressable onPress={onToggle} style={styles.heartButton} hitSlop={8}>
          <Icon
            name={isFavorite ? iconNames.favorite : iconNames.favoriteBorder}
            size={18}
            color={isFavorite ? colors.primary : colors.onSurface}
          />
        </Pressable>
      </View>
      <Text style={styles.swatchName} numberOfLines={1}>
        {color.name}
      </Text>
      <Text style={styles.swatchHex}>{color.hex}</Text>
    </AnimatedPressable>
  );
}

function ColorDetailSheet({
  color,
  garments,
  isFavorite,
  onToggle,
}: {
  color: (typeof paletteColors)[0] | null;
  garments: Garment[];
  isFavorite: boolean;
  onToggle: () => void;
}) {
  if (!color) return null;

  return (
    <View style={styles.sheetContent}>
      <View style={styles.sheetHeader}>
        <View style={[styles.sheetSwatch, { backgroundColor: color.hex }]} />
        <View style={{ flex: 1 }}>
          <Text style={styles.sheetColorName}>{color.name}</Text>
          <Text style={styles.sheetColorHex}>{color.hex}</Text>
        </View>
        <Pressable onPress={onToggle} style={styles.sheetHeart}>
          <Icon
            name={isFavorite ? iconNames.favorite : iconNames.favoriteBorder}
            size={24}
            color={isFavorite ? colors.primary : colors.outline}
          />
        </Pressable>
      </View>

      <Text style={styles.sheetSectionTitle}>Garments in this color</Text>

      {garments.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.garmentRow}>
            {garments.map((g) => (
              <View key={g.id} style={styles.garmentItem}>
                <View style={[styles.garmentSwatch, { backgroundColor: g.color }]}>
                  <Text style={styles.garmentEmoji}>
                    {g.category === 'tops' ? '👕' : g.category === 'bottoms' ? '👖' : g.category === 'shoes' ? '👟' : g.category === 'outerwear' ? '🧥' : '👜'}
                  </Text>
                </View>
                <Text style={styles.garmentName} numberOfLines={1}>
                  {g.name}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.emptyGarments}>
          <Icon name={iconNames.checkroom} size={32} color={colors.outlineVariant} />
          <Text style={styles.emptyGarmentsText}>
            No garments in this color yet. Add items to see them here.
          </Text>
        </View>
      )}
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
  title: { ...typography.h2, fontSize: 20 },
  scroll: { paddingHorizontal: spacing.screenMargin, paddingBottom: 120 },
  introCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.lg,
    padding: 16,
    marginBottom: 20,
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
  swatchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  swatch: { width: '31.5%' },
  swatchColor: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radii.lg,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    padding: 8,
  },
  heartButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchName: { ...typography.caption, fontFamily: 'Inter_600SemiBold', marginTop: 6 },
  swatchHex: { ...typography.label, fontSize: 10, color: colors.outline },
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
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
    ...shadow.soft,
    elevation: 6,
  },
  sheetContent: { padding: 20 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  sheetSwatch: { width: 56, height: 56, borderRadius: 16 },
  sheetColorName: { ...typography.h2, fontSize: 18 },
  sheetColorHex: { ...typography.bodySm, color: colors.onSurfaceVariant, marginTop: 2 },
  sheetHeart: { padding: 8 },
  sheetSectionTitle: {
    ...typography.label,
    color: colors.onSurfaceVariant,
    marginBottom: 12,
    letterSpacing: 1,
  },
  garmentRow: { flexDirection: 'row', gap: 12, paddingBottom: 20 },
  garmentItem: { width: 100 },
  garmentSwatch: {
    width: '100%',
    aspectRatio: 0.8,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  garmentEmoji: { fontSize: 32 },
  garmentName: { ...typography.caption, marginTop: 4, textAlign: 'center' },
  emptyGarments: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  emptyGarmentsText: { ...typography.bodySm, color: colors.onSurfaceVariant, textAlign: 'center' },
});
