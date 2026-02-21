import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity, TextInput as RNTextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { theme } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<RNTextInput>(null);

  const email = params.email as string;
  const mockOTP = params.mock_otp as string;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleResetPassword = async () => {
    if (!otp) {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please enter your new password');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/auth/reset-password`, {
        email,
        otp,
        new_password: newPassword
      });
      
      Alert.alert('Success', 'Your password has been reset successfully', [
        {
          text: 'Login Now',
          onPress: () => router.replace('/auth/login')
        }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to reset password');
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
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Ionicons name="lock-open" size={48} color={theme.colors.primary} />
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>Enter the OTP sent to {email}</Text>
            {mockOTP && (
              <View style={styles.mockContainer}>
                <Text style={styles.mockLabel}>OTP (Dev Mode):</Text>
                <Text style={styles.mockOTP}>{mockOTP}</Text>
              </View>
            )}
          </View>

          <Card>
            <Text style={styles.inputLabel}>Enter OTP</Text>
            <View style={styles.otpInputContainer}>
              <RNTextInput
                ref={inputRef}
                style={styles.otpInput}
                value={otp}
                onChangeText={setOtp}
                placeholder="000000"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus={true}
              />
            </View>

            <Input
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              icon="lock-closed-outline"
              isPassword
            />
            <Input
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              icon="lock-closed-outline"
              isPassword
            />
            
            <Button
              title="Reset Password"
              onPress={handleResetPassword}
              loading={loading}
              size="lg"
              style={{ marginTop: theme.spacing.lg }}
            />
          </Card>

          <View style={styles.footer}>
            <Button
              title="Back to Login"
              onPress={() => router.replace('/auth/login')}
              variant="outline"
              size="sm"
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
  backButton: {
    marginBottom: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.md,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
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
    marginBottom: theme.spacing.lg,
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
});
