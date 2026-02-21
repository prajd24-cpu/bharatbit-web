import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../constants/theme';

export default function WelcomeScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') {
        router.replace('/admin');
      } else if (user.kyc_status === 'approved') {
        router.replace('/(tabs)/dashboard');
      } else if (user.kyc_status === 'pending' || user.kyc_status === 'under_review' || user.kyc_status === 'rejected') {
        router.replace('/kyc/submit');
      }
    }
  }, [user, loading]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo and Brand */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>B</Text>
          </View>
          <Text style={styles.brandName}>BharatBit</Text>
          <Text style={styles.brandSubtitle}>OTC DESK</Text>
        </View>

        {/* Tagline */}
        <View style={styles.taglineContainer}>
          <Text style={styles.tagline}>Discreet. Secure. Direct.</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <Button
          title="Sign In"
          onPress={() => router.push('/auth/login')}
          variant="primary"
          size="lg"
        />
        <Button
          title="Create Account"
          onPress={() => router.push('/auth/register')}
          variant="outline"
          size="lg"
          style={{ marginTop: theme.spacing.md }}
        />
        
        {/* Invitation Only Text */}
        <View style={styles.inviteContainer}>
          <Text style={styles.inviteText}>By invitation only.</Text>
          <Text style={styles.inviteSubtext}>For High Net-worth Individuals.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
    borderWidth: 3,
    borderColor: '#E95721',
    shadowColor: '#E95721',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 72,
    fontWeight: '900',
    color: '#E95721',
  },
  brandName: {
    fontSize: 48,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    letterSpacing: 2,
  },
  brandSubtitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: '#E95721',
    letterSpacing: 4,
    marginTop: theme.spacing.sm,
  },
  taglineContainer: {
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  tagline: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    fontWeight: theme.fontWeight.medium,
  },
  footer: {
    padding: theme.spacing.xl,
  },
  inviteContainer: {
    marginTop: theme.spacing.xxl,
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  inviteText: {
    textAlign: 'center',
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  inviteSubtext: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.xs,
  },
});
