/**
 * Dressing Room Preview Screen
 * Polish pass — multi-snap sheet, consistent garment sizing, all-slot swipe,
 * de-bounced springs, and proper slide-in swipe carousel.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  Easing as REasing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import Svg, { Path, Ellipse } from 'react-native-svg';

import { colors, radii, shadow, spacing, typography } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { useWardrobeStore, Garment } from '@/store/useWardrobeStore';
import { useOutfitDraftStore } from '@/store/useOutfitDraftStore';
import {
  useDressingRoomStore,
  DressingRoomSlot,
  slotToCategory,
} from '@/store/useDressingRoomStore';

// ─── Screen dimensions ────────────────────────────────────────────────────────
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── SVG mannequin constants (in viewBox 0 0 300 700 space) ──────────────────
const SVG_VB_W = 300;
const SVG_VB_H = 700;

// Named anchor constants — garment fitting math references these directly
const SHOULDER_Y = 160;
const SHOULDER_WIDTH = 160;
const WAIST_Y = 340;
const WAIST_WIDTH = 100;
const ANKLE_Y = 650;
const ANKLE_WIDTH = 50;

// ─── Calm spring config — no bounce ──────────────────────────────────────────
const CALM_SPRING = { damping: 20, stiffness: 200, mass: 0.5, overshootClamping: true } as const;
const TIMING_FAST = { duration: 220, easing: REasing.out(REasing.cubic) } as const;

// ─── Sub-category tab definitions ────────────────────────────────────────────
const SUB_TABS: Record<DressingRoomSlot, string[]> = {
  top: ['All', 'T-Shirts', 'Polos', 'Tops', 'Shirts', 'Blouses'],
  outerwear: ['All', 'Jackets', 'Coats', 'Blazers'],
  bottom: ['All', 'Jeans', 'Pants', 'Leggings', 'Sweatpants'],
  shoes: ['All', 'Sneakers', 'Boots', 'Sandals', 'Heels', 'Flats'],
  accessory: ['All', 'Bags', 'Hats', 'Jewelry', 'Belts', 'Scarves'],
};

const SUB_TAB_TO_SUBCATEGORY: Record<string, string | null> = {
  All: null,
  'T-Shirts': 't-shirt',
  Polos: 'polo',
  Tops: 'top',
  Shirts: 'shirt',
  Blouses: 'blouse',
  Jackets: 'jacket',
  Coats: 'coat',
  Blazers: 'blazer',
  Jeans: 'jeans',
  Pants: 'pants',
  Leggings: 'leggings',
  Sweatpants: 'sweatpants',
  Sneakers: 'sneakers',
  Boots: 'boots',
  Sandals: 'sandals',
  Heels: 'heels',
  Flats: 'flats',
  Bags: 'bag',
  Hats: 'hat',
  Jewelry: 'jewelry',
  Belts: 'belt',
  Scarves: 'scarf',
};

// ─── Garment fit computation — fixed bounding boxes ───────────────────────────
interface GarmentFit {
  width: number;
  height: number;
  left: number;
  top: number;
  centerX: number;
}

/**
 * Returns a FIXED bounding box per slot category, independent of each image's
 * own aspect ratio. Every garment image renders as `resizeMode="contain"` inside
 * this fixed box, so photo padding differences produce a harmless letterbox
 * rather than wildly different visible sizes.
 *
 * The caller multiplies by garment.fitScale (default 1) for per-item correction.
 */
function computeGarmentFit(
  slot: DressingRoomSlot,
  canvasW: number,
  canvasH: number,
  fitScale: number = 1
): GarmentFit {
  const scale = canvasH / SVG_VB_H;
  const centerX = canvasW / 2;

  let boxW: number;
  let boxH: number;
  let anchorTopY: number;
  let anchorCenterY: number | null = null;

  switch (slot) {
    case 'top':
      boxW = SHOULDER_WIDTH * 1.35 * scale;
      boxH = canvasH * 0.30;
      anchorTopY = SHOULDER_Y * scale;
      break;
    case 'outerwear':
      boxW = SHOULDER_WIDTH * 1.55 * scale;
      boxH = canvasH * 0.35;
      anchorTopY = (SHOULDER_Y - 10) * scale;
      break;
    case 'bottom':
      boxW = WAIST_WIDTH * 2.0 * scale;
      boxH = canvasH * 0.38;
      anchorTopY = WAIST_Y * scale;
      break;
    case 'shoes':
      boxW = ANKLE_WIDTH * 3.0 * scale;
      boxH = canvasH * 0.12;
      anchorCenterY = ANKLE_Y * scale;
      anchorTopY = 0;
      break;
    case 'accessory':
      boxW = SHOULDER_WIDTH * 0.45 * scale;
      boxH = canvasH * 0.10;
      anchorTopY = (SHOULDER_Y - 60) * scale;
      break;
    default:
      boxW = SHOULDER_WIDTH * scale;
      boxH = canvasH * 0.30;
      anchorTopY = SHOULDER_Y * scale;
  }

  // Apply per-garment manual scale correction
  const w = boxW * fitScale;
  const h = boxH * fitScale;
  const left = centerX - w / 2;

  let top: number;
  if (anchorCenterY !== null) {
    top = anchorCenterY - h / 2;
  } else {
    top = anchorTopY;
  }

  return { width: w, height: h, left, top, centerX };
}

