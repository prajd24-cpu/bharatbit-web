import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

type AdminTab = 'dashboard' | 'kyc' | 'orders' | 'rates' | 'users';

export default function AdminPanelScreen() {
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [analytics, setAnalytics] = useState<any>(null);
  const [pendingKYC, setPendingKYC] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [rates, setRates] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (user?.role !== 'admin') {
      Alert.alert('Access Denied', 'You do not have admin access', [
        { text: 'OK', onPress: () => router.replace('/(tabs)/dashboard') }
      ]);
      return;
    }
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      if (activeTab === 'dashboard') {
        const res = await axios.get(`${BACKEND_URL}/api/admin/analytics`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAnalytics(res.data);
      } else if (activeTab === 'kyc') {
        const res = await axios.get(`${BACKEND_URL}/api/admin/kyc-pending`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPendingKYC(res.data);
      } else if (activeTab === 'orders') {
        const res = await axios.get(`${BACKEND_URL}/api/admin/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAllOrders(res.data);
      } else if (activeTab === 'rates') {
        const res = await axios.get(`${BACKEND_URL}/api/admin/rates`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRates(res.data);
      } else if (activeTab === 'users') {
        const res = await axios.get(`${BACKEND_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(res.data);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Admin Panel</Text>
          <Text style={styles.headerSubtitle}>BharatBit OTC Desk</Text>
        </View>
        <TouchableOpacity onPress={logout}>
          <Ionicons name="log-out-outline" size={28} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
        <AdminTab
          icon="stats-chart"
          label="Dashboard"
          active={activeTab === 'dashboard'}
          onPress={() => setActiveTab('dashboard')}
        />
        <AdminTab
          icon="document-text"
          label="KYC"
          active={activeTab === 'kyc'}
          onPress={() => setActiveTab('kyc')}
          badge={pendingKYC.length}
        />
        <AdminTab
          icon="receipt"
          label="Orders"
          active={activeTab === 'orders'}
          onPress={() => setActiveTab('orders')}
        />
        <AdminTab
          icon="pricetag"
          label="Rates"
          active={activeTab === 'rates'}
          onPress={() => setActiveTab('rates')}
        />
        <AdminTab
          icon="people"
          label="Users"
          active={activeTab === 'users'}
          onPress={() => setActiveTab('users')}
        />
      </ScrollView>

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.gold} />}
      >
        {activeTab === 'dashboard' && <DashboardTab analytics={analytics} />}
        {activeTab === 'kyc' && <KYCTab pendingKYC={pendingKYC} token={token} onRefresh={loadData} />}
        {activeTab === 'orders' && <OrdersTab orders={allOrders} token={token} onRefresh={loadData} />}
        {activeTab === 'rates' && <RatesTab rates={rates} token={token} onRefresh={loadData} />}
        {activeTab === 'users' && <UsersTab users={users} token={token} onRefresh={loadData} />}
      </ScrollView>
    </SafeAreaView>
  );
}

// Tab Component
const AdminTab = ({ icon, label, active, onPress, badge }: any) => (
  <TouchableOpacity
    style={[styles.tab, active && styles.tabActive]}
    onPress={onPress}
  >
    <View>
      <Ionicons name={icon} size={24} color={active ? theme.colors.gold : theme.colors.textMuted} />
      {badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
    </View>
    <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
  </TouchableOpacity>
);

// Dashboard Tab
const DashboardTab = ({ analytics }: any) => {
  if (!analytics) return <Text style={styles.loadingText}>Loading...</Text>;

  return (
    <View>
      <View style={styles.statsGrid}>
        <StatCard icon="people" label="Total Users" value={analytics.total_users} color={theme.colors.info} />
        <StatCard icon="document-text" label="Pending KYC" value={analytics.pending_kyc} color={theme.colors.warning} />
        <StatCard icon="checkmark-circle" label="Approved KYC" value={analytics.approved_kyc} color={theme.colors.success} />
        <StatCard icon="receipt" label="Total Orders" value={analytics.total_orders} color={theme.colors.gold} />
        <StatCard icon="time" label="Pending Orders" value={analytics.pending_orders} color={theme.colors.warning} />
        <StatCard icon="checkmark-done" label="Completed Orders" value={analytics.completed_orders} color={theme.colors.success} />
      </View>

      <Card>
        <Text style={styles.sectionTitle}>Total Volume</Text>
        <Text style={styles.volumeText}>₹{analytics.total_volume_inr.toLocaleString()}</Text>
      </Card>
    </View>
  );
};

const StatCard = ({ icon, label, value, color }: any) => (
  <Card style={styles.statCard}>
    <Ionicons name={icon} size={32} color={color} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </Card>
);

// KYC Tab
const KYCTab = ({ pendingKYC, token, onRefresh }: any) => {
  const [selectedKYC, setSelectedKYC] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadKYCDetail = async (kycId: string) => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/admin/kyc/${kycId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedKYC(res.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load KYC details');
    }
  };

  const handleKYCAction = async (action: 'approve' | 'reject', reason?: string) => {
    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/admin/kyc/action`, {
        kyc_id: selectedKYC.id,
        action,
        rejection_reason: reason
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Alert.alert('Success', `KYC ${action}d successfully`);
      setSelectedKYC(null);
      onRefresh();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || `Failed to ${action} KYC`);
    } finally {
      setLoading(false);
    }
  };

  if (selectedKYC) {
    return (
      <View>
        <TouchableOpacity style={styles.backButton} onPress={() => setSelectedKYC(null)}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.gold} />
          <Text style={styles.backButtonText}>Back to List</Text>
        </TouchableOpacity>

        <Card>
          <Text style={styles.sectionTitle}>User Information</Text>
          <Text style={styles.detailText}>Email: {selectedKYC.user?.email}</Text>
          <Text style={styles.detailText}>Mobile: {selectedKYC.user?.mobile}</Text>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>PAN Details</Text>
          <Text style={styles.detailText}>PAN: {selectedKYC.pan_number}</Text>
          <Text style={styles.label}>PAN Card Image:</Text>
          <Image source={{ uri: selectedKYC.pan_image }} style={styles.docImage} />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Aadhaar Details</Text>
          <Text style={styles.detailText}>Aadhaar: {selectedKYC.aadhaar_number}</Text>
          <Text style={styles.label}>Aadhaar Front:</Text>
          <Image source={{ uri: selectedKYC.aadhaar_front }} style={styles.docImage} />
          <Text style={styles.label}>Aadhaar Back:</Text>
          <Image source={{ uri: selectedKYC.aadhaar_back }} style={styles.docImage} />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Selfie & Address</Text>
          <Text style={styles.label}>Selfie:</Text>
          <Image source={{ uri: selectedKYC.selfie_image }} style={styles.docImage} />
          <Text style={styles.label}>Address Proof:</Text>
          <Image source={{ uri: selectedKYC.address_proof }} style={styles.docImage} />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Bank Details</Text>
          <Text style={styles.detailText}>Account Holder: {selectedKYC.account_holder_name}</Text>
          <Text style={styles.detailText}>Account Number: {selectedKYC.bank_account_number}</Text>
          <Text style={styles.detailText}>IFSC: {selectedKYC.bank_ifsc}</Text>
          <Text style={styles.detailText}>Bank: {selectedKYC.bank_name}</Text>
        </Card>

        <View style={styles.actionButtons}>
          <Button
            title="Approve KYC"
            onPress={() => handleKYCAction('approve')}
            loading={loading}
            style={{ flex: 1, marginRight: 8 }}
          />
          <Button
            title="Reject KYC"
            onPress={() => {
              Alert.prompt('Rejection Reason', 'Enter reason for rejection:', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Reject', onPress: (reason) => handleKYCAction('reject', reason) }
              ]);
            }}
            variant="danger"
            loading={loading}
            style={{ flex: 1 }}
          />
        </View>
      </View>
    );
  }

  return (
    <View>
      {pendingKYC.length === 0 ? (
        <Card>
          <Text style={styles.emptyText}>No pending KYC applications</Text>
        </Card>
      ) : (
        pendingKYC.map((kyc) => (
          <TouchableOpacity key={kyc.id} onPress={() => loadKYCDetail(kyc.id)}>
            <Card style={styles.listCard}>
              <View style={styles.listCardContent}>
                <View>
                  <Text style={styles.listCardTitle}>{kyc.user_email}</Text>
                  <Text style={styles.listCardSubtitle}>{kyc.user_mobile}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={theme.colors.textMuted} />
              </View>
            </Card>
          </TouchableOpacity>
        ))
      )}
    </View>
  );
};

// Orders Tab
const OrdersTab = ({ orders, token, onRefresh }: any) => {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdateOrder = async () => {
    setLoading(true);
    try {
      await axios.put(`${BACKEND_URL}/api/admin/orders/update`, {
        order_id: selectedOrder.id,
        status: newStatus,
        notes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Alert.alert('Success', 'Order updated successfully');
      setSelectedOrder(null);
      onRefresh();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to update order');
    } finally {
      setLoading(false);
    }
  };

  if (selectedOrder) {
    return (
      <View>
        <TouchableOpacity style={styles.backButton} onPress={() => setSelectedOrder(null)}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.gold} />
          <Text style={styles.backButtonText}>Back to List</Text>
        </TouchableOpacity>

        <Card>
          <Text style={styles.sectionTitle}>Order #{selectedOrder.order_id}</Text>
          <Text style={styles.detailText}>User: {selectedOrder.user_email}</Text>
          <Text style={styles.detailText}>Type: {selectedOrder.order_type.toUpperCase()}</Text>
          <Text style={styles.detailText}>Asset: {selectedOrder.asset}</Text>
          <Text style={styles.detailText}>Quantity: {selectedOrder.quantity}</Text>
          <Text style={styles.detailText}>Total: ₹{selectedOrder.total_inr.toLocaleString()}</Text>
          <Text style={styles.detailText}>Status: {selectedOrder.status}</Text>
          {selectedOrder.utr_number && (
            <Text style={styles.detailText}>UTR: {selectedOrder.utr_number}</Text>
          )}
        </Card>

        {selectedOrder.payment_proof && (
          <Card>
            <Text style={styles.sectionTitle}>Payment Proof</Text>
            <Image source={{ uri: selectedOrder.payment_proof }} style={styles.docImage} />
          </Card>
        )}

        <Card>
          <Text style={styles.sectionTitle}>Update Order Status</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={newStatus || selectedOrder.status}
              onValueChange={setNewStatus}
              style={styles.picker}
            >
              <Picker.Item label="Awaiting Payment" value="awaiting_payment" />
              <Picker.Item label="Payment Confirmed" value="payment_confirmed" />
              <Picker.Item label="Processing" value="processing" />
              <Picker.Item label="Completed" value="completed" />
              <Picker.Item label="Cancelled" value="cancelled" />
            </Picker>
          </View>
          <Input
            label="Admin Notes"
            value={notes}
            onChangeText={setNotes}
            placeholder="Add notes for this order"
            multiline
          />
          <Button
            title="Update Order"
            onPress={handleUpdateOrder}
            loading={loading}
            style={{ marginTop: theme.spacing.md }}
          />
        </Card>
      </View>
    );
  }

  return (
    <View>
      {orders.length === 0 ? (
        <Card>
          <Text style={styles.emptyText}>No orders yet</Text>
        </Card>
      ) : (
        orders.map((order: any) => (
          <TouchableOpacity key={order.id} onPress={() => setSelectedOrder(order)}>
            <Card style={styles.listCard}>
              <View style={styles.listCardContent}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.listCardTitle}>#{order.order_id}</Text>
                  <Text style={styles.listCardSubtitle}>
                    {order.user_email} • {order.asset} • ₹{order.total_inr.toLocaleString()}
                  </Text>
                  <Text style={styles.listCardStatus}>{order.status}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={theme.colors.textMuted} />
              </View>
            </Card>
          </TouchableOpacity>
        ))
      )}
    </View>
  );
};

// Rates Tab
const RatesTab = ({ rates, token, onRefresh }: any) => {
  const [asset, setAsset] = useState('USDT');
  const [buyRate, setBuyRate] = useState('');
  const [sellRate, setSellRate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdateRate = async () => {
    if (!buyRate || !sellRate) {
      Alert.alert('Error', 'Please enter both buy and sell rates');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/admin/rates/update`, {
        asset,
        buy_rate: parseFloat(buyRate),
        sell_rate: parseFloat(sellRate)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Alert.alert('Success', 'Rates updated successfully');
      setBuyRate('');
      setSellRate('');
      onRefresh();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to update rates');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Card>
        <Text style={styles.sectionTitle}>Update Asset Rates</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={asset}
            onValueChange={setAsset}
            style={styles.picker}
          >
            <Picker.Item label="USDT" value="USDT" />
            <Picker.Item label="BTC" value="BTC" />
            <Picker.Item label="ETH" value="ETH" />
          </Picker>
        </View>
        <Input
          label="Buy Rate (₹)"
          value={buyRate}
          onChangeText={setBuyRate}
          placeholder="Enter buy rate"
          keyboardType="numeric"
        />
        <Input
          label="Sell Rate (₹)"
          value={sellRate}
          onChangeText={setSellRate}
          placeholder="Enter sell rate"
          keyboardType="numeric"
        />
        <Button
          title="Update Rates"
          onPress={handleUpdateRate}
          loading={loading}
        />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Current Rates</Text>
        {rates.map((rate: any) => (
          <View key={rate.id} style={styles.rateRow}>
            <Text style={styles.rateAsset}>{rate.asset}</Text>
            <View>
              <Text style={styles.rateText}>Buy: ₹{rate.buy_rate.toLocaleString()}</Text>
              <Text style={styles.rateText}>Sell: ₹{rate.sell_rate.toLocaleString()}</Text>
            </View>
          </View>
        ))}
      </Card>
    </View>
  );
};

// Users Tab
const UsersTab = ({ users, token, onRefresh }: any) => {
  return (
    <View>
      {users.length === 0 ? (
        <Card>
          <Text style={styles.emptyText}>No users yet</Text>
        </Card>
      ) : (
        users.map((user: any) => (
          <Card key={user.id} style={styles.listCard}>
            <View style={styles.listCardContent}>
              <View style={{ flex: 1 }}>
                <Text style={styles.listCardTitle}>{user.email}</Text>
                <Text style={styles.listCardSubtitle}>{user.mobile}</Text>
                <Text style={styles.listCardStatus}>KYC: {user.kyc_status}</Text>
              </View>
            </View>
          </Card>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gold,
    marginTop: 2,
  },
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    paddingHorizontal: theme.spacing.sm,
  },
  tab: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: theme.colors.gold,
  },
  tabText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
  tabTextActive: {
    color: theme.colors.gold,
    fontWeight: theme.fontWeight.semibold,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: theme.colors.textPrimary,
    fontSize: 10,
    fontWeight: theme.fontWeight.bold,
  },
  content: {
    padding: theme.spacing.lg,
  },
  loadingText: {
    textAlign: 'center',
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.md,
    paddingVertical: theme.spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  statValue: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.sm,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.gold,
    marginBottom: theme.spacing.md,
  },
  volumeText: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.gold,
    textAlign: 'center',
  },
  listCard: {
    marginBottom: theme.spacing.md,
  },
  listCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listCardTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
  listCardSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  listCardStatus: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gold,
    marginTop: 4,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  backButtonText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.gold,
    fontWeight: theme.fontWeight.medium,
  },
  detailText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  label: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  docImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  pickerContainer: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
  },
  picker: {
    color: theme.colors.textPrimary,
    height: 50,
  },
  rateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  rateAsset: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.gold,
  },
  rateText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textPrimary,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.md,
    paddingVertical: theme.spacing.lg,
  },
});
