import { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, FlatList, Dimensions, Modal, TextInput, Image, RefreshControl, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, withDelay } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, radii, spacing, shadow } from '@/constants/theme';
import { Icon, iconNames } from '@/components/ui/Icon';
import { Pill } from '@/components/ui/Pill';
import { Card } from '@/components/ui/Card';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { GlassIconButton } from '@/components/ui/GlassIconButton';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import { useWardrobeStore, Garment } from '@/store/useWardrobeStore';
import { useOutfitStore, Outfit } from '@/store/useOutfitStore';
import { useNotificationsStore } from '@/store/useNotificationsStore';
import { useProfileStore } from '@/store/useProfileStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useWeather } from '@/hooks/useWeather';
import { launchGarmentCamera } from '@/utils/camera';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const quickActions = [
  { id: 'planner', label: 'Planner', icon: iconNames.calendarToday },
  { id: 'dressing', label: 'Dressing Room', icon: iconNames.checkroom },
  { id: 'tryon', label: 'AI Try On', icon: iconNames.bodyFat },
  { id: 'selfie', label: 'Selfie', icon: iconNames.photoCamera },
];

const notifications = [
  { id: '1', title: 'New outfit ideas', body: 'Your stylist has 3 new recommendations', time: '2h ago' },
  { id: '2', title: 'Weather alert', body: 'Rain expected tomorrow — plan accordingly', time: '5h ago' },
  { id: '3', title: 'Wardrobe tip', body: 'You haven\'t worn your camel coat in 30 days', time: '1d ago' },
];