// ─── SVG Mannequin ────────────────────────────────────────────────────────────
function MannequinSilhouette() {
  const bodyFill = colors.surfaceContainerHigh;
  const hairFill = colors.surfaceContainerHighest;

  return (
    <Svg
      viewBox={`0 0 ${SVG_VB_W} ${SVG_VB_H}`}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* ── Hair / head cap ──────────────────────────────── */}
      <Path
        d={`
          M 115 75
          C 108 40, 125 18, 150 18
          C 175 18, 192 40, 185 75
          C 182 90, 175 100, 165 108
          C 160 112, 155 115, 150 115
          C 145 115, 140 112, 135 108
          C 125 100, 118 90, 115 75
          Z
        `}
        fill={hairFill}
      />

      {/* ── Face / head (body tone) ───────────────────────── */}
      <Ellipse cx="150" cy="110" rx="30" ry="32" fill={bodyFill} />

      {/* ── Neck ─────────────────────────────────────────── */}
      <Path
        d="M 138 135 L 138 158 Q 150 162 162 158 L 162 135 Q 150 130 138 135 Z"
        fill={bodyFill}
      />

      {/* ── Torso (shoulder → waist → hip) ───────────────── */}
      <Path
        d={`
          M 70 160
          C 68 160, 66 162, 66 165
          L 70 200
          C 72 240, 80 290, 90 320
          L 98 340
          Q 120 360, 150 362
          Q 180 360, 202 340
          L 210 320
          C 220 290, 228 240, 230 200
          L 234 165
          C 234 162, 232 160, 230 160
          L 70 160
          Z
        `}
        fill={bodyFill}
      />

      {/* ── Hip / upper leg region ────────────────────────── */}
      <Path
        d={`
          M 98 340
          Q 80 360, 75 390
          L 70 430
          L 120 435
          L 125 390
          Q 135 370, 150 368
          Q 165 370, 175 390
          L 180 435
          L 230 430
          L 225 390
          Q 220 360, 202 340
          Q 180 360, 150 362
          Q 120 360, 98 340
          Z
        `}
        fill={bodyFill}
      />

      {/* ── Left leg ─────────────────────────────────────── */}
      <Path
        d={`
          M 70 430
          L 68 510
          L 70 580
          Q 72 620, 75 645
          L 115 648
          Q 120 620, 122 580
          L 124 510
          L 120 435
          Z
        `}
        fill={bodyFill}
      />

      {/* ── Right leg ────────────────────────────────────── */}
      <Path
        d={`
          M 230 430
          L 176 435
          L 178 510
          L 180 580
          Q 182 620, 185 645
          L 225 648
          Q 228 620, 230 580
          L 232 510
          L 232 430
          Z
        `}
        fill={bodyFill}
      />

      {/* ── Left foot ────────────────────────────────────── */}
      <Path
        d="M 68 645 Q 60 648, 58 655 Q 55 665, 65 668 L 118 668 Q 122 665, 120 658 L 115 648 Z"
        fill={bodyFill}
      />

      {/* ── Right foot ───────────────────────────────────── */}
      <Path
        d="M 232 645 L 225 648 L 182 658 Q 180 665, 184 668 L 238 668 Q 246 665, 244 655 Q 242 648, 234 645 Z"
        fill={bodyFill}
      />

      {/* ── Left arm ─────────────────────────────────────── */}
      <Path
        d={`
          M 70 160
          C 60 162, 50 170, 46 185
          L 40 240
          L 38 300
          Q 38 340, 42 380
          L 44 420
          Q 48 428, 54 428
          Q 60 428, 62 420
          L 62 380
          Q 60 340, 60 300
          L 62 240
          L 66 190
          L 70 172
          Z
        `}
        fill={bodyFill}
      />

      {/* ── Right arm ────────────────────────────────────── */}
      <Path
        d={`
          M 230 160
          L 234 172
          L 238 190
          L 242 240
          L 240 300
          L 238 380
          L 238 420
          Q 240 428, 246 428
          Q 252 428, 256 420
          L 258 380
          Q 262 340, 262 300
          L 262 240
          L 256 185
          C 252 170, 242 162, 230 160
          Z
        `}
        fill={bodyFill}
      />

      {/* ── Left hand ────────────────────────────────────── */}
      <Ellipse cx="53" cy="434" rx="8" ry="10" fill={bodyFill} />

      {/* ── Right hand ───────────────────────────────────── */}
      <Ellipse cx="247" cy="434" rx="8" ry="10" fill={bodyFill} />
    </Svg>
  );
}

// ─── Garment Layer (pan-to-move only, no swipe) ───────────────────────────────
interface GarmentLayerProps {
  garment: Garment;
  slot: DressingRoomSlot;
  fit: GarmentFit;
  isActive: boolean;
  isMoveMode: boolean;
  onPress: () => void;
  onOffsetChange: (offsetX: number, offsetY: number) => void;
  storedOffsetX: number;
  storedOffsetY: number;
  scaleAdjust: number;
  zIndex: number;
}

