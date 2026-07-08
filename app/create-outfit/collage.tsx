import { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Image, Dimensions, Modal, FlatList, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { colors, typography, radii, spacing, shadow } from '@/constants/theme';
import { Icon, iconNames } from '@/components/ui/Icon';
import { useCollageStore, CollageLayer } from '@/store/useCollageStore';
import { useWardrobeStore, Garment, GarmentCategory } from '@/store/useWardrobeStore';
import { useOutfitDraftStore } from '@/store/useOutfitDraftStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CANVAS_W = SCREEN_WIDTH - 40;
const CANVAS_H = SCREEN_HEIGHT * 0.55;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const stickers = [
  '✨', '🌟', '💫', '⭐', '🔥', '💖', '💕', '🌸', '🌺', '🌷',
  '🌹', '🦋', '🌈', '☁️', '🌙', '☀️', '💄', '👗', '👠', '👜',
];

const bgColors = [
  '#fff8f7', '#fbeae8', '#f5e5e2', '#efdfdc',
  '#e8877a', '#fed65b', '#4eb397', '#96463c',
  '#221a18', '#ffffff',
];

export default function CollageEditorScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { items } = useWardrobeStore();
  const { selectedItemIds } = useOutfitDraftStore();
  const {
    layers,
    background,
    selectedLayerId,
    hasEdits,
    addLayer,
    updateLayer,
    removeLayer,
    selectLayer,
    bringToFront,
    setBackground,
    clear,
    initFromGarments,
  } = useCollageStore();

  const [showAddClothes, setShowAddClothes] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [showBackground, setShowBackground] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized && selectedItemIds.length > 0) {
      const selectedGarments = selectedItemIds
        .map((id) => items.find((i) => i.id === id))
        .filter(Boolean) as Garment[];
      if (selectedGarments.length > 0 && layers.length === 0) {
        initFromGarments(
          selectedGarments.map((g) => ({ id: g.id, imageUri: g.imageUri, category: g.category }))
        );
      }
      setInitialized(true);
    }
  }, [initialized, selectedItemIds, items, layers.length, initFromGarments]);

  const handleBack = () => {
    if (hasEdits) {
      setShowDiscardConfirm(true);
    } else {
      router.back();
    }
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/create-outfit/save-outfit');
  };

  const handleCanvasTap = () => {
    selectLayer(null);
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.iconButton}>
            <Icon name={iconNames.arrowBack} size={22} color={colors.onSurface} />
          </Pressable>
          <Text style={styles.title}>Collage</Text>
          <Pressable onPress={handleNext} style={styles.nextPill}>
            <Text style={styles.nextPillText}>Next</Text>
            <Icon name={iconNames.arrowForward} size={16} color={colors.onPrimary} />
          </Pressable>
        </View>

        <View style={styles.canvasContainer}>
          <Pressable style={styles.canvasTapArea} onPress={handleCanvasTap}>
            <View style={[styles.canvas, { backgroundColor: background }]}>
              {layers.length === 0 && (
                <View style={styles.canvasEmpty}>
                  <Icon name={iconNames.autoAwesome} size={32} color={colors.outlineVariant} />
                  <Text style={styles.canvasEmptyText}>Add clothes to start</Text>
                </View>
              )}
              {layers
                .sort((a, b) => a.zIndex - b.zIndex)
                .map((layer) => (
                  <CollageLayerView
                    key={layer.id}
                    layer={layer}
                    isSelected={selectedLayerId === layer.id}
                    onSelect={() => selectLayer(layer.id)}
                    onUpdate={(updates) => updateLayer(layer.id, updates)}
                    onDelete={() => removeLayer(layer.id)}
                    onBringToFront={() => bringToFront(layer.id)}
                  />
                ))}
            </View>
          </Pressable>
        </View>

        <View style={[styles.toolbar, { paddingBottom: insets.bottom + 8 }]}>
          <ToolbarTile
            label="Add clothes"
            icon={iconNames.checkroom}
            onPress={() => setShowAddClothes(true)}
          />
          <ToolbarTile
            label="Stickers"
            icon={iconNames.autoAwesome}
            onPress={() => setShowStickers(true)}
          />
          <ToolbarTile
            label="Background"
            icon={iconNames.palette}
            onPress={() => setShowBackground(true)}
          />
        </View>
      </SafeAreaView>

      {/* Add Clothes picker */}
      <Modal visible={showAddClothes} animationType="slide" transparent>
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerSheet}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Add clothes</Text>
              <Pressable onPress={() => setShowAddClothes(false)} style={styles.pickerClose}>
                <Icon name={iconNames.close} size={20} color={colors.onSurface} />
              </Pressable>
            </View>
            <FlatList
              data={items}
              numColumns={4}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    addLayer({
                      type: 'garment',
                      source: item.imageUri,
                      x: 0,
                      y: 0,
                      scale: 1,
                      rotation: 0,
                    });
                    setShowAddClothes(false);
                  }}
                  style={styles.pickerItem}
                >
                  <Image source={{ uri: item.imageUri }} style={styles.pickerItemImage} resizeMode="cover" />
                  <Text style={styles.pickerItemName} numberOfLines={1}>{item.name}</Text>
                </Pressable>
              )}
              contentContainerStyle={styles.pickerList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>

      {/* Stickers picker */}
      <Modal visible={showStickers} animationType="slide" transparent>
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerSheet}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Stickers</Text>
              <Pressable onPress={() => setShowStickers(false)} style={styles.pickerClose}>
                <Icon name={iconNames.close} size={20} color={colors.onSurface} />
              </Pressable>
            </View>
            <FlatList
              data={stickers}
              numColumns={5}
              keyExtractor={(item, i) => `${item}-${i}`}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    addLayer({
                      type: 'sticker',
                      source: item,
                      x: 0,
                      y: 0,
                      scale: 1,
                      rotation: 0,
                    });
                    setShowStickers(false);
                  }}
                  style={styles.stickerItem}
                >
                  <Text style={styles.stickerText}>{item}</Text>
                </Pressable>
              )}
              contentContainerStyle={styles.pickerList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>

      {/* Background picker */}
      <Modal visible={showBackground} animationType="slide" transparent>
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerSheet}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Background</Text>
              <Pressable onPress={() => setShowBackground(false)} style={styles.pickerClose}>
                <Icon name={iconNames.close} size={20} color={colors.onSurface} />
              </Pressable>
            </View>
            <View style={styles.bgSwatches}>
              {bgColors.map((bg) => (
                <Pressable
                  key={bg}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setBackground(bg);
                    setShowBackground(false);
                  }}
                  style={[styles.bgSwatch, { backgroundColor: bg }, background === bg && styles.bgSwatchActive]}
                />
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Discard confirmation */}
      <Modal visible={showDiscardConfirm} animationType="fade" transparent>
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Discard changes?</Text>
            <Text style={styles.confirmBody}>Your collage edits will be lost.</Text>
            <View style={styles.confirmActions}>
              <Pressable
                onPress={() => setShowDiscardConfirm(false)}
                style={styles.confirmCancel}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  clear();
                  setShowDiscardConfirm(false);
                  router.back();
                }}
                style={styles.confirmDiscard}
              >
                <Text style={styles.confirmDiscardText}>Discard</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </GestureHandlerRootView>
  );
}

