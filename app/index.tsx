import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Image, Modal, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSpring, Easing } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, typography, radii, spacing, shadow } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { Icon, iconNames } from '@/components/ui/Icon';
import { useAuthStore } from '@/store/useAuthStore';
import { useProfileStore } from '@/store/useProfileStore';
import { useQuizStore } from '@/store/useQuizStore';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HERO_IMAGE = Image.resolveAssetSource(require('@/assets/images/men-top1.webp')).uri;

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login, hasCompletedQuiz } = useAuthStore();
  const { hasSeenIntro } = useProfileStore();
  const [loading, setLoading] = useState<string | null>(null);
  const [showLegal, setShowLegal] = useState<'terms' | 'privacy' | null>(null);

  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const wordmarkOpacity = useSharedValue(0);
  const wordmarkTranslateY = useSharedValue(8);
  const shimmer = useSharedValue(0);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + shimmer.value * 0.6,
  }));

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const wordmarkAnimatedStyle = useAnimatedStyle(() => ({
    opacity: wordmarkOpacity.value,
    transform: [{ translateY: wordmarkTranslateY.value }],
  }));

  useEffect(() => {
    if (!hasSeenIntro) {
      router.replace('/onboarding/intro');
      return;
    }

    logoScale.value = withSpring(1, { damping: 14, stiffness: 150 });
    logoOpacity.value = withTiming(1, { duration: 400 });

    wordmarkOpacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) });
    wordmarkTranslateY.value = withSpring(0, { damping: 16, stiffness: 120 });

    shimmer.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const handleAuth = (method: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(method);
    setTimeout(() => {
      useQuizStore.getState().reset();
      const profileStore = useProfileStore.getState();
      profileStore.setEmail(method === 'google' ? 'google.user@example.com' : 'apple.user@example.com');
      
      login();
      setLoading(null);
      
      const freshHasCompletedQuiz = useAuthStore.getState().hasCompletedQuiz;
      if (freshHasCompletedQuiz) {
        router.replace('/(tabs)/wardrobe');
      } else {
        router.replace('/onboarding/style-quiz');
      }
    }, 1200);
  };

  const handleLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    login();
    useAuthStore.getState().completeQuiz();
    const profileStore = useProfileStore.getState();
    if (!profileStore.email) {
      profileStore.setEmail('user@example.com');
    }
    if (!profileStore.name) {
      profileStore.setName('Stylish User');
    }
    router.replace('/(tabs)/wardrobe');
  };

  const handleEmailSignup = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/onboarding/email-signup');
  };

  return (
    <LinearGradient
      colors={[colors.surface, colors.surfaceContainerLow, colors.surfaceContainer]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Animated.View style={[styles.logoMark, logoAnimatedStyle]}>
              <View style={styles.logoTriangle} />
              <View style={styles.logoDiamond} />
            </Animated.View>
            <Animated.View style={wordmarkAnimatedStyle}>
              <Text style={styles.wordmark}>Fits</Text>
              <Text style={styles.tagline}>Your closet, reimagined</Text>
              <Text style={styles.socialProof}>Join thousands curating their closet</Text>
            </Animated.View>
          </View>

          <View style={styles.previewCard}>
            <View style={styles.previewImageWrap}>
              <Image source={{ uri: HERO_IMAGE }} style={styles.previewImage} resizeMode="cover" />
              <View style={styles.previewImageOverlay} />
              <View style={styles.previewHeader}>
                <View style={styles.previewIcon}>
                  <Icon name={iconNames.checkroom} size={18} color={colors.onPrimary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.previewTitle}>Welcome to Fits</Text>
                  <Text style={styles.previewSubtitle}>Your Curated Minimalist Wardrobe</Text>
                </View>
              </View>
              <Animated.View style={[styles.curatingPill, shimmerStyle]}>
                <Icon name={iconNames.autoAwesome} size={12} color={colors.onTertiaryContainer} />
                <Text style={styles.curatingText}>Curating…</Text>
              </Animated.View>
            </View>
          </View>

          <View style={styles.buttonGroup}>
            <Button
              label="Continue with Apple"
              onPress={() => handleAuth('apple')}
              variant="secondary"
              loading={loading === 'apple'}
              icon={<Icon name="apple" size={20} color={colors.onSurface} />}
            />
            <Button
              label="Continue with Google"
              onPress={() => handleAuth('google')}
              variant="secondary"
              loading={loading === 'google'}
              icon={<Text style={styles.googleG}>G</Text>}
            />
            <Pressable onPress={handleEmailSignup} disabled={!!loading}>
              <Text style={[styles.textLink, loading === 'email' && { opacity: 0.5 }]}>
                Sign up with email
              </Text>
            </Pressable>
            <Pressable onPress={handleLogin}>
              <Text style={styles.textLinkSubtle}>
                Already have an account? <Text style={styles.loginLink}>Log in</Text>
              </Text>
            </Pressable>
            <View style={styles.legalRow}>
              <Text style={styles.legalText}>By continuing you agree to our </Text>
              <TouchableOpacity onPress={() => setShowLegal('terms')}>
                <Text style={styles.legalLink}>Terms</Text>
              </TouchableOpacity>
              <Text style={styles.legalText}> and </Text>
              <TouchableOpacity onPress={() => setShowLegal('privacy')}>
                <Text style={styles.legalLink}>Privacy Policy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>

      <LegalModal type={showLegal} onClose={() => setShowLegal(null)} />
    </LinearGradient>
  );
}