function GarmentLayer({
  garment,
  slot,
  fit,
  isActive,
  isMoveMode,
  onPress,
  onOffsetChange,
  storedOffsetX,
  storedOffsetY,
  scaleAdjust,
  zIndex,
}: GarmentLayerProps) {
  const offsetX = useSharedValue(storedOffsetX);
  const offsetY = useSharedValue(storedOffsetY);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  useEffect(() => {
    offsetX.value = storedOffsetX;
    offsetY.value = storedOffsetY;
  }, [storedOffsetX, storedOffsetY, garment.id]);

  const panGesture = Gesture.Pan()
    .enabled(isActive && isMoveMode)
    .onBegin(() => {
      startX.value = offsetX.value;
      startY.value = offsetY.value;
    })
    .onUpdate((e) => {
      offsetX.value = startX.value + e.translationX;
      offsetY.value = startY.value + e.translationY;
    })
    .onEnd(() => {
      runOnJS(onOffsetChange)(offsetX.value, offsetY.value);
    });

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: offsetX.value },
      { translateY: offsetY.value },
      { scale: scaleAdjust },
    ],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          styles.garmentLayer,
          {
            width: fit.width,
            height: fit.height,
            left: fit.left,
            top: fit.top,
            zIndex,
          },
          isActive && styles.garmentLayerActive,
          animStyle,
        ]}
      >
        <Pressable onPress={onPress} style={StyleSheet.absoluteFill}>
          <Image
            source={{ uri: garment.imageUri }}
            style={styles.garmentImage}
            resizeMode="contain"
          />
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}

// ─── Swipe Carousel — proper dual-layer slide-in ──────────────────────────────
interface SwipeCarouselProps {
  garment: Garment;
  slot: DressingRoomSlot;
  fit: GarmentFit;
  items: Garment[];
  canvasWidth: number;
  onSwipe: (newId: string) => void;
}

function SwipeCarousel({ garment, slot, fit, items, canvasWidth, onSwipe }: SwipeCarouselProps) {
  const currentIndex = items.findIndex((i) => i.id === garment.id);

  // Shared values for the two layers
  const currentTX = useSharedValue(0);
  const nextTX = useSharedValue(canvasWidth); // starts off-screen right

  // Which garment is staged as the "incoming" one
  const [nextGarment, setNextGarment] = useState<Garment | null>(null);
  const [swipeDir, setSwipeDir] = useState<'left' | 'right'>('left');
  const isAnimatingRef = useRef(false);

  // Reset carousel when the source garment changes (after a committed swipe)
  useEffect(() => {
    currentTX.value = 0;
    nextTX.value = canvasWidth;
    setNextGarment(null);
    isAnimatingRef.current = false;
  }, [garment.id]);

  const commitSwipe = useCallback(
    (dir: 'left' | 'right') => {
      if (items.length <= 1) return;
      const len = items.length;
      const nextIndex =
        dir === 'left'
          ? (currentIndex + 1) % len
          : (currentIndex - 1 + len) % len;
      onSwipe(items[nextIndex].id);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      isAnimatingRef.current = false;
    },
    [currentIndex, items, onSwipe]
  );

  const stageNext = useCallback(
    (dir: 'left' | 'right') => {
      if (items.length <= 1) return;
      const len = items.length;
      const nextIndex =
        dir === 'left'
          ? (currentIndex + 1) % len
          : (currentIndex - 1 + len) % len;
      setNextGarment(items[nextIndex]);
      setSwipeDir(dir);
    },
    [currentIndex, items]
  );

  const swipeGesture = Gesture.Pan()
    // Require clear horizontal intent before activating
    .activeOffsetX([-15, 15])
    .failOffsetY([-8, 8])
    .onBegin(() => {
      // don't allow re-entry during completion animation
    })
    .onUpdate((e) => {
      if (isAnimatingRef.current) return;
      const tx = e.translationX;
      currentTX.value = tx;

      // Stage the incoming item on the correct side
      const dir = tx < 0 ? 'left' : 'right';
      const offscreen = dir === 'left' ? canvasWidth : -canvasWidth;
      nextTX.value = offscreen + tx;

      // Stage next garment if not already done for this direction
      runOnJS(stageNext)(dir);
    })
    .onEnd((e) => {
      if (isAnimatingRef.current) return;

      const DIST_THRESHOLD = 60;
      const VEL_THRESHOLD = 400;
      const shouldCommit =
        Math.abs(e.translationX) > DIST_THRESHOLD || Math.abs(e.velocityX) > VEL_THRESHOLD;

      if (shouldCommit && items.length > 1) {
        isAnimatingRef.current = true;
        const dir = e.translationX < 0 ? 'left' : 'right';
        const exitTo = dir === 'left' ? -canvasWidth : canvasWidth;

        // Slide current item fully off-screen
        currentTX.value = withTiming(exitTo, TIMING_FAST, () => {
          runOnJS(commitSwipe)(dir);
        });
        // Slide incoming item to centre
        nextTX.value = withTiming(0, TIMING_FAST);
      } else {
        // Cancelled — return both to rest positions
        currentTX.value = withSpring(0, CALM_SPRING);
        nextTX.value = withTiming(canvasWidth, TIMING_FAST);
        runOnJS(setNextGarment)(null);
      }
    });

  const currentStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: currentTX.value }],
  }));

  const nextStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: nextTX.value }],
  }));

  const layerBase = {
    width: fit.width,
    height: fit.height,
    left: fit.left,
    top: fit.top,
  } as const;

  return (
    <>
      {/* Incoming item — rendered below current so it slides in behind */}
      {nextGarment && (
        <Animated.View
          style={[styles.garmentLayer, layerBase, { zIndex: 18 }, nextStyle]}
          pointerEvents="none"
        >
          <Image
            source={{ uri: nextGarment.imageUri }}
            style={styles.garmentImage}
            resizeMode="contain"
          />
        </Animated.View>
      )}

      {/* Current item — rendered on top, dragged by gesture */}
      <GestureDetector gesture={swipeGesture}>
        <Animated.View
          style={[styles.garmentLayer, layerBase, styles.garmentLayerActive, { zIndex: 20 }, currentStyle]}
        >
          <Image
            source={{ uri: garment.imageUri }}
            style={styles.garmentImage}
            resizeMode="contain"
          />
        </Animated.View>
      </GestureDetector>
    </>
  );
}

