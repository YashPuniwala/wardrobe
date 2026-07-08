import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { colors, radii, typography } from '@/constants/theme';
import { ReactNode } from 'react';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gold';
  size?: 'md' | 'lg';
  icon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  icon,
  loading,
  disabled,
  fullWidth = true,
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.98, { duration: 100 });
  };
  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 150 });
  };

  const bg =
    variant === 'primary'
      ? colors.primary
      : variant === 'secondary'
      ? colors.surfaceContainerLowest
      : variant === 'gold'
      ? colors.secondaryContainer
      : variant === 'outline'
      ? 'transparent'
      : 'transparent';

  const fg =
    variant === 'primary'
      ? colors.onPrimary
      : variant === 'secondary'
      ? colors.onSurface
      : variant === 'gold'
      ? colors.onSecondaryContainer
      : variant === 'outline'
      ? colors.primary
      : colors.primary;

  const borderColor =
    variant === 'outline' ? colors.primary : variant === 'secondary' ? colors.outlineVariant : 'transparent';

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.base,
        { backgroundColor: bg, borderColor, opacity: disabled ? 0.5 : 1 },
        animatedStyle,
        fullWidth && styles.fullWidth,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[styles.label, { color: fg }]}>{label}</Text>
        </>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: radii.pill,
    gap: 8,
    borderWidth: 1.5,
  },
  fullWidth: { width: '100%' },
  label: {
    ...typography.bodyLg,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
  },
});
