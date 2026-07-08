import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
import { colors, typography, radii, spacing, shadow } from '@/constants/theme';
import { Icon, iconNames } from '@/components/ui/Icon';
import { useWardrobeStore, Garment } from '@/store/useWardrobeStore';
import { useOutfitStore, OutfitSlot } from '@/store/useOutfitStore';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const slotLabels: Record<keyof OutfitSlot, string> = {
  top: 'Top',
  bottom: 'Bottom',
  shoes: 'Shoes',
  accessory: 'Accessory',
  outerwear: 'Outerwear',
};

export default function Step2Screen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { items } = useWardrobeStore();
  const { draft, saveOutfit, clearDraft } = useOutfitStore();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [outfitName, setOutfitName] = useState('');
  const [occasion, setOccasion] = useState('');
  const [saved, setSaved] = useState(false);

  const getGarment = (id?: string) => items.find((i) => i.id === id);

  const filledSlots = (Object.keys(draft) as (keyof OutfitSlot)[]).filter(
    (k) => draft[k] !== undefined
  );

  const handleSave = () => {
    const name = outfitName.trim() || 'New Outfit';
    saveOutfit(name, occasion.trim() || undefined);
    setSaved(true);
    setTimeout(() => {
      setShowSaveModal(false);
      clearDraft();
      router.replace('/(tabs)/outfits');
    }, 1200);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <Icon name={iconNames.arrowBack} size={22} color={colors.onSurface} />
          </Pressable>
          <Text style={styles.title}>Step 2: Review</Text>
          <Pressable
            onPress={() => router.push('/create-outfit/step-1')}
            style={styles.iconButton}
          >
            <Icon name={iconNames.autoAwesome} size={20} color={colors.primary} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.outfitPreview}>
            {filledSlots.length === 0 ? (
              <View style={styles.emptyPreview}>
                <Icon name={iconNames.checkroom} size={48} color={colors.outlineVariant} />
                <Text style={styles.emptyText}>No items selected</Text>
                <Pressable
                  onPress={() => router.push('/create-outfit/step-1')}
                  style={styles.emptyButton}
                >
                  <Text style={styles.emptyButtonText}>Go back and pick items</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.outfitStack}>
                {filledSlots.map((slot) => {
                  const garment = getGarment(draft[slot]);
                  if (!garment) return null;
                  return (
                    <OutfitLayer
                      key={slot}
                      garment={garment}
                      slotLabel={slotLabels[slot]}
                      onSwap={() => router.push('/create-outfit/step-1')}
                    />
                  );
                })}
              </View>
            )}
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Outfit Summary</Text>
            <View style={styles.summaryItems}>
              {filledSlots.map((slot) => {
                const garment = getGarment(draft[slot]);
                return (
                  <View key={slot} style={styles.summaryItem}>
                    <View style={[styles.summarySwatch, { backgroundColor: garment?.color || colors.surfaceContainer }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.summarySlot}>{slotLabels[slot]}</Text>
                      <Text style={styles.summaryName}>{garment?.name || 'Empty'}</Text>
                    </View>
                    <Pressable
                      onPress={() => router.push('/create-outfit/step-1')}
                      style={styles.swapButton}
                    >
                      <Icon name={iconNames.autoAwesome} size={14} color={colors.primary} />
                      <Text style={styles.swapText}>Swap</Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
          <Pressable
            onPress={() => setShowSaveModal(true)}
            disabled={filledSlots.length === 0}
            style={[styles.saveButton, filledSlots.length === 0 && styles.saveButtonDisabled]}
          >
            <Icon name={iconNames.bookmark} size={20} color={colors.onPrimary} />
            <Text style={styles.saveButtonText}>Save Outfit</Text>
          </Pressable>
        </View>
      </SafeAreaView>

      <Modal visible={showSaveModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {saved ? (
              <View style={styles.savedState}>
                <View style={styles.savedIcon}>
                  <Icon name={iconNames.checkCircle} size={48} color={colors.tertiary} />
                </View>
                <Text style={styles.savedTitle}>Outfit Saved!</Text>
                <Text style={styles.savedSubtitle}>Your outfit is now in your collection</Text>
              </View>
            ) : (
              <View style={styles.modalContent}>
                <View style={styles.modalHandle} />
                <Text style={styles.modalTitle}>Name your outfit</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. Sunday Brunch"
                  value={outfitName}
                  onChangeText={setOutfitName}
                  autoFocus
                />
                <Text style={styles.modalLabel}>Occasion (optional)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. Casual, Work, Date"
                  value={occasion}
                  onChangeText={setOccasion}
                />
                <View style={styles.modalActions}>
                  <Pressable
                    onPress={() => setShowSaveModal(false)}
                    style={styles.modalCancelButton}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </Pressable>
                  <Pressable onPress={handleSave} style={styles.modalSaveButton}>
                    <Text style={styles.modalSaveText}>Save</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function OutfitLayer({
  garment,
  slotLabel,
  onSwap,
}: {
  garment: Garment;
  slotLabel: string;
  onSwap: () => void;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      onPress={onSwap}
      onPressIn={() => (scale.value = withTiming(0.98, { duration: 100 }))}
      onPressOut={() => (scale.value = withTiming(1, { duration: 150 }))}
      style={[styles.layer, animatedStyle]}
    >
      <View style={[styles.layerColor, { backgroundColor: garment.color }]}>
        <Text style={styles.layerEmoji}>
          {garment.category === 'tops' ? '👕' : garment.category === 'bottoms' ? '👖' : garment.category === 'shoes' ? '👟' : garment.category === 'outerwear' ? '🧥' : '👜'}
        </Text>
      </View>
      <View style={styles.layerInfo}>
        <Text style={styles.layerSlot}>{slotLabel}</Text>
        <Text style={styles.layerName}>{garment.name}</Text>
        <View style={styles.swapTag}>
          <Icon name={iconNames.autoAwesome} size={10} color={colors.primary} />
          <Text style={styles.swapTagText}>Tap to swap</Text>
        </View>
      </View>
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
  scroll: { paddingHorizontal: spacing.screenMargin, paddingBottom: 100 },
  outfitPreview: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.xl,
    padding: 20,
    minHeight: 300,
    ...shadow.soft,
  },
  emptyPreview: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { ...typography.bodyLg, color: colors.onSurfaceVariant },
  emptyButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 9999,
    backgroundColor: colors.primary,
    marginTop: 8,
  },
  emptyButtonText: { ...typography.bodySm, fontFamily: 'Inter_600SemiBold', color: colors.onPrimary },
  outfitStack: { gap: 12 },
  layer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.lg,
    padding: 12,
  },
  layerColor: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  layerEmoji: { fontSize: 28 },
  layerInfo: { flex: 1 },
  layerSlot: { ...typography.label, color: colors.onSurfaceVariant },
  layerName: { ...typography.bodyLg, fontFamily: 'Inter_600SemiBold', marginTop: 2 },
  swapTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  swapTagText: { ...typography.label, fontSize: 10, color: colors.primary },
  summaryCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.lg,
    padding: 16,
    marginTop: 16,
    ...shadow.soft,
  },
  summaryTitle: { ...typography.h2, fontSize: 16, marginBottom: 12 },
  summaryItems: { gap: 12 },
  summaryItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  summarySwatch: { width: 32, height: 32, borderRadius: 8 },
  summarySlot: { ...typography.label, color: colors.onSurfaceVariant },
  summaryName: { ...typography.bodySm, fontFamily: 'Inter_500Medium' },
  swapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 9999,
    backgroundColor: colors.surfaceContainerLow,
  },
  swapText: { ...typography.label, fontSize: 10, color: colors.primary },
  footer: {
    paddingHorizontal: spacing.screenMargin,
    paddingTop: 12,
    backgroundColor: colors.surfaceContainerLowest,
    borderTopColor: colors.outlineVariant,
    borderTopWidth: 1,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 9999,
    paddingVertical: 16,
  },
  saveButtonDisabled: { opacity: 0.4 },
  saveButtonText: { ...typography.bodyLg, fontFamily: 'Inter_600SemiBold', color: colors.onPrimary },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(34, 26, 24, 0.4)',
  },
  modalSheet: {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.outlineVariant,
    alignSelf: 'center',
    marginTop: 12,
  },
  modalContent: { padding: 20 },
  modalTitle: { ...typography.h2, fontSize: 20, marginBottom: 16 },
  modalLabel: { ...typography.label, color: colors.onSurfaceVariant, marginTop: 12, marginBottom: 6 },
  modalInput: {
    ...typography.bodyLg,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.md,
  },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 9999,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
  },
  modalCancelText: { ...typography.bodyLg, fontFamily: 'Inter_600SemiBold', color: colors.onSurfaceVariant },
  modalSaveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 9999,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  modalSaveText: { ...typography.bodyLg, fontFamily: 'Inter_600SemiBold', color: colors.onPrimary },
  savedState: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  savedIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.tertiaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedTitle: { ...typography.h1, fontSize: 22 },
  savedSubtitle: { ...typography.bodySm, color: colors.onSurfaceVariant },
});
