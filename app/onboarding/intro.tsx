import { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, radii, spacing, shadow } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { useProfileStore } from '@/store/useProfileStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Your closet, reimagined',
    subtitle: 'Photograph every garment and let Fits organize your wardrobe into a beautiful, searchable collection.',
    image: Image.resolveAssetSource(require('@/assets/images/men-jeans1.png')).uri,
  },
  {
    id: '2',
    title: 'AI-styled outfits, instantly',
    subtitle: 'Chat with your personal AI Stylist to get outfit ideas pulled straight from the clothes you already own.',
    image: Image.resolveAssetSource(require('@/assets/images/men-top1.webp')).uri,
  },
  {
    id: '3',
    title: 'Plan your week in seconds',
    subtitle: 'Lay out your looks day by day so every morning starts with a ready-to-go fit.',
    image: Image.resolveAssetSource(require('@/assets/images/men-shoes1.png')).uri,
  },
];

export default function IntroCarousel() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { markIntroSeen } = useProfileStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    markIntroSeen();
    router.replace('/');
  };

  const handleGetStarted = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    markIntroSeen();
    router.replace('/');
  };

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (index !== currentIndex) {
      setCurrentIndex(index);
      Haptics.selectionAsync();
    }
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      handleGetStarted();
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={[styles.topBar, { paddingTop: 8 }]}>
          <View style={{ width: 40 }} />
          <View style={styles.dots}>
            {slides.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === currentIndex && styles.dotActive]}
              />
            ))}
          </View>
          <Pressable onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>

        <FlatList
          ref={flatListRef}
          data={slides}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.slide}>
              <View style={styles.imageWrap}>
                <Image source={{ uri: item.image }} style={styles.heroImage} resizeMode="cover" />
                <View style={styles.imageOverlay} />
              </View>
              <View style={styles.textWrap}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.subtitle}</Text>
              </View>
            </View>
          )}
        />

        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          {currentIndex === slides.length - 1 ? (
            <Button label="Get Started" onPress={handleGetStarted} />
          ) : (
            <Button label="Continue" onPress={handleNext} />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenMargin,
    paddingBottom: 16,
  },
  dots: { flexDirection: 'row', gap: 8 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.outlineVariant,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  skipButton: { width: 40, alignItems: 'flex-end' },
  skipText: {
    ...typography.label,
    color: colors.onSurfaceVariant,
  },
  slide: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    paddingHorizontal: spacing.screenMargin,
  },
  imageWrap: {
    width: SCREEN_WIDTH - spacing.screenMargin * 2,
    height: SCREEN_WIDTH * 1.1,
    borderRadius: radii.xl,
    overflow: 'hidden',
    ...shadow.soft,
  },
  heroImage: { width: '100%', height: '100%' },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(34, 26, 24, 0.08)',
  },
  textWrap: { marginTop: 32, alignItems: 'center' },
  title: {
    ...typography.h1,
    fontSize: 26,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyLg,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: spacing.screenMargin,
    paddingTop: 16,
  },
});
