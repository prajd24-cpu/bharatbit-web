import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TextInput, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
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

  // For WEB - use pure HTML
  if (Platform.OS === 'web') {
    return (
      <div className="otp-container" style={{
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '400px',
          textAlign: 'center' as const,
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '40px',
            backgroundColor: 'rgba(233, 87, 33, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <Ionicons name="mail" size={48} color="#E95721" />
          </div>
          
          <h1 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#1a1a2e',
            margin: '0 0 8px',
          }}>Verify Account</h1>
          
          <p style={{
            fontSize: '15px',
            color: '#666',
            margin: '0 0 4px',
          }}>Enter the OTP sent to your email & phone</p>
          
          <p style={{
            fontSize: '16px',
            fontWeight: 600,
            color: '#E95721',
            margin: '0 0 32px',
          }}>{mobile}</p>

          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: 600,
            color: '#666',
            marginBottom: '10px',
            textAlign: 'left' as const,
            letterSpacing: '0.5px',
          }}>ENTER 6-DIGIT OTP</label>
          
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={otp}
            onChange={(e) => handleOtpChange(e.target.value)}
            placeholder="000000"
            autoComplete="one-time-code"
            style={{
              width: '100%',
              height: '60px',
              fontSize: '24px',
              textAlign: 'center' as const,
              letterSpacing: '10px',
              border: '2px solid #E95721',
              borderRadius: '12px',
              backgroundColor: '#ffffff',
              color: '#1a1a2e',
              padding: '0 16px',
              boxSizing: 'border-box' as const,
              marginBottom: '20px',
              caretColor: '#E95721',
            }}
          />
          
          <button
            onClick={handleVerify}
            disabled={loading || otp.length !== 6}
            style={{
              width: '100%',
              height: '56px',
              fontSize: '17px',
              fontWeight: 600,
              color: '#fff',
              border: 'none',
              borderRadius: '14px',
              cursor: otp.length !== 6 ? 'not-allowed' : 'pointer',
              background: otp.length !== 6 
                ? 'linear-gradient(135deg, #ccc 0%, #aaa 100%)' 
                : 'linear-gradient(135deg, #E95721 0%, #ff7043 50%, #E95721 100%)',
              boxShadow: otp.length !== 6 
                ? 'none' 
                : '0 4px 20px rgba(233, 87, 33, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
              transition: 'all 0.3s ease',
            }}
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>

          <button
            onClick={() => alert('A new OTP has been sent')}
            style={{
              marginTop: '24px',
              padding: '12px 20px',
              background: 'none',
              border: 'none',
              color: '#E95721',
              fontSize: '15px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Didn't receive OTP? Resend
          </button>
        </div>
      </div>
    );
  }

  // For NATIVE (iOS/Android)
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="mail" size={48} color="#E95721" />
        </View>
        <Text style={styles.title}>Verify Account</Text>
        <Text style={styles.subtitle}>Enter the OTP sent to your email & phone</Text>
        <Text style={styles.mobile}>{mobile}</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>ENTER 6-DIGIT OTP</Text>
          <TextInput
            style={styles.input}
            value={otp}
            onChangeText={handleOtpChange}
            placeholder="000000"
            placeholderTextColor="#999"
            keyboardType="numeric"
            maxLength={6}
            textContentType="oneTimeCode"
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
    marginBottom: 20,
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
    height: 60,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E95721',
    paddingHorizontal: 16,
    fontSize: 24,
    color: '#1a1a2e',
    textAlign: 'center',
    letterSpacing: 10,
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: 14,
    backgroundColor: '#E95721',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E95721',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
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
