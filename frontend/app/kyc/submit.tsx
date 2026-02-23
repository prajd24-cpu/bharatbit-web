import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity, Image, Modal } from 'react-native';
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

interface ImagePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onCameraPress: () => void;
  onGalleryPress: () => void;
  title: string;
}

const ImagePickerModal: React.FC<ImagePickerModalProps> = ({ visible, onClose, onCameraPress, onGalleryPress, title }) => (
  <Modal visible={visible} transparent animationType="slide">
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>{title}</Text>
        <TouchableOpacity style={styles.modalOption} onPress={onCameraPress}>
          <Ionicons name="camera" size={28} color={theme.colors.primary} />
          <Text style={styles.modalOptionText}>Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.modalOption} onPress={onGalleryPress}>
          <Ionicons name="images" size={28} color={theme.colors.primary} />
          <Text style={styles.modalOptionText}>Choose from Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.modalCancel} onPress={onClose}>
          <Text style={styles.modalCancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

export default function KYCSubmitScreen() {
  const router = useRouter();
  const { user, token, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentImagePicker, setCurrentImagePicker] = useState<string | null>(null);

  // Determine account type (default to individual for backward compatibility)
  const accountType = user?.account_type || 'individual';
  const isIndividual = accountType === 'individual';
  const isCorporate = accountType === 'corporate';

  // Check if user is outside India based on mobile number
  const isOutsideIndia = user?.mobile ? !user.mobile.startsWith('+91') : false;

  // Individual KYC form state
  const [panNumber, setPanNumber] = useState('');
  const [panImage, setPanImage] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [passportImage, setPassportImage] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [aadhaarFront, setAadhaarFront] = useState('');
  const [aadhaarBack, setAadhaarBack] = useState('');
  const [selfieImage, setSelfieImage] = useState('');
  const [addressProof, setAddressProof] = useState('');

  // Corporate KYC form state
  const [companyRegCert, setCompanyRegCert] = useState('');
  const [gstCertificate, setGstCertificate] = useState('');
  const [boardResolution, setBoardResolution] = useState('');
  const [authorizedSignatoryId, setAuthorizedSignatoryId] = useState('');
  const [authorizedSignatoryName, setAuthorizedSignatoryName] = useState('');

  // Common Bank Details
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

  const imageSetters: Record<string, (value: string) => void> = {
    pan: setPanImage,
    passport: setPassportImage,
    aadhaarFront: setAadhaarFront,
    aadhaarBack: setAadhaarBack,
    selfie: setSelfieImage,
    address: setAddressProof,
    companyReg: setCompanyRegCert,
    gst: setGstCertificate,
    boardRes: setBoardResolution,
    authId: setAuthorizedSignatoryId,
  };

  const imageValues: Record<string, string> = {
    pan: panImage,
    passport: passportImage,
    aadhaarFront,
    aadhaarBack,
    selfie: selfieImage,
    address: addressProof,
    companyReg: companyRegCert,
    gst: gstCertificate,
    boardRes: boardResolution,
    authId: authorizedSignatoryId,
  };

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera permission is required to take photos.');
      return false;
    }
    return true;
  };

  const requestGalleryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Gallery permission is required to select photos.');
      return false;
    }
    return true;
  };

  const takePhoto = async (field: string) => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    const setter = imageSetters[field];
    
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: field === 'selfie' ? [1, 1] : [4, 3],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setter(`data:image/jpeg;base64,${result.assets[0].base64}`);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
    
    setCurrentImagePicker(null);
  };

  const pickFromGallery = async (field: string) => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return;

    const setter = imageSetters[field];
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: field === 'selfie' ? [1, 1] : [4, 3],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setter(`data:image/jpeg;base64,${result.assets[0].base64}`);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Failed to select photo. Please try again.');
    }
    
    setCurrentImagePicker(null);
  };

  const openImagePicker = (field: string) => {
    setCurrentImagePicker(field);
  };

  const pickerTitles: Record<string, string> = {
    pan: 'Upload PAN Card',
    passport: 'Upload Passport',
    aadhaarFront: 'Upload Aadhaar Front',
    aadhaarBack: 'Upload Aadhaar Back',
    selfie: 'Take Selfie',
    address: 'Upload Address Proof',
    companyReg: 'Upload Company Registration Certificate',
    gst: 'Upload GST Certificate',
    boardRes: 'Upload Board Resolution',
    authId: 'Upload Authorized Signatory ID',
  };

  const validateIndividualKYC = () => {
    if (!panNumber || !panImage) {
      Alert.alert('Error', 'PAN Card details are required');
      return false;
    }
    if (!aadhaarNumber || !aadhaarFront || !aadhaarBack) {
      Alert.alert('Error', 'Aadhaar Card details are required');
      return false;
    }
    if (!selfieImage) {
      Alert.alert('Error', 'Selfie is required');
      return false;
    }
    if (!addressProof) {
      Alert.alert('Error', 'Address proof is required');
      return false;
    }
    if (isOutsideIndia && !passportImage) {
      Alert.alert('Error', 'Passport is mandatory for non-Indian clients');
      return false;
    }
    return true;
  };

  const validateCorporateKYC = () => {
    if (!companyRegCert) {
      Alert.alert('Error', 'Company Registration Certificate is required');
      return false;
    }
    if (!gstCertificate) {
      Alert.alert('Error', 'GST Certificate is required');
      return false;
    }
    if (!boardResolution) {
      Alert.alert('Error', 'Board Resolution is required');
      return false;
    }
    if (!authorizedSignatoryId || !authorizedSignatoryName) {
      Alert.alert('Error', 'Authorized Signatory details are required');
      return false;
    }
    return true;
  };

  const validateCommonFields = () => {
    if (!bankAccountNumber || !bankIFSC || !bankName || !nomineeName) {
      Alert.alert('Error', 'Please fill all bank and nominee details');
      return false;
    }
    if (!fatcaAccepted || !termsAccepted) {
      Alert.alert('Error', 'Please accept FATCA declaration and Terms & Conditions');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    // Validate based on account type
    if (isIndividual && !validateIndividualKYC()) return;
    if (isCorporate && !validateCorporateKYC()) return;
    if (!validateCommonFields()) return;

    setLoading(true);
    try {
      const kycData: Record<string, any> = {
        // Common bank details
        bank_account_number: bankAccountNumber,
        bank_ifsc: bankIFSC,
        bank_name: bankName,
        bank_branch: bankBranch,
        account_holder_name: accountHolderName,
        nominee_name: nomineeName,
        nominee_relationship: nomineeRelationship,
        nominee_dob: nomineeDOB,
      };

      if (isIndividual) {
        // Individual KYC data
        kycData.pan_number = panNumber;
        kycData.pan_image = panImage;
        kycData.aadhaar_number = aadhaarNumber;
        kycData.aadhaar_front = aadhaarFront;
        kycData.aadhaar_back = aadhaarBack;
        kycData.selfie_image = selfieImage;
        kycData.address_proof = addressProof;
        if (isOutsideIndia) {
          kycData.passport_number = passportNumber;
          kycData.passport_image = passportImage;
        }
      } else {
        // Corporate KYC data
        kycData.company_registration_cert = companyRegCert;
        kycData.gst_certificate = gstCertificate;
        kycData.board_resolution = boardResolution;
        kycData.authorized_signatory_id = authorizedSignatoryId;
        kycData.authorized_signatory_name = authorizedSignatoryName;
      }

      await axios.post(`${BACKEND_URL}/api/kyc/submit`, kycData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      await refreshUser();
      Alert.alert('Success', 'KYC submitted successfully. It is now under review.', [
        { text: 'OK', onPress: () => router.replace('/kyc/pending') }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to submit KYC');
    } finally {
      setLoading(false);
    }
  };

  const renderImageUploader = (field: string, label: string, required: boolean = true) => {
    const imageValue = imageValues[field];
    const isSelfie = field === 'selfie';
    
    return (
      <View style={styles.uploaderContainer}>
        <Text style={styles.uploaderLabel}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
        <TouchableOpacity 
          style={[styles.uploaderBox, imageValue && styles.uploaderBoxWithImage]}
          onPress={() => openImagePicker(field)}
          data-testid={`upload-${field}`}
        >
          {imageValue ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: imageValue }} style={[styles.imagePreview, isSelfie && styles.selfiePreview]} />
              <View style={styles.imageOverlay}>
                <Ionicons name="camera" size={24} color="#FFFFFF" />
                <Text style={styles.imageOverlayText}>Change</Text>
              </View>
            </View>
          ) : (
            <View style={styles.uploaderPlaceholder}>
              <Ionicons name={isSelfie ? "person-circle" : "cloud-upload"} size={48} color={theme.colors.textMuted} />
              <Text style={styles.uploaderText}>
                {isSelfie ? 'Take Selfie or Upload' : 'Tap to capture or upload'}
              </Text>
              <View style={styles.uploaderIcons}>
                <Ionicons name="camera" size={20} color={theme.colors.primary} />
                <Text style={styles.orText}>or</Text>
                <Ionicons name="images" size={20} color={theme.colors.primary} />
              </View>
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>KYC Verification</Text>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/dashboard')}>
          <Ionicons name="home" size={28} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Account Type Badge */}
      <View style={styles.accountTypeBadge}>
        <Ionicons 
          name={isIndividual ? "person" : "business"} 
          size={18} 
          color={theme.colors.primary} 
        />
        <Text style={styles.accountTypeBadgeText}>
          {isIndividual ? 'Individual Account' : 'Corporate Account'}
        </Text>
        {user?.company_name && (
          <Text style={styles.companyNameText}>({user.company_name})</Text>
        )}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* INDIVIDUAL KYC FORM */}
          {isIndividual && (
            <>
              {/* Passport (Required for Non-Indian clients) */}
              {isOutsideIndia && (
                <Card>
                  <View style={styles.alertBox}>
                    <Ionicons name="information-circle" size={24} color={theme.colors.primary} />
                    <Text style={styles.alertText}>
                      Passport is mandatory for clients outside India
                    </Text>
                  </View>
                  <Text style={styles.sectionTitle}>Passport Details</Text>
                  <Input
                    label="Passport Number"
                    value={passportNumber}
                    onChangeText={setPassportNumber}
                    placeholder="Enter passport number"
                    autoCapitalize="characters"
                    icon="document"
                  />
                  {renderImageUploader('passport', 'Passport Photo Page')}
                </Card>
              )}

              {/* PAN Card */}
              <Card>
                <Text style={styles.sectionTitle}>PAN Card Details</Text>
                <Input
                  label="PAN Number"
                  value={panNumber}
                  onChangeText={(text) => setPanNumber(text.toUpperCase())}
                  placeholder="ABCDE1234F"
                  autoCapitalize="characters"
                  maxLength={10}
                  icon="card"
                />
                {renderImageUploader('pan', 'PAN Card Photo')}
              </Card>

              {/* Aadhaar Card */}
              <Card>
                <Text style={styles.sectionTitle}>Aadhaar Card Details</Text>
                <Input
                  label="Aadhaar Number"
                  value={aadhaarNumber}
                  onChangeText={setAadhaarNumber}
                  placeholder="1234 5678 9012"
                  keyboardType="numeric"
                  maxLength={14}
                  icon="id-card"
                />
                {renderImageUploader('aadhaarFront', 'Aadhaar Front')}
                {renderImageUploader('aadhaarBack', 'Aadhaar Back')}
              </Card>

              {/* Selfie & Address Proof */}
              <Card>
                <Text style={styles.sectionTitle}>Identity Verification</Text>
                {renderImageUploader('selfie', 'Live Selfie (Face clearly visible)')}
                {renderImageUploader('address', 'Address Proof (Utility Bill/Bank Statement)')}
              </Card>
            </>
          )}

          {/* CORPORATE KYC FORM */}
          {isCorporate && (
            <>
              <Card>
                <Text style={styles.sectionTitle}>Company Registration Certificate</Text>
                <Text style={styles.sectionDesc}>
                  Upload Certificate of Incorporation or Registration
                </Text>
                {renderImageUploader('companyReg', 'Company Registration Certificate')}
              </Card>

              <Card>
                <Text style={styles.sectionTitle}>GST Certificate</Text>
                <Text style={styles.sectionDesc}>
                  Upload valid GST Registration Certificate
                </Text>
                {renderImageUploader('gst', 'GST Certificate')}
              </Card>

              <Card>
                <Text style={styles.sectionTitle}>Board Resolution</Text>
                <Text style={styles.sectionDesc}>
                  Upload Board Resolution authorizing crypto trading
                </Text>
                {renderImageUploader('boardRes', 'Board Resolution Document')}
              </Card>

              <Card>
                <Text style={styles.sectionTitle}>Authorized Signatory</Text>
                <Text style={styles.sectionDesc}>
                  Details of person authorized to operate this account
                </Text>
                <Input
                  label="Authorized Signatory Name"
                  value={authorizedSignatoryName}
                  onChangeText={setAuthorizedSignatoryName}
                  placeholder="Full name as per ID"
                  icon="person"
                />
                {renderImageUploader('authId', 'Authorized Signatory ID Proof (PAN/Aadhaar/Passport)')}
              </Card>
            </>
          )}

          {/* Bank Details - Common for both */}
          <Card>
            <Text style={styles.sectionTitle}>Bank Account Details</Text>
            <Input
              label="Account Holder Name"
              value={accountHolderName}
              onChangeText={setAccountHolderName}
              placeholder="As per bank records"
              icon="person"
            />
            <Input
              label="Bank Name"
              value={bankName}
              onChangeText={setBankName}
              placeholder="e.g., HDFC Bank"
              icon="business"
            />
            <Input
              label="Account Number"
              value={bankAccountNumber}
              onChangeText={setBankAccountNumber}
              placeholder="Enter account number"
              keyboardType="numeric"
              icon="card"
            />
            <Input
              label="IFSC Code"
              value={bankIFSC}
              onChangeText={(text) => setBankIFSC(text.toUpperCase())}
              placeholder="e.g., HDFC0001234"
              autoCapitalize="characters"
              icon="git-branch"
            />
            <Input
              label="Branch"
              value={bankBranch}
              onChangeText={setBankBranch}
              placeholder="Branch name & location"
              icon="location"
            />
          </Card>

          {/* Nominee Details */}
          <Card>
            <Text style={styles.sectionTitle}>Nominee Details</Text>
            <Input
              label="Nominee Name"
              value={nomineeName}
              onChangeText={setNomineeName}
              placeholder="Full name of nominee"
              icon="people"
            />
            <Input
              label="Relationship"
              value={nomineeRelationship}
              onChangeText={setNomineeRelationship}
              placeholder="e.g., Father, Mother, Spouse"
              icon="heart"
            />
            <Input
              label="Date of Birth"
              value={nomineeDOB}
              onChangeText={setNomineeDOB}
              placeholder="DD/MM/YYYY"
              icon="calendar"
            />
          </Card>

          {/* Declarations */}
          <Card>
            <Text style={styles.sectionTitle}>Declarations</Text>
            
            <TouchableOpacity 
              style={styles.checkboxRow}
              onPress={() => setFatcaAccepted(!fatcaAccepted)}
              data-testid="fatca-checkbox"
            >
              <View style={[styles.checkbox, fatcaAccepted && styles.checkboxChecked]}>
                {fatcaAccepted && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
              </View>
              <Text style={styles.checkboxText}>
                {isIndividual 
                  ? 'I confirm that I am not a tax resident of any country other than India (FATCA Declaration)'
                  : 'I confirm that the company is not a tax resident of any country other than India (FATCA Declaration)'
                }
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.checkboxRow}
              onPress={() => setTermsAccepted(!termsAccepted)}
              data-testid="terms-checkbox"
            >
              <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
                {termsAccepted && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
              </View>
              <Text style={styles.checkboxText}>
                I agree to the Terms & Conditions and Privacy Policy. I confirm all information provided is accurate.
              </Text>
            </TouchableOpacity>
          </Card>

          <Button
            title="Submit KYC"
            onPress={handleSubmit}
            loading={loading}
            disabled={!fatcaAccepted || !termsAccepted}
            size="lg"
            style={{ marginTop: theme.spacing.md }}
            data-testid="submit-kyc-btn"
          />

          <Text style={styles.disclaimer}>
            Your documents will be securely stored and verified. KYC verification typically takes 1-3 business days.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Image Picker Modal */}
      <ImagePickerModal
        visible={currentImagePicker !== null}
        onClose={() => setCurrentImagePicker(null)}
        onCameraPress={() => currentImagePicker && takePhoto(currentImagePicker)}
        onGalleryPress={() => currentImagePicker && pickFromGallery(currentImagePicker)}
        title={currentImagePicker ? pickerTitles[currentImagePicker] || 'Select Image' : ''}
      />
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
  accountTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: `${theme.colors.primary}15`,
    gap: theme.spacing.xs,
  },
  accountTypeBadgeText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  companyNameText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  sectionDesc: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.primary}10`,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  alertText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  uploaderContainer: {
    marginTop: theme.spacing.md,
  },
  uploaderLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: '500',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  required: {
    color: theme.colors.error,
  },
  uploaderBox: {
    borderWidth: 2,
    borderColor: theme.colors.borderLight,
    borderStyle: 'dashed',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.backgroundSecondary,
    minHeight: 150,
  },
  uploaderBoxWithImage: {
    padding: 0,
    borderStyle: 'solid',
    borderColor: theme.colors.success,
  },
  uploaderPlaceholder: {
    alignItems: 'center',
  },
  uploaderText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  uploaderIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  orText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textMuted,
  },
  imagePreviewContainer: {
    width: '100%',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: theme.borderRadius.md - 2,
    resizeMode: 'cover',
  },
  selfiePreview: {
    height: 250,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    borderBottomLeftRadius: theme.borderRadius.md - 2,
    borderBottomRightRadius: theme.borderRadius.md - 2,
  },
  imageOverlayText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkboxText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  disclaimer: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
  },
  modalTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  modalOptionText: {
    fontSize: theme.fontSize.lg,
    fontWeight: '500',
    color: theme.colors.textPrimary,
  },
  modalCancel: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  modalCancelText: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.error,
  },
});