const stylistTips = [
  { icon: iconNames.umbrella, text: 'Rain expected tomorrow. Layer your camel coat over a knit sweater for a cozy, weather-ready look.' },
  { icon: iconNames.wbSunny, text: 'It\'s a bright one today. A linen shirt with your wide-leg trousers will keep you cool and sharp.' },
  { icon: iconNames.autoAwesome, text: 'You haven\'t worn your camel coat in 30 days. Try pairing it with your cream knit sweater for a fresh look.' },
  { icon: iconNames.checkroom, text: 'Your silk blouse and pleated skirt are a perfect combo for an evening out — give them a spin.' },
  { icon: iconNames.calendarToday, text: 'Planning for the week? Your Sunday Brunch outfit is ready to go — just assign it to a day in the Planner.' },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function isNewGarment(createdAt: number) {
  return Date.now() - createdAt < 24 * 60 * 60 * 1000;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export default function WardrobeScreen() {
  const router = useRouter();
  const { items } = useWardrobeStore();
  const { outfits, toggleFavorite } = useOutfitStore();
  const { hasUnread, markRead } = useNotificationsStore();
  const { name } = useProfileStore();
  const { temperatureUnit } = useSettingsStore();
  const { weather, refresh: refreshWeather } = useWeather();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setTipIndex(Math.floor(Math.random() * stylistTips.length));
  }, []);

  const handleQuickAction = async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    switch (id) {
      case 'planner':
        router.push('/dressing-room/planner');
        break;
      case 'dressing':
        router.push('/dressing-room/o1');
        break;
      case 'tryon':
        router.push('/garment/try-on');
        break;
      case 'selfie': {
        const uri = await launchGarmentCamera();
        if (uri) {
          router.push({ pathname: '/garment/processing', params: { imageUri: uri } });
        }
        break;
      }
    }
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTipIndex(Math.floor(Math.random() * stylistTips.length));
    refreshWeather();
    setTimeout(() => setRefreshing(false), 1000);
  }, [refreshWeather]);

  const handleLongPressFavorite = (outfitId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleFavorite(outfitId);
  };

  const filteredItems = searchQuery
    ? items.filter((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : items;

  const greeting = getGreeting();
  const weatherTemp = temperatureUnit === 'C' ? Math.round((weather.temp - 32) * 5/9) : weather.temp;
  const weatherLabel = weather.condition === 'clear' ? 'Clear' : weather.condition === 'cloudy' ? 'Cloudy' : weather.condition === 'rain' ? 'Rain' : 'Cool';
  const weatherIconName = weather.icon === 'wbSunny' ? iconNames.wbSunny : weather.icon === 'umbrella' ? iconNames.umbrella : iconNames.wbSunny;

  const favoriteCount = items.filter((i) => i.favorite).length + outfits.filter((o) => o.favorite).length;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <AnimatedScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          onScroll={() => {}}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
          }
        >
          {/* Top bar with small wordmark */}
          <View style={[styles.topBar, styles.sectionContainer]}>
            <Text style={styles.wordmarkSmall}>Fits</Text>
            <View style={styles.topActions}>
              <Pressable onPress={() => setShowUpgrade(true)}>
                <Pill label="Upgrade" variant="gold" />
              </Pressable>
              <GlassIconButton
                icon={<Icon name={iconNames.search} size={20} color={colors.onSurface} />}
                onPress={() => setShowSearch(true)}
                size={40}
              />
              <GlassIconButton
                icon={<Icon name={iconNames.notifications} size={20} color={colors.onSurface} />}
                onPress={() => { markRead(); setShowNotifications(true); }}
                size={40}
                badge={hasUnread}
              />
            </View>
          </View>

          {/* Time-aware greeting + weather chip */}
          <View style={[styles.greetingRow, styles.sectionContainer]}>
            <View style={{ flex: 1 }}>
              {loading ? (
                <Skeleton width="60%" height={28} radius={8} />
              ) : (
                <Text style={styles.greeting}>{greeting}, {name || 'Stylish'}</Text>
              )}
            </View>
            {!loading && (
              <View style={styles.weatherChip}>
                <Icon name={weatherIconName} size={16} color={colors.primary} />
                <Text style={styles.weatherText}>{weatherTemp}°{temperatureUnit} · {weatherLabel}</Text>
              </View>
            )}
          </View>

          {/* Stats strip */}
          {loading ? (
            <View style={styles.sectionContainer}>
              <Skeleton width="100%" height={20} radius={8} style={{ marginTop: 8 }} />
            </View>
          ) : (
            <Text style={[styles.statsStrip, styles.sectionContainer]}>
              {items.length} items · {outfits.length} outfits · {favoriteCount} favorites
            </Text>
          )}

          {/* Empty wardrobe prompt */}
          {!loading && items.length === 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.emptyWardrobeCard}>
                <View style={styles.emptyWardrobeIcon}>
                  <Icon name={iconNames.addCircle} size={28} color={colors.primary} />
                </View>
                <Text style={styles.emptyWardrobeTitle}>Add your first garment</Text>
                <Text style={styles.emptyWardrobeSubtitle}>
                  Tap the Selfie quick action to photograph a piece and start building your wardrobe.
                </Text>
              </View>
            </View>
          )}

          {/* Hero cards with entrance animation */}
          <AnimatedSection delay={0}>
            {loading ? (
              <View style={[styles.heroSkeletonRow, styles.sectionContainer]}>
                <Skeleton width={SCREEN_WIDTH * 0.72} height={160} radius={24} />
                <Skeleton width={SCREEN_WIDTH * 0.72} height={160} radius={24} />
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.heroScroll}
              >
                <Pressable onPress={() => router.push('/create-outfit/choose-method')}>
                  <View style={[styles.heroCard, styles.heroCardPrimary]}>
                    <View style={styles.heroIconWrap}>
                      <Icon name={iconNames.autoAwesome} size={24} color={colors.onPrimary} />
                    </View>
                    <Text style={styles.heroTitle}>Make an outfit</Text>
                    <Text style={styles.heroSubtitle}>For any date, occasion and style</Text>
                    <View style={styles.heroArrow}>
                      <Icon name={iconNames.arrowForward} size={18} color={colors.onPrimary} />
                    </View>
                  </View>
                </Pressable>
                <Pressable onPress={() => router.push('/(tabs)/stylist')}>
                  <View style={[styles.heroCard, styles.heroCardSecondary]}>
                    <View style={[styles.heroIconWrap, { backgroundColor: colors.surfaceContainerHigh }]}>
                      <Icon name={iconNames.forum} size={24} color={colors.onSurface} />
                    </View>
                    <Text style={[styles.heroTitle, { color: colors.onSurface }]}>Rate my fit</Text>
                    <Text style={[styles.heroSubtitle, { color: colors.onSurfaceVariant }]}>
                      Get instant feedback on your current look
                    </Text>
                    <View style={[styles.heroArrow, { backgroundColor: 'rgba(34, 26, 24, 0.08)' }]}>
                      <Icon name={iconNames.arrowForward} size={18} color={colors.onSurface} />
                    </View>
                  </View>
                </Pressable>
              </ScrollView>
            )}
          </AnimatedSection>

          {/* Quick actions */}
          <AnimatedSection delay={100}>
            {loading ? (
              <View style={[styles.quickActionSkeletonRow, styles.sectionContainer]}>
                {[0,1,2,3].map((i) => <Skeleton key={i} width={64} height={64} radius={20} />)}
              </View>
            ) : (
              <View style={[styles.quickActions, styles.sectionContainer]}>
                {quickActions.map((action) => (
                  <QuickActionTile
                    key={action.id}
                    label={action.label}
                    iconName={action.icon}
                    onPress={() => handleQuickAction(action.id)}
                  />
                ))}
              </View>
            )}
          </AnimatedSection>

          {/* Recent Outfits */}
          <AnimatedSection delay={200}>
            <View style={[styles.sectionHeader, styles.sectionContainer]}>
              <Text style={styles.sectionTitle}>Recent Outfits</Text>
              <Pressable onPress={() => router.push('/(tabs)/outfits')}>
                <Text style={styles.viewAll}>View All</Text>
              </Pressable>
            </View>

            {loading ? (
              <View style={[styles.outfitScroll, styles.sectionContainer]}>
                {[0,1,2,3].map((i) => <SkeletonCard key={i} />)}
              </View>
            ) : outfits.length === 0 ? (
              <View style={styles.sectionContainer}>
                <View style={styles.emptyOutfitsCard}>
                  <View style={styles.emptyOutfitsIcon}>
                    <Icon name={iconNames.autoAwesome} size={28} color={colors.primary} />
                  </View>
                  <Text style={styles.emptyOutfitsTitle}>You haven't built a fit yet</Text>
                  <Text style={styles.emptyOutfitsSubtitle}>
                    Tap + to create your first look
                  </Text>
                  <Pressable onPress={() => router.push('/create-outfit/choose-method')} style={styles.emptyOutfitsButton}>
                    <Text style={styles.emptyOutfitsButtonText}>Create an outfit</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.outfitScroll}
              >
                <Pressable onPress={() => router.push('/create-outfit/choose-method')}>
                  <View style={styles.newFitTile}>
                    <View style={styles.newFitDashed}>
                      <Icon name={iconNames.add} size={28} color={colors.primary} />
                    </View>
                    <Text style={styles.newFitLabel}>New Fit</Text>
                  </View>
                </Pressable>
                {outfits.slice(0, 5).map((outfit) => (
                  <OutfitThumb
                    key={outfit.id}
                    outfit={outfit}
                    items={items}
                    onPress={() => router.push(`/dressing-room/${outfit.id}`)}
                    onLongPress={() => handleLongPressFavorite(outfit.id)}
                  />
                ))}
              </ScrollView>
            )}
          </AnimatedSection>

          {/* Stylist Tip */}
          <AnimatedSection delay={300}>
            {loading ? (
              <View style={styles.sectionContainer}>
                <Skeleton width="100%" height={72} radius={16} style={{ marginTop: 24 }} />
              </View>
            ) : (
              <Pressable onPress={() => router.push('/(tabs)/stylist')} style={styles.sectionContainer}>
                <View style={styles.stylistTip}>
                  <View style={styles.stylistTipIcon}>
                    <Icon name={stylistTips[tipIndex].icon} size={20} color={colors.secondary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.stylistTipTitle}>Stylist Tip</Text>
                    <Text style={styles.stylistTipBody}>
                      {stylistTips[tipIndex].text}
                    </Text>
                  </View>
                  <Icon name={iconNames.chevronRight} size={20} color={colors.onSurfaceVariant} />
                </View>
              </Pressable>
            )}
          </AnimatedSection>
        </AnimatedScrollView>
      </SafeAreaView>

      <BottomSheet visible={showUpgrade} onClose={() => setShowUpgrade(false)}>
        <UpgradeSheet onClose={() => setShowUpgrade(false)} />
      </BottomSheet>

      <BottomSheet visible={showNotifications} onClose={() => setShowNotifications(false)}>
        <NotificationsSheet notifications={notifications} />
      </BottomSheet>

      <Modal visible={showSearch} animationType="slide" transparent>
        <View style={styles.searchModal}>
          <SafeAreaView style={styles.searchSafe}>
            <View style={styles.searchHeader}>
              <Pressable onPress={() => setShowSearch(false)} style={styles.searchBack}>
                <Icon name={iconNames.arrowBack} size={22} color={colors.onSurface} />
              </Pressable>
              <TextInput
                style={styles.searchInput}
                placeholder="Search your wardrobe…"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
            </View>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
              <View style={styles.searchGrid}>
                {filteredItems.map((item) => (
                  <View key={item.id} style={styles.searchItem}>
                    <View style={styles.searchItemImage}>
                      <Image
                        source={{ uri: item.imageUri }}
                        style={styles.searchItemImageContent}
                        resizeMode="cover"
                      />
                      {isNewGarment(item.createdAt) && <NewBadge />}
                    </View>
                    <Text style={styles.searchItemName}>{item.name}</Text>
                  </View>
                ))}
                {filteredItems.length === 0 && (
                  <Text style={styles.searchEmpty}>No items found</Text>
                )}
              </View>
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}

