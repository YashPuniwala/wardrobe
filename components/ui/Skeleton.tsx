import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { radii } from '@/constants/theme';
import { useEffect } from 'react';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  radius?: number;
  style?: any;
}

export function Skeleton({ width = '100%', height = 16, radius, style }: SkeletonProps) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.5 + shimmer.value * 0.5,
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: radius || radii.md,
          backgroundColor: '#F3F2F0',
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

export function SkeletonCard() {
  return (
    <View style={skeletonStyles.card}>
      <Skeleton width="100%" height={120} radius={16} />
      <Skeleton width="80%" height={14} style={{ marginTop: 8 }} />
      <Skeleton width="50%" height={12} style={{ marginTop: 4 }} />
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  card: {
    width: 140,
  },
});
