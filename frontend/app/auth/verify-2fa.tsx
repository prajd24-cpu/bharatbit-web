import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableWithoutFeedback, Keyboard, Platform } from 'react-native';
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
  const [error, setError] = useState('');

  const mobile = params.mobile as string;
  const mockOTP = params.mock_otp as string;

  const handleOtpChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    if (numericValue.length <= 6) {
      setOtp(numericValue);
    }
  };

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      setError(message);
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleVerify = async () => {
    setError('');
    if (Platform.OS !== 'web') {
      Keyboard.dismiss();
    }
    
    if (!otp || otp.length !== 6) {
      showAlert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      await verify2FA(mobile, otp);
      router.replace('/(tabs)/dashboard');
    } catch (error: any) {
      showAlert('Verification Failed', error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Web version with pure HTML for better keyboard support
  if (Platform.OS === 'web') {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '400px',
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center' as const, marginBottom: '24px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '40px',
              backgroundColor: 'rgba(233, 87, 33, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <Ionicons name="shield-checkmark" size={48} color="#E95721" />
            </div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#1a1a2e',
              margin: '0 0 8px',
            }}>Two-Factor Authentication</h1>
            <p style={{
              fontSize: '15px',
              color: '#666',
              margin: '0 0 4px',
            }}>Enter the OTP sent to your email & phone</p>
            <p style={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#E95721',
              margin: '0',
            }}>{mobile}</p>
          </div>

          {/* Mock OTP Display - For Development */}
          {mockOTP && (
            <div style={{
              backgroundColor: '#fef3cd',
              border: '1px solid #ffc107',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
              textAlign: 'center' as const,
            }}>
              <p style={{
                fontSize: '12px',
                color: '#856404',
                fontWeight: 600,
                margin: '0 0 8px',
                textTransform: 'uppercase' as const,
              }}>Mock OTP (Dev Only)</p>
              <p style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#d4a106',
                margin: 0,
                letterSpacing: '4px',
              }}>{mockOTP}</p>
            </div>
          )}

          {/* Card */}
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          }}>
            {/* Error message */}
            {error && (
              <div style={{
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '14px',
              }}>
                {error}
              </div>
            )}

            {/* OTP Input */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: '#666',
                marginBottom: '10px',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.5px',
              }}>Enter 6-Digit OTP</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={otp}
                onChange={(e) => handleOtpChange(e.target.value)}
                placeholder="000000"
                autoComplete="one-time-code"
                autoFocus
                style={{
                  width: '100%',
                  height: '60px',
                  fontSize: '28px',
                  textAlign: 'center' as const,
                  letterSpacing: '12px',
                  border: '2px solid #E95721',
                  borderRadius: '12px',
                  backgroundColor: '#ffffff',
                  color: '#1a1a2e',
                  padding: '0 16px',
                  boxSizing: 'border-box' as const,
                  outline: 'none',
                  caretColor: '#E95721',
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && otp.length === 6) {
                    handleVerify();
                  }
                }}
              />
            </div>

            {/* Verify Button */}
            <button
              type="button"
              onClick={handleVerify}
              disabled={loading || otp.length !== 6}
              style={{
                width: '100%',
                height: '56px',
                backgroundColor: loading || otp.length !== 6 ? '#ccc' : '#E95721',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '17px',
                fontWeight: 600,
                cursor: loading || otp.length !== 6 ? 'not-allowed' : 'pointer',
                boxShadow: loading || otp.length !== 6 ? 'none' : '0 4px 14px rgba(233, 87, 33, 0.3)',
                transition: 'all 0.2s ease',
              }}
            >
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center' as const, marginTop: '24px' }}>
            <button
              type="button"
              onClick={() => window.alert('A new OTP has been sent to your phone and email.')}
              style={{
                padding: '12px 24px',
                backgroundColor: 'transparent',
                color: '#E95721',
                border: 'none',
                fontSize: '15px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Didn't receive OTP? Resend
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Native (iOS/Android) version
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Ionicons name="shield-checkmark" size={48} color={theme.colors.primary} />
            <Text style={styles.title}>Two-Factor Authentication</Text>
            <Text style={styles.subtitle}>Enter the OTP sent to</Text>
            <Text style={styles.mobile}>{mobile}</Text>
            {mockOTP && (
              <View style={styles.mockContainer}>
                <Text style={styles.mockLabel}>Mock OTP (Dev Only):</Text>
                <Text style={styles.mockOTP}>{mockOTP}</Text>
              </View>
            )}
          </View>

          <Card>
            <Input
              label="Enter 2FA OTP"
              value={otp}
              onChangeText={handleOtpChange}
              placeholder="6-digit OTP"
              keyboardType="number-pad"
              maxLength={6}
              returnKeyType="done"
              onSubmitEditing={handleVerify}
            />
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
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
    color: theme.colors.gold,
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
    color: theme.colors.gold,
    fontWeight: theme.fontWeight.bold,
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
