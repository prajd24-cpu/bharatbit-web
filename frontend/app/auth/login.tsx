import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      setError(message);
      // Also use browser alert as fallback
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleLogin = async () => {
    setError('');
    
    if (!identifier || !password) {
      showAlert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const result = await login(identifier, password);
      if (result.requires_2fa) {
        router.push({
          pathname: '/auth/verify-2fa',
          params: { mobile: result.mobile, mock_otp: result.mock_otp }
        });
      }
    } catch (error: any) {
      showAlert('Login Failed', error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Web-specific login form for better compatibility
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
          <div style={{ textAlign: 'center' as const, marginBottom: '32px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '32px',
              backgroundColor: 'rgba(233, 87, 33, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <Ionicons name="shield-checkmark" size={36} color="#E95721" />
            </div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#1a1a2e',
              margin: '0 0 8px',
            }}>Welcome Back</h1>
            <p style={{
              fontSize: '16px',
              color: '#666',
              margin: 0,
            }}>Sign in to your private vault</p>
          </div>

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

            {/* Email/Mobile Input */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: '#666',
                marginBottom: '8px',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.5px',
              }}>Mobile / Email</label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter mobile number or email"
                style={{
                  width: '100%',
                  height: '48px',
                  padding: '0 16px',
                  fontSize: '16px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '10px',
                  backgroundColor: '#f8f9fa',
                  boxSizing: 'border-box' as const,
                  outline: 'none',
                }}
              />
            </div>

            {/* Password Input */}
            <div style={{ marginBottom: '8px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: '#666',
                marginBottom: '8px',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.5px',
              }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  height: '48px',
                  padding: '0 16px',
                  fontSize: '16px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '10px',
                  backgroundColor: '#f8f9fa',
                  boxSizing: 'border-box' as const,
                  outline: 'none',
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleLogin();
                  }
                }}
              />
            </div>

            {/* Forgot Password */}
            <div style={{ textAlign: 'right' as const, marginBottom: '20px' }}>
              <a 
                href="/auth/forgot-password"
                onClick={(e) => {
                  e.preventDefault();
                  router.push('/auth/forgot-password');
                }}
                style={{
                  color: '#E95721',
                  fontSize: '14px',
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}
              >
                Forgot Password?
              </a>
            </div>

            {/* Sign In Button */}
            <button
              type="button"
              onClick={handleLogin}
              disabled={loading}
              style={{
                width: '100%',
                height: '56px',
                backgroundColor: loading ? '#ccc' : '#E95721',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '17px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 14px rgba(233, 87, 33, 0.3)',
                transition: 'all 0.2s ease',
              }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center' as const, marginTop: '24px' }}>
            <p style={{ color: '#666', fontSize: '14px', margin: '0 0 12px' }}>
              Don't have an account?
            </p>
            <button
              type="button"
              onClick={() => router.push('/auth/register')}
              style={{
                padding: '10px 24px',
                backgroundColor: 'transparent',
                color: '#E95721',
                border: '1.5px solid #E95721',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Native (iOS/Android) version
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Ionicons name="shield-checkmark" size={48} color={theme.colors.primary} />
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your private vault</Text>
          </View>

          <Card>
            <Input
              label="Mobile / Email"
              value={identifier}
              onChangeText={setIdentifier}
              placeholder="Enter mobile number or email"
              icon="person-outline"
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              icon="lock-closed-outline"
              isPassword
            />
            
            {/* Forgot Password Link */}
            <TouchableOpacity 
              style={styles.forgotPassword}
              onPress={() => router.push('/auth/forgot-password')}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
            
            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              size="lg"
              style={{ marginTop: theme.spacing.md }}
            />
          </Card>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <Button
              title="Create Account"
              onPress={() => router.push('/auth/register')}
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: theme.spacing.sm,
  },
  forgotPasswordText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
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
