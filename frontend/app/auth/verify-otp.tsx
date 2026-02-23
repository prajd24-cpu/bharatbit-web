import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function VerifyOTPScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { verifyOTP } = useAuth();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const mobile = params.mobile as string;
  const purpose = params.purpose as string;

  const handleOtpChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    if (numericValue.length <= 6) {
      setOtp(numericValue);
    }
  };

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      await verifyOTP(mobile, otp, purpose);
      router.replace('/kyc/submit');
    } catch (error: any) {
      Alert.alert('Verification Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="mail" size={48} color="#E95721" style={styles.icon} />
        <Text style={styles.title}>Verify Account</Text>
        <Text style={styles.subtitle}>Enter the OTP sent to your email & phone</Text>
        <Text style={styles.mobile}>{mobile}</Text>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>ENTER 6-DIGIT OTP</Text>
          <TextInput
            style={styles.input}
            value={otp}
            onChangeText={handleOtpChange}
            placeholder="Enter OTP"
            placeholderTextColor="#999"
            keyboardType="numeric"
            maxLength={6}
            autoFocus={false}
            returnKeyType="done"
            onSubmitEditing={handleVerify}
          />
        </View>

        <TouchableOpacity 
          style={[styles.button, otp.length !== 6 && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={loading || otp.length !== 6}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Verify</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.resendButton}
          onPress={() => Alert.alert('OTP Sent', 'A new OTP has been sent')}
        >
          <Text style={styles.resendText}>Didn't receive OTP? Resend</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a2e',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  mobile: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E95721',
    marginTop: 4,
  },
  inputWrapper: {
    width: '100%',
    marginTop: 32,
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    width: '100%',
    height: 56,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E95721',
    paddingHorizontal: 16,
    fontSize: 20,
    color: '#1a1a2e',
    textAlign: 'center',
    letterSpacing: 8,
  },
  button: {
    width: '100%',
    height: 56,
    backgroundColor: '#E95721',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  resendButton: {
    marginTop: 24,
    padding: 12,
  },
  resendText: {
    color: '#E95721',
    fontSize: 14,
    fontWeight: '500',
  },
});
