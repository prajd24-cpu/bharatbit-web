import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

const ASSETS = ['USDT', 'BTC', 'ETH'];
const NETWORKS: Record<string, string[]> = {
  USDT: ['TRC20', 'ERC20', 'BEP20'],
  BTC: ['Bitcoin'],
  ETH: ['ERC20'],
};

const EXCHANGES = [
  'Binance',
  'WazirX',
  'CoinDCX',
  'Bybit',
  'OKX',
  'KuCoin',
  'Coinbase',
  'Kraken',
  'Other',
];

export default function AddWalletScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  // Form state
  const [label, setLabel] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [asset, setAsset] = useState('USDT');
  const [network, setNetwork] = useState('TRC20');
  const [walletType, setWalletType] = useState<'exchange' | 'self_custody'>('exchange');
  const [exchangeName, setExchangeName] = useState('');
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [proofDescription, setProofDescription] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setProofImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!label.trim()) {
      Alert.alert('Error', 'Please enter a wallet label');
      return;
    }
    if (!walletAddress.trim()) {
      Alert.alert('Error', 'Please enter the wallet address');
      return;
    }
    if (walletType === 'exchange' && !exchangeName) {
      Alert.alert('Error', 'Please select an exchange');
      return;
    }
    if (!proofImage) {
      Alert.alert('Error', 'Please upload proof of ownership');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        label: label.trim(),
        wallet_address: walletAddress.trim(),
        asset,
        network,
        wallet_type: walletType,
        exchange_name: walletType === 'exchange' ? exchangeName : null,
        proof_image: proofImage,
        proof_description: proofDescription.trim() || null,
        is_primary: isPrimary,
      };

      await axios.post(`${BACKEND_URL}/api/wallets/save`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Alert.alert(
        'Wallet Saved',
        'Your wallet has been submitted for verification. You will be notified once verified.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to save wallet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Wallet</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Instructions */}
          <Card style={styles.instructionCard}>
            <Text style={styles.instructionTitle}>How to prove wallet ownership</Text>
            <View style={styles.instructionList}>
              <Text style={styles.instructionItem}>
                • <Text style={styles.bold}>Exchange Wallet:</Text> Upload a screenshot from the exchange showing your wallet address with your account name visible
              </Text>
              <Text style={styles.instructionItem}>
                • <Text style={styles.bold}>Self Custody:</Text> Upload a screenshot of your wallet app showing the address, or a signed message proof
              </Text>
            </View>
          </Card>

          {/* Basic Info */}
          <Card>
            <Text style={styles.sectionTitle}>Wallet Information</Text>
            
            <Input
              label="Wallet Label"
              value={label}
              onChangeText={setLabel}
              placeholder="e.g., My Binance USDT"
            />

            <Input
              label="Wallet Address"
              value={walletAddress}
              onChangeText={setWalletAddress}
              placeholder="Enter your wallet address"
              autoCapitalize="none"
            />

            {/* Asset Selection */}
            <Text style={styles.inputLabel}>Asset</Text>
            <View style={styles.optionRow}>
              {ASSETS.map((a) => (
                <TouchableOpacity
                  key={a}
                  style={[styles.optionButton, asset === a && styles.optionButtonActive]}
                  onPress={() => {
                    setAsset(a);
                    setNetwork(NETWORKS[a][0]);
                  }}
                >
                  <Text style={[styles.optionText, asset === a && styles.optionTextActive]}>
                    {a}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Network Selection */}
            <Text style={styles.inputLabel}>Network</Text>
            <View style={styles.optionRow}>
              {NETWORKS[asset].map((n) => (
                <TouchableOpacity
                  key={n}
                  style={[styles.optionButton, network === n && styles.optionButtonActive]}
                  onPress={() => setNetwork(n)}
                >
                  <Text style={[styles.optionText, network === n && styles.optionTextActive]}>
                    {n}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Wallet Type */}
          <Card>
            <Text style={styles.sectionTitle}>Wallet Type</Text>
            
            <View style={styles.typeRow}>
              <TouchableOpacity
                style={[styles.typeCard, walletType === 'exchange' && styles.typeCardActive]}
                onPress={() => setWalletType('exchange')}
              >
                <Ionicons
                  name="business"
                  size={32}
                  color={walletType === 'exchange' ? theme.colors.primary : theme.colors.textMuted}
                />
                <Text style={[styles.typeTitle, walletType === 'exchange' && styles.typeTitleActive]}>
                  Exchange
                </Text>
                <Text style={styles.typeDesc}>Binance, WazirX, etc.</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.typeCard, walletType === 'self_custody' && styles.typeCardActive]}
                onPress={() => setWalletType('self_custody')}
              >
                <Ionicons
                  name="wallet"
                  size={32}
                  color={walletType === 'self_custody' ? theme.colors.primary : theme.colors.textMuted}
                />
                <Text style={[styles.typeTitle, walletType === 'self_custody' && styles.typeTitleActive]}>
                  Self Custody
                </Text>
                <Text style={styles.typeDesc}>MetaMask, Ledger, etc.</Text>
              </TouchableOpacity>
            </View>

            {walletType === 'exchange' && (
              <>
                <Text style={styles.inputLabel}>Select Exchange</Text>
                <View style={styles.exchangeGrid}>
                  {EXCHANGES.map((e) => (
                    <TouchableOpacity
                      key={e}
                      style={[styles.exchangeButton, exchangeName === e && styles.exchangeButtonActive]}
                      onPress={() => setExchangeName(e)}
                    >
                      <Text style={[styles.exchangeText, exchangeName === e && styles.exchangeTextActive]}>
                        {e}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </Card>

          {/* Proof Upload */}
          <Card>
            <Text style={styles.sectionTitle}>Proof of Ownership</Text>
            
            <TouchableOpacity style={styles.uploadArea} onPress={pickImage}>
              {proofImage ? (
                <Image source={{ uri: proofImage }} style={styles.proofImage} />
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <Ionicons name="cloud-upload-outline" size={48} color={theme.colors.textMuted} />
                  <Text style={styles.uploadText}>Tap to upload screenshot</Text>
                  <Text style={styles.uploadHint}>PNG, JPG up to 5MB</Text>
                </View>
              )}
            </TouchableOpacity>

            <Input
              label="Additional Notes (Optional)"
              value={proofDescription}
              onChangeText={setProofDescription}
              placeholder="Any additional details about the proof"
              multiline
            />
          </Card>

          {/* Primary Wallet Toggle */}
          <Card>
            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setIsPrimary(!isPrimary)}
            >
              <View>
                <Text style={styles.toggleTitle}>Set as Primary Wallet</Text>
                <Text style={styles.toggleDesc}>
                  This wallet will be used by default for {asset} orders
                </Text>
              </View>
              <View style={[styles.toggle, isPrimary && styles.toggleActive]}>
                {isPrimary && <Ionicons name="checkmark" size={16} color="#fff" />}
              </View>
            </TouchableOpacity>
          </Card>

          {/* Submit Button */}
          <Button
            title="Save Wallet"
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
          />
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
  instructionCard: {
    backgroundColor: theme.colors.primary + '10',
    marginBottom: theme.spacing.lg,
  },
  instructionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  instructionList: {
    gap: theme.spacing.sm,
  },
  instructionItem: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  bold: {
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  inputLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optionRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  optionButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    backgroundColor: theme.colors.card,
  },
  optionButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '15',
  },
  optionText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  optionTextActive: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
  typeRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  typeCard: {
    flex: 1,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    alignItems: 'center',
  },
  typeCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  typeTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  typeTitleActive: {
    color: theme.colors.primary,
  },
  typeDesc: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  exchangeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  exchangeButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    backgroundColor: theme.colors.card,
  },
  exchangeButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  exchangeText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  exchangeTextActive: {
    color: '#fff',
    fontWeight: theme.fontWeight.semibold,
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: theme.colors.borderLight,
    borderStyle: 'dashed',
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
  },
  uploadPlaceholder: {
    padding: theme.spacing.xxl,
    alignItems: 'center',
  },
  uploadText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  uploadHint: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
  proofImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textPrimary,
  },
  toggleDesc: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  toggle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: theme.colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  submitButton: {
    marginTop: theme.spacing.lg,
  },
});