// ─── Right Rail ───────────────────────────────────────────────────────────────
interface RightRailProps {
  isSlotActive: boolean;
  isMoveMode: boolean;
  isLocked: boolean;
  onDone: () => void;
  onMove: () => void;
  onLock: () => void;
  onShuffle: () => void;
  onDelete: () => void;
  onPerson: () => void;
  onWardrobe: () => void;
  onShuffleAll: () => void;
}

function RightRail({
  isSlotActive,
  isMoveMode,
  isLocked,
  onDone,
  onMove,
  onLock,
  onShuffle,
  onDelete,
  onPerson,
  onWardrobe,
  onShuffleAll,
}: RightRailProps) {
  if (isSlotActive) {
    return (
      <View style={styles.rail} pointerEvents="box-none">
        {/* Check / Done */}
        <Pressable onPress={onDone} style={[styles.railBtn, styles.railBtnDark]} hitSlop={6}>
          <Icon name="check" size={22} color={colors.onPrimary} />
        </Pressable>

        {/* Move */}
        <Pressable
          onPress={onMove}
          style={[styles.railBtn, styles.railBtnLight, isMoveMode && styles.railBtnLightActive]}
          hitSlop={6}
        >
          <Icon name="open-with" size={22} color={isMoveMode ? colors.primary : colors.onSurface} />
        </Pressable>

        {/* Lock */}
        <Pressable onPress={onLock} style={[styles.railBtn, styles.railBtnLight]} hitSlop={6}>
          <Icon name={isLocked ? 'lock' : 'lock-open'} size={22} color={colors.onSurface} />
        </Pressable>

        {/* Shuffle slot */}
        <Pressable onPress={onShuffle} style={[styles.railBtn, styles.railBtnLight]} hitSlop={6}>
          <Icon name="shuffle" size={22} color={colors.onSurface} />
        </Pressable>

        {/* Delete */}
        <Pressable onPress={onDelete} style={[styles.railBtn, styles.railBtnLight]} hitSlop={6}>
          <Icon name="delete-outline" size={22} color={colors.onSurface} />
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.rail} pointerEvents="box-none">
      <Pressable onPress={onPerson} style={[styles.railBtn, styles.railBtnLight]} hitSlop={6}>
        <Icon name="person" size={22} color={colors.onSurface} />
      </Pressable>
      <Pressable onPress={onWardrobe} style={[styles.railBtn, styles.railBtnLight]} hitSlop={6}>
        <Icon name="checkroom" size={22} color={colors.onSurface} />
      </Pressable>
      <Pressable onPress={onShuffleAll} style={[styles.railBtn, styles.railBtnLight]} hitSlop={6}>
        <Icon name="shuffle" size={22} color={colors.onSurface} />
      </Pressable>
    </View>
  );
}

// ─── Bottom Bar ───────────────────────────────────────────────────────────────
interface BottomBarProps {
  onSwitchTo: () => void;
  onNext: () => void;
  insetBottom: number;
}

function BottomBar({ onSwitchTo, onNext, insetBottom }: BottomBarProps) {
  return (
    <View style={[styles.bottomBar, { paddingBottom: insetBottom + 12 }]}>
      <Pressable onPress={onSwitchTo} style={styles.switchToPill}>
        <Text style={styles.switchToPillText}>Switch to…</Text>
        <Icon name="expand-more" size={18} color={colors.onSurfaceVariant} />
      </Pressable>

      <Pressable onPress={onNext} style={styles.nextPill}>
        <Text style={styles.nextPillText}>Next</Text>
        <Icon name="arrow-forward" size={18} color={colors.onPrimary} />
      </Pressable>
    </View>
  );
}

// ─── Wardrobe Grid Item ───────────────────────────────────────────────────────
interface GridItemProps {
  item: Garment;
  onPress: () => void;
}

