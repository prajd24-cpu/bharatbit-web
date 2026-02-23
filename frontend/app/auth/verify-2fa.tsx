import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, TextInput as RNTextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function Verify2FAScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { verify2FA } = useAuth();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<RNTextInput>(null);

  const mobile = params.mobile as string;

  // Auto-focus the input when screen loads (mobile only)
  useEffect(() => {
    if (Platform.OS !== 'web') {
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      await verify2FA(mobile, otp);
      router.replace('/(tabs)/dashboard');
    } catch (error: any) {
      Alert.alert('Verification Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Ionicons name="shield-checkmark" size={48} color={theme.colors.primary} />
            <Text style={styles.title}>Two-Factor Authentication</Text>
            <Text style={styles.subtitle}>Enter the OTP sent to your email & phone</Text>
            <Text style={styles.mobile}>{mobile}</Text>
          </View>

          <Card>
            <Text style={styles.inputLabel}>Enter 2FA OTP</Text>
            <View style={styles.otpInputContainer}>
              <RNTextInput
                ref={inputRef}
                style={styles.otpInput}
                value={otp}
                onChangeText={setOtp}
                placeholder="000000"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="number-pad"
                inputMode="numeric"
                maxLength={6}
                returnKeyType="done"
                onSubmitEditing={handleVerify}
                autoFocus={Platform.OS !== 'web'}
                autoComplete="one-time-code"
                textContentType="oneTimeCode"
              />
            </View>
            <Button
              title="Verify & Login"
              onPress={handleVerify}
              loading={loading}
              size="lg"
              style={{ marginTop: theme.spacing.md }}
            />
          </Card>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Didn't receive the OTP?</Text>
            <Button
              title="Resend OTP"
              onPress={() => Alert.alert('OTP Sent', 'A new OTP has been sent')}
              variant="outline"
              size="sm"
              style={{ marginTop: theme.spacing.sm }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: theme.spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  mobile: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
  },
  mockContainer: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.warning,
  },
  mockLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.warning,
    fontWeight: theme.fontWeight.semibold,
  },
  mockOTP: {
    fontSize: theme.fontSize.xl,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.bold,
    marginTop: theme.spacing.xs,
  },
  inputLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  otpInputContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  otpInput: {
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 8,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    color: theme.colors.textPrimary,
    minHeight: 56,
  },
  footer: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  footerText: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.sm,
  },
});
