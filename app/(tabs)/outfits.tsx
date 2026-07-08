import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { colors, typography, radii, spacing, shadow } from '@/constants/theme';
import { Icon, iconNames } from '@/components/ui/Icon';
import { Pill } from '@/components/ui/Pill';
import { useOutfitStore, Outfit } from '@/store/useOutfitStore';
import { useWardrobeStore } from '@/store/useWardrobeStore';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const filters = [
  { id: 'all', label: 'All' },
  { id: 'favorites', label: 'Favorites' },
  { id: 'recent', label: 'Recent' },
];

export default function OutfitsScreen() {
  const router = useRouter();
  const { outfits, toggleFavorite } = useOutfitStore();
  const { items } = useWardrobeStore();
  const [filter, setFilter] = useState('all');

  const filteredOutfits = outfits.filter((o) => {
    if (filter === 'favorites') return o.favorite;
    if (filter === 'recent') return Date.now() - o.createdAt < 200000;
    return true;
  });

  const getGarment = (id?: string) => items.find((i) => i.id === id);

  const renderItem = ({ item }: { item: Outfit }) => {
    const top = getGarment(item.slots.top);
    const bottom = getGarment(item.slots.bottom);
    const shoes = getGarment(item.slots.shoes);
    const accessory = getGarment(item.slots.accessory);

    return (
      <OutfitCard
        outfit={item}
        top={top}
        bottom={bottom}
        shoes={shoes}
        accessory={accessory}
        onPress={() => router.push(`/dressing-room/${item.id}`)}
        onFavorite={() => toggleFavorite(item.id)}
      />
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>Outfits</Text>
          <Pressable onPress={() => router.push('/create-outfit/action-sheet')} style={styles.addButton}>
            <Icon name={iconNames.add} size={24} color={colors.onPrimary} />
          </Pressable>
        </View>

        <FlatList
          horizontal
          data={filters}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          renderItem={({ item }) => (
            <Pill
              label={item.label}
              active={filter === item.id}
              onPress={() => setFilter(item.id)}
            />
          )}
        />

        <FlatList
          data={filteredOutfits}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.gridRow}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </View>
  );
}

function OutfitCard({
  outfit,
  top,
  bottom,
  shoes,
  accessory,
  onPress,
  onFavorite,
}: {
  outfit: Outfit;
  top?: any;
  bottom?: any;
  shoes?: any;
  accessory?: any;
  onPress: () => void;
  onFavorite: () => void;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => (scale.value = withTiming(0.97, { duration: 100 }))}
      onPressOut={() => (scale.value = withTiming(1, { duration: 150 }))}
      style={[styles.card, animatedStyle]}
    >
      <View style={styles.cardImage}>
        {outfit.coverImage ? (
          <Image source={{ uri: outfit.coverImage }} style={styles.cardCoverImage} resizeMode="cover" />
        ) : (
          <>
            {top && <View style={[styles.cardLayer, { backgroundColor: top.color, height: '35%' }]} />}
            {bottom && (
              <View style={[styles.cardLayer, { backgroundColor: bottom.color, height: '30%' }]} />
            )}
            {shoes && (
              <View style={[styles.cardLayer, { backgroundColor: shoes.color, height: '15%' }]} />
            )}
            {accessory && (
              <View style={[styles.cardLayer, { backgroundColor: accessory.color, height: '10%' }]} />
            )}
          </>
        )}
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName} numberOfLines={1}>{outfit.name}</Text>
        {outfit.occasion && <Text style={styles.cardOccasion}>{outfit.occasion}</Text>}
      </View>
      <Pressable onPress={onFavorite} style={styles.heartIcon} hitSlop={8}>
        <Icon
          name={outfit.favorite ? iconNames.favorite : iconNames.favoriteBorder}
          size={18}
          color={outfit.favorite ? colors.primary : colors.outline}
        />
      </Pressable>
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
    paddingBottom: 12,
  },
  title: { ...typography.h1, fontSize: 28 },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: { paddingHorizontal: spacing.screenMargin, gap: 8, paddingBottom: 12 },
  grid: { paddingHorizontal: spacing.screenMargin, paddingBottom: 100 },
  gridRow: { gap: 12, marginBottom: 12 },
  card: {
    flex: 1,
    maxWidth: '48%',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.lg,
    overflow: 'hidden',
    ...shadow.soft,
  },
  cardImage: {
    width: '100%',
    aspectRatio: 0.85,
    backgroundColor: colors.surfaceContainer,
    overflow: 'hidden',
  },
  cardCoverImage: { width: '100%', height: '100%' },
  cardLayer: { width: '100%' },
  cardInfo: { padding: 12 },
  cardName: { ...typography.bodyLg, fontFamily: 'Inter_600SemiBold' },
  cardOccasion: { ...typography.caption, color: colors.onSurfaceVariant, marginTop: 2 },
  heartIcon: { position: 'absolute', top: 8, right: 8 },
});
