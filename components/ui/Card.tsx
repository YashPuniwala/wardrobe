import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { colors, radii, shadow } from '@/constants/theme';
import { ReactNode } from 'react';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  style?: any;
  variant?: 'default' | 'elevated' | 'flat';
}

export function Card({ children, onPress, style, variant = 'default' }: CardProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const bg =
    variant === 'flat'
      ? colors.surfaceContainer
      : variant === 'elevated'
      ? colors.surfaceContainerLowest
      : colors.surfaceContainerLowest;

  if (!onPress) {
    return <View style={[styles.base, { backgroundColor: bg }, style]}>{children}</View>;
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => (scale.value = withTiming(0.98, { duration: 100 }))}
      onPressOut={() => (scale.value = withTiming(1, { duration: 150 }))}
      style={[styles.base, { backgroundColor: bg }, shadow.soft, animatedStyle, style]}
    >
      {children}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.xl,
    padding: 16,
    overflow: 'hidden',
  },
});
