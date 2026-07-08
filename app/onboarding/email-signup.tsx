import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, radii, spacing, shadow } from '@/constants/theme';
import { Icon, iconNames } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EmailSignupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login, hasCompletedQuiz } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!EMAIL_REGEX.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateAccount = () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      login();
      setLoading(false);
      if (hasCompletedQuiz) {
        router.replace('/(tabs)/wardrobe');
      } else {
        router.replace('/onboarding/style-quiz');
      }
    }, 1200);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.iconButton}>
              <Icon name={iconNames.arrowBack} size={22} color={colors.onSurface} />
            </Pressable>
            <Text style={styles.title}>Create Account</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.subtitle}>
              Join Fits and start curating your wardrobe
            </Text>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="you@example.com"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor={colors.outline}
                />
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  style={[styles.input, errors.password && styles.inputError]}
                  placeholder="At least 6 characters"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  secureTextEntry
                  placeholderTextColor={colors.outline}
                />
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              </View>
            </View>

            <Text style={styles.legalText}>
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </Text>
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
            <Button
              label="Create Account"
              onPress={handleCreateAccount}
              loading={loading}
              disabled={loading}
            />
          </View>
        </KeyboardAvoidingView>
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
  scroll: { paddingHorizontal: spacing.screenMargin, paddingTop: 8 },
  subtitle: {
    ...typography.bodyLg,
    color: colors.onSurfaceVariant,
    marginBottom: 24,
  },
  form: { gap: 20 },
  inputGroup: { gap: 6 },
  inputLabel: {
    ...typography.label,
    color: colors.onSurfaceVariant,
  },
  input: {
    ...typography.bodyLg,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
    ...shadow.soft,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: 2,
  },
  legalText: {
    ...typography.caption,
    color: colors.outline,
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 20,
  },
  footer: {
    paddingHorizontal: spacing.screenMargin,
    paddingTop: 12,
  },
});