function GridItem({ item, onPress }: GridItemProps) {
  return (
    <Pressable onPress={onPress} style={styles.gridItem}>
      <Image source={{ uri: item.imageUri }} style={styles.gridItemImage} resizeMode="cover" />
    </Pressable>
  );
}

// ─── Wardrobe Bottom Sheet — multi-snap (peek ↔ expanded) ────────────────────
const SHEET_FULL_HEIGHT = SCREEN_H * 0.42;
const PEEK_SHOW_HEIGHT = SCREEN_H * 0.13; // how much of the sheet is visible in peek
const PEEK_Y = SHEET_FULL_HEIGHT - PEEK_SHOW_HEIGHT; // translateY for peek state
const EXPANDED_Y = 0;                                  // translateY for full open
const CLOSED_Y = SHEET_FULL_HEIGHT + 20;               // translateY for fully hidden

interface WardrobeSheetProps {
  visible: boolean;
  activeSlot: DressingRoomSlot | null;
  currentGarmentId: string | null;
  wardrobeItems: Garment[];
  onSelectGarment: (id: string) => void;
}

function WardrobeSheet({
  visible,
  activeSlot,
  currentGarmentId,
  wardrobeItems,
  onSelectGarment,
}: WardrobeSheetProps) {
  const translateY = useSharedValue(CLOSED_Y);
  const dragStartY = useSharedValue(0);
  const [selectedTab, setSelectedTab] = useState('All');
  // Track snap state on JS side for gesture logic
  const snapState = useRef<'closed' | 'peek' | 'expanded'>('closed');

  const tabs = activeSlot ? SUB_TABS[activeSlot] : ['All'];

  useEffect(() => {
    setSelectedTab('All');
  }, [activeSlot]);

  useEffect(() => {
    if (visible) {
      // Open to PEEK position — smooth timing, no bounce
      translateY.value = withTiming(PEEK_Y, TIMING_FAST);
      snapState.current = 'peek';
    } else {
      // Close — timing slide-down
      translateY.value = withTiming(CLOSED_Y, { duration: 240, easing: REasing.in(REasing.cubic) });
      snapState.current = 'closed';
    }
  }, [visible]);

  // Pan gesture on the drag handle / sheet header to drag between snap points
  const panGesture = Gesture.Pan()
    .onBegin(() => {
      dragStartY.value = translateY.value;
    })
    .onUpdate((e) => {
      // Clamp: cannot drag above expanded (0) or below closed + some slack
      const raw = dragStartY.value + e.translationY;
      translateY.value = Math.max(EXPANDED_Y, Math.min(CLOSED_Y, raw));
    })
    .onEnd((e) => {
      const current = translateY.value;
      const vel = e.velocityY;

      // Decide target snap point based on position + velocity
      if (vel < -400 || current < PEEK_Y * 0.5) {
        // Fast upward drag or dragged past midpoint → expand
        translateY.value = withSpring(EXPANDED_Y, CALM_SPRING);
        runOnJS(() => { snapState.current = 'expanded'; })();
      } else if (vel > 500 || current > PEEK_Y + (CLOSED_Y - PEEK_Y) * 0.4) {
        // Fast downward drag or dragged well below peek → close
        translateY.value = withTiming(CLOSED_Y, { duration: 240, easing: REasing.in(REasing.cubic) });
        runOnJS(() => { snapState.current = 'closed'; })();
      } else {
        // Default: snap back to peek
        translateY.value = withSpring(PEEK_Y, CALM_SPRING);
        runOnJS(() => { snapState.current = 'peek'; })();
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!activeSlot) return null;

  const category = slotToCategory(activeSlot);
  const subCatFilter = SUB_TAB_TO_SUBCATEGORY[selectedTab] ?? null;

  const filteredItems = wardrobeItems.filter((g) => {
    if (g.category !== category) return false;
    if (subCatFilter !== null) return g.subCategory === subCatFilter;
    return true;
  });

  return (
    <Animated.View
      style={[styles.wardrobeSheet, sheetStyle]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      {/* Drag handle — wrapped in gesture detector */}
      <GestureDetector gesture={panGesture}>
        <View style={styles.sheetDragArea}>
          <View style={styles.sheetHandle} />

          {/* Main wardrobe row — always visible in peek */}
          <View style={styles.wardrobeHeaderRow}>
            <Icon name="checkroom" size={18} color={colors.onSurfaceVariant} />
            <Text style={styles.wardrobeHeaderText}>Main wardrobe</Text>
            <Icon name="unfold-more" size={18} color={colors.onSurfaceVariant} />
          </View>
        </View>
      </GestureDetector>

      {/* Sub-category tabs */}
      <View style={styles.tabsRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {tabs.map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setSelectedTab(tab)}
              style={[styles.tabPill, selectedTab === tab && styles.tabPillActive]}
            >
              <Text style={[styles.tabPillText, selectedTab === tab && styles.tabPillTextActive]}>
                {tab}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        <Pressable style={styles.filterIconBtn}>
          <Icon name="filter-list" size={20} color={colors.onSurfaceVariant} />
        </Pressable>
      </View>

      {/* Grid */}
      {filteredItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No items in this category yet</Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={({ item }) => (
            <GridItem
              item={item}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onSelectGarment(item.id);
              }}
            />
          )}
          keyExtractor={(item) => item.id}
          numColumns={3}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Animated.View>
  );
}

// ─── Body Type Sheet ──────────────────────────────────────────────────────────
interface BodyTypeSheetProps {
  visible: boolean;
  onClose: () => void;
}

function BodyTypeSheet({ visible, onClose }: BodyTypeSheetProps) {
  const translateY = useSharedValue(400);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, TIMING_FAST);
    } else {
      translateY.value = withTiming(400, { duration: 240, easing: REasing.in(REasing.cubic) });
    }
  }, [visible]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  const types = [
    { id: 'standard', label: 'Standard' },
    { id: 'athletic', label: 'Athletic' },
    { id: 'plus', label: 'Plus' },
  ];

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      <Pressable style={styles.sheetOverlay} onPress={onClose} />
      <Animated.View style={[styles.bodyTypeSheet, sheetStyle]}>
        <View style={styles.sheetHandle} />
        <Text style={styles.bodyTypeTitle}>Body Type</Text>
        {types.map((t) => (
          <Pressable key={t.id} onPress={onClose} style={styles.bodyTypeOption}>
            <Icon name="person" size={20} color={colors.primary} />
            <Text style={styles.bodyTypeOptionText}>{t.label}</Text>
          </Pressable>
        ))}
      </Animated.View>
    </View>
  );
}

