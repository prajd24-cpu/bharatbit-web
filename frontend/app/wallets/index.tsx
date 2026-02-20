import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface SavedWallet {
  id: string;
  label: string;
  wallet_address: string;
  asset: string;
  network: string;
  wallet_type: string;
  exchange_name?: string;
  verification_status: string;
  is_primary: boolean;
  created_at: string;
}

export default function SavedWalletsScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [wallets, setWallets] = useState<SavedWallet[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWallets();
  }, []);

  const loadWallets = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/wallets/my-wallets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWallets(res.data);
    } catch (error) {
      console.error('Error loading wallets:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWallets();
    setRefreshing(false);
  };

  const handleSetPrimary = async (walletId: string) => {
    try {
      await axios.put(
        `${BACKEND_URL}/api/wallets/${walletId}/set-primary`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Success', 'Wallet set as primary');
      loadWallets();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to set primary');
    }
  };

  const handleDelete = (walletId: string, label: string) => {
    Alert.alert(
      'Delete Wallet',
      `Are you sure you want to delete "${label}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${BACKEND_URL}/api/wallets/${walletId}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              Alert.alert('Success', 'Wallet deleted');
              loadWallets();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.detail || 'Failed to delete');
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return theme.colors.success;
      case 'rejected': return theme.colors.error;
      default: return theme.colors.warning;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return 'checkmark-circle';
      case 'rejected': return 'close-circle';
      default: return 'time';
    }
  };

  const truncateAddress = (address: string) => {
    if (address.length <= 20) return address;
    return `${address.slice(0, 10)}...${address.slice(-8)}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Wallets</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }
      >
        {/* Info Card */}
        <Card style={styles.infoCard}>
          <View style={styles.infoContent}>
            <Ionicons name="information-circle" size={24} color={theme.colors.primary} />
            <Text style={styles.infoText}>
              Save your wallet addresses with proof of ownership. Verified wallets can be used for receiving crypto from your orders.
            </Text>
          </View>
        </Card>

        {/* Add Wallet Button */}
        <Button
          title="Add New Wallet"
          onPress={() => router.push('/wallets/add')}
          style={styles.addButton}
          icon={<Ionicons name="add-circle" size={20} color="#fff" />}
        />

        {/* Wallets List */}
        {loading ? (
          <Card>
            <Text style={styles.loadingText}>Loading wallets...</Text>
          </Card>
        ) : wallets.length === 0 ? (
          <Card>
            <View style={styles.emptyState}>
              <Ionicons name="wallet-outline" size={48} color={theme.colors.textMuted} />
              <Text style={styles.emptyTitle}>No Wallets Saved</Text>
              <Text style={styles.emptyText}>
                Add your wallet addresses to receive crypto from your orders.
              </Text>
            </View>
          </Card>
        ) : (
          wallets.map((wallet) => (
            <Card key={wallet.id} style={styles.walletCard}>
              <View style={styles.walletHeader}>
                <View style={styles.walletTitleRow}>
                  <Text style={styles.walletLabel}>{wallet.label}</Text>
                  {wallet.is_primary && (
                    <View style={styles.primaryBadge}>
                      <Text style={styles.primaryText}>PRIMARY</Text>
                    </View>
                  )}
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(wallet.verification_status) + '20' }]}>
                  <Ionicons
                    name={getStatusIcon(wallet.verification_status)}
                    size={14}
                    color={getStatusColor(wallet.verification_status)}
                  />
                  <Text style={[styles.statusText, { color: getStatusColor(wallet.verification_status) }]}>
                    {wallet.verification_status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.walletDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Address</Text>
                  <Text style={styles.detailValue}>{truncateAddress(wallet.wallet_address)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Asset</Text>
                  <Text style={styles.detailValue}>{wallet.asset} ({wallet.network})</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Type</Text>
                  <Text style={styles.detailValue}>
                    {wallet.wallet_type === 'exchange' 
                      ? `Exchange - ${wallet.exchange_name}` 
                      : 'Self Custody'}
                  </Text>
                </View>
              </View>

              <View style={styles.walletActions}>
                {wallet.verification_status === 'verified' && !wallet.is_primary && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleSetPrimary(wallet.id)}
                  >
                    <Ionicons name="star-outline" size={18} color={theme.colors.primary} />
                    <Text style={styles.actionText}>Set Primary</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDelete(wallet.id, wallet.label)}
                >
                  <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
                  <Text style={[styles.actionText, { color: theme.colors.error }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  infoCard: {
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.primary + '10',
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  addButton: {
    marginBottom: theme.spacing.lg,
  },
  loadingText: {
    textAlign: 'center',
    color: theme.colors.textMuted,
    padding: theme.spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.md,
  },
  emptyText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
  walletCard: {
    marginBottom: theme.spacing.md,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  walletTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  walletLabel: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
  primaryBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  primaryText: {
    fontSize: 10,
    fontWeight: theme.fontWeight.bold,
    color: '#fff',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
  walletDetails: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    paddingTop: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  detailLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
  },
  detailValue: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textPrimary,
  },
  walletActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  actionText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.primary,
  },
  deleteButton: {},
});