function CollageLayerView({
  layer,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onBringToFront,
}: {
  layer: CollageLayer;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<CollageLayer>) => void;
  onDelete: () => void;
  onBringToFront: () => void;
}) {
  const translateX = useSharedValue(layer.x);
  const translateY = useSharedValue(layer.y);
  const scale = useSharedValue(layer.scale);
  const rotation = useSharedValue(layer.rotation);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const startScale = useSharedValue(1);
  const startRotation = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
      runOnJS(onSelect)();
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    })
    .onUpdate((e) => {
      translateX.value = startX.value + e.translationX;
      translateY.value = startY.value + e.translationY;
    })
    .onEnd(() => {
      runOnJS(onUpdate)({ x: translateX.value, y: translateY.value });
      runOnJS(onBringToFront)();
    });

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      startScale.value = scale.value;
    })
    .onUpdate((e) => {
      scale.value = Math.max(0.3, Math.min(3, startScale.value * e.scale));
    })
    .onEnd(() => {
      runOnJS(onUpdate)({ scale: scale.value });
    });

  const rotationGesture = Gesture.Rotation()
    .onStart(() => {
      startRotation.value = rotation.value;
    })
    .onUpdate((e) => {
      rotation.value = startRotation.value + e.rotation;
    })
    .onEnd(() => {
      runOnJS(onUpdate)({ rotation: rotation.value });
    });

  const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture, rotationGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}rad` },
    ],
  }));

  const isSticker = layer.type === 'sticker';

  return (
    <View style={styles.layerWrapper} pointerEvents="box-none">
      <GestureDetector gesture={composedGesture}>
        <Animated.View
          style={[
            styles.layer,
            isSelected && styles.layerSelected,
            animatedStyle,
          ]}
        >
          {isSticker ? (
            <Text style={styles.stickerLayerText}>{layer.source}</Text>
          ) : (
            <Image
              source={{ uri: layer.source }}
              style={styles.garmentLayerImage}
              resizeMode="contain"
            />
          )}
        </Animated.View>
      </GestureDetector>
      {isSelected && (
        <Pressable onPress={onDelete} style={styles.deleteButton}>
          <Icon name={iconNames.close} size={14} color={colors.onPrimary} />
        </Pressable>
      )}
    </View>
  );
}

function ToolbarTile({ label, icon, onPress }: { label: string; icon: any; onPress: () => void }) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => (scale.value = withTiming(0.95, { duration: 100 }))}
      onPressOut={() => (scale.value = withTiming(1, { duration: 150 }))}
      style={[styles.toolbarTile, animatedStyle]}
    >
      <View style={styles.toolbarIcon}>
        <Icon name={icon} size={22} color={colors.primary} />
      </View>
      <Text style={styles.toolbarLabel}>{label}</Text>
    </AnimatedPressable>
  );
}

import { runOnJS } from 'react-native-reanimated';

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
  canvasContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  canvasTapArea: { width: CANVAS_W, height: CANVAS_H, borderRadius: radii.xl, overflow: 'hidden' },
  canvas: {
    width: '100%',
    height: '100%',
    borderRadius: radii.xl,
    overflow: 'hidden',
    ...shadow.soft,
  },
  canvasEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  canvasEmptyText: { ...typography.bodySm, color: colors.outline },
  layerWrapper: {
    position: 'absolute',
    top: CANVAS_H / 2,
    left: CANVAS_W / 2,
  },
  layer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  layerSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 8,
  },
  garmentLayerImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  stickerLayerText: {
    fontSize: 64,
  },
  deleteButton: {
    position: 'absolute',
    top: -12,
    right: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    backgroundColor: colors.surfaceContainerLowest,
    borderTopColor: colors.outlineVariant,
    borderTopWidth: 1,
  },
  toolbarTile: { alignItems: 'center', gap: 6 },
  toolbarIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbarLabel: { ...typography.caption, fontFamily: 'Inter_500Medium' },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(34, 26, 24, 0.4)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: SCREEN_HEIGHT * 0.6,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  pickerTitle: { ...typography.h2, fontSize: 18 },
  pickerClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerList: { paddingBottom: 20 },
  pickerItem: { width: '23%', marginRight: '2%', marginBottom: 12, alignItems: 'center' },
  pickerItemImage: { width: '100%', aspectRatio: 0.8, borderRadius: radii.md, backgroundColor: colors.surfaceContainerLow },
  pickerItemName: { ...typography.caption, fontSize: 10, marginTop: 4, textAlign: 'center' },
  stickerItem: {
    width: '18%',
    marginRight: '2%',
    marginBottom: 12,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.md,
  },
  stickerText: { fontSize: 32 },
  bgSwatches: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingBottom: 20 },
  bgSwatch: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  bgSwatchActive: {
    borderColor: colors.primary,
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(34, 26, 24, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  confirmCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.xl,
    padding: 24,
    width: '100%',
    ...shadow.soft,
  },
  confirmTitle: { ...typography.h2, fontSize: 18, marginBottom: 8 },
  confirmBody: { ...typography.bodySm, color: colors.onSurfaceVariant, marginBottom: 20 },
  confirmActions: { flexDirection: 'row', gap: 12 },
  confirmCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
  },
  confirmCancelText: { ...typography.bodyLg, fontFamily: 'Inter_600SemiBold', color: colors.onSurfaceVariant },
  confirmDiscard: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radii.pill,
    backgroundColor: colors.error,
    alignItems: 'center',
  },
  confirmDiscardText: { ...typography.bodyLg, fontFamily: 'Inter_600SemiBold', color: colors.onError },
});
