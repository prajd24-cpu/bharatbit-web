import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function CreateOrderScreen() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [rates, setRates] = useState<any[]>([]);
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [walletBalances, setWalletBalances] = useState<any[]>([]);
  const [kycData, setKycData] = useState<any>(null);
  
  // Form state
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [asset, setAsset] = useState('USDT');
  const [quantity, setQuantity] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [currentRate, setCurrentRate] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (rates.length > 0 && asset) {
      const rate = rates.find(r => r.asset === asset);
      setCurrentRate(rate);
    }
  }, [asset, rates]);

  const loadData = async () => {
    try {
      const [ratesRes, bankRes, balanceRes, kycRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/rates`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${BACKEND_URL}/api/payment/bank-details`),
        axios.get(`${BACKEND_URL}/api/wallet/balance`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] })),
        axios.get(`${BACKEND_URL}/api/kyc/document`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: null }))
      ]);
      
      setRates(ratesRes.data);
      setBankDetails(bankRes.data);
      setWalletBalances(balanceRes.data || []);
      setKycData(kycRes.data);
      
      if (ratesRes.data.length > 0) {
        setAsset(ratesRes.data[0].asset);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    }
  };

  const calculateTotal = () => {
    if (!quantity || !currentRate) return 0;
    const rate = orderType === 'buy' ? currentRate.buy_rate : currentRate.sell_rate;
    return parseFloat(quantity) * rate;
  };

  const getAssetBalance = (assetName: string) => {
    const balance = walletBalances.find(b => b.asset === assetName);
    return balance ? balance.balance : 0;
  };

  const handleCreateOrder = async () => {
    if (!quantity || parseFloat(quantity) <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    // For SELL orders, check if user has enough balance
    if (orderType === 'sell') {
      const balance = getAssetBalance(asset);
      if (parseFloat(quantity) > balance) {
        Alert.alert('Error', `Insufficient balance. You have ${balance} ${asset}`);
        return;
      }
    }

    // For BUY orders, wallet address is required
    if (orderType === 'buy' && !walletAddress) {
      Alert.alert('Error', 'Please enter your wallet address to receive crypto');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/orders/create`, {
        order_type: orderType,
        asset: asset,
        quantity: parseFloat(quantity),
        wallet_address: walletAddress || null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Alert.alert(
        'Order Created!',
        `Your ${orderType.toUpperCase()} order for ${quantity} ${asset} has been created successfully.`,
        [
          {
            text: 'View Order',
            onPress: () => router.replace(`/orders/${response.data.order.id}`)
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  if (user?.kyc_status !== 'approved') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle" size={64} color={theme.colors.warning} />
          <Text style={styles.statusTitle}>KYC Approval Required</Text>
          <Text style={styles.statusText}>Your KYC must be approved before you can place orders.</Text>
          <Button
            title="Go Back"
            onPress={() => router.back()}
            style={{ marginTop: theme.spacing.lg }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Place Order</Text>
        <View style={{ width: 28 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Order Type Toggle */}
          <Card>
            <Text style={styles.sectionTitle}>Order Type</Text>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleButton, orderType === 'buy' && styles.toggleButtonActive]}
                onPress={() => setOrderType('buy')}
              >
                <Text style={[styles.toggleText, orderType === 'buy' && styles.toggleTextActive]}>BUY</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, orderType === 'sell' && styles.toggleButtonActive]}
                onPress={() => setOrderType('sell')}
              >
                <Text style={[styles.toggleText, orderType === 'sell' && styles.toggleTextActive]}>SELL</Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* SELL: Show Wallet Balances */}
          {orderType === 'sell' && (
            <Card>
              <Text style={styles.sectionTitle}>Your Wallet Balances</Text>
              {walletBalances.length > 0 ? (
                <View style={styles.balanceList}>
                  {walletBalances.map((bal, idx) => (
                    <TouchableOpacity 
                      key={idx} 
                      style={[
                        styles.balanceItem,
                        asset === bal.asset && styles.balanceItemSelected
                      ]}
                      onPress={() => setAsset(bal.asset)}
                    >
                      <Text style={styles.balanceAsset}>{bal.asset}</Text>
                      <Text style={styles.balanceAmount}>{bal.balance.toFixed(4)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyBalance}>
                  <Ionicons name="wallet-outline" size={48} color={theme.colors.textMuted} />
                  <Text style={styles.emptyText}>No assets in wallet</Text>
                  <Text style={styles.emptySubtext}>Buy crypto first to start selling</Text>
                </View>
              )}
            </Card>
          )}

          {/* Asset Selection */}
          <Card>
            <Text style={styles.sectionTitle}>Select Asset</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={asset}
                onValueChange={setAsset}
                style={styles.picker}
                dropdownIconColor={theme.colors.primary}
              >
                {rates.map(rate => (
                  <Picker.Item key={rate.asset} label={rate.asset} value={rate.asset} />
                ))}
              </Picker>
            </View>
            {currentRate && (
              <View style={styles.rateDisplay}>
                <View style={styles.rateRow}>
                  <Text style={styles.rateLabel}>Indicative {orderType === 'buy' ? 'Buy' : 'Sell'} Rate:</Text>
                  <Text style={styles.rateValue}>
                    ₹{(orderType === 'buy' ? currentRate.buy_rate : currentRate.sell_rate).toLocaleString()}
                  </Text>
                </View>
                {orderType === 'sell' && (
                  <View style={styles.rateRow}>
                    <Text style={styles.rateLabel}>Available Balance:</Text>
                    <Text style={styles.balanceValue}>{getAssetBalance(asset)} {asset}</Text>
                  </View>
                )}
                <View style={styles.rateNotice}>
                  <Ionicons name="information-circle" size={16} color={theme.colors.warning} />
                  <Text style={styles.rateNoticeText}>
                    Rate is indicative only. Final rate will be confirmed at time of execution.
                  </Text>
                </View>
              </View>
            )}
          </Card>

          {/* Quantity Input */}
          <Card>
            <Input
              label={orderType === 'sell' ? `Quantity to Sell *` : `Quantity to Buy *`}
              value={quantity}
              onChangeText={setQuantity}
              placeholder="Enter quantity"
              keyboardType="numeric"
              icon="analytics"
            />
            {orderType === 'sell' && getAssetBalance(asset) > 0 && (
              <TouchableOpacity 
                style={styles.maxButton}
                onPress={() => setQuantity(getAssetBalance(asset).toString())}
              >
                <Text style={styles.maxButtonText}>Use Max ({getAssetBalance(asset)} {asset})</Text>
              </TouchableOpacity>
            )}
            {quantity && currentRate && (
              <View style={styles.totalDisplay}>
                <Text style={styles.totalLabel}>
                  {orderType === 'buy' ? 'Estimated Amount to Pay:' : 'Estimated Amount You Will Receive:'}
                </Text>
                <Text style={styles.totalAmount}>₹{calculateTotal().toLocaleString()}</Text>
                <Text style={styles.estimateNote}>*Final amount confirmed at execution</Text>
              </View>
            )}
          </Card>

          {/* BUY: Wallet Address Input */}
          {orderType === 'buy' && (
            <Card>
              <Input
                label="Your Wallet Address *"
                value={walletAddress}
                onChangeText={setWalletAddress}
                placeholder="Enter your crypto wallet address"
                icon="wallet"
                autoCapitalize="none"
              />
              <Text style={styles.helperText}>
                We'll transfer {asset} to this address after payment confirmation.
              </Text>
            </Card>
          )}

          {/* BUY: Payment Details */}
          {orderType === 'buy' && bankDetails && (
            <Card>
              <Text style={styles.sectionTitle}>Payment Details</Text>
              <Text style={styles.instructionText}>
                After placing the order, transfer ₹{calculateTotal().toLocaleString()} to:
              </Text>
              
              <View style={styles.paymentMethod}>
                <Text style={styles.methodTitle}>Bank Transfer (NEFT/RTGS/IMPS)</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Account Name:</Text>
                  <Text style={styles.detailValue}>{bankDetails.account_name}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Account Number:</Text>
                  <Text style={styles.detailValue}>{bankDetails.account_number}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>IFSC Code:</Text>
                  <Text style={styles.detailValue}>{bankDetails.ifsc_code}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Bank:</Text>
                  <Text style={styles.detailValue}>{bankDetails.bank_name}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Branch:</Text>
                  <Text style={styles.detailValue}>{bankDetails.branch}</Text>
                </View>
              </View>
            </Card>
          )}

          {/* SELL: User's Bank Details for Payment */}
          {orderType === 'sell' && kycData && (
            <Card>
              <Text style={styles.sectionTitle}>Payment Will Be Sent To</Text>
              <Text style={styles.instructionText}>
                Amount ₹{calculateTotal().toLocaleString()} will be transferred to your registered bank account:
              </Text>
              
              <View style={styles.paymentMethod}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Account Holder:</Text>
                  <Text style={styles.detailValue}>{kycData.account_holder_name}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Bank:</Text>
                  <Text style={styles.detailValue}>{kycData.bank_name}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Account Number:</Text>
                  <Text style={styles.detailValue}>{kycData.bank_account_number}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>IFSC Code:</Text>
                  <Text style={styles.detailValue}>{kycData.bank_ifsc}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Branch:</Text>
                  <Text style={styles.detailValue}>{kycData.bank_branch}</Text>
                </View>
              </View>
              
              <Text style={styles.helperText}>
                Payment will be processed within 1-24 hours after order confirmation.
              </Text>
            </Card>
          )}

          {/* SELL: No KYC bank details warning */}
          {orderType === 'sell' && !kycData && (
            <Card>
              <View style={styles.warningBox}>
                <Ionicons name="warning" size={24} color={theme.colors.warning} />
                <Text style={styles.warningText}>
                  Bank details not found. Please complete your KYC to sell crypto.
                </Text>
              </View>
            </Card>
          )}

          <Button
            title={`Place ${orderType.toUpperCase()} Order`}
            onPress={handleCreateOrder}
            loading={loading}
            disabled={orderType === 'sell' && (!kycData || walletBalances.length === 0)}
            size="lg"
            style={{ marginTop: theme.spacing.lg }}
          />

          <Text style={styles.disclaimer}>
            By placing this order, you agree to our terms and conditions. All orders are executed manually with price confirmation. Rates shown are indicative only and final execution rate may vary based on market conditions. Orders are typically processed within 1-24 hours.
          </Text>
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
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  toggleButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  toggleText: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  balanceList: {
    gap: theme.spacing.sm,
  },
  balanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  balanceItemSelected: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  balanceAsset: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  balanceAmount: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  emptyBalance: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.textMuted,
    marginTop: theme.spacing.md,
  },
  emptySubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
  pickerContainer: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    overflow: 'hidden',
  },
  picker: {
    color: theme.colors.textPrimary,
    height: 50,
  },
  rateDisplay: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.sm,
  },
  rateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  rateLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  rateValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  rateNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    gap: theme.spacing.xs,
  },
  rateNoticeText: {
    flex: 1,
    fontSize: theme.fontSize.xs,
    color: theme.colors.warning,
    fontStyle: 'italic',
  },
  balanceValue: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.success,
  },
  maxButton: {
    alignSelf: 'flex-end',
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.primary + '20',
    borderRadius: theme.borderRadius.sm,
  },
  maxButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  totalDisplay: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  totalLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  estimateNote: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
    marginTop: theme.spacing.xs,
  },
  helperText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm,
    fontStyle: 'italic',
  },
  instructionText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  paymentMethod: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.md,
  },
  methodTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xs,
  },
  detailLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
  },
  detailValue: {
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
    color: theme.colors.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.warning + '20',
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  warningText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.warning,
  },
  disclaimer: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    fontStyle: 'italic',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  statusTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.lg,
  },
  statusText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
});
