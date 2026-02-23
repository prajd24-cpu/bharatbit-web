import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TextInput, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
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

  // Native HTML input for web to fix keyboard issue
  const renderWebInput = () => (
    <input
      type="tel"
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={6}
      value={otp}
      onChange={(e) => handleOtpChange(e.target.value)}
      placeholder="Enter 6-digit OTP"
      autoComplete="one-time-code"
      style={{
        width: '100%',
        height: 56,
        fontSize: 18,
        textAlign: 'center',
        letterSpacing: 8,
        border: '1px solid #e0e0e0',
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.9)',
        color: '#1a1a2e',
        outline: 'none',
        padding: '0 16px',
        boxSizing: 'border-box' as const,
      }}
    />
  );

  // Native TextInput for mobile apps
  const renderNativeInput = () => (
    <TextInput
      style={styles.input}
      value={otp}
      onChangeText={handleOtpChange}
      placeholder="Enter 6-digit OTP"
      placeholderTextColor="#999"
      keyboardType="numeric"
      maxLength={6}
      textContentType="oneTimeCode"
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="shield-checkmark" size={48} color="#E95721" />
        </View>
        <Text style={styles.title}>Two-Factor Authentication</Text>
        <Text style={styles.subtitle}>Enter the OTP sent to your email & phone</Text>
        <Text style={styles.mobile}>{mobile}</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>ENTER 6-DIGIT OTP</Text>
          {Platform.OS === 'web' ? renderWebInput() : renderNativeInput()}
        </View>

        <TouchableOpacity 
          style={[styles.button, otp.length !== 6 && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={loading || otp.length !== 6}
          activeOpacity={0.8}
        >
          <View style={styles.buttonInner}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Verify & Login</Text>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.resendButton}
          onPress={() => Alert.alert('OTP Sent', 'A new OTP has been sent')}
          activeOpacity={0.7}
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
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(233, 87, 33, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a2e',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  mobile: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E95721',
    marginTop: 4,
  },
  inputContainer: {
    width: '100%',
    marginTop: 32,
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  input: {
    width: '100%',
    height: 56,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    fontSize: 18,
    color: '#1a1a2e',
    textAlign: 'center',
    letterSpacing: 8,
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: 14,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        background: 'linear-gradient(135deg, #E95721 0%, #ff7043 100%)',
        boxShadow: '0 4px 15px rgba(233, 87, 33, 0.4)',
      },
      default: {
        backgroundColor: '#E95721',
        shadowColor: '#E95721',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
      },
    }),
  },
  buttonInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Platform.OS === 'web' ? 'transparent' : '#E95721',
  },
  buttonDisabled: {
    ...Platform.select({
      web: {
        background: '#ccc',
        boxShadow: 'none',
      },
      default: {
        backgroundColor: '#ccc',
        shadowOpacity: 0,
        elevation: 0,
      },
    }),
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  resendButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  resendText: {
    color: '#E95721',
    fontSize: 15,
    fontWeight: '500',
  },
});
