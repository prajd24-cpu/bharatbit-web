import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { CryptoPriceList } from '../../components/CryptoPriceChart';
import axios from 'axios';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function DashboardScreen() {
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [balance, setBalance] = useState<any>({});

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [ordersRes, balanceRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/orders/my-orders`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${BACKEND_URL}/api/wallet/balance`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setOrders(ordersRes.data.slice(0, 5));
      setBalance(balanceRes.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleRMContact = (type: 'phone' | 'whatsapp') => {
    if (type === 'phone' && user?.rm_phone) {
      Linking.openURL(`tel:${user.rm_phone}`);
    } else if (type === 'whatsapp' && user?.rm_whatsapp) {
      Linking.openURL(`https://wa.me/${user.rm_whatsapp}`);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.gold} />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good day,</Text>
            <Text style={styles.userName}>{user?.email?.split('@')[0] || 'Investor'}</Text>
          </View>
          <TouchableOpacity onPress={logout}>
            <Ionicons name="log-out-outline" size={28} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* KYC Status Banner */}
        {user?.kyc_status !== 'approved' && (
          <TouchableOpacity 
            style={[
              styles.kycBanner, 
              { backgroundColor: user?.kyc_status === 'rejected' ? theme.colors.error + '15' : 
                                 user?.kyc_status === 'under_review' ? theme.colors.warning + '15' : 
                                 theme.colors.primary + '15' }
            ]}
            onPress={() => {
              if (user?.kyc_status === 'pending') {
                router.push('/kyc/submit');
              }
            }}
          >
            <View style={styles.kycBannerContent}>
              <Ionicons 
                name={user?.kyc_status === 'rejected' ? 'alert-circle' : 
                      user?.kyc_status === 'under_review' ? 'time' : 'document-text'} 
                size={32} 
                color={user?.kyc_status === 'rejected' ? theme.colors.error : 
                       user?.kyc_status === 'under_review' ? theme.colors.warning : 
                       theme.colors.primary} 
              />
              <View style={styles.kycBannerText}>
                <Text style={styles.kycBannerTitle}>
                  {user?.kyc_status === 'rejected' ? 'KYC Rejected' :
                   user?.kyc_status === 'under_review' ? 'KYC Under Review' :
                   'Complete Your KYC'}
                </Text>
                <Text style={styles.kycBannerSubtitle}>
                  {user?.kyc_status === 'rejected' ? 'Please resubmit your documents' :
                   user?.kyc_status === 'under_review' ? 'We are reviewing your documents' :
                   'Submit your documents to start trading'}
                </Text>
              </View>
              {user?.kyc_status === 'pending' && (
                <Ionicons name="chevron-forward" size={24} color={theme.colors.primary} />
              )}
            </View>
          </TouchableOpacity>
        )}

        {/* Portfolio Summary */}
        <Card style={styles.portfolioCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="wallet" size={32} color={theme.colors.gold} />
            <Text style={styles.cardTitle}>Portfolio</Text>
          </View>
          <View style={styles.balanceContainer}>
            {Object.keys(balance).length > 0 ? (
              Object.entries(balance).map(([asset, amount]: any) => (
                <View key={asset} style={styles.balanceRow}>
                  <Text style={styles.balanceAsset}>{asset}</Text>
                  <Text style={styles.balanceAmount}>{amount.toFixed(6)}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No assets yet</Text>
            )}
          </View>
        </Card>

        {/* Live Crypto Prices */}
        {token && user?.kyc_status === 'approved' && (
          <CryptoPriceList token={token} />
        )}

        {/* Quick Actions */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/orders/create')}
          >
            <Ionicons name="add-circle" size={32} color={theme.colors.gold} />
            <Text style={styles.actionText}>Place Order</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/orders')}
          >
            <Ionicons name="receipt" size={32} color={theme.colors.gold} />
            <Text style={styles.actionText}>My Orders</Text>
          </TouchableOpacity>
        </View>

        {/* Relationship Manager */}
        {user?.relationship_manager && (
          <Card>
            <View style={styles.cardHeader}>
              <Ionicons name="person-circle" size={32} color={theme.colors.gold} />
              <Text style={styles.cardTitle}>Your Relationship Manager</Text>
            </View>
            <Text style={styles.rmName}>{user.relationship_manager}</Text>
            <View style={styles.rmButtons}>
              {user.rm_phone && (
                <Button
                  title="Call"
                  onPress={() => handleRMContact('phone')}
                  variant="outline"
                  size="sm"
                  style={{ flex: 1, marginRight: 8 }}
                />
              )}
              {user.rm_whatsapp && (
                <Button
                  title="WhatsApp"
                  onPress={() => handleRMContact('whatsapp')}
                  variant="primary"
                  size="sm"
                  style={{ flex: 1 }}
                />
              )}
            </View>
          </Card>
        )}

        {/* Recent Orders */}
        {orders.length > 0 && (
          <Card>
            <View style={styles.cardHeader}>
              <Ionicons name="time" size={24} color={theme.colors.gold} />
              <Text style={styles.cardTitle}>Recent Orders</Text>
            </View>
            {orders.map((order) => (
              <TouchableOpacity
                key={order.id}
                style={styles.orderItem}
                onPress={() => router.push(`/orders/${order.id}`)}
              >
                <View>
                  <Text style={styles.orderAsset}>{order.asset}</Text>
                  <Text style={styles.orderType}>{order.order_type.toUpperCase()}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.orderAmount}>₹{order.total_inr.toLocaleString()}</Text>
                  <Text style={[styles.orderStatus, { color: getStatusColor(order.status) }]}>
                    {order.status.replace('_', ' ')}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return theme.colors.success;
    case 'cancelled': return theme.colors.error;
    case 'processing': return theme.colors.warning;
    default: return theme.colors.info;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  greeting: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  userName: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    textTransform: 'capitalize',
  },
  kycBanner: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  kycBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  kycBannerText: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  kycBannerTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  kycBannerSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  portfolioCard: {
    marginBottom: theme.spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginLeft: theme.spacing.sm,
  },
  balanceContainer: {
    gap: theme.spacing.sm,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  balanceAsset: {
    fontSize: theme.fontSize.md,
    color: theme.colors.gold,
    fontWeight: theme.fontWeight.semibold,
  },
  balanceAmount: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textPrimary,
    fontWeight: theme.fontWeight.medium,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textMuted,
    textAlign: 'center',
    paddingVertical: theme.spacing.lg,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  actionCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actionText: {
    marginTop: theme.spacing.sm,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textPrimary,
    fontWeight: theme.fontWeight.semibold,
  },
  rmName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.gold,
    marginBottom: theme.spacing.md,
  },
  rmButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  orderAsset: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
  orderType: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  orderAmount: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.gold,
  },
  orderStatus: {
    fontSize: theme.fontSize.xs,
    marginTop: 2,
    textTransform: 'uppercase',
  },
});
