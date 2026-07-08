import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, ScrollView, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { colors, typography, radii, spacing, shadow } from '@/constants/theme';
import { Icon, iconNames } from '@/components/ui/Icon';
import { Pill } from '@/components/ui/Pill';
import { useWardrobeStore, Garment, GarmentCategory } from '@/store/useWardrobeStore';
import { useOutfitDraftStore } from '@/store/useOutfitDraftStore';
import { useOutfitStore } from '@/store/useOutfitStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const categories: { id: GarmentCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'tops', label: 'Tops' },
  { id: 'bottoms', label: 'Bottoms' },
  { id: 'shoes', label: 'Shoes' },
  { id: 'outerwear', label: 'Outerwear' },
  { id: 'accessories', label: 'Accessories' },
];

const shortcuts = [
  { id: 'selfie', label: 'Selfie', icon: iconNames.photoCamera },
  { id: 'suggestions', label: 'Suggestions', icon: iconNames.autoAwesome },
  { id: 'saved', label: 'Saved Outfits', icon: iconNames.bookmark },
];

export default function AddOutfitScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { items } = useWardrobeStore();
  const { outfits } = useOutfitStore();
  const { selectedItemIds, toggleItem, removeItem, setReferencePhoto, reset } = useOutfitDraftStore();
  const [filter, setFilter] = useState<GarmentCategory | 'all'>('all');
  const [showMethodSheet, setShowMethodSheet] = useState(false);

  useEffect(() => {
    reset();
  }, []);

  const filteredItems = filter === 'all' ? items : items.filter((i) => i.category === filter);

  const handleShortcut = async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (id === 'selfie') {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        setReferencePhoto(result.assets[0].uri);
      }
    } else if (id === 'suggestions') {
      const aiPicks = items.slice(0, 4);
      aiPicks.forEach((item) => {
        if (!selectedItemIds.includes(item.id)) toggleItem(item.id);
      });
    } else if (id === 'saved') {
      if (outfits.length > 0) {
        const first = outfits[0];
        first.selectedItemIds?.forEach((gid) => {
          if (!selectedItemIds.includes(gid)) toggleItem(gid);
        });
      }
    }
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowMethodSheet(true);
  };

  const renderItem = ({ item }: { item: Garment }) => {
    const isSelected = selectedItemIds.includes(item.id);
    return (
      <GarmentTile
        item={item}
        selected={isSelected}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          toggleItem(item.id);
        }}
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
          <Text style={styles.title}>Add outfit</Text>
          <Pressable style={styles.iconButton}>
            <Icon name={iconNames.calendarToday} size={20} color={colors.onSurface} />
          </Pressable>
        </View>

        <View style={styles.shortcutsRow}>
          {shortcuts.map((s) => (
            <ShortcutTile key={s.id} label={s.label} iconName={s.icon} onPress={() => handleShortcut(s.id)} />
          ))}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScrollView}
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

        {selectedItemIds.length > 0 && (
          <View style={[styles.bottomStrip, { paddingBottom: insets.bottom + 12 }]}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.selectedThumbs}
            >
              {selectedItemIds.map((id) => {
                const item = items.find((i) => i.id === id);
                if (!item) return null;
                return (
                  <View key={id} style={styles.selectedThumb}>
                    <Image source={{ uri: item.imageUri }} style={styles.selectedThumbImage} resizeMode="cover" />
                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        removeItem(id);
                      }}
                      style={styles.selectedThumbRemove}
                    >
                      <Icon name={iconNames.close} size={12} color={colors.onPrimary} />
                    </Pressable>
                  </View>
                );
              })}
            </ScrollView>
            <View style={styles.bottomActions}>
              <Text style={styles.selectedCount}>{selectedItemIds.length} selected</Text>
              <Pressable
                onPress={handleNext}
                style={styles.nextButton}
              >
                <Text style={styles.nextButtonText}>Next</Text>
                <Icon name={iconNames.arrowForward} size={18} color={colors.onPrimary} />
              </Pressable>
            </View>
          </View>
        )}
      </SafeAreaView>

      {showMethodSheet && (
        <MethodChoiceSheet
          onClose={() => setShowMethodSheet(false)}
        />
      )}
    </View>
  );
}

function ShortcutTile({ label, iconName, onPress }: { label: string; iconName: any; onPress: () => void }) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => (scale.value = withTiming(0.95, { duration: 100 }))}
      onPressOut={() => (scale.value = withTiming(1, { duration: 150 }))}
      style={[styles.shortcutTile, animatedStyle]}
    >
      <View style={styles.shortcutIcon}>
        <Icon name={iconName} size={20} color={colors.primary} />
      </View>
      <Text style={styles.shortcutLabel}>{label}</Text>
    </AnimatedPressable>
  );
}

function GarmentTile({ item, selected, onPress }: { item: Garment; selected: boolean; onPress: () => void }) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => (scale.value = withTiming(0.96, { duration: 100 }))}
      onPressOut={() => (scale.value = withTiming(1, { duration: 150 }))}
      style={[styles.garmentTile, animatedStyle]}
    >
      <View style={[styles.garmentImage, selected && styles.garmentImageSelected]}>
        <Image source={{ uri: item.imageUri }} style={styles.garmentImageContent} resizeMode="cover" />
        <View style={[styles.checkbox, selected && styles.checkboxChecked]}>
          {selected && <Icon name={iconNames.check} size={14} color={colors.onPrimary} />}
        </View>
      </View>
      <Text style={styles.garmentName} numberOfLines={1}>{item.name}</Text>
    </AnimatedPressable>
  );
}

