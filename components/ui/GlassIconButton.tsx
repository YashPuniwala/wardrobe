import { Pressable, StyleSheet, View, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { colors, radii, typography, shadow } from '@/constants/theme';
import { ReactNode } from 'react';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface GlassIconButtonProps {
  icon: ReactNode;
  onPress?: () => void;
  size?: number;
  badge?: boolean;
  label?: string;
  bg?: string;
}

export function GlassIconButton({ icon, onPress, size = 44, badge, label, bg }: GlassIconButtonProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => (scale.value = withTiming(0.95, { duration: 100 }))}
      onPressOut={() => (scale.value = withTiming(1, { duration: 150 }))}
      style={[
        styles.base,
        { width: size, height: size, backgroundColor: bg || colors.surfaceContainerLowest },
        animatedStyle,
      ]}
    >
      {icon}
      {badge && <View style={styles.badge} />}
      {label && <Text style={styles.label}>{label}</Text>}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    borderWidth: 1.5,
    borderColor: colors.surfaceContainerLowest,
  },
  label: {
    ...typography.label,
  },
});
