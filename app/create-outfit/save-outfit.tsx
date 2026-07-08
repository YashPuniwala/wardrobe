import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Image, Modal, FlatList, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, radii, spacing, shadow } from '@/constants/theme';
import { Icon, iconNames } from '@/components/ui/Icon';
import { useOutfitDraftStore, Occasion, Visibility } from '@/store/useOutfitDraftStore';
import { useCollageStore } from '@/store/useCollageStore';
import { useOutfitStore } from '@/store/useOutfitStore';
import { useWardrobeStore } from '@/store/useWardrobeStore';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const occasions: { id: Occasion; emoji: string }[] = [
  { id: 'Casual', emoji: '○' },
  { id: 'Formal', emoji: '◇' },
  { id: 'Work', emoji: '△' },
  { id: 'Party', emoji: '✦' },
  { id: 'Date Night', emoji: '♥' },
  { id: 'Brunch', emoji: '☕' },
  { id: 'Workout', emoji: '✸' },
  { id: 'Travel', emoji: '✈' },
];

const visibilities: { id: Visibility; label: string; icon: any }[] = [
  { id: 'everyone', label: 'Everyone', icon: iconNames.publicIcon },
  { id: 'friends', label: 'Friends', icon: iconNames.group },
  { id: 'only-me', label: 'Only Me', icon: iconNames.lock },
];

