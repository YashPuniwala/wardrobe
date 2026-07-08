import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, radii, spacing, shadow } from '@/constants/theme';
import { Icon, iconNames } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/useAuthStore';
import { useProfileStore } from '@/store/useProfileStore';
import { useQuizStore } from '@/store/useQuizStore';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EmailSignupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

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
      useQuizStore.getState().reset();
      useAuthStore.getState().setHasCompletedQuiz(false);
      useProfileStore.getState().setEmail(email.trim());
      
      login();
      setLoading(false);
      router.replace('/onboarding/style-quiz');
    }, 1200);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.iconButton}>
              <Icon name={iconNames.arrowBack} size={22} color={colors.onSurface} />
            </Pressable>
            <Text style={styles.title}>Create Account</Text>
            <View style={{ width: 44 }} />
          </View>

          <View style={styles.content}>
            <Text style={styles.subtitle}>
              Join Fits and start curating your wardrobe
            </Text>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={[
                    styles.input,
                    errors.email && styles.inputError,
                    emailFocused && styles.inputFocused,
                  ]}
                  placeholder="you@example.com"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
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
                  style={[
                    styles.input,
                    errors.password && styles.inputError,
                    passwordFocused && styles.inputFocused,
                  ]}
                  placeholder="At least 6 characters"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  secureTextEntry
                  placeholderTextColor={colors.outline}
                />
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              </View>
            </View>

            <Text style={styles.legalText}>
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>

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
  keyboardView: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenMargin,
    paddingTop: 8,
    paddingBottom: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...typography.h2 },
  content: {
    flex: 1,
    paddingHorizontal: spacing.screenMargin,
    justifyContent: 'center',
  },
  subtitle: {
    ...typography.bodyLg,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.stackMd,
    textAlign: 'center',
  },
  form: { gap: spacing.stackMd },
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
    borderColor: colors.surfaceContainerHigh,
    minHeight: 48,
    ...shadow.soft,
  },
  inputFocused: {
    borderColor: colors.primary,
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
    marginTop: spacing.stackMd,
    paddingHorizontal: 16,
  },
  footer: {
    paddingHorizontal: spacing.screenMargin,
    paddingTop: 12,
  },
});
