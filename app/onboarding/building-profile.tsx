import { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
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
import { useAuthStore } from '@/store/useAuthStore';

const steps = [
  { id: 'analyze', label: 'Analyzing your style', icon: iconNames.autoAwesome },
  { id: 'palette', label: 'Matching your palette', icon: iconNames.palette },
  { id: 'curate', label: 'Curating your first looks', icon: iconNames.checkroom },
];

export default function BuildingProfileScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    steps.forEach((_, index) => {
      timers.push(
        setTimeout(() => {
          setCurrentStep(index + 1);
        }, (index + 1) * 600)
      );
    });

    timers.push(
      setTimeout(() => {
        useAuthStore.getState().completeQuiz();
        router.replace('/(tabs)/wardrobe');
      }, 2000)
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <View style={styles.iconWrap}>
            <Icon name={iconNames.autoAwesome} size={36} color={colors.primary} />
          </View>
          <Text style={styles.title}>Building your style profile</Text>
          <Text style={styles.subtitle}>Personalizing Fits just for you…</Text>

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
      scale.value = withSpring(1.03, { damping: 12, stiffness: 200 });
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
          size={18}
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
          <Icon name={iconNames.pending} size={18} color={colors.primary} />
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
    width.value = withTiming(progress, { duration: 500, easing: Easing.out(Easing.cubic) });
  }, [progress]);

  return <Animated.View style={[styles.progressFill, animatedStyle]} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  safe: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.screenMargin },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.stackMd,
  },
  title: { ...typography.h1, fontSize: 22, textAlign: 'center' },
  subtitle: { ...typography.bodySm, color: colors.onSurfaceVariant, marginTop: spacing.stackSm },
  steps: { width: '100%', gap: 12, marginTop: spacing.stackLg },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.lg,
    padding: 14,
    ...shadow.soft,
  },
  stepIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIconComplete: { backgroundColor: colors.tertiaryContainer },
  stepIconActive: { backgroundColor: colors.primaryContainer },
  stepLabel: { ...typography.bodySm, flex: 1, color: colors.outline },
  stepLabelComplete: { color: colors.onSurface },
  stepLabelActive: { color: colors.onPrimaryContainer, fontFamily: 'Inter_600SemiBold' },
  stepSpinner: { marginRight: 4 },
  progressBar: {
    width: '100%',
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.surfaceContainerHigh,
    overflow: 'hidden',
    marginTop: spacing.stackLg,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
});
