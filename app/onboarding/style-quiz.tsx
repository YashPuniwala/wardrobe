import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, radii, spacing, shadow } from '@/constants/theme';
import { Icon, iconNames } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { useQuizStore } from '@/store/useQuizStore';
import { useAuthStore } from '@/store/useAuthStore';

interface QuizQuestion {
  id: string;
  question: string;
  subtitle?: string;
  multi?: boolean;
  options: { id: string; label: string; emoji?: string }[];
}

const questions: QuizQuestion[] = [
  {
    id: 'style',
    question: 'What best describes your style?',
    subtitle: 'Pick the one that feels most you',
    options: [
      { id: 'minimal', label: 'Minimalist', emoji: '○' },
      { id: 'classic', label: 'Classic', emoji: '◇' },
      { id: 'streetwear', label: 'Streetwear', emoji: '△' },
      { id: 'bohemian', label: 'Bohemian', emoji: '✦' },
      { id: 'sporty', label: 'Sporty', emoji: '✸' },
      { id: 'eclectic', label: 'Eclectic', emoji: '✺' },
    ],
  },
  {
    id: 'colors',
    question: 'Which colors do you love?',
    subtitle: 'Select all that appeal to you',
    multi: true,
    options: [
      { id: 'neutrals', label: 'Neutrals & Earth Tones', emoji: '◐' },
      { id: 'pastels', label: 'Soft Pastels', emoji: '◑' },
      { id: 'bold', label: 'Bold & Bright', emoji: '◓' },
      { id: 'monochrome', label: 'Monochrome', emoji: '◒' },
      { id: 'jewel', label: 'Jewel Tones', emoji: '◈' },
    ],
  },
  {
    id: 'occasion',
    question: 'How do you usually dress?',
    subtitle: 'Pick your go-to vibe',
    options: [
      { id: 'casual', label: 'Casual everyday', emoji: '○' },
      { id: 'smart', label: 'Smart casual', emoji: '◇' },
      { id: 'formal', label: 'Formal / Business', emoji: '△' },
      { id: 'mix', label: 'A mix of everything', emoji: '✦' },
    ],
  },
  {
    id: 'priority',
    question: 'What matters most in your wardrobe?',
    subtitle: 'Choose your top priority',
    options: [
      { id: 'versatility', label: 'Versatility', emoji: '✸' },
      { id: 'comfort', label: 'Comfort', emoji: '✺' },
      { id: 'quality', label: 'Quality & longevity', emoji: '◈' },
      { id: 'trend', label: 'On-trend styles', emoji: '✦' },
    ],
  },
];

export default function StyleQuizScreen() {
  const router = useRouter();
  const { setAnswer, toggleAnswer, answers } = useQuizStore();
  const { completeQuiz } = useAuthStore();
  const [step, setStep] = useState(0);

  const progress = useSharedValue(0);
  const progressStyle = useAnimatedStyle(() => ({
    width: `${((progress.value / (questions.length - 1)) * 100)}%`,
  }));

  const currentQuestion = questions[step];
  const selectedAnswers = answers[currentQuestion.id] || [];

  const handleSelect = (optionId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentQuestion.multi) {
      toggleAnswer(currentQuestion.id, optionId);
    } else {
      setAnswer(currentQuestion.id, optionId);
    }
  };

  const handleNext = () => {
    if (step < questions.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      progress.value = withSpring(step + 1);
      setStep(step + 1);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      completeQuiz();
      router.replace('/onboarding/building-profile');
    }
  };

  const handleBack = () => {
    if (step > 0) {
      progress.value = withSpring(step - 1);
      setStep(step - 1);
    } else {
      router.replace('/');
    }
  };

  const canContinue = selectedAnswers.length > 0;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Icon name={iconNames.arrowBack} size={22} color={colors.onSurface} />
          </Pressable>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, progressStyle]} />
          </View>
          <Text style={styles.progressText}>
            {step + 1} / {questions.length}
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.question}>{currentQuestion.question}</Text>
          {currentQuestion.subtitle && (
            <Text style={styles.subtitle}>{currentQuestion.subtitle}</Text>
          )}

          <View style={styles.options}>
            {currentQuestion.options.map((option) => {
              const isSelected = selectedAnswers.includes(option.id);
              return (
                <OptionCard
                  key={option.id}
                  label={option.label}
                  emoji={option.emoji}
                  selected={isSelected}
                  onPress={() => handleSelect(option.id)}
                />
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            label={step === questions.length - 1 ? 'Complete' : 'Continue'}
            onPress={handleNext}
            disabled={!canContinue}
            icon={<Icon name={iconNames.arrowForward} size={20} color={colors.onPrimary} />}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

function OptionCard({
  label,
  emoji,
  selected,
  onPress,
}: {
  label: string;
  emoji?: string;
  selected: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPressIn={() => (scale.value = withTiming(0.98, { duration: 100 }))}
        onPressOut={() => (scale.value = withTiming(1, { duration: 150 }))}
        onPress={onPress}
        style={[
          styles.optionCard,
          selected && styles.optionCardSelected,
        ]}
      >
        <View style={styles.optionLeft}>
          {emoji && <Text style={styles.optionEmoji}>{emoji}</Text>}
          <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
            {label}
          </Text>
        </View>
        {selected ? (
          <Icon name={iconNames.checkCircle} size={24} color={colors.primary} />
        ) : (
          <Icon name={iconNames.circle} size={24} color={colors.outlineVariant} />
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenMargin,
    paddingVertical: 12,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceContainerHigh,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  progressText: {
    ...typography.label,
    color: colors.onSurfaceVariant,
  },
  scroll: {
    paddingHorizontal: spacing.screenMargin,
    paddingTop: 24,
  },
  question: {
    ...typography.h1,
    fontSize: 28,
  },
  subtitle: {
    ...typography.bodyLg,
    color: colors.onSurfaceVariant,
    marginTop: 8,
    marginBottom: 24,
  },
  options: { gap: 12, paddingBottom: 40 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1.5,
    borderColor: 'transparent',
    ...shadow.soft,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceContainerLow,
  },
  optionLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  optionEmoji: {
    fontSize: 20,
    color: colors.onSurfaceVariant,
  },
  optionLabel: {
    ...typography.bodyLg,
    fontFamily: 'Inter_500Medium',
  },
  optionLabelSelected: {
    fontFamily: 'Inter_600SemiBold',
    color: colors.onPrimaryContainer,
  },
  footer: {
    paddingHorizontal: spacing.screenMargin,
    paddingBottom: 24,
    paddingTop: 12,
  },
});
