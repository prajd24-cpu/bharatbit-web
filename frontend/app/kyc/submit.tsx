import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function KYCSubmitScreen() {
  const router = useRouter();
  const { user, token, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);

  // Form state
  const [panNumber, setPanNumber] = useState('');
  const [panImage, setPanImage] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [aadhaarFront, setAadhaarFront] = useState('');
  const [aadhaarBack, setAadhaarBack] = useState('');
  const [selfieImage, setSelfieImage] = useState('');
  const [addressProof, setAddressProof] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankIFSC, setBankIFSC] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankBranch, setBankBranch] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [nomineeName, setNomineeName] = useState('');
  const [nomineeRelationship, setNomineeRelationship] = useState('');
  const [nomineeDOB, setNomineeDOB] = useState('');
  const [fatcaAccepted, setFatcaAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const pickImage = async (setter: (value: string) => void) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setter(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handleSubmit = async () => {
    if (!panNumber || !panImage || !aadhaarNumber || !aadhaarFront || !aadhaarBack || !selfieImage || !addressProof ||
        !bankAccountNumber || !bankIFSC || !bankName || !nomineeName) {
      Alert.alert('Error', 'Please fill all required fields and upload all documents');
      return;
    }

    if (!fatcaAccepted || !termsAccepted) {
      Alert.alert('Error', 'Please accept FATCA declaration and Terms & Conditions');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/kyc/submit`, {
        pan_number: panNumber,
        pan_image: panImage,
        aadhaar_number: aadhaarNumber,
        aadhaar_front: aadhaarFront,
        aadhaar_back: aadhaarBack,
        selfie_image: selfieImage,
        address_proof: addressProof,
        bank_account_number: bankAccountNumber,
        bank_ifsc: bankIFSC,
        bank_name: bankName,
        bank_branch: bankBranch,
        account_holder_name: accountHolderName,
        nominee_name: nomineeName,
        nominee_relationship: nomineeRelationship,
        nominee_dob: nomineeDOB,
        fatca_declaration: fatcaAccepted,
        terms_accepted: termsAccepted,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      await refreshUser();
      Alert.alert('Success', 'KYC submitted successfully. Please wait for admin approval.', [
        { text: 'OK', onPress: () => router.replace('/kyc/pending') }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'KYC submission failed');
    } finally {
      setLoading(false);
    }
  };

  if (user?.kyc_status === 'under_review') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Ionicons name="time" size={64} color={theme.colors.warning} />
          <Text style={styles.statusTitle}>KYC Under Review</Text>
          <Text style={styles.statusText}>Your KYC documents are being reviewed. You'll be notified once approved.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (user?.kyc_status === 'approved') {
    router.replace('/(tabs)/dashboard');
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Ionicons name="document-text" size={48} color={theme.colors.gold} />
            <Text style={styles.title}>Complete KYC</Text>
            <Text style={styles.subtitle}>Submit your documents for verification</Text>
          </View>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>PAN Details</Text>
            <Input
              label="PAN Number *"
              value={panNumber}
              onChangeText={setPanNumber}
              placeholder="ABCDE1234F"
              autoCapitalize="characters"
              maxLength={10}
            />
            <ImageUploadButton
              label="Upload PAN Card *"
              hasImage={!!panImage}
              onPress={() => pickImage(setPanImage)}
            />
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Aadhaar Details</Text>
            <Input
              label="Aadhaar Number *"
              value={aadhaarNumber}
              onChangeText={setAadhaarNumber}
              placeholder="1234 5678 9012"
              keyboardType="number-pad"
              maxLength={12}
            />
            <ImageUploadButton
              label="Upload Aadhaar Front *"
              hasImage={!!aadhaarFront}
              onPress={() => pickImage(setAadhaarFront)}
            />
            <ImageUploadButton
              label="Upload Aadhaar Back *"
              hasImage={!!aadhaarBack}
              onPress={() => pickImage(setAadhaarBack)}
            />
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Selfie & Address Proof</Text>
            <ImageUploadButton
              label=\"Upload Selfie *\"
              hasImage={!!selfieImage}
              onPress={() => pickImage(setSelfieImage)}
            />
            <ImageUploadButton
              label=\"Upload Address Proof *\"
              hasImage={!!addressProof}
              onPress={() => pickImage(setAddressProof)}
            />
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Bank Details</Text>
            <Input
              label=\"Account Holder Name *\"
              value={accountHolderName}
              onChangeText={setAccountHolderName}
              placeholder=\"As per bank records\"
            />
            <Input
              label=\"Account Number *\"
              value={bankAccountNumber}
              onChangeText={setBankAccountNumber}
              placeholder=\"Bank account number\"
              keyboardType=\"number-pad\"
            />
            <Input
              label=\"IFSC Code *\"
              value={bankIFSC}
              onChangeText={setBankIFSC}
              placeholder=\"ABCD0123456\"
              autoCapitalize=\"characters\"
            />
            <Input
              label=\"Bank Name *\"
              value={bankName}
              onChangeText={setBankName}
              placeholder=\"Bank name\"
            />
            <Input
              label=\"Branch Name\"
              value={bankBranch}
              onChangeText={setBankBranch}
              placeholder=\"Branch location\"
            />
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Nominee Details</Text>
            <Input
              label=\"Nominee Name *\"
              value={nomineeName}
              onChangeText={setNomineeName}
              placeholder=\"Full name\"
            />
            <Input
              label=\"Relationship *\"
              value={nomineeRelationship}
              onChangeText={setNomineeRelationship}
              placeholder=\"Father/Mother/Spouse/Child\"
            />
            <Input
              label=\"Date of Birth\"
              value={nomineeDOB}
              onChangeText={setNomineeDOB}
              placeholder=\"DD/MM/YYYY\"
            />
          </Card>

          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Declarations</Text>
            <CheckBox
              label=\"I accept FATCA declaration *\"
              checked={fatcaAccepted}
              onPress={() => setFatcaAccepted(!fatcaAccepted)}
            />
            <CheckBox
              label=\"I accept Terms & Risk Disclosure *\"
              checked={termsAccepted}
              onPress={() => setTermsAccepted(!termsAccepted)}
            />
          </Card>

          <Button
            title=\"Submit KYC\"
            onPress={handleSubmit}
            loading={loading}
            size=\"lg\"
            style={{ marginTop: theme.spacing.lg }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const ImageUploadButton = ({ label, hasImage, onPress }: any) => (
  <TouchableOpacity style={[styles.uploadButton, hasImage && styles.uploadButtonSuccess]} onPress={onPress}>
    <Ionicons name={hasImage ? 'checkmark-circle' : 'cloud-upload'} size={24} color={hasImage ? theme.colors.success : theme.colors.gold} />
    <Text style={styles.uploadButtonText}>{label}</Text>
  </TouchableOpacity>
);

const CheckBox = ({ label, checked, onPress }: any) => (
  <TouchableOpacity style={styles.checkbox} onPress={onPress}>
    <Ionicons
      name={checked ? 'checkbox' : 'square-outline'}
      size={24}
      color={checked ? theme.colors.gold : theme.colors.textSecondary}
    />
    <Text style={styles.checkboxLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.md,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.gold,
    marginBottom: theme.spacing.md,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: theme.colors.gold,
    marginBottom: theme.spacing.md,
  },
  uploadButtonSuccess: {
    borderColor: theme.colors.success,
    borderStyle: 'solid',
  },
  uploadButtonText: {
    marginLeft: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.textPrimary,
    fontWeight: theme.fontWeight.medium,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  checkboxLabel: {
    marginLeft: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.textPrimary,
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
