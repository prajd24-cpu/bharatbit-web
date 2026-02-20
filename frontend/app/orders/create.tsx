import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import QRCode from 'react-native-qrcode-svg';
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
  const [upiDetails, setUpiDetails] = useState<any>(null);
  
  // Form state
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [asset, setAsset] = useState('USDT');
  const [quantity, setQuantity] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [currentRate, setCurrentRate] = useState<any>(null);

  useEffect(() => {
    loadRatesAndPaymentDetails();
  }, []);

  useEffect(() => {
    if (rates.length > 0 && asset) {
      const rate = rates.find(r => r.asset === asset);
      setCurrentRate(rate);
    }
  }, [asset, rates]);

  const loadRatesAndPaymentDetails = async () => {
    try {
      const [ratesRes, bankRes, upiRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/rates`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${BACKEND_URL}/api/payment/bank-details`),
        axios.get(`${BACKEND_URL}/api/payment/upi-details`)
      ]);
      setRates(ratesRes.data);
      setBankDetails(bankRes.data);
      setUpiDetails(upiRes.data);
      if (ratesRes.data.length > 0) {
        setAsset(ratesRes.data[0].asset);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load rates and payment details');
    }
  };

  const calculateTotal = () => {
    if (!quantity || !currentRate) return 0;
    const rate = orderType === 'buy' ? currentRate.buy_rate : currentRate.sell_rate;
    return parseFloat(quantity) * rate;
  };

  const handleCreateOrder = async () => {
    if (!quantity || parseFloat(quantity) <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    if (orderType === 'sell' && !walletAddress) {
      Alert.alert('Error', 'Please enter your wallet address for crypto transfer');
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

          {/* Asset Selection */}
          <Card>
            <Text style={styles.sectionTitle}>Select Asset</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={asset}
                onValueChange={setAsset}
                style={styles.picker}
                dropdownIconColor={theme.colors.gold}
              >
                {rates.map(rate => (
                  <Picker.Item key={rate.asset} label={rate.asset} value={rate.asset} />
                ))}
              </Picker>
            </View>
            {currentRate && (
              <View style={styles.rateDisplay}>
                <View style={styles.rateRow}>
                  <Text style={styles.rateLabel}>Current {orderType === 'buy' ? 'Buy' : 'Sell'} Rate:</Text>
                  <Text style={styles.rateValue}>
                    ₹{(orderType === 'buy' ? currentRate.buy_rate : currentRate.sell_rate).toLocaleString()}
                  </Text>
                </View>
              </View>
            )}
          </Card>

          {/* Quantity Input */}
          <Card>
            <Input
              label="Quantity *"
              value={quantity}
              onChangeText={setQuantity}
              placeholder="Enter quantity"
              keyboardType="numeric"
              icon="analytics"
            />
            {quantity && currentRate && (
              <View style={styles.totalDisplay}>
                <Text style={styles.totalLabel}>Total Amount:</Text>
                <Text style={styles.totalAmount}>₹{calculateTotal().toLocaleString()}</Text>
              </View>
            )}
          </Card>

          {/* Wallet Address for SELL orders */}
          {orderType === 'sell' && (
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

          {/* Payment Instructions for BUY orders */}
          {orderType === 'buy' && bankDetails && (
            <Card>
              <Text style={styles.sectionTitle}>Payment Details</Text>
              <Text style={styles.instructionText}>
                After placing the order, transfer ₹{calculateTotal().toLocaleString()} to:
              </Text>
              
              <View style={styles.paymentMethod}>
                <Text style={styles.methodTitle}>Bank Transfer (NEFT/RTGS)</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Bank Name:</Text>
                  <Text style={styles.detailValue}>{bankDetails.bank_name}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Account Holder:</Text>
                  <Text style={styles.detailValue}>{bankDetails.account_holder}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Account Number:</Text>
                  <Text style={styles.detailValue}>{bankDetails.account_number}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>IFSC Code:</Text>
                  <Text style={styles.detailValue}>{bankDetails.ifsc}</Text>
                </View>
              </View>

              {upiDetails && (
                <View style={styles.paymentMethod}>
                  <Text style={styles.methodTitle}>UPI Payment</Text>
                  <Text style={styles.detailValue}>UPI ID: {upiDetails.upi_id}</Text>
                  <View style={styles.qrContainer}>
                    <Text style={styles.qrLabel}>Scan QR Code:</Text>
                    <View style={styles.qrCode}>
                      <QRCode
                        value={upiDetails.upi_id}
                        size={150}
                        backgroundColor={theme.colors.textPrimary}
                      />
                    </View>
                  </View>
                </View>
              )}
            </Card>
          )}

          <Button
            title={`Place ${orderType.toUpperCase()} Order`}
            onPress={handleCreateOrder}
            loading={loading}
            size="lg"
            style={{ marginTop: theme.spacing.lg }}
          />

          <Text style={styles.disclaimer}>
            By placing this order, you agree to our terms and conditions. Orders are processed manually and may take 1-24 hours.
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
    fontWeight: theme.fontWeight.bold,
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
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.gold,
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
    backgroundColor: theme.colors.gold,
    borderColor: theme.colors.gold,
  },
  toggleText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textSecondary,
  },
  toggleTextActive: {
    color: theme.colors.background,
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
  },
  rateLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  rateValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.gold,
  },
  totalDisplay: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.gold,
  },
  totalLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  totalAmount: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.gold,
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
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.md,
  },
  methodTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.gold,
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
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textPrimary,
  },
  qrContainer: {
    marginTop: theme.spacing.md,
    alignItems: 'center',
  },
  qrLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  qrCode: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.textPrimary,
    borderRadius: theme.borderRadius.md,
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
    fontWeight: theme.fontWeight.bold,
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