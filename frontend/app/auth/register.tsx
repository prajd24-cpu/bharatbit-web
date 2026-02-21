import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!mobile || !email || !password) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const result = await register(mobile, email, password, referralCode);
      Alert.alert('Success', 'OTP sent to your email', [
        {
          text: 'OK',
          onPress: () => {
            router.push({
              pathname: '/auth/verify-otp',
              params: { mobile: email, mock_otp: result.mock_otp, purpose: 'registration' }
            });
          }
        }
      ]);
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message);
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
            <Ionicons name="shield-checkmark" size={48} color={theme.colors.gold} />
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join the private vault</Text>
          </View>

          <Card>
            <Input
              label="Mobile Number *"
              value={mobile}
              onChangeText={setMobile}
              placeholder="10-digit mobile number"
              icon="phone-portrait-outline"
              keyboardType="phone-pad"
              maxLength={10}
            />
            <Input
              label="Email Address *"
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              icon="mail-outline"
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <Input
              label="Password *"
              value={password}
              onChangeText={setPassword}
              placeholder="Minimum 8 characters"
              icon="lock-closed-outline"
              isPassword
            />
            <Input
              label="Confirm Password *"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter password"
              icon="lock-closed-outline"
              isPassword
            />
            <Input
              label="Referral Code (Optional)"
              value={referralCode}
              onChangeText={setReferralCode}
              placeholder="Enter referral code"
              icon="gift-outline"
              autoCapitalize="characters"
            />
            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={loading}
              size="lg"
              style={{ marginTop: theme.spacing.md }}
            />
          </Card>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <Button
              title="Sign In"
              onPress={() => router.push('/auth/login')}
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
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.md,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
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