function LegalModal({ type, onClose }: { type: 'terms' | 'privacy' | null; onClose: () => void }) {
  if (!type) return null;

  const title = type === 'terms' ? 'Terms of Service' : 'Privacy Policy';
  const body = type === 'terms'
    ? 'Welcome to Fits. By using this app, you agree to use the service responsibly and for its intended purpose of managing your personal wardrobe. You retain ownership of all garment images you upload. Fits is provided "as is" without warranty. We may update these terms from time to time. Continued use after updates constitutes acceptance of the new terms.'
    : 'Fits stores your wardrobe data locally on your device using secure storage. We do not collect or transmit personal data to external servers at this time. Garment photos you capture are stored on-device. If cloud sync is introduced in the future, we will update this policy and request your explicit consent before syncing any data.';

  return (
    <Modal visible={!!type} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Pressable onPress={onClose} style={styles.modalClose}>
              <Icon name={iconNames.close} size={20} color={colors.onSurface} />
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
            <Text style={styles.modalBody}>{body}</Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: spacing.screenMargin,
    justifyContent: 'space-between',
  },
  logoContainer: { alignItems: 'center', paddingTop: 24 },
  logoMark: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
  logoTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.onPrimary,
  },
  logoDiamond: {
    position: 'absolute',
    bottom: 12,
    width: 8,
    height: 8,
    backgroundColor: colors.secondaryContainer,
    transform: [{ rotate: '45deg' }],
  },
  wordmark: {
    ...typography.display,
    fontSize: 36,
    marginTop: 12,
    color: colors.onSurface,
    textAlign: 'center',
  },
  tagline: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    marginTop: 4,
    textAlign: 'center',
  },
  socialProof: {
    ...typography.caption,
    color: colors.outline,
    marginTop: 4,
    textAlign: 'center',
  },
  previewCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.xl,
    overflow: 'hidden',
    ...shadow.soft,
  },
  previewImageWrap: {
    width: '100%',
    height: Math.min(160, SCREEN_HEIGHT * 0.18),
    position: 'relative',
  },
  previewImage: { width: '100%', height: '100%' },
  previewImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(34, 26, 24, 0.25)',
  },
  previewHeader: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(150, 70, 60, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewTitle: {
    ...typography.h2,
    fontSize: 15,
    color: colors.surfaceContainerLowest,
  },
  previewSubtitle: {
    ...typography.caption,
    fontSize: 11,
    color: 'rgba(255, 248, 247, 0.85)',
    marginTop: 2,
  },
  curatingPill: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.tertiaryContainer,
  },
  curatingText: {
    ...typography.label,
    fontSize: 11,
    color: colors.onTertiaryContainer,
  },
  buttonGroup: { gap: 10, paddingBottom: 16 },
  textLink: {
    ...typography.bodyLg,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
    color: colors.primary,
    paddingVertical: 10,
  },
  textLinkSubtle: {
    ...typography.bodySm,
    textAlign: 'center',
    color: colors.onSurfaceVariant,
    paddingVertical: 6,
  },
  loginLink: {
    fontFamily: 'Inter_600SemiBold',
    color: colors.primary,
  },
  googleG: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4285F4',
  },
  legalRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  legalText: {
    ...typography.caption,
    color: colors.outline,
  },
  legalLink: {
    ...typography.caption,
    color: colors.primary,
    fontFamily: 'Inter_600SemiBold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(34, 26, 24, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    maxHeight: 500,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.xl,
    padding: 24,
    ...shadow.soft,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: { ...typography.h2, fontSize: 18 },
  modalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScroll: { maxHeight: 380 },
  modalBody: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    lineHeight: 22,
  },
});