// ─── Switch-to Sheet ──────────────────────────────────────────────────────────
interface SwitchToSheetProps {
  visible: boolean;
  onClose: () => void;
  onCollage: () => void;
  onAiTryon: () => void;
}

function SwitchToSheet({ visible, onClose, onCollage, onAiTryon }: SwitchToSheetProps) {
  const translateY = useSharedValue(400);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, TIMING_FAST);
    } else {
      translateY.value = withTiming(400, { duration: 240, easing: REasing.in(REasing.cubic) });
    }
  }, [visible]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      <Pressable style={styles.sheetOverlay} onPress={onClose} />
      <Animated.View style={[styles.bodyTypeSheet, sheetStyle]}>
        <View style={styles.sheetHandle} />
        <Text style={styles.bodyTypeTitle}>Switch to…</Text>
        <Pressable onPress={onCollage} style={styles.bodyTypeOption}>
          <Icon name="auto-awesome" size={20} color={colors.primary} />
          <Text style={styles.bodyTypeOptionText}>Collage</Text>
        </Pressable>
        <Pressable onPress={onAiTryon} style={styles.bodyTypeOption}>
          <Icon name="accessibility-new" size={20} color={colors.primary} />
          <Text style={styles.bodyTypeOptionText}>AI Try On</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
const SLOT_Z_INDEX: Record<DressingRoomSlot, number> = {
  accessory: 50,
  outerwear: 40,
  top: 30,
  bottom: 20,
  shoes: 10,
};

