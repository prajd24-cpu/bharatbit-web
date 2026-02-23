import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function Verify2FAScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { verify2FA } = useAuth();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const mobile = params.mobile as string;

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
      await verify2FA(mobile, otp);
      router.replace('/(tabs)/dashboard');
    } catch (error: any) {
      Alert.alert('Verification Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="shield-checkmark" size={48} color="#E95721" />
        <Text style={styles.title}>Two-Factor Authentication</Text>
        <Text style={styles.subtitle}>Enter the OTP sent to your email & phone</Text>
        <Text style={styles.mobile}>{mobile}</Text>

        <Text style={styles.label}>ENTER 6-DIGIT OTP</Text>
        
        {/* Very visible input box */}
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            value={otp}
            onChangeText={handleOtpChange}
            placeholder="______"
            placeholderTextColor="#CCCCCC"
            keyboardType="numeric"
            maxLength={6}
          />
        </View>
        
        {/* Show what user typed */}
        <Text style={styles.otpDisplay}>Entered: {otp || '------'}</Text>

        <TouchableOpacity 
          style={[styles.button, otp.length !== 6 && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={loading || otp.length !== 6}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Verify & Login</Text>
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
    paddingTop: 50,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 8,
    textAlign: 'center',
  },
  mobile: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E95721',
    marginTop: 4,
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  inputBox: {
    width: '100%',
    height: 60,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#E95721',
    borderRadius: 10,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    height: '100%',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    letterSpacing: 10,
    paddingHorizontal: 10,
  },
  otpDisplay: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 24,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#E95721',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendButton: {
    marginTop: 20,
    padding: 10,
  },
  resendText: {
    color: '#E95721',
    fontSize: 14,
  },
});
