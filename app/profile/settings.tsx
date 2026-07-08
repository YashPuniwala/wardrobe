import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, radii, spacing, shadow } from '@/constants/theme';
import { Icon, iconNames } from '@/components/ui/Icon';
import { useSettingsStore } from '@/store/useSettingsStore';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { notificationsEnabled, temperatureUnit, toggleNotifications, setTemperatureUnit } = useSettingsStore();

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <Icon name={iconNames.arrowBack} size={22} color={colors.onSurface} />
          </Pressable>
          <Text style={styles.title}>Settings</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionLabel}>PREFERENCES</Text>
          <View style={styles.section}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Icon name={iconNames.notifications} size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.settingLabel}>Push Notifications</Text>
                  <Text style={styles.settingSub}>Outfit ideas, tips & alerts</Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={toggleNotifications}
                trackColor={{ false: colors.surfaceContainerHigh, true: colors.primary }}
                thumbColor={notificationsEnabled ? colors.onPrimary : colors.outline}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Icon name={iconNames.wbSunny} size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.settingLabel}>Temperature Unit</Text>
                  <Text style={styles.settingSub}>Display weather in your preferred unit</Text>
                </View>
              </View>
              <View style={styles.unitToggle}>
                <Pressable
                  onPress={() => setTemperatureUnit('F')}
                  style={[styles.unitButton, temperatureUnit === 'F' && styles.unitButtonActive]}
                >
                  <Text style={[styles.unitText, temperatureUnit === 'F' && styles.unitTextActive]}>°F</Text>
                </Pressable>
                <Pressable
                  onPress={() => setTemperatureUnit('C')}
                  style={[styles.unitButton, temperatureUnit === 'C' && styles.unitButtonActive]}
                >
                  <Text style={[styles.unitText, temperatureUnit === 'C' && styles.unitTextActive]}>°C</Text>
                </Pressable>
              </View>
            </View>
          </View>

          <Text style={styles.sectionLabel}>ABOUT</Text>
          <View style={styles.section}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIcon}>
                  <Icon name={iconNames.info} size={20} color={colors.primary} />
                </View>
                <Text style={styles.settingLabel}>Version</Text>
              </View>
              <Text style={styles.settingValue}>1.0.0</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
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
  sectionLabel: {
    ...typography.label,
    color: colors.onSurfaceVariant,
    letterSpacing: 1,
    marginTop: 24,
    marginBottom: 8,
  },
  section: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.lg,
    padding: 16,
    ...shadow.soft,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: { ...typography.bodyLg, fontFamily: 'Inter_500Medium' },
  settingSub: { ...typography.caption, color: colors.onSurfaceVariant, marginTop: 2 },
  settingValue: { ...typography.bodySm, color: colors.onSurfaceVariant },
  divider: {
    height: 1,
    backgroundColor: colors.outlineVariant,
    marginVertical: 8,
  },
  unitToggle: { flexDirection: 'row', backgroundColor: colors.surfaceContainerLow, borderRadius: radii.pill, overflow: 'hidden' },
  unitButton: { paddingVertical: 8, paddingHorizontal: 14 },
  unitButtonActive: { backgroundColor: colors.primary },
  unitText: { ...typography.label, color: colors.onSurfaceVariant },
  unitTextActive: { color: colors.onPrimary },
});