export default function DressingRoomPreviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { items: wardrobeItems } = useWardrobeStore();
  const { selectedItemIds } = useOutfitDraftStore();
  const {
    slots,
    activeSlot,
    initFromSelection,
    setActiveSlot,
    setSlotGarment,
    toggleLock,
    removeSlotGarment,
    setSlotOffset,
    shuffleSlot,
    shuffleAll,
    reset,
  } = useDressingRoomStore();

  const [isMoveMode, setIsMoveMode] = useState(false);
  const [showBodyTypeSheet, setShowBodyTypeSheet] = useState(false);
  const [showSwitchToSheet, setShowSwitchToSheet] = useState(false);
  const [canvasLayout, setCanvasLayout] = useState({ width: SCREEN_W, height: SCREEN_H * 0.65 });

  useEffect(() => {
    reset();
    initFromSelection(selectedItemIds, wardrobeItems);
  }, []);

  useEffect(() => {
    setIsMoveMode(false);
  }, [activeSlot]);

  const handleSlotTap = useCallback(
    (slot: DressingRoomSlot) => {
      if (activeSlot === slot) return;
      setActiveSlot(slot);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    [activeSlot, setActiveSlot]
  );

  const handleDone = useCallback(() => {
    setActiveSlot(null);
    setIsMoveMode(false);
  }, [setActiveSlot]);

  const handleMove = useCallback(() => {
    setIsMoveMode((prev) => !prev);
  }, []);

  const handleLock = useCallback(() => {
    if (!activeSlot) return;
    toggleLock(activeSlot);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [activeSlot, toggleLock]);

  const handleShuffleSlot = useCallback(() => {
    if (!activeSlot) return;
    shuffleSlot(activeSlot, wardrobeItems);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [activeSlot, shuffleSlot, wardrobeItems]);

  const handleDelete = useCallback(() => {
    if (!activeSlot) return;
    removeSlotGarment(activeSlot);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [activeSlot, removeSlotGarment]);

  const handleShuffleAll = useCallback(() => {
    shuffleAll(wardrobeItems);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [shuffleAll, wardrobeItems]);

  const handleSelectGarment = useCallback(
    (garmentId: string) => {
      if (!activeSlot) return;
      setSlotGarment(activeSlot, garmentId);
    },
    [activeSlot, setSlotGarment]
  );

  const handleSwipe = useCallback(
    (newId: string) => {
      if (!activeSlot) return;
      setSlotGarment(activeSlot, newId);
    },
    [activeSlot, setSlotGarment]
  );

  const handleNext = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/create-outfit/save-outfit');
  }, [router]);

  const handleSwitchToCollage = useCallback(() => {
    setShowSwitchToSheet(false);
    router.replace('/create-outfit/collage');
  }, [router]);

  const handleSwitchToAiTryon = useCallback(() => {
    setShowSwitchToSheet(false);
    router.replace('/create-outfit/ai-tryon');
  }, [router]);

  // Items for the active slot's swipe carousel — filtered to matching category
  const activeSlotItems: Garment[] = activeSlot
    ? wardrobeItems.filter((g) => g.category === slotToCategory(activeSlot))
    : [];

  const isSheetVisible = activeSlot !== null;

  const slotEntries: { slot: DressingRoomSlot; garmentId: string | null }[] = [
    { slot: 'outerwear', garmentId: slots.outerwear.garmentId },
    { slot: 'top', garmentId: slots.top.garmentId },
    { slot: 'bottom', garmentId: slots.bottom.garmentId },
    { slot: 'shoes', garmentId: slots.shoes.garmentId },
    { slot: 'accessory', garmentId: slots.accessory.garmentId },
  ];

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* ── Header ─────────────────────────────────────────── */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <Icon name="arrow-back" size={22} color={colors.onSurface} />
          </Pressable>
          <Text style={styles.headerTitle}>Dressing Room</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* ── Canvas ─────────────────────────────────────────── */}
        <View
          style={styles.canvas}
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            setCanvasLayout({ width, height });
          }}
        >
          {/* Mannequin SVG */}
          <View style={styles.mannequinContainer}>
            <MannequinSilhouette />
          </View>

          {/* Garment layers — active slot uses SwipeCarousel, others use GarmentLayer */}
          {slotEntries.map(({ slot, garmentId }) => {
            if (!garmentId) return null;
            const garment = wardrobeItems.find((g) => g.id === garmentId);
            if (!garment) return null;

            // Use per-garment fitScale (default 1) for manual size correction
            const fitScale = garment.fitScale ?? 1;
            const fit = computeGarmentFit(slot, canvasLayout.width, canvasLayout.height, fitScale);
            const slotData = slots[slot];
            const isActive = activeSlot === slot;

            if (isActive) {
              return (
                <SwipeCarousel
                  key={slot}
                  garment={garment}
                  slot={slot}
                  fit={fit}
                  items={activeSlotItems}
                  canvasWidth={canvasLayout.width}
                  onSwipe={handleSwipe}
                />
              );
            }

            return (
              <GarmentLayer
                key={slot}
                garment={garment}
                slot={slot}
                fit={fit}
                isActive={false}
                isMoveMode={false}
                onPress={() => handleSlotTap(slot)}
                onOffsetChange={(ox, oy) => setSlotOffset(slot, ox, oy, slotData.scaleAdjust)}
                storedOffsetX={slotData.offsetX}
                storedOffsetY={slotData.offsetY}
                scaleAdjust={slotData.scaleAdjust}
                zIndex={SLOT_Z_INDEX[slot]}
              />
            );
          })}

          {/* Active garment Move layer — on top, gesture-driven */}
          {activeSlot && slots[activeSlot].garmentId && isMoveMode && (() => {
            const slot = activeSlot;
            const garmentId = slots[slot].garmentId!;
            const garment = wardrobeItems.find((g) => g.id === garmentId);
            if (!garment) return null;
            const fitScale = garment.fitScale ?? 1;
            const fit = computeGarmentFit(slot, canvasLayout.width, canvasLayout.height, fitScale);
            const slotData = slots[slot];
            return (
              <GarmentLayer
                key={`${slot}-move`}
                garment={garment}
                slot={slot}
                fit={fit}
                isActive
                isMoveMode
                onPress={() => {}}
                onOffsetChange={(ox, oy) => setSlotOffset(slot, ox, oy, slotData.scaleAdjust)}
                storedOffsetX={slotData.offsetX}
                storedOffsetY={slotData.offsetY}
                scaleAdjust={slotData.scaleAdjust}
                zIndex={100}
              />
            );
          })()}

          {/* Right rail */}
          <RightRail
            isSlotActive={activeSlot !== null}
            isMoveMode={isMoveMode}
            isLocked={activeSlot ? slots[activeSlot].locked : false}
            onDone={handleDone}
            onMove={handleMove}
            onLock={handleLock}
            onShuffle={handleShuffleSlot}
            onDelete={handleDelete}
            onPerson={() => setShowBodyTypeSheet(true)}
            onWardrobe={() => {
              if (!activeSlot) {
                const firstFilled = slotEntries.find((e) => e.garmentId !== null);
                setActiveSlot(firstFilled?.slot ?? 'top');
              }
            }}
            onShuffleAll={handleShuffleAll}
          />
        </View>

        {/* ── Bottom Bar ─────────────────────────────────────── */}
        <BottomBar
          onSwitchTo={() => setShowSwitchToSheet(true)}
          onNext={handleNext}
          insetBottom={insets.bottom}
        />

        {/* ── Wardrobe Sheet ──────────────────────────────────── */}
        <WardrobeSheet
          visible={isSheetVisible}
          activeSlot={activeSlot}
          currentGarmentId={activeSlot ? slots[activeSlot].garmentId : null}
          wardrobeItems={wardrobeItems}
          onSelectGarment={handleSelectGarment}
        />

        {/* ── Body Type Sheet ─────────────────────────────────── */}
        <BodyTypeSheet
          visible={showBodyTypeSheet}
          onClose={() => setShowBodyTypeSheet(false)}
        />

        {/* ── Switch-to Sheet ─────────────────────────────────── */}
        <SwitchToSheet
          visible={showSwitchToSheet}
          onClose={() => setShowSwitchToSheet(false)}
          onCollage={handleSwitchToCollage}
          onAiTryon={handleSwitchToAiTryon}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const RAIL_BTN_SIZE = 46;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenMargin,
    paddingTop: 8,
    paddingBottom: 8,
  },
  headerTitle: {
    ...typography.h2,
    fontSize: 17,
    color: colors.onSurface,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Canvas
  canvas: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
    position: 'relative',
    overflow: 'hidden',
  },
  mannequinContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: '6%',
    paddingHorizontal: '8%',
  },

  // Garment layers
  garmentLayer: {
    position: 'absolute',
  },
  garmentLayerActive: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: radii.md,
  },
  garmentImage: {
    width: '100%',
    height: '100%',
  },

  // Right rail
  rail: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    zIndex: 200,
    pointerEvents: 'box-none',
  },
  railBtn: {
    width: RAIL_BTN_SIZE,
    height: RAIL_BTN_SIZE,
    borderRadius: RAIL_BTN_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
  railBtnDark: {
    backgroundColor: colors.onSurface,
  },
  railBtnLight: {
    backgroundColor: colors.surfaceContainerLowest,
  },
  railBtnLightActive: {
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },

  // Bottom bar
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: spacing.screenMargin,
    paddingTop: 12,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.outlineVariant,
  },
  switchToPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceContainerLow,
    ...shadow.soft,
  },
  switchToPillText: {
    ...typography.bodySm,
    fontFamily: 'Inter_600SemiBold',
    color: colors.onSurfaceVariant,
  },
  nextPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: radii.pill,
    backgroundColor: colors.onSurface,
  },
  nextPillText: {
    ...typography.bodySm,
    fontFamily: 'Inter_600SemiBold',
    color: colors.surface,
  },

  // Wardrobe sheet
  wardrobeSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_FULL_HEIGHT,
    backgroundColor: colors.surfaceContainerLowest,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    zIndex: 300,
    ...shadow.tab,
  },
  sheetDragArea: {
    // Tappable/draggable area: handle + header row
    paddingBottom: 4,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.outlineVariant,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  wardrobeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: spacing.screenMargin,
    marginVertical: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceContainerLow,
  },
  wardrobeHeaderText: {
    ...typography.bodySm,
    fontFamily: 'Inter_600SemiBold',
    color: colors.onSurface,
    flex: 1,
  },

  // Tab strip
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
  },
  tabsContent: {
    paddingLeft: spacing.screenMargin,
    paddingRight: 4,
    gap: 8,
    alignItems: 'center',
  },
  tabPill: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
  },
  tabPillActive: {
    backgroundColor: colors.onSurface,
  },
  tabPillText: {
    ...typography.caption,
    fontFamily: 'Inter_500Medium',
    color: colors.onSurfaceVariant,
  },
  tabPillTextActive: {
    color: colors.surface,
    fontFamily: 'Inter_600SemiBold',
  },
  filterIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerLow,
    marginRight: 8,
  },

  // Grid
  gridContent: {
    paddingHorizontal: spacing.screenMargin,
    paddingTop: 12,
    paddingBottom: 16,
  },
  gridRow: {
    gap: 8,
    marginBottom: 8,
  },
  gridItem: {
    flex: 1,
    aspectRatio: 0.85,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainerLow,
  },
  gridItemImage: {
    width: '100%',
    height: '100%',
  },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 32,
  },
  emptyStateText: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },

  // Body type / switch-to sheet overlay + sheet
  sheetOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(34, 26, 24, 0.35)',
  },
  bodyTypeSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surfaceContainerLowest,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingBottom: 40,
    zIndex: 400,
    ...shadow.tab,
  },
  bodyTypeTitle: {
    ...typography.h2,
    fontSize: 18,
    color: colors.onSurface,
    paddingHorizontal: spacing.screenMargin,
    paddingVertical: 12,
  },
  bodyTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: spacing.screenMargin,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.outlineVariant,
  },
  bodyTypeOptionText: {
    ...typography.bodyLg,
    fontFamily: 'Inter_600SemiBold',
    color: colors.onSurface,
  },
});
