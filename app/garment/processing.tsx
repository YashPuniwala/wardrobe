import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { colors, typography, radii, spacing, shadow } from '@/constants/theme';
import { Icon, iconNames } from '@/components/ui/Icon';
import { useWardrobeStore, GarmentCategory } from '@/store/useWardrobeStore';

const steps = [
  { id: 'upload', label: 'Uploading', icon: iconNames.photoCamera },
  { id: 'bg', label: 'Removing background', icon: iconNames.autoAwesome },
  { id: 'categorize', label: 'Categorizing', icon: iconNames.checkroom },
];

export default function ProcessingScreen() {
  const router = useRouter();
  const { imageUri, from } = useLocalSearchParams();
  const { addItem } = useWardrobeStore();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const stepTimers: ReturnType<typeof setTimeout>[] = [];
    steps.forEach((_, index) => {
      stepTimers.push(
        setTimeout(() => {
          setCurrentStep(index + 1);
        }, (index + 1) * 1000)
      );
    });

    stepTimers.push(
      setTimeout(() => {
        const categories: GarmentCategory[] = ['tops', 'bottoms', 'shoes', 'accessories', 'outerwear'];
        const randomCat = categories[Math.floor(Math.random() * categories.length)];
        const colors_arr = ['#e8d5c4', '#3a3a3a', '#c4a882', '#8a7960', '#6b4e3a'];
        addItem({
          imageUri: (imageUri as string) || Image.resolveAssetSource(require('@/assets/images/men-top1.webp')).uri,
          category: randomCat,
          name: `New ${randomCat.charAt(0).toUpperCase() + randomCat.slice(1, -1)}`,
          color: colors_arr[Math.floor(Math.random() * colors_arr.length)],
        });

        if (from === 'create') {
          router.replace('/create-outfit/step-1');
        } else {
          router.replace('/(tabs)/wardrobe');
        }
      }, 3500)
    );

    return () => stepTimers.forEach(clearTimeout);
  }, []);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <View style={styles.iconWrap}>
            <Icon name={iconNames.autoAwesome} size={40} color={colors.primary} />
          </View>
          <Text style={styles.title}>Processing Garment</Text>
          <Text style={styles.subtitle}>Analyzing your item with AI…</Text>

          <View style={styles.steps}>
            {steps.map((step, index) => {
              const isComplete = currentStep > index;
              const isActive = currentStep === index;
              return (
                <StepRow
                  key={step.id}
                  label={step.label}
                  iconName={step.icon}
                  isComplete={isComplete}
                  isActive={isActive}
                />
              );
            })}
          </View>

          <View style={styles.progressBar}>
            <AnimatedProgressFill progress={currentStep / steps.length} />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function StepRow({
  label,
  iconName,
  isComplete,
  isActive,
}: {
  label: string;
  iconName: any;
  isComplete: boolean;
  isActive: boolean;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  useEffect(() => {
    if (isActive) {
      scale.value = withSpring(1.05, { damping: 12, stiffness: 200 });
    } else {
      scale.value = withTiming(1, { duration: 200 });
    }
  }, [isActive]);

  return (
    <Animated.View style={[styles.stepRow, animatedStyle]}>
      <View
        style={[
          styles.stepIcon,
          isComplete && styles.stepIconComplete,
          isActive && styles.stepIconActive,
        ]}
      >
        <Icon
          name={isComplete ? iconNames.checkCircle : iconName}
          size={20}
          color={isComplete ? colors.tertiary : isActive ? colors.primary : colors.outline}
        />
      </View>
      <Text
        style={[
          styles.stepLabel,
          isComplete && styles.stepLabelComplete,
          isActive && styles.stepLabelActive,
        ]}
      >
        {label}
      </Text>
      {isActive && (
        <Animated.View style={styles.stepSpinner}>
          <Icon name={iconNames.pending} size={20} color={colors.primary} />
        </Animated.View>
      )}
    </Animated.View>
  );
}

function AnimatedProgressFill({ progress }: { progress: number }) {
  const width = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }));

  useEffect(() => {
    width.value = withTiming(progress, { duration: 800, easing: Easing.out(Easing.cubic) });
  }, [progress]);

  return <Animated.View style={[styles.progressFill, animatedStyle]} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  safe: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: { ...typography.h1, fontSize: 24 },
  subtitle: { ...typography.bodySm, color: colors.onSurfaceVariant, marginTop: 8 },
  steps: { width: '100%', gap: 16, marginTop: 40 },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.lg,
    padding: 16,
    ...shadow.soft,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIconComplete: { backgroundColor: colors.tertiaryContainer },
  stepIconActive: { backgroundColor: colors.primaryContainer },
  stepLabel: { ...typography.bodyLg, flex: 1, color: colors.outline },
  stepLabelComplete: { color: colors.onSurface },
  stepLabelActive: { color: colors.onPrimaryContainer, fontFamily: 'Inter_600SemiBold' },
  stepSpinner: { marginRight: 4 },
  progressBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceContainerHigh,
    overflow: 'hidden',
    marginTop: 32,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
});
