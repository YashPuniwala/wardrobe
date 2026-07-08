import { Pressable, Text, StyleSheet, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { colors, radii, typography } from '@/constants/theme';
import { ReactNode } from 'react';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PillProps {
  label: string;
  onPress?: () => void;
  active?: boolean;
  icon?: ReactNode;
  variant?: 'default' | 'gold' | 'tertiary';
}

export function Pill({ label, onPress, active, icon, variant = 'default' }: PillProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const bg = active
    ? colors.primary
    : variant === 'gold'
    ? colors.secondaryContainer
    : variant === 'tertiary'
    ? colors.tertiaryContainer
    : colors.surfaceContainerLow;

  const fg = active
    ? colors.onPrimary
    : variant === 'gold'
    ? colors.onSecondaryContainer
    : variant === 'tertiary'
    ? colors.onTertiaryContainer
    : colors.onSurfaceVariant;

  if (!onPress) {
    return (
      <View style={[styles.base, { backgroundColor: bg }]}>
        {icon}
        <Text style={[styles.label, { color: fg }]}>{label}</Text>
      </View>
    );
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => (scale.value = withTiming(0.96, { duration: 100 }))}
      onPressOut={() => (scale.value = withTiming(1, { duration: 150 }))}
      style={[styles.base, { backgroundColor: bg }, animatedStyle]}
    >
      {icon}
      <Text style={[styles.label, { color: fg }]}>{label}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radii.pill,
    gap: 6,
  },
  label: {
    ...typography.caption,
    fontFamily: 'Inter_600SemiBold',
  },
});
