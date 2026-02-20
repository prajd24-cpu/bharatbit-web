import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { format } from 'date-fns';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function OrderDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { token } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [paymentProof, setPaymentProof] = useState('');
  const [utrNumber, setUtrNumber] = useState('');

  useEffect(() => {
    loadOrderDetails();
  }, []);

  const loadOrderDetails = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/orders/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrder(response.data);
      if (response.data.utr_number) {
        setUtrNumber(response.data.utr_number);
      }
    } catch (error) {
      console.error('Error loading order:', error);
      Alert.alert('Error', 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const pickPaymentProof = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setPaymentProof(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handleUploadPayment = async () => {
    if (!paymentProof) {
      Alert.alert('Error', 'Please upload payment proof');
      return;
    }

    if (!utrNumber) {
      Alert.alert('Error', 'Please enter UTR number');
      return;
    }

    setUploading(true);
    try {
      await axios.put(`${BACKEND_URL}/api/orders/${params.id}/update`, {
        payment_proof: paymentProof,
        utr_number: utrNumber
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Alert.alert('Success', 'Payment details uploaded successfully');
      loadOrderDetails();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to upload payment details');
    } finally {
      setUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return theme.colors.success;
      case 'cancelled': return theme.colors.error;
      case 'processing':
      case 'payment_confirmed': return theme.colors.warning;
      default: return theme.colors.info;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return 'checkmark-circle';
      case 'cancelled': return 'close-circle';
      case 'processing': return 'sync';
      case 'payment_confirmed': return 'checkmark-done';
      default: return 'time';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Loading order...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Order not found</Text>
          <Button title="Go Back" onPress={() => router.back()} style={{ marginTop: theme.spacing.lg }} />
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
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Order Header */}
        <Card>
          <View style={styles.orderHeader}>
            <Text style={styles.orderID}>#{order.order_id}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
              <Ionicons name={getStatusIcon(order.status)} size={20} color={getStatusColor(order.status)} />
              <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                {order.status.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.orderTypeBadge}>
            <Text style={[styles.orderType, { color: order.order_type === 'buy' ? theme.colors.success : theme.colors.error }]}>
              {order.order_type.toUpperCase()} ORDER
            </Text>
          </View>
        </Card>

        {/* Order Details */}
        <Card>
          <Text style={styles.sectionTitle}>Order Information</Text>
          <DetailRow label="Asset" value={order.asset} />
          <DetailRow label="Quantity" value={order.quantity.toString()} />
          <DetailRow label="Rate" value={`₹${order.rate.toLocaleString()}`} />
          <DetailRow label="Total Amount" value={`₹${order.total_inr.toLocaleString()}`} highlight />
          {order.wallet_address && (
            <DetailRow label="Wallet Address" value={order.wallet_address} />
          )}
          <DetailRow
            label="Created"
            value={format(new Date(order.created_at), 'MMM dd, yyyy • hh:mm a')}
          />
          {order.completed_at && (
            <DetailRow
              label="Completed"
              value={format(new Date(order.completed_at), 'MMM dd, yyyy • hh:mm a')}
            />
          )}
        </Card>

        {/* Payment Upload Section - Only for BUY orders awaiting payment */}
        {order.order_type === 'buy' && order.status === 'awaiting_payment' && (
          <Card>
            <Text style={styles.sectionTitle}>Upload Payment Proof</Text>
            <Text style={styles.instructionText}>
              Please transfer ₹{order.total_inr.toLocaleString()} and upload payment proof with UTR number.
            </Text>

            <TouchableOpacity
              style={[styles.uploadButton, paymentProof && styles.uploadButtonSuccess]}
              onPress={pickPaymentProof}
            >
              <Ionicons
                name={paymentProof ? 'checkmark-circle' : 'cloud-upload'}
                size={32}
                color={paymentProof ? theme.colors.success : theme.colors.gold}
              />
              <Text style={styles.uploadButtonText}>
                {paymentProof ? 'Payment Proof Uploaded' : 'Upload Payment Screenshot'}
              </Text>
            </TouchableOpacity>

            {paymentProof && (
              <View style={styles.previewContainer}>
                <Image source={{ uri: paymentProof }} style={styles.preview} />
              </View>
            )}

            <Input
              label="UTR Number *"
              value={utrNumber}
              onChangeText={setUtrNumber}
              placeholder="Enter UTR/Reference Number"
              icon="document-text"
            />

            <Button
              title="Submit Payment Details"
              onPress={handleUploadPayment}
              loading={uploading}
              size="lg"
              style={{ marginTop: theme.spacing.md }}
            />
          </Card>
        )}

        {/* Payment Status - If payment proof uploaded */}
        {order.payment_proof && (
          <Card>
            <Text style={styles.sectionTitle}>Payment Details</Text>
            {order.utr_number && <DetailRow label="UTR Number" value={order.utr_number} />}
            <Text style={styles.label}>Payment Proof:</Text>
            <Image source={{ uri: order.payment_proof }} style={styles.paymentProofImage} />
          </Card>
        )}

        {/* Notes from Admin */}
        {order.notes && (
          <Card>
            <Text style={styles.sectionTitle}>Admin Notes</Text>
            <Text style={styles.notesText}>{order.notes}</Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const DetailRow = ({ label, value, highlight = false }: any) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}:</Text>
    <Text style={[styles.detailValue, highlight && styles.detailValueHighlight]}>{value}</Text>
  </View>
);

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
  scrollContent: {
    padding: theme.spacing.lg,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  orderID: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  statusText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
  },
  orderTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  orderType: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.gold,
    marginBottom: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  detailLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  detailValue: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textPrimary,
    fontWeight: theme.fontWeight.medium,
    flex: 1,
    textAlign: 'right',
  },
  detailValueHighlight: {
    color: theme.colors.gold,
    fontWeight: theme.fontWeight.bold,
    fontSize: theme.fontSize.lg,
  },
  instructionText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: theme.colors.gold,
    marginBottom: theme.spacing.md,
  },
  uploadButtonSuccess: {
    borderColor: theme.colors.success,
    borderStyle: 'solid',
  },
  uploadButtonText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textPrimary,
    fontWeight: theme.fontWeight.medium,
  },
  previewContainer: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  preview: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    backgroundColor: theme.colors.backgroundSecondary,
  },
  label: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  paymentProofImage: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.md,
  },
  notesText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textPrimary,
    lineHeight: 24,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
  },
  errorText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.error,
  },
});
