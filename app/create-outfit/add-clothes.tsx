import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Image, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { colors, typography, radii, spacing, shadow } from '@/constants/theme';
import { Icon, iconNames } from '@/components/ui/Icon';
import { useWardrobeStore, GarmentCategory } from '@/store/useWardrobeStore';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const methods = [
  { id: 'library', label: 'Library', icon: iconNames.gridView, description: 'Choose from photos' },
  { id: 'camera', label: 'Camera', icon: iconNames.photoCamera, description: 'Take a new photo' },
  { id: 'extract', label: 'Extract', icon: iconNames.autoAwesome, description: 'Coming soon' },
  { id: 'receipt', label: 'Receipt', icon: iconNames.receipt, description: 'Coming soon' },
];

export default function AddClothesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addItem } = useWardrobeStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const handleMethod = async (methodId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (methodId === 'camera') {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        router.push({ pathname: '/garment/processing', params: { imageUri: uri, from: 'create' } });
      }
    } else if (methodId === 'library') {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        router.push({ pathname: '/garment/processing', params: { imageUri: uri, from: 'create' } });
      }
    } else {
      setToast('Coming soon!');
      setTimeout(() => setToast(null), 2000);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <Icon name={iconNames.arrowBack} size={22} color={colors.onSurface} />
          </Pressable>
          <Text style={styles.title}>Add Clothes</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
          <View style={styles.searchWrap}>
            <Icon name={iconNames.search} size={20} color={colors.outline} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search your wardrobe…"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <Text style={styles.sectionLabel}>METHODS</Text>
          <View style={styles.methodsGrid}>
            {methods.map((method) => (
              <MethodTile key={method.id} method={method} onPress={() => handleMethod(method.id)} />
            ))}
          </View>

          {toast && (
            <View style={styles.toast}>
              <Text style={styles.toastText}>{toast}</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function MethodTile({
  method,
  onPress,
}: {
  method: typeof methods[0];
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => (scale.value = withTiming(0.96, { duration: 100 }))}
      onPressOut={() => (scale.value = withTiming(1, { duration: 150 }))}
      style={[styles.methodTile, animatedStyle]}
    >
      <View style={styles.methodIcon}>
        <Icon name={method.icon} size={24} color={colors.primary} />
      </View>
      <Text style={styles.methodLabel}>{method.label}</Text>
      <Text style={styles.methodDescription}>{method.description}</Text>
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
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...typography.h2 },
  scroll: { paddingHorizontal: spacing.screenMargin },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.pill,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
  },
  searchInput: { flex: 1, ...typography.bodyLg },
  sectionLabel: {
    ...typography.label,
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
    marginBottom: 12,
  },
  methodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  methodTile: {
    width: '48%',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.lg,
    padding: 16,
    ...shadow.soft,
  },
  methodIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  methodLabel: { ...typography.bodyLg, fontFamily: 'Inter_600SemiBold' },
  methodDescription: { ...typography.caption, color: colors.onSurfaceVariant, marginTop: 4 },
  toast: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignSelf: 'center',
    backgroundColor: colors.inverseSurface,
    borderRadius: radii.pill,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  toastText: { ...typography.bodySm, color: colors.inverseOnSurface, fontFamily: 'Inter_600SemiBold' },
});
