import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function KYCPendingScreen() {
  const router = useRouter();
  const { user, token, refreshUser } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [kycStatus, setKycStatus] = useState<any>(null);

  useEffect(() => {
    loadKYCStatus();
  }, []);

  const loadKYCStatus = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/kyc/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setKycStatus(res.data);
      await refreshUser();
    } catch (error) {
      console.error('Error loading KYC status:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadKYCStatus();
    setRefreshing(false);
  };

  const goToDashboard = () => {
    router.replace('/(tabs)/dashboard');
  };

  const getStatusConfig = () => {
    switch (kycStatus?.status || user?.kyc_status) {
      case 'approved':
        return {
          icon: 'checkmark-circle',
          color: theme.colors.success,
          title: 'KYC Approved!',
          subtitle: 'Your account is verified. You can now start trading.',
          showButton: true,
          buttonText: 'Start Trading',
          buttonAction: () => router.replace('/(tabs)/dashboard'),
        };
      case 'rejected':
        return {
          icon: 'close-circle',
          color: theme.colors.error,
          title: 'KYC Rejected',
          subtitle: kycStatus?.rejection_reason || 'Your documents could not be verified.',
          showButton: true,
          buttonText: 'Resubmit KYC',
          buttonAction: () => router.replace('/kyc/submit'),
        };
      case 'under_review':
        return {
          icon: 'time',
          color: theme.colors.warning,
          title: 'Under Review',
          subtitle: 'Our team is reviewing your documents. This usually takes 24-48 hours.',
          showButton: false,
        };
      default:
        return {
          icon: 'document-text',
          color: theme.colors.primary,
          title: 'KYC Pending',
          subtitle: 'Please submit your documents to get started.',
          showButton: true,
          buttonText: 'Submit KYC',
          buttonAction: () => router.replace('/kyc/submit'),
        };
    }
  };

  const config = getStatusConfig();

  return (
    <SafeAreaView style={styles.container}>
      {/* Navigation Header */}
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={goToDashboard} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>KYC Status</Text>
        <TouchableOpacity onPress={goToDashboard} style={styles.homeButton}>
          <Ionicons name="home" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }
      >
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: config.color + '15' }]}>
            <Ionicons name={config.icon as any} size={80} color={config.color} />
          </View>

          <Text style={styles.title}>{config.title}</Text>
          <Text style={styles.subtitle}>{config.subtitle}</Text>

          {kycStatus?.submitted_at && (
            <Card style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Submitted</Text>
                <Text style={styles.infoValue}>
                  {new Date(kycStatus.submitted_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              {kycStatus?.reviewed_at && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Reviewed</Text>
                  <Text style={styles.infoValue}>
                    {new Date(kycStatus.reviewed_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              )}
            </Card>
          )}

          {config.showButton && (
            <Button
              title={config.buttonText || 'Continue'}
              onPress={config.buttonAction}
              style={styles.button}
              size="lg"
            />
          )}

          <Button
            title="Go to Dashboard"
            onPress={goToDashboard}
            variant="outline"
            style={styles.secondaryButton}
          />
        </View>

        {/* Help Section */}
        <Card style={styles.helpCard}>
          <Text style={styles.helpTitle}>Need Help?</Text>
          <Text style={styles.helpText}>
            If you have any questions about the KYC process, please contact your relationship manager or email us at support@bharatbit.world
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    backgroundColor: theme.colors.background,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  homeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  navTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  scrollContent: {
    padding: theme.spacing.xl,
  },
  content: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: theme.spacing.lg,
  },
  infoCard: {
    width: '100%',
    marginTop: theme.spacing.xl,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  infoLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
  },
  infoValue: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textPrimary,
    fontWeight: theme.fontWeight.medium,
  },
  button: {
    width: '100%',
    marginTop: theme.spacing.xl,
  },
  secondaryButton: {
    width: '100%',
    marginTop: theme.spacing.md,
  },
  helpCard: {
    marginTop: theme.spacing.xl,
    backgroundColor: theme.colors.primary + '10',
  },
  helpTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  helpText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
});