function MethodChoiceSheet({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { setBuildMethod, askEveryTime, setAskEveryTime, setLastMethod } = useOutfitDraftStore();

  const handleMethod = (method: 'collage' | 'dressing-room' | 'ai-tryon') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setBuildMethod(method);
    if (!askEveryTime) {
      setLastMethod(method);
    }
    onClose();
    switch (method) {
      case 'collage':
        router.push('/create-outfit/collage');
        break;
      case 'dressing-room':
        router.push('/create-outfit/dressing-room-preview');
        break;
      case 'ai-tryon':
        router.push('/create-outfit/ai-tryon');
        break;
    }
  };

  const methods = [
    { id: 'collage' as const, title: 'Collage', description: 'Freely arrange and style your pieces', icon: iconNames.autoAwesome },
    { id: 'dressing-room' as const, title: 'Dressing Room', description: 'See it on a model', icon: iconNames.checkroom },
    { id: 'ai-tryon' as const, title: 'AI Try On', description: 'Try it on virtually', icon: iconNames.bodyFat },
  ];

  return (
    <View style={styles.sheetOverlay}>
      <Pressable style={styles.sheetDismiss} onPress={onClose} />
      <View style={styles.methodSheet}>
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>How do you want to build this?</Text>
        <View style={styles.methodCards}>
          {methods.map((m) => (
            <Pressable key={m.id} onPress={() => handleMethod(m.id)} style={styles.methodCard}>
              <View style={styles.methodCardIcon}>
                <Icon name={m.icon} size={24} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.methodCardTitle}>{m.title}</Text>
                <Text style={styles.methodCardDesc}>{m.description}</Text>
              </View>
              <Icon name={iconNames.chevronRight} size={20} color={colors.outline} />
            </Pressable>
          ))}
        </View>
        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleLabel}>Ask me every time</Text>
            <Text style={styles.toggleSub}>Turn off to remember your last method</Text>
          </View>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setAskEveryTime(!askEveryTime);
            }}
            style={[styles.toggleSwitch, askEveryTime && styles.toggleSwitchOn]}
          >
            <View style={[styles.toggleThumb, askEveryTime && styles.toggleThumbOn]} />
          </Pressable>
        </View>
      </View>
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
  shortcutsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenMargin,
    paddingBottom: 16,
    gap: 12,
  },
  shortcutTile: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  shortcutIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
  shortcutLabel: { ...typography.caption, fontFamily: 'Inter_500Medium' },
  filterScrollView: {
    flexGrow: 0,
    height: 48,
    marginBottom: 8,
  },
  filterRow: {
    paddingHorizontal: spacing.screenMargin,
    gap: 8,
    alignItems: 'center',
  },
  grid: { paddingHorizontal: spacing.screenMargin, paddingBottom: 160 },
  gridRow: { gap: 12, marginBottom: 12 },
  garmentTile: { flex: 1, maxWidth: '33.3%' },
  garmentImage: {
    width: '100%',
    aspectRatio: 0.8,
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainerLow,
    ...shadow.soft,
  },
  garmentImageSelected: {
    borderWidth: 3,
    borderColor: colors.primary,
  },
  garmentImageContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  checkbox: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.surfaceContainerLowest,
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  garmentName: { ...typography.caption, marginTop: 6, textAlign: 'center' },
  bottomStrip: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surfaceContainerLowest,
    borderTopColor: colors.outlineVariant,
    borderTopWidth: 1,
    paddingTop: 12,
    paddingHorizontal: spacing.screenMargin,
  },
  selectedThumbs: { gap: 8, paddingBottom: 8 },
  selectedThumb: {
    width: 48,
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  selectedThumbImage: { width: '100%', height: '100%' },
  selectedThumbRemove: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(150, 70, 60, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  selectedCount: { ...typography.bodyLg, fontFamily: 'Inter_600SemiBold' },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  nextButtonText: { ...typography.bodyLg, fontFamily: 'Inter_600SemiBold', color: colors.onPrimary },
  sheetOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(34, 26, 24, 0.4)',
    justifyContent: 'flex-end',
  },
  sheetDismiss: { flex: 1 },
  methodSheet: {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sheetHandle: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.outlineVariant,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: { ...typography.h2, fontSize: 18, marginBottom: 16 },
  methodCards: { gap: 8 },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceContainerLow,
  },
  methodCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodCardTitle: { ...typography.bodyLg, fontFamily: 'Inter_600SemiBold' },
  methodCardDesc: { ...typography.caption, color: colors.onSurfaceVariant, marginTop: 2 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopColor: colors.outlineVariant,
    borderTopWidth: 1,
  },
  toggleLabel: { ...typography.bodyLg, fontFamily: 'Inter_600SemiBold' },
  toggleSub: { ...typography.caption, color: colors.onSurfaceVariant, marginTop: 2 },
  toggleSwitch: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.outlineVariant,
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchOn: { backgroundColor: colors.primary },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surfaceContainerLowest,
  },
  toggleThumbOn: { transform: [{ translateX: 18 }] },
});
