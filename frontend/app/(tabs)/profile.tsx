import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout }
      ]
    );
  };

  const getKYCStatusColor = () => {
    switch (user?.kyc_status) {
      case 'approved': return theme.colors.success;
      case 'rejected': return theme.colors.error;
      case 'under_review': return theme.colors.warning;
      default: return theme.colors.textMuted;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <Card style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={48} color={theme.colors.gold} />
            </View>
            <Text style={styles.userName}>{user?.email?.split('@')[0] || 'User'}</Text>
            <View style={[styles.kycBadge, { backgroundColor: getKYCStatusColor() + '20' }]}>
              <Ionicons
                name={user?.kyc_status === 'approved' ? 'shield-checkmark' : 'shield'}
                size={16}
                color={getKYCStatusColor()}
              />
              <Text style={[styles.kycStatus, { color: getKYCStatusColor() }]}>
                KYC {user?.kyc_status?.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          </View>
        </Card>

        {/* Account Details */}
        <Card>
          <Text style={styles.sectionTitle}>Account Details</Text>
          <ProfileRow icon="mail" label="Email" value={user?.email || ''} />
          <ProfileRow icon="phone-portrait" label="Mobile" value={user?.mobile || ''} />
          <ProfileRow icon="person-circle" label="Role" value={user?.role?.toUpperCase() || ''} />
        </Card>

        {/* Security */}
        <Card>
          <Text style={styles.sectionTitle}>Security</Text>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="key" size={24} color={theme.colors.textSecondary} />
            <Text style={styles.menuText}>Change Password</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="shield-checkmark" size={24} color={theme.colors.textSecondary} />
            <Text style={styles.menuText}>Two-Factor Authentication</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </Card>

        {/* Support */}
        <Card>
          <Text style={styles.sectionTitle}>Support</Text>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="help-circle" size={24} color={theme.colors.textSecondary} />
            <Text style={styles.menuText}>Help & FAQ</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="document-text" size={24} color={theme.colors.textSecondary} />
            <Text style={styles.menuText}>Terms & Conditions</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </Card>

        <Button
          title="Logout"
          onPress={handleLogout}
          variant="danger"
          size="lg"
          style={{ marginTop: theme.spacing.lg }}
        />

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const ProfileRow = ({ icon, label, value }: any) => (
  <View style={styles.profileRow}>
    <View style={styles.profileRowLeft}>
      <Ionicons name={icon} size={20} color={theme.colors.textSecondary} />
      <Text style={styles.profileLabel}>{label}</Text>
    </View>
    <Text style={styles.profileValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  profileCard: {
    marginBottom: theme.spacing.lg,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.gold,
    marginBottom: theme.spacing.md,
  },
  userName: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    textTransform: 'capitalize',
  },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    marginTop: theme.spacing.sm,
  },
  kycStatus: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.gold,
    marginBottom: theme.spacing.md,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  profileRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  profileLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  profileValue: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textPrimary,
    fontWeight: theme.fontWeight.medium,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  menuText: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.textPrimary,
  },
  version: {
    textAlign: 'center',
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.xs,
    marginTop: theme.spacing.xl,
  },
});
