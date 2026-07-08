import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, radii, spacing, shadow } from '@/constants/theme';
import { Icon, iconNames } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { useQuizStore } from '@/store/useQuizStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useProfileStore } from '@/store/useProfileStore';

interface QuizQuestion {
  id: string;
  type: 'single' | 'multi' | 'input';
  question: string;
  subtitle?: string;
  options?: { id: string; label: string; emoji?: string }[];
  placeholder?: string;
  skippable?: boolean;
}

const questions: QuizQuestion[] = [
  {
    id: 'name',
    type: 'input',
    question: 'What should we call you?',
    subtitle: 'Your name personalizes your Fits experience',
    placeholder: 'Enter your name',
    skippable: false,
  },
  {
    id: 'style',
    type: 'single',
    question: 'What best describes your style?',
    subtitle: 'Pick the one that feels most you',
    options: [
      { id: 'minimal', label: 'Minimalist', emoji: '🌿' },
      { id: 'classic', label: 'Classic', emoji: '👔' },
      { id: 'streetwear', label: 'Streetwear', emoji: '👟' },
      { id: 'bohemian', label: 'Bohemian', emoji: '🌸' },
      { id: 'sporty', label: 'Sporty', emoji: '🏃' },
      { id: 'eclectic', label: 'Eclectic', emoji: '🎨' },
    ],
  },
  {
    id: 'colors',
    type: 'multi',
    question: 'Which colors do you love?',
    subtitle: 'Select all that appeal to you',
    options: [
      { id: 'neutrals', label: 'Neutrals & Earth Tones', emoji: '🪵' },
      { id: 'pastels', label: 'Soft Pastels', emoji: '🦄' },
      { id: 'bold', label: 'Bold & Bright', emoji: '🌈' },
      { id: 'monochrome', label: 'Monochrome', emoji: '🖤' },
      { id: 'jewel', label: 'Jewel Tones', emoji: '💎' },
    ],
  },
  {
    id: 'dressing_for',
    type: 'single',
    question: 'Who are you dressing for?',
    subtitle: 'This helps us tailor outfit suggestions',
    options: [
      { id: 'mens', label: "Men's", emoji: '👨' },
      { id: 'womens', label: "Women's", emoji: '👩' },
      { id: 'unisex', label: 'Unisex / Mixed', emoji: '🧑‍🤝‍🧑' },
    ],
  },
  {
    id: 'occasions',
    type: 'multi',
    question: 'Where do you usually wear outfits?',
    subtitle: 'Select all that apply to your lifestyle',
    options: [
      { id: 'work', label: 'Work / Office', emoji: '💼' },
      { id: 'casual', label: 'Casual everyday', emoji: '☕' },
      { id: 'date', label: 'Date night', emoji: '🍷' },
      { id: 'gym', label: 'Gym / Athletic', emoji: '💪' },
      { id: 'formal', label: 'Formal events', emoji: '🎭' },
      { id: 'travel', label: 'Travel', emoji: '✈️' },
    ],
  },
  {
    id: 'fit',
    type: 'single',
    question: 'What fit do you prefer?',
    subtitle: 'Your go-to silhouette',
    options: [
      { id: 'fitted', label: 'Fitted', emoji: '📏' },
      { id: 'relaxed', label: 'Relaxed', emoji: '🛋️' },
      { id: 'oversized', label: 'Oversized', emoji: '🧥' },
      { id: 'mix', label: 'Mix of both', emoji: '🔄' },
    ],
  },
  {
    id: 'priority',
    type: 'single',
    question: 'What matters most in your wardrobe?',
    subtitle: 'Choose your top priority',
    options: [
      { id: 'versatility', label: 'Versatility', emoji: '🔁' },
      { id: 'comfort', label: 'Comfort', emoji: '☁️' },
      { id: 'quality', label: 'Quality & longevity', emoji: '💯' },
      { id: 'trend', label: 'On-trend styles', emoji: '🔥' },
    ],
  },
  {
    id: 'sizes',
    type: 'input',
    question: 'What are your sizes? (optional)',
    subtitle: 'Helps us suggest the right fit — skip if you prefer',
    placeholder: 'e.g. Top: M, Bottom: 32, Shoe: 10',
    skippable: true,
  },
];
export default function StyleQuizScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setAnswer, toggleAnswer, answers } = useQuizStore();
  const { setName } = useProfileStore();
  const [step, setStep] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [inputFocused, setInputFocused] = useState(false);

  const progress = useSharedValue(0);
  const progressStyle = useAnimatedStyle(() => ({
    width: `${((progress.value / (questions.length - 1)) * 100)}%`,
  }));

  const currentQuestion = questions[step];
  const selectedAnswers = answers[currentQuestion.id] || [];

  useEffect(() => {
    if (currentQuestion.id === 'name' && answers.name?.[0]) {
      setInputValue(answers.name[0]);
    } else if (currentQuestion.id === 'sizes' && answers.sizes?.[0]) {
      setInputValue(answers.sizes[0]);
    } else if (currentQuestion.type === 'input') {
      setInputValue('');
    }
  }, [step, currentQuestion.id]);

  const handleSelect = (optionId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentQuestion.type === 'multi') {
      toggleAnswer(currentQuestion.id, optionId);
    } else {
      setAnswer(currentQuestion.id, optionId);
    }
  };

  const handleInputChange = (text: string) => {
    setInputValue(text);
    setAnswer(currentQuestion.id, text);
  };

  const handleNext = () => {
    if (currentQuestion.id === 'name' && inputValue.trim()) {
      setName(inputValue.trim());
    }

    if (step < questions.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      progress.value = withSpring(step + 1);
      setStep(step + 1);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleNext();
  };

  const canContinue = currentQuestion.skippable
    ? true
    : currentQuestion.type === 'input'
    ? inputValue.trim().length > 0
    : selectedAnswers.length > 0;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Icon name={iconNames.arrowBack} size={22} color={colors.onSurface} />
          </Pressable>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, progressStyle]} />
          </View>
          <Text style={styles.progressText}>
            {step + 1} / {questions.length}
          </Text>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.question}>{currentQuestion.question}</Text>
            {currentQuestion.subtitle && (
              <Text style={styles.subtitle}>{currentQuestion.subtitle}</Text>
            )}

            {currentQuestion.type === 'input' ? (
              <View style={styles.inputWrap}>
                <TextInput
                  style={[styles.textInput, inputFocused && styles.textInputFocused]}
                  placeholder={currentQuestion.placeholder}
                  value={inputValue}
                  onChangeText={handleInputChange}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  autoCapitalize={currentQuestion.id === 'name' ? 'words' : 'sentences'}
                  autoCorrect={false}
                  placeholderTextColor={colors.outline}
                />
                {currentQuestion.skippable && (
                  <Pressable onPress={handleSkip} style={styles.skipLink}>
                    <Text style={styles.skipLinkText}>Skip for now</Text>
                  </Pressable>
                )}
              </View>
            ) : (
              <View style={styles.options}>
                {currentQuestion.options?.map((option) => {
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
            )}
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
            <Button
              label={step === questions.length - 1 ? 'Complete' : 'Continue'}
              onPress={handleNext}
              disabled={!canContinue}
              icon={<Icon name={iconNames.arrowForward} size={20} color={colors.onPrimary} />}
            />
          </View>
        </KeyboardAvoidingView>
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
    width: 44,
    height: 44,
    borderRadius: 22,
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
    minWidth: 40,
    textAlign: 'right',
  },
  scroll: {
    paddingHorizontal: spacing.screenMargin,
    paddingTop: spacing.stackLg,
    paddingBottom: 20,
  },
  question: {
    ...typography.h1,
    fontSize: 26,
  },
  subtitle: {
    ...typography.bodyLg,
    color: colors.onSurfaceVariant,
    marginTop: spacing.stackSm,
    marginBottom: spacing.stackLg,
  },
  options: { gap: 12 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1.5,
    borderColor: colors.surfaceContainerHigh,
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
  inputWrap: { gap: 16 },
  textInput: {
    ...typography.bodyLg,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    minHeight: 56,
    ...shadow.soft,
  },
  textInputFocused: {
    borderColor: colors.primary,
  },
  skipLink: {
    alignSelf: 'center',
    paddingVertical: 8,
  },
  skipLinkText: {
    ...typography.bodySm,
    color: colors.primary,
    fontFamily: 'Inter_600SemiBold',
  },
  footer: {
    paddingHorizontal: spacing.screenMargin,
    paddingTop: 12,
  },
});