function NewBadge() {
  return (
    <View style={styles.newBadge}>
      <Text style={styles.newBadgeText}>New</Text>
    </View>
  );
}

function AnimatedSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    translateY.value = withDelay(delay, withSpring(0, { damping: 16, stiffness: 120 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      {children}
    </Animated.View>
  );
}

function QuickActionTile({
  label,
  iconName,
  onPress,
}: {
  label: string;
  iconName: any;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => (scale.value = withTiming(0.95, { duration: 100 }))}
      onPressOut={() => (scale.value = withTiming(1, { duration: 150 }))}
      style={[styles.quickAction, animatedStyle]}
    >
      <View style={styles.quickActionIcon}>
        <Icon name={iconName} size={24} color={colors.primary} />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </AnimatedPressable>
  );
}

function OutfitThumb({ outfit, items, onPress, onLongPress }: { outfit: Outfit; items: Garment[]; onPress: () => void; onLongPress: () => void }) {
  const top = items.find((i) => i.id === outfit.slots.top);
  const bottom = items.find((i) => i.id === outfit.slots.bottom);
  const scale = useSharedValue(1);
  const heartScale = useSharedValue(0);
  const heartOpacity = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
    opacity: heartOpacity.value,
  }));

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    heartScale.value = withSpring(1.2, { damping: 8, stiffness: 200 });
    heartOpacity.value = withTiming(1, { duration: 100 });
    setTimeout(() => {
      heartScale.value = withTiming(0, { duration: 300 });
      heartOpacity.value = withTiming(0, { duration: 300 });
    }, 600);
    onLongPress();
  };

  return (
    <Pressable
      onPress={onPress}
      onLongPress={handleLongPress}
      delayLongPress={400}
    >
      <Animated.View style={[styles.outfitThumb, animatedStyle]}>
        <View style={styles.outfitThumbImage}>
          {top && (
            <Image source={{ uri: top.imageUri }} style={styles.outfitThumbLayerTop} resizeMode="cover" />
          )}
          {bottom && (
            <Image source={{ uri: bottom.imageUri }} style={styles.outfitThumbLayerBottom} resizeMode="cover" />
          )}
          {outfit.favorite && (
            <View style={styles.outfitFavBadge}>
              <Icon name={iconNames.favorite} size={12} color={colors.onPrimary} />
            </View>
          )}
          <Animated.View style={[styles.heartBurst, heartStyle]} pointerEvents="none">
            <Icon name={iconNames.favorite} size={32} color={colors.primary} />
          </Animated.View>
        </View>
        <Text style={styles.outfitThumbName} numberOfLines={1}>
          {outfit.name}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

function UpgradeSheet({ onClose }: { onClose: () => void }) {
  return (
    <View style={styles.sheetContent}>
      <View style={styles.upgradeHeader}>
        <View style={styles.upgradeBadge}>
          <Icon name={iconNames.star} size={16} color={colors.onSecondaryContainer} />
          <Text style={styles.upgradeBadgeText}>FITS PRO</Text>
        </View>
        <Pressable onPress={onClose} style={styles.sheetClose}>
          <Icon name={iconNames.close} size={20} color={colors.onSurface} />
        </Pressable>
      </View>
      <Text style={styles.upgradeTitle}>Unlock your full wardrobe</Text>
      <Text style={styles.upgradeSubtitle}>
        Get unlimited outfits, AI styling, weather-based suggestions, and more.
      </Text>
      <View style={styles.upgradeFeatures}>
        {['Unlimited outfit creation', 'AI Stylist recommendations', 'Weather-aware suggestions', 'Color palette analysis'].map(
          (feature) => (
            <View key={feature} style={styles.upgradeFeature}>
              <Icon name={iconNames.checkCircle} size={20} color={colors.tertiary} />
              <Text style={styles.upgradeFeatureText}>{feature}</Text>
            </View>
          )
        )}
      </View>
      <View style={styles.upgradePriceRow}>
        <Text style={styles.upgradePrice}>$9.99</Text>
        <Text style={styles.upgradePricePeriod}>/month</Text>
      </View>
      <Pressable onPress={onClose} style={styles.upgradeButton}>
        <Text style={styles.upgradeButtonText}>Start free trial</Text>
      </Pressable>
    </View>
  );
}

function NotificationsSheet({ notifications }: { notifications: any[] }) {
  return (
    <View style={styles.sheetContent}>
      <Text style={styles.sheetTitle}>Notifications</Text>
      {notifications.map((n) => (
        <View key={n.id} style={styles.notificationItem}>
          <View style={styles.notificationDot} />
          <View style={{ flex: 1 }}>
            <Text style={styles.notificationTitle}>{n.title}</Text>
            <Text style={styles.notificationBody}>{n.body}</Text>
            <Text style={styles.notificationTime}>{n.time}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  safe: { flex: 1 },
  scroll: { paddingBottom: 24 },
  sectionContainer: {
    paddingHorizontal: spacing.screenMargin,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 12,
  },
  wordmarkSmall: { ...typography.h2, fontSize: 18, color: colors.onSurfaceVariant },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  greeting: { ...typography.h1, fontSize: 26 },
  weatherChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceContainerLow,
  },
  weatherText: { ...typography.caption, color: colors.onSurfaceVariant, fontFamily: 'Inter_600SemiBold' },
  statsStrip: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    marginTop: 12,
  },
  emptyWardrobeCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.xl,
    padding: 24,
    alignItems: 'center',
    marginTop: 16,
    ...shadow.soft,
  },
  emptyWardrobeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyWardrobeTitle: { ...typography.h2, fontSize: 18 },
  emptyWardrobeSubtitle: { ...typography.bodySm, color: colors.onSurfaceVariant, textAlign: 'center', marginTop: 6 },
  heroSkeletonRow: { flexDirection: 'row', gap: 12, paddingBottom: 8 },
  heroScroll: { paddingHorizontal: spacing.screenMargin, gap: 12, paddingBottom: 8 },
  heroCard: {
    width: SCREEN_WIDTH * 0.72,
    borderRadius: radii.xl,
    padding: 24,
    minHeight: 160,
    justifyContent: 'space-between',
    ...shadow.soft,
  },
  heroCardPrimary: { backgroundColor: colors.primary },
  heroCardSecondary: { backgroundColor: colors.surfaceContainerLow },
  heroIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: { ...typography.h2, color: colors.onPrimary, marginTop: 12 },
  heroSubtitle: { ...typography.bodySm, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  heroArrow: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionSkeletonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, gap: 12 },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  quickAction: { alignItems: 'center', flex: 1 },
  quickActionIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
  quickActionLabel: {
    ...typography.caption,
    fontFamily: 'Inter_500Medium',
    marginTop: 8,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 12,
  },
  sectionTitle: { ...typography.h2, fontSize: 18 },
  viewAll: { ...typography.caption, color: colors.primary, fontFamily: 'Inter_600SemiBold' },
  outfitScroll: { flexDirection: 'row', gap: 12, paddingBottom: 8, paddingHorizontal: spacing.screenMargin },
  emptyOutfitsCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.xl,
    padding: 28,
    alignItems: 'center',
    ...shadow.soft,
  },
  emptyOutfitsIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyOutfitsTitle: { ...typography.h2, fontSize: 18 },
  emptyOutfitsSubtitle: { ...typography.bodySm, color: colors.onSurfaceVariant, marginTop: 6 },
  emptyOutfitsButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 16,
  },
  emptyOutfitsButtonText: { ...typography.bodyLg, fontFamily: 'Inter_600SemiBold', color: colors.onPrimary },
  newFitTile: { alignItems: 'center', gap: 8 },
  newFitDashed: {
    width: 100,
    height: 120,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerLow,
  },
  newFitLabel: { ...typography.caption, color: colors.primary, fontFamily: 'Inter_600SemiBold' },
  outfitThumb: { gap: 8 },
  outfitThumbImage: {
    width: 100,
    height: 120,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceContainerLowest,
    overflow: 'hidden',
    ...shadow.soft,
  },
  outfitThumbLayerTop: { width: '100%', height: '55%' },
  outfitThumbLayerBottom: { width: '100%', height: '45%' },
  outfitFavBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(150, 70, 60, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartBurst: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -16,
    marginTop: -16,
  },
  outfitThumbName: { ...typography.caption, width: 100, textAlign: 'center' },
  stylistTip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.secondaryContainer,
    borderRadius: radii.lg,
    padding: 16,
    marginTop: 24,
  },
  stylistTipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stylistTipTitle: { ...typography.label, color: colors.onSecondaryContainer, marginBottom: 2 },
  stylistTipBody: { ...typography.bodySm, color: colors.onSecondaryContainer, flex: 1 },
  newBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  newBadgeText: {
    ...typography.label,
    fontSize: 9,
    color: colors.onPrimary,
  },
  sheetContent: { padding: 20 },
  sheetTitle: { ...typography.h2, marginBottom: 16 },
  sheetClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  upgradeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    backgroundColor: colors.secondaryContainer,
  },
  upgradeBadgeText: { ...typography.label, color: colors.onSecondaryContainer },
  upgradeTitle: { ...typography.h1, fontSize: 22 },
  upgradeSubtitle: { ...typography.bodySm, color: colors.onSurfaceVariant, marginTop: 8 },
  upgradeFeatures: { gap: 12, marginTop: 20 },
  upgradeFeature: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  upgradeFeatureText: { ...typography.bodyLg, fontFamily: 'Inter_500Medium' },
  upgradePriceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 24, gap: 4 },
  upgradePrice: { ...typography.display, fontSize: 36 },
  upgradePricePeriod: { ...typography.bodyLg, color: colors.onSurfaceVariant },
  upgradeButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  upgradeButtonText: { ...typography.bodyLg, fontFamily: 'Inter_600SemiBold', color: colors.onPrimary },
  notificationItem: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 6,
  },
  notificationTitle: { ...typography.bodyLg, fontFamily: 'Inter_600SemiBold' },
  notificationBody: { ...typography.bodySm, color: colors.onSurfaceVariant, marginTop: 2 },
  notificationTime: { ...typography.caption, color: colors.outline, marginTop: 4 },
  searchModal: { flex: 1, backgroundColor: colors.background },
  searchSafe: { flex: 1 },
  searchHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 12 },
  searchBack: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: {
    flex: 1,
    ...typography.bodyLg,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.pill,
  },
  searchGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  searchItem: { width: '31%', alignItems: 'center' },
  searchItemImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceContainerLow,
    overflow: 'hidden',
  },
  searchItemImageContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  searchItemName: { ...typography.caption, marginTop: 4, textAlign: 'center' },
  searchEmpty: { ...typography.bodyLg, color: colors.onSurfaceVariant, textAlign: 'center', marginTop: 40 },
});
