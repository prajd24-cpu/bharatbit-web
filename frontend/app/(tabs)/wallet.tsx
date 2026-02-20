import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/Card';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { format } from 'date-fns';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function WalletScreen() {
  const { token } = useAuth();
  const [balance, setBalance] = useState<any>({});
  const [ledger, setLedger] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      const [balanceRes, ledgerRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/wallet/balance`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${BACKEND_URL}/api/wallet/ledger`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setBalance(balanceRes.data);
      setLedger(ledgerRes.data);
    } catch (error) {
      console.error('Error loading wallet:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWalletData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wallet & Ledger</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.gold} />}
      >
        {/* Balance Cards */}
        <View style={styles.balanceSection}>
          <Text style={styles.sectionTitle}>Your Assets</Text>
          {Object.keys(balance).length > 0 ? (
            Object.entries(balance).map(([asset, amount]: any) => (
              <Card key={asset} style={styles.balanceCard}>
                <View style={styles.balanceContent}>
                  <View>
                    <Text style={styles.assetName}>{asset}</Text>
                    <Text style={styles.assetLabel}>Available Balance</Text>
                  </View>
                  <Text style={styles.assetAmount}>{amount.toFixed(6)}</Text>
                </View>
              </Card>
            ))
          ) : (
            <Card>
              <Text style={styles.emptyText}>No assets yet. Place an order to get started.</Text>
            </Card>
          )}
        </View>

        {/* Ledger */}
        <View style={styles.ledgerSection}>
          <Text style={styles.sectionTitle}>Transaction History</Text>
          {ledger.length > 0 ? (
            ledger.map((entry) => (
              <Card key={entry.id} style={styles.ledgerCard}>
                <View style={styles.ledgerRow}>
                  <View style={styles.ledgerIcon}>
                    <Ionicons
                      name={entry.transaction_type === 'credit' ? 'arrow-down-circle' : 'arrow-up-circle'}
                      size={32}
                      color={entry.transaction_type === 'credit' ? theme.colors.success : theme.colors.error}
                    />
                  </View>
                  <View style={styles.ledgerContent}>
                    <Text style={styles.ledgerDesc}>{entry.description}</Text>
                    <Text style={styles.ledgerDate}>
                      {format(new Date(entry.created_at), 'MMM dd, yyyy • hh:mm a')}
                    </Text>
                  </View>
                  <View style={styles.ledgerAmount}>
                    <Text style={[styles.ledgerAmountText, { color: entry.transaction_type === 'credit' ? theme.colors.success : theme.colors.error }]}>
                      {entry.transaction_type === 'credit' ? '+' : '-'}{entry.amount} {entry.asset}
                    </Text>
                    <Text style={styles.ledgerBalance}>Bal: {entry.balance_after}</Text>
                  </View>
                </View>
              </Card>
            ))
          ) : (
            <Card>
              <Text style={styles.emptyText}>No transactions yet</Text>
            </Card>
          )}
        </View>
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
  balanceSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.gold,
    marginBottom: theme.spacing.md,
  },
  balanceCard: {
    marginBottom: theme.spacing.md,
  },
  balanceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assetName: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.gold,
  },
  assetLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  assetAmount: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  ledgerSection: {
    marginBottom: theme.spacing.xl,
  },
  ledgerCard: {
    marginBottom: theme.spacing.md,
  },
  ledgerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  ledgerIcon: {},
  ledgerContent: {
    flex: 1,
  },
  ledgerDesc: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textPrimary,
  },
  ledgerDate: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  ledgerAmount: {
    alignItems: 'flex-end',
  },
  ledgerAmountText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
  },
  ledgerBalance: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textMuted,
    textAlign: 'center',
    paddingVertical: theme.spacing.lg,
  },
});
