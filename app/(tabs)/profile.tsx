import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { colors, typography, radii, spacing, shadow } from '@/constants/theme';
import { Icon, iconNames } from '@/components/ui/Icon';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/store/useAuthStore';
import { useWardrobeStore } from '@/store/useWardrobeStore';
import { useOutfitStore } from '@/store/useOutfitStore';
import { useProfileStore } from '@/store/useProfileStore';
import { useQuizStore } from '@/store/useQuizStore';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const menuItems = [
  { id: 'palette', label: 'Your Palette', icon: iconNames.palette, screen: '/palette/your-palette' },
  { id: 'dressing', label: 'Dressing Room', icon: iconNames.checkroom, screen: '/dressing-room/o1' },
  { id: 'favorites', label: 'Favorites', icon: iconNames.favorite, screen: '/(tabs)/outfits' },
  { id: 'styleQuiz', label: 'Retake Style Quiz', icon: iconNames.autoAwesome, screen: '/onboarding/style-quiz' },
  { id: 'settings', label: 'Settings', icon: iconNames.settings, screen: '/profile/settings' },
  { id: 'help', label: 'Help & Support', icon: iconNames.help, screen: '/profile/help' },
  { id: 'logout', label: 'Log out', icon: iconNames.logout, screen: 'logout' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const { items } = useWardrobeStore();
  const { outfits } = useOutfitStore();
  const { name, email } = useProfileStore();

  const handleMenu = (item: typeof menuItems[0]) => {
    if (item.screen === 'logout') {
      logout();
      useProfileStore.getState().resetProfile();
      useQuizStore.getState().reset();
      router.replace('/');
    } else if (item.id === 'styleQuiz') {
      useAuthStore.getState().setHasCompletedQuiz(false);
      router.push('/onboarding/style-quiz');
    } else if (item.screen) {
      router.push(item.screen as any);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <Text style={styles.title}>Profile</Text>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Icon name={iconNames.person} size={36} color={colors.onPrimary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{name || 'Stylish User'}</Text>
              <Text style={styles.email}>{email || 'your@email.com'}</Text>
              <View style={styles.proBadge}>
                <Icon name={iconNames.star} size={12} color={colors.onSecondaryContainer} />
                <Text style={styles.proText}>FITS PRO</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsRow}>
            <StatBox label="Items" value={items.length} />
            <StatBox label="Outfits" value={outfits.length} />
            <StatBox label="Favorites" value={items.filter((i) => i.favorite).length + outfits.filter((o) => o.favorite).length} />
          </View>

          <View style={styles.menuList}>
            {menuItems.map((item) => (
              <MenuItem key={item.id} item={item} onPress={() => handleMenu(item)} />
            ))}
          </View>

          <Text style={styles.version}>Fits v1.0.0</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MenuItem({ item, onPress }: { item: typeof menuItems[0]; onPress: () => void }) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const isLogout = item.id === 'logout';

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => (scale.value = withTiming(0.98, { duration: 100 }))}
      onPressOut={() => (scale.value = withTiming(1, { duration: 150 }))}
      style={[styles.menuItem, animatedStyle]}
    >
      <View style={[styles.menuIcon, isLogout && { backgroundColor: colors.errorContainer }]}>
        <Icon
          name={item.icon as any}
          size={20}
          color={isLogout ? colors.error : colors.onSurface}
        />
      </View>
      <Text style={[styles.menuLabel, isLogout && { color: colors.error }]}>{item.label}</Text>
      {!isLogout && <Icon name={iconNames.chevronRight} size={20} color={colors.outline} />}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  safe: { flex: 1 },
  scroll: { paddingHorizontal: spacing.screenMargin, paddingBottom: 100 },
  header: { paddingTop: 8, paddingBottom: 16 },
  title: { ...typography.h1, fontSize: 28 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.xl,
    padding: 20,
    ...shadow.soft,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { ...typography.h2, fontSize: 18 },
  email: { ...typography.bodySm, color: colors.onSurfaceVariant, marginTop: 2 },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 9999,
    backgroundColor: colors.secondaryContainer,
  },
  proText: { ...typography.label, fontSize: 10, color: colors.onSecondaryContainer },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.lg,
    padding: 16,
    alignItems: 'center',
    ...shadow.soft,
  },
  statValue: { ...typography.h1, fontSize: 24 },
  statLabel: { ...typography.caption, color: colors.onSurfaceVariant, marginTop: 4 },
  menuList: { marginTop: 24, gap: 8 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.lg,
    padding: 16,
    ...shadow.soft,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { ...typography.bodyLg, flex: 1, fontFamily: 'Inter_500Medium' },
  version: {
    ...typography.caption,
    textAlign: 'center',
    color: colors.outline,
    marginTop: 24,
  },
});