export default function SaveOutfitScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    caption,
    setCaption,
    date,
    setDate,
    occasion,
    setOccasion,
    visibility,
    setVisibility,
    ootd,
    setOotd,
    selectedItemIds,
    reset,
  } = useOutfitDraftStore();
  const { background, coverImage } = useCollageStore();
  const { saveFullOutfit } = useOutfitStore();
  const { items } = useWardrobeStore();
  const [showOccasionPicker, setShowOccasionPicker] = useState(false);
  const [showVisibilityPicker, setShowVisibilityPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saved, setSaved] = useState(false);

  const selectedGarments = selectedItemIds
    .map((id) => items.find((i) => i.id === id))
    .filter(Boolean);

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const name = caption.trim() || 'New Outfit';
    saveFullOutfit({
      name,
      slots: {},
      coverImage: coverImage || selectedGarments[0]?.imageUri,
      caption: caption.trim() || undefined,
      date: date || undefined,
      occasion: occasion || undefined,
      visibility,
      ootd,
      selectedItemIds,
    });
    setSaved(true);
    setTimeout(() => {
      reset();
      useCollageStore.getState().clear();
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
          <Text style={styles.title}>New outfit</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 80 }]} showsVerticalScrollIndicator={false}>
          {/* Collage preview */}
          <View style={[styles.collagePreview, { backgroundColor: background }]}>
            {coverImage ? (
              <Image source={{ uri: coverImage }} style={styles.collageImage} resizeMode="cover" />
            ) : (
              <View style={styles.collagePlaceholder}>
                {selectedGarments.slice(0, 4).map((g, i) => (
                  <Image
                    key={g!.id}
                    source={{ uri: g!.imageUri }}
                    style={[styles.collagePlaceholderImage, { marginLeft: i * 20 }]}
                    resizeMode="cover"
                  />
                ))}
              </View>
            )}
          </View>

          {/* Caption */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Caption</Text>
            <TextInput
              style={styles.captionInput}
              placeholder="Add a caption…"
              value={caption}
              onChangeText={setCaption}
              multiline
            />
          </View>

          {/* Date */}
          <Pressable style={styles.fieldRow} onPress={() => setShowDatePicker(true)}>
            <View style={styles.fieldLeft}>
              <View style={styles.fieldIcon}>
                <Icon name={iconNames.calendarToday} size={18} color={colors.primary} />
              </View>
              <Text style={styles.fieldText}>Date</Text>
            </View>
            <View style={styles.fieldRight}>
              <Text style={styles.fieldValue}>{date || 'Not set'}</Text>
              <Icon name={iconNames.chevronRight} size={18} color={colors.outline} />
            </View>
          </Pressable>

          {/* OOTD toggle */}
          <View style={styles.fieldRow}>
            <View style={styles.fieldLeft}>
              <View style={styles.fieldIcon}>
                <Icon name={iconNames.star} size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldText}>Add to OOTD story</Text>
                <Text style={styles.fieldSub}>Show this outfit to your followers for 24h as your fit of the day.</Text>
              </View>
            </View>
            <Switch
              value={ootd}
              onValueChange={(v) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setOotd(v);
              }}
              trackColor={{ false: colors.surfaceContainerHigh, true: colors.primary }}
              thumbColor={ootd ? colors.onPrimary : colors.outline}
            />
          </View>

          {/* Occasion */}
          <Pressable style={styles.fieldRow} onPress={() => setShowOccasionPicker(true)}>
            <View style={styles.fieldLeft}>
              <View style={styles.fieldIcon}>
                <Icon name={iconNames.event} size={18} color={colors.primary} />
              </View>
              <Text style={styles.fieldText}>Occasion</Text>
            </View>
            <View style={styles.fieldRight}>
              <Text style={styles.fieldValue}>{occasion || 'Select'}</Text>
              <Icon name={iconNames.chevronRight} size={18} color={colors.outline} />
            </View>
          </Pressable>

          {/* Visibility */}
          <Pressable style={styles.fieldRow} onPress={() => setShowVisibilityPicker(true)}>
            <View style={styles.fieldLeft}>
              <View style={styles.fieldIcon}>
                <Icon name={iconNames.lock} size={18} color={colors.primary} />
              </View>
              <Text style={styles.fieldText}>Visibility</Text>
            </View>
            <View style={styles.fieldRight}>
              <Text style={styles.fieldValue}>
                {visibilities.find((v) => v.id === visibility)?.label || 'Everyone'}
              </Text>
              <Icon name={iconNames.chevronRight} size={18} color={colors.outline} />
            </View>
          </Pressable>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
          <Pressable onPress={handleSave} style={styles.saveButton}>
            {saved ? (
              <Icon name={iconNames.checkCircle} size={22} color={colors.onPrimary} />
            ) : (
              <Icon name={iconNames.bookmark} size={20} color={colors.onPrimary} />
            )}
            <Text style={styles.saveButtonText}>{saved ? 'Saved!' : 'Save outfit'}</Text>
          </Pressable>
        </View>
      </SafeAreaView>

      {/* Occasion picker */}
      <Modal visible={showOccasionPicker} animationType="slide" transparent>
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerSheet}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select occasion</Text>
              <Pressable onPress={() => setShowOccasionPicker(false)} style={styles.pickerClose}>
                <Icon name={iconNames.close} size={20} color={colors.onSurface} />
              </Pressable>
            </View>
            <FlatList
              data={occasions}
              numColumns={3}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setOccasion(item.id);
                    setShowOccasionPicker(false);
                  }}
                  style={[styles.occasionChip, occasion === item.id && styles.occasionChipActive]}
                >
                  <Text style={styles.occasionEmoji}>{item.emoji}</Text>
                  <Text style={[styles.occasionLabel, occasion === item.id && styles.occasionLabelActive]}>{item.id}</Text>
                </Pressable>
              )}
              contentContainerStyle={styles.occasionGrid}
            />
          </View>
        </View>
      </Modal>

      {/* Visibility picker */}
      <Modal visible={showVisibilityPicker} animationType="slide" transparent>
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerSheet}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Who can see this?</Text>
              <Pressable onPress={() => setShowVisibilityPicker(false)} style={styles.pickerClose}>
                <Icon name={iconNames.close} size={20} color={colors.onSurface} />
              </Pressable>
            </View>
            {visibilities.map((v) => (
              <Pressable
                key={v.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setVisibility(v.id);
                  setShowVisibilityPicker(false);
                }}
                style={[styles.visibilityRow, visibility === v.id && styles.visibilityRowActive]}
              >
                <View style={styles.visibilityIcon}>
                  <Icon name={v.icon} size={20} color={colors.primary} />
                </View>
                <Text style={styles.visibilityLabel}>{v.label}</Text>
                {visibility === v.id && <Icon name={iconNames.checkCircle} size={20} color={colors.primary} />}
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>

      {/* Date picker (simple) */}
      <Modal visible={showDatePicker} animationType="slide" transparent>
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerSheet}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Assign to a date</Text>
              <Pressable onPress={() => setShowDatePicker(false)} style={styles.pickerClose}>
                <Icon name={iconNames.close} size={20} color={colors.onSurface} />
              </Pressable>
            </View>
            <View style={styles.dateOptions}>
              {['Today', 'Tomorrow', 'This Weekend', 'Next Week'].map((d) => (
                <Pressable
                  key={d}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setDate(d);
                    setShowDatePicker(false);
                  }}
                  style={[styles.dateOption, date === d && styles.dateOptionActive]}
                >
                  <Text style={[styles.dateOptionText, date === d && styles.dateOptionTextActive]}>{d}</Text>
                </Pressable>
              ))}
              <Pressable
                onPress={() => {
                  setDate(null);
                  setShowDatePicker(false);
                }}
                style={styles.dateOption}
              >
                <Text style={[styles.dateOptionText, { color: colors.onSurfaceVariant }]}>Clear date</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Saved overlay */}
      {saved && (
        <View style={styles.savedOverlay}>
          <View style={styles.savedCard}>
            <View style={styles.savedIcon}>
              <Icon name={iconNames.checkCircle} size={48} color={colors.tertiary} />
            </View>
            <Text style={styles.savedTitle}>Outfit Saved!</Text>
            <Text style={styles.savedSubtitle}>Your outfit is now in your collection</Text>
          </View>
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
  title: { ...typography.h2, fontSize: 18 },
  scroll: { paddingHorizontal: spacing.screenMargin },
  collagePreview: {
    width: '100%',
    aspectRatio: 1.2,
    borderRadius: radii.xl,
    overflow: 'hidden',
    marginBottom: 20,
    ...shadow.soft,
  },
  collageImage: { width: '100%', height: '100%' },
  collagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  collagePlaceholderImage: { width: 80, height: 100, borderRadius: 12, borderWidth: 2, borderColor: colors.surfaceContainerLowest },
  field: { marginBottom: 16 },
  fieldLabel: { ...typography.label, color: colors.onSurfaceVariant, marginBottom: 8 },
  captionInput: {
    ...typography.bodyLg,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.lg,
    padding: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.lg,
    padding: 16,
    marginBottom: 8,
    ...shadow.soft,
  },
  fieldLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  fieldIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldText: { ...typography.bodyLg, fontFamily: 'Inter_500Medium' },
  fieldSub: { ...typography.caption, color: colors.onSurfaceVariant, marginTop: 2 },
  fieldRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  fieldValue: { ...typography.bodySm, color: colors.onSurfaceVariant },
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
    borderRadius: radii.pill,
    paddingVertical: 16,
  },
  saveButtonText: { ...typography.bodyLg, fontFamily: 'Inter_600SemiBold', color: colors.onPrimary },
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
  occasionGrid: { paddingBottom: 20, gap: 8 },
  occasionChip: {
    width: '31%',
    marginRight: '2%',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceContainerLow,
    gap: 6,
  },
  occasionChipActive: { backgroundColor: colors.primary },
  occasionEmoji: { fontSize: 24 },
  occasionLabel: { ...typography.caption, fontFamily: 'Inter_500Medium' },
  occasionLabelActive: { color: colors.onPrimary, fontFamily: 'Inter_600SemiBold' },
  visibilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceContainerLow,
    marginBottom: 8,
  },
  visibilityRowActive: { backgroundColor: colors.primaryContainer },
  visibilityIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visibilityLabel: { ...typography.bodyLg, fontFamily: 'Inter_500Medium', flex: 1 },
  dateOptions: { gap: 8, paddingBottom: 20 },
  dateOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceContainerLow,
  },
  dateOptionActive: { backgroundColor: colors.primary },
  dateOptionText: { ...typography.bodyLg, fontFamily: 'Inter_500Medium' },
  dateOptionTextActive: { color: colors.onPrimary, fontFamily: 'Inter_600SemiBold' },
  savedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(34, 26, 24, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.xl,
    padding: 32,
    alignItems: 'center',
    gap: 12,
    ...shadow.soft,
  },
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
