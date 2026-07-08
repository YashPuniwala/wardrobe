import { useEffect } from 'react';
import { Stack, useRouter, useSegments, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts } from 'expo-font';
import {
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';
import { useAuthStore } from '@/store/useAuthStore';

SplashScreen.preventAutoHideAsync();

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, hasCompletedQuiz } = useAuthStore();
  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const inOnboarding = segments[0] === 'onboarding';
    const inWelcome = pathname === '/';
    const inProfile = segments[0] === 'profile';

    if (!isLoggedIn) {
      if (!inWelcome && !inOnboarding) {
        router.replace('/');
      }
    } else if (isLoggedIn && !hasCompletedQuiz && !inOnboarding) {
      router.replace('/onboarding/style-quiz');
    } else if (isLoggedIn && hasCompletedQuiz && (inWelcome || inOnboarding)) {
      router.replace('/(tabs)/wardrobe');
    }
  }, [isLoggedIn, hasCompletedQuiz, segments, pathname, router]);

  return <>{children}</>;
}

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <AuthGate>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="create-outfit" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="dressing-room" options={{ headerShown: false }} />
          <Stack.Screen name="garment" options={{ headerShown: false }} />
          <Stack.Screen name="palette" options={{ headerShown: false }} />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </AuthGate>
      <StatusBar style="dark" />
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
