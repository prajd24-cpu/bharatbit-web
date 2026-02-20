import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

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
            <Ionicons name="shield-checkmark" size={56} color={theme.colors.primary} />
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

const Feature = ({ icon, text }: { icon: any; text: string }) => (
  <View style={styles.feature}>
    <Ionicons name={icon} size={24} color={theme.colors.gold} />
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

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
  header: {
    alignItems: 'center',
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.xl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.gold,
  },
  brandName: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    letterSpacing: 2,
  },
  brandSubtitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.gold,
    letterSpacing: 3,
    marginTop: theme.spacing.xs,
  },
  tagline: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    fontStyle: 'italic',
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    justifyContent: 'center',
  },
  features: {
    gap: theme.spacing.lg,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  featureText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textPrimary,
    marginLeft: theme.spacing.md,
    fontWeight: theme.fontWeight.medium,
  },
  footer: {
    padding: theme.spacing.xl,
  },
  footerText: {
    textAlign: 'center',
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.xs,
    marginTop: theme.spacing.lg,
    fontStyle: 'italic',
  },
});
