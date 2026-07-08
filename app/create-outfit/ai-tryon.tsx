import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { colors, typography, radii, spacing, shadow } from '@/constants/theme';
import { Icon, iconNames } from '@/components/ui/Icon';
import { useWardrobeStore } from '@/store/useWardrobeStore';
import { useOutfitDraftStore } from '@/store/useOutfitDraftStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Step = 'upload' | 'processing' | 'result';

export default function AITryOnScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { items } = useWardrobeStore();
  const { selectedItemIds, referencePhoto } = useOutfitDraftStore();
  const [step, setStep] = useState<Step>(referencePhoto ? 'processing' : 'upload');
  const [selfieUri, setSelfieUri] = useState<string | null>(referencePhoto);

  const selectedGarments = selectedItemIds
    .map((id) => items.find((i) => i.id === id))
    .filter(Boolean);

  useEffect(() => {
    if (step === 'processing') {
      const timer = setTimeout(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setStep('result');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleTakeSelfie = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setSelfieUri(result.assets[0].uri);
      setStep('processing');
    }
  };

  const handleChoosePhoto = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setSelfieUri(result.assets[0].uri);
      setStep('processing');
    }
  };

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
          <Text style={styles.title}>AI Try On</Text>
          {step === 'result' ? (
            <Pressable onPress={handleNext} style={styles.nextPill}>
              <Text style={styles.nextPillText}>Next</Text>
              <Icon name={iconNames.arrowForward} size={16} color={colors.onPrimary} />
            </Pressable>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        {step === 'upload' && (
          <View style={styles.uploadContent}>
            <View style={styles.uploadIcon}>
              <Icon name={iconNames.photoCamera} size={40} color={colors.primary} />
            </View>
            <Text style={styles.uploadTitle}>Take a selfie</Text>
            <Text style={styles.uploadSubtitle}>
              We'll virtually place your selected garments on your photo so you can see how the outfit looks on you.
            </Text>
            <View style={styles.uploadActions}>
              <Pressable onPress={handleTakeSelfie} style={styles.uploadPrimaryButton}>
                <Icon name={iconNames.photoCamera} size={20} color={colors.onPrimary} />
                <Text style={styles.uploadPrimaryText}>Take Selfie</Text>
              </Pressable>
              <Pressable onPress={handleChoosePhoto} style={styles.uploadSecondaryButton}>
                <Icon name={iconNames.gridView} size={20} color={colors.onSurface} />
                <Text style={styles.uploadSecondaryText}>Choose Photo</Text>
              </Pressable>
            </View>
            <View style={styles.selectedPreview}>
              <Text style={styles.selectedLabel}>{selectedGarments.length} garments selected</Text>
              <View style={styles.selectedThumbs}>
                {selectedGarments.slice(0, 5).map((g) => (
                  <Image key={g!.id} source={{ uri: g!.imageUri }} style={styles.selectedThumb} resizeMode="cover" />
                ))}
              </View>
            </View>
          </View>
        )}

        {step === 'processing' && (
          <View style={styles.processingContent}>
            <View style={styles.processingImageWrap}>
              {selfieUri && (
                <Image source={{ uri: selfieUri }} style={styles.processingImage} resizeMode="cover" />
              )}
              <View style={styles.processingOverlay} />
              <View style={styles.processingSpinner}>
                <Animated.View style={styles.spinnerRing} />
              </View>
            </View>
            <Text style={styles.processingTitle}>Trying on your outfit…</Text>
            <Text style={styles.processingSubtitle}>Compositing {selectedGarments.length} garments onto your photo</Text>
            <View style={styles.processingSteps}>
              {['Analyzing pose', 'Mapping garments', 'Compositing result'].map((s, i) => (
                <View key={s} style={styles.processingStep}>
                  <View style={[styles.processingStepDot, { opacity: 1 - i * 0.2 }]} />
                  <Text style={[styles.processingStepText, { opacity: 1 - i * 0.2 }]}>{s}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {step === 'result' && (
          <View style={styles.resultContent}>
            <View style={styles.resultImageWrap}>
              {selfieUri && (
                <Image source={{ uri: selfieUri }} style={styles.resultImage} resizeMode="cover" />
              )}
              {selectedGarments.map((g, i) => (
                <View
                  key={g!.id}
                  style={[
                    styles.resultGarment,
                    {
                      top: 40 + i * 60,
                      left: SCREEN_WIDTH * 0.2,
                      width: SCREEN_WIDTH * 0.6,
                    },
                  ]}
                >
                  <Image source={{ uri: g!.imageUri }} style={styles.resultGarmentImage} resizeMode="contain" />
                </View>
              ))}
            </View>
            <Text style={styles.resultTitle}>Your virtual try-on</Text>
            <Text style={styles.resultSubtitle}>This is a preview composite. Real AI generation coming soon.</Text>
            <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
              <Pressable onPress={() => setStep('upload')} style={styles.retakeButton}>
                <Icon name={iconNames.refresh} size={18} color={colors.onSurface} />
                <Text style={styles.retakeText}>Retake</Text>
              </Pressable>
              <Pressable onPress={handleNext} style={styles.nextButton}>
                <Text style={styles.nextButtonText}>Next</Text>
                <Icon name={iconNames.arrowForward} size={18} color={colors.onPrimary} />
              </Pressable>
            </View>
          </View>
        )}
      </SafeAreaView>
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
  uploadContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 16 },
  uploadIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadTitle: { ...typography.h1, fontSize: 22 },
  uploadSubtitle: { ...typography.bodySm, color: colors.onSurfaceVariant, textAlign: 'center', lineHeight: 20 },
  uploadActions: { gap: 12, marginTop: 16, width: '100%' },
  uploadPrimaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: 16,
  },
  uploadPrimaryText: { ...typography.bodyLg, fontFamily: 'Inter_600SemiBold', color: colors.onPrimary },
  uploadSecondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.pill,
    paddingVertical: 16,
  },
  uploadSecondaryText: { ...typography.bodyLg, fontFamily: 'Inter_600SemiBold', color: colors.onSurface },
  selectedPreview: { marginTop: 24, alignItems: 'center' },
  selectedLabel: { ...typography.caption, color: colors.onSurfaceVariant, marginBottom: 8 },
  selectedThumbs: { flexDirection: 'row', gap: 8 },
  selectedThumb: { width: 40, height: 40, borderRadius: 12 },
  processingContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 16 },
  processingImageWrap: {
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_WIDTH * 0.8,
    borderRadius: radii.xl,
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainer,
    ...shadow.soft,
  },
  processingImage: { width: '100%', height: '100%' },
  processingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(34, 26, 24, 0.3)' },
  processingSpinner: { position: 'absolute', top: '50%', left: '50%', marginLeft: -30, marginTop: -30 },
  spinnerRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: colors.primary,
    borderTopColor: 'transparent',
  },
  processingTitle: { ...typography.h2, fontSize: 18 },
  processingSubtitle: { ...typography.bodySm, color: colors.onSurfaceVariant, textAlign: 'center' },
  processingSteps: { gap: 8, marginTop: 16 },
  processingStep: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  processingStepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  processingStepText: { ...typography.caption, color: colors.onSurfaceVariant },
  resultContent: { flex: 1 },
  resultImageWrap: {
    width: SCREEN_WIDTH - 40,
    height: SCREEN_WIDTH * 1.1,
    margin: 20,
    borderRadius: radii.xl,
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainer,
    ...shadow.soft,
  },
  resultImage: { width: '100%', height: '100%' },
  resultGarment: { position: 'absolute' },
  resultGarmentImage: { width: '100%', height: 80, opacity: 0.85 },
  resultTitle: { ...typography.h2, fontSize: 18, textAlign: 'center', marginTop: 8 },
  resultSubtitle: { ...typography.caption, color: colors.onSurfaceVariant, textAlign: 'center', marginTop: 4 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.screenMargin,
    paddingTop: 12,
    marginTop: 'auto',
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceContainerLow,
  },
  retakeText: { ...typography.bodyLg, fontFamily: 'Inter_600SemiBold', color: colors.onSurfaceVariant },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: 14,
  },
  nextButtonText: { ...typography.bodyLg, fontFamily: 'Inter_600SemiBold', color: colors.onPrimary },
});
