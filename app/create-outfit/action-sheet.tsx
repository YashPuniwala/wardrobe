import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, radii, spacing, shadow } from '@/constants/theme';
import { Icon, iconNames } from '@/components/ui/Icon';
import { useOutfitStore } from '@/store/useOutfitStore';
import { launchGarmentCamera } from '@/utils/camera';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const actions = [
  {
    id: 'add-clothes',
    title: 'Add clothes',
    subtitle: 'Photograph or import a new garment',
    icon: iconNames.photoCamera,
  },
  {
    id: 'create-outfit',
    title: 'Create outfit',
    subtitle: 'Build a new look from your wardrobe',
    icon: iconNames.autoAwesome,
  },
  {
    id: 'chat-stylist',
    title: 'Chat with AI stylist',
    subtitle: 'Get personalized outfit recommendations',
    icon: iconNames.forum,
  },
];

export default function ActionSheetScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { clearDraft } = useOutfitStore();

  const handleAction = async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    switch (id) {
      case 'add-clothes':
        router.push('/create-outfit/add-clothes');
        break;
      case 'create-outfit':
        clearDraft();
        router.push('/create-outfit/add-outfit');
        break;
      case 'chat-stylist':
        router.push('/(tabs)/stylist');
        break;
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <Pressable style={styles.dismissArea} onPress={() => router.back()} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>Create</Text>
          <View style={styles.actions}>
            {actions.map((action) => (
              <ActionRow key={action.id} action={action} onPress={() => handleAction(action.id)} />
            ))}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function ActionRow({
  action,
  onPress,
}: {
  action: typeof actions[0];
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => (scale.value = withTiming(0.98, { duration: 100 }))}
      onPressOut={() => (scale.value = withTiming(1, { duration: 150 }))}
      style={[styles.actionRow, animatedStyle]}
    >
      <View style={styles.actionIcon}>
        <Icon name={action.icon} size={24} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.actionTitle}>{action.title}</Text>
        <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
      </View>
      <Icon name={iconNames.chevronRight} size={20} color={colors.outline} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'rgba(34, 26, 24, 0.4)' },
  safe: { flex: 1, justifyContent: 'flex-end' },
  dismissArea: { flex: 1 },
  sheet: {
    backgroundColor: colors.surfaceContainerLowest,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingTop: 12,
    paddingHorizontal: 20,
    ...shadow.soft,
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  handle: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.outlineVariant,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: { ...typography.h2, fontSize: 18, marginBottom: 16 },
  actions: { gap: 8 },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceContainerLow,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: { ...typography.bodyLg, fontFamily: 'Inter_600SemiBold' },
  actionSubtitle: { ...typography.caption, color: colors.onSurfaceVariant, marginTop: 2 },
});
