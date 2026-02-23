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

  // Auto-focus the input when screen loads (mobile native only)
  useEffect(() => {
    if (Platform.OS !== 'web') {
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 500);
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

  const handleOtpChange = (text: string) => {
    // Only allow numbers
    const numericValue = text.replace(/[^0-9]/g, '');
    if (numericValue.length <= 6) {
      setOtp(numericValue);
    }
  };

  // Web-specific input for better mobile browser support
  const renderWebInput = () => (
    <input
      type="tel"
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={6}
      value={otp}
      onChange={(e) => handleOtpChange(e.target.value)}
      placeholder="000000"
      autoComplete="one-time-code"
      style={{
        width: '100%',
        fontSize: 28,
        textAlign: 'center',
        letterSpacing: 12,
        padding: 16,
        border: 'none',
        outline: 'none',
        backgroundColor: 'transparent',
        color: theme.colors.textPrimary,
        fontFamily: 'monospace',
      }}
    />
  );

  // Native input for iOS/Android
  const renderNativeInput = () => (
    <RNTextInput
      ref={inputRef}
      style={styles.otpInput}
      value={otp}
      onChangeText={handleOtpChange}
      placeholder="000000"
      placeholderTextColor={theme.colors.textMuted}
      keyboardType="number-pad"
      maxLength={6}
      returnKeyType="done"
      onSubmitEditing={handleVerify}
      textContentType="oneTimeCode"
    />
  );

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
            <Text style={styles.inputLabel}>Enter 6-Digit OTP</Text>
            <View style={styles.otpInputContainer}>
              {Platform.OS === 'web' ? renderWebInput() : renderNativeInput()}
            </View>
            <Text style={styles.otpHint}>Tap the box above to enter OTP</Text>
            <Button
              title="Verify & Login"
              onPress={handleVerify}
              loading={loading}
              disabled={otp.length !== 6}
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
    textAlign: 'center',
  },
  mobile: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
  },
  inputLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  otpInputContainer: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    minHeight: 60,
    justifyContent: 'center',
  },
  otpInput: {
    fontSize: 28,
    textAlign: 'center',
    letterSpacing: 12,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    color: theme.colors.textPrimary,
    minHeight: 56,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  otpHint: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
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
