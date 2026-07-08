import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { colors, typography, radii, spacing, shadow } from '@/constants/theme';
import { Icon, iconNames } from '@/components/ui/Icon';
import { Pill } from '@/components/ui/Pill';
import { useWardrobeStore } from '@/store/useWardrobeStore';
import { useOutfitStore } from '@/store/useOutfitStore';
import { launchGarmentCamera } from '@/utils/camera';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const methods = [
  {
    id: 'photo',
    title: 'Take Photo',
    description: 'Capture a new garment with your camera',
    icon: iconNames.photoCamera,
  },
  {
    id: 'wardrobe',
    title: 'Choose from Wardrobe',
    description: 'Build an outfit from your existing items',
    icon: iconNames.checkroom,
  },
  {
    id: 'ai',
    title: 'AI Generate Outfit',
    description: 'Let AI curate a look for you',
    icon: iconNames.autoAwesome,
  },
];

export default function ChooseMethodScreen() {
  const router = useRouter();
  const { addItem } = useWardrobeStore();
  const { clearDraft } = useOutfitStore();
  const [loading, setLoading] = useState(false);

  const handleMethod = async (methodId: string) => {
    if (methodId === 'photo') {
      const uri = await launchGarmentCamera();
      if (uri) {
        router.push({
          pathname: '/garment/processing',
          params: { imageUri: uri, from: 'create' },
        });
      }
    } else if (methodId === 'wardrobe') {
      clearDraft();
      router.push('/create-outfit/step-1');
    } else if (methodId === 'ai') {
      setLoading(true);
      clearDraft();
      const aiPicks = ['g1', 'g2', 'g3', 'g7'];
      setTimeout(() => {
        setLoading(false);
        router.push('/create-outfit/step-1?ai=1');
      }, 1500);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.closeButton}>
            <Icon name={iconNames.close} size={22} color={colors.onSurface} />
          </Pressable>
          <Text style={styles.title}>Create Outfit</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.subtitle}>Choose how you would like to start</Text>

          <View style={styles.methods}>
            {methods.map((method) => (
              <MethodCard
                key={method.id}
                method={method}
                onPress={() => handleMethod(method.id)}
                loading={loading && method.id === 'ai'}
              />
            ))}
          </View>

          <View style={styles.aiTag}>
            <Icon name={iconNames.autoAwesomeMotion} size={14} color={colors.onTertiaryContainer} />
            <Text style={styles.aiTagText}>AI-curated suggestions powered by your wardrobe</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function MethodCard({
  method,
  onPress,
  loading,
}: {
  method: typeof methods[0];
  onPress: () => void;
  loading?: boolean;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => (scale.value = withTiming(0.98, { duration: 100 }))}
      onPressOut={() => (scale.value = withTiming(1, { duration: 150 }))}
      disabled={loading}
      style={[styles.methodCard, animatedStyle]}
    >
      <View style={styles.methodIcon}>
        <Icon name={method.icon as any} size={24} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.methodTitle}>{method.title}</Text>
        <Text style={styles.methodDescription}>{method.description}</Text>
      </View>
      {loading ? (
        <Text style={styles.loadingText}>…</Text>
      ) : (
        <Icon name={iconNames.chevronRight} size={20} color={colors.outline} />
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenMargin,
    paddingTop: 8,
    paddingBottom: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...typography.h2 },
  scroll: { paddingHorizontal: spacing.screenMargin, paddingBottom: 40 },
  subtitle: { ...typography.bodyLg, color: colors.onSurfaceVariant, marginBottom: 24 },
  methods: { gap: 12 },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.lg,
    padding: 16,
    ...shadow.soft,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodTitle: { ...typography.bodyLg, fontFamily: 'Inter_600SemiBold' },
  methodDescription: { ...typography.bodySm, color: colors.onSurfaceVariant, marginTop: 2 },
  loadingText: { ...typography.h2, color: colors.primary },
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    backgroundColor: colors.tertiaryContainer,
    alignSelf: 'center',
  },
  aiTagText: {
    ...typography.caption,
    color: colors.onTertiaryContainer,
    fontFamily: 'Inter_500Medium',
  },
});
