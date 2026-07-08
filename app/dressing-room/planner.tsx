import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, radii, spacing, shadow } from '@/constants/theme';
import { Icon, iconNames } from '@/components/ui/Icon';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const dates = [1, 2, 3, 4, 5, 6, 7];

const plannedOutfits: Record<number, { name: string; occasion: string }> = {
  2: { name: 'Office Chic', occasion: 'Work' },
  4: { name: 'Date Night', occasion: 'Dinner' },
  6: { name: 'Weekend Walk', occasion: 'Casual' },
};

export default function PlannerScreen() {
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState(0);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <Icon name={iconNames.arrowBack} size={22} color={colors.onSurface} />
          </Pressable>
          <Text style={styles.title}>Planner</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.weekRow}>
            {days.map((day, index) => (
              <Pressable
                key={day}
                onPress={() => setSelectedDay(index)}
                style={[
                  styles.dayCard,
                  selectedDay === index && styles.dayCardSelected,
                ]}
              >
                <Text
                  style={[
                    styles.dayLabel,
                    selectedDay === index && styles.dayLabelSelected,
                  ]}
                >
                  {day}
                </Text>
                <Text
                  style={[
                    styles.dateLabel,
                    selectedDay === index && styles.dateLabelSelected,
                  ]}
                >
                  {dates[index]}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.plannedSection}>
            <Text style={styles.sectionTitle}>
              {plannedOutfits[dates[selectedDay]]
                ? 'Planned Outfit'
                : 'No outfit planned'}
            </Text>

            {plannedOutfits[dates[selectedDay]] ? (
              <View style={styles.plannedCard}>
                <View style={styles.plannedImage}>
                  <Icon name={iconNames.checkroom} size={32} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.plannedName}>
                    {plannedOutfits[dates[selectedDay]].name}
                  </Text>
                  <Text style={styles.plannedOccasion}>
                    {plannedOutfits[dates[selectedDay]].occasion}
                  </Text>
                </View>
                <Pressable
                  onPress={() => router.push('/create-outfit/choose-method')}
                  style={styles.editButton}
                >
                  <Icon name={iconNames.autoFixHigh} size={16} color={colors.primary} />
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={() => router.push('/create-outfit/choose-method')}
                style={styles.addOutfitCard}
              >
                <Icon name={iconNames.add} size={24} color={colors.primary} />
                <Text style={styles.addOutfitText}>Plan an outfit</Text>
              </Pressable>
            )}
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
  scroll: { paddingHorizontal: spacing.screenMargin, paddingBottom: 40 },
  weekRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  dayCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 12,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceContainerLow,
  },
  dayCardSelected: { backgroundColor: colors.primary },
  dayLabel: { ...typography.label, color: colors.onSurfaceVariant },
  dayLabelSelected: { color: colors.onPrimary },
  dateLabel: { ...typography.h2, fontSize: 18 },
  dateLabelSelected: { color: colors.onPrimary },
  plannedSection: { gap: 12 },
  sectionTitle: { ...typography.h2, fontSize: 18 },
  plannedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.lg,
    padding: 16,
    ...shadow.soft,
  },
  plannedImage: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plannedName: { ...typography.bodyLg, fontFamily: 'Inter_600SemiBold' },
  plannedOccasion: { ...typography.bodySm, color: colors.onSurfaceVariant, marginTop: 2 },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addOutfitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.lg,
    padding: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary,
  },
  addOutfitText: { ...typography.bodyLg, fontFamily: 'Inter_600SemiBold', color: colors.primary },
});
