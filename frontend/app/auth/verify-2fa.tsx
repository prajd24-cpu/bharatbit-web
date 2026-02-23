import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
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

  const mobile = params.mobile as string;

  const handleOtpChange = (text: string) => {
    // Only allow numbers, max 6 digits
    const numericValue = text.replace(/[^0-9]/g, '');
    if (numericValue.length <= 6) {
      setOtp(numericValue);
    }
  };

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
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Ionicons name="shield-checkmark" size={48} color={theme.colors.primary} />
            <Text style={styles.title}>Two-Factor Authentication</Text>
            <Text style={styles.subtitle}>Enter the OTP sent to your email & phone</Text>
            <Text style={styles.mobile}>{mobile}</Text>
          </View>

          <Card>
            <Input
              label="Enter 6-Digit OTP"
              value={otp}
              onChangeText={handleOtpChange}
              placeholder="Enter OTP here"
              icon="keypad-outline"
              keyboardType="number-pad"
              maxLength={6}
              autoComplete="one-time-code"
              textContentType="oneTimeCode"
            />
            
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
        </ScrollView>
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
  scrollContent: {
    padding: theme.spacing.xl,
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
  footer: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  footerText: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.sm,
  },
});
