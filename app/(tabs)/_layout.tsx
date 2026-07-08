import { Tabs } from 'expo-router';
import { Pressable, View, StyleSheet, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, typography, shadow } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function TabIcon({ name, color, size = 24 }: { name: any; color: string; size?: number }) {
  return <MaterialIcons name={name} size={size} color={color} />;
}

function CenterButton() {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View
      style={[styles.centerButton, animatedStyle]}
    >
      <MaterialIcons name="add" size={32} color={colors.onPrimary} />
    </Animated.View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleCenterPress = () => {
    router.push('/create-outfit/action-sheet');
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: colors.surfaceContainerLowest,
          borderTopColor: colors.outlineVariant,
          borderTopWidth: 1,
          height: 64 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
          ...shadow.tab,
        },
        tabBarLabelStyle: {
          ...typography.label,
          fontSize: 10,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="wardrobe"
        options={{
          title: 'Wardrobe',
          tabBarIcon: ({ color, size }) => <TabIcon name="checkroom" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="outfits"
        options={{
          title: 'Outfits',
          tabBarIcon: ({ color, size }) => <TabIcon name="auto-awesome" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="center"
        options={{
          title: '',
          tabBarIcon: () => <CenterButton />,
          tabBarButton: (props) => (
            <Pressable
              {...(props as any)}
              onPress={handleCenterPress}
              style={styles.centerButtonWrap}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="stylist"
        options={{
          title: 'Stylist',
          tabBarIcon: ({ color, size }) => <TabIcon name="auto-fix-high" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <TabIcon name="person" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
    ...shadow.soft,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  centerButtonWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
