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

  // For WEB - use pure HTML form
  if (Platform.OS === 'web') {
    return (
      <div style={webStyles.container}>
        <div style={webStyles.content}>
          <div style={webStyles.iconContainer}>
            <Ionicons name="shield-checkmark" size={48} color="#E95721" />
          </div>
          <h1 style={webStyles.title}>Two-Factor Authentication</h1>
          <p style={webStyles.subtitle}>Enter the OTP sent to your email & phone</p>
          <p style={webStyles.mobile}>{mobile}</p>

          <form onSubmit={(e) => { e.preventDefault(); handleVerify(); }} style={webStyles.form}>
            <label style={webStyles.label}>ENTER 6-DIGIT OTP</label>
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={otp}
              onChange={(e) => handleOtpChange(e.target.value)}
              placeholder="Enter OTP"
              autoComplete="one-time-code"
              style={webStyles.input}
            />
            
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              style={{
                ...webStyles.button,
                ...(otp.length !== 6 ? webStyles.buttonDisabled : {}),
              }}
            >
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
          </form>

          <button
            onClick={() => Alert.alert('OTP Sent', 'A new OTP has been sent')}
            style={webStyles.resendButton}
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
          <Ionicons name="shield-checkmark" size={48} color="#E95721" />
        </View>
        <Text style={styles.title}>Two-Factor Authentication</Text>
        <Text style={styles.subtitle}>Enter the OTP sent to your email & phone</Text>
        <Text style={styles.mobile}>{mobile}</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>ENTER 6-DIGIT OTP</Text>
          <TextInput
            style={styles.input}
            value={otp}
            onChangeText={handleOtpChange}
            placeholder="Enter OTP"
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

// WEB STYLES - Pure CSS
const webStyles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  content: {
    width: '100%',
    maxWidth: 400,
    textAlign: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(233, 87, 33, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: '#1a1a2e',
    margin: '0 0 8px',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    margin: '0 0 4px',
  },
  mobile: {
    fontSize: 16,
    fontWeight: 600,
    color: '#E95721',
    margin: 0,
  },
  form: {
    marginTop: 32,
  },
  label: {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: '#666',
    marginBottom: 10,
    textAlign: 'left',
    letterSpacing: 0.5,
  },
  input: {
    width: '100%',
    height: 56,
    fontSize: 20,
    textAlign: 'center',
    letterSpacing: 8,
    border: '1px solid #ddd',
    borderRadius: 12,
    backgroundColor: '#fff',
    color: '#1a1a2e',
    outline: 'none',
    padding: '0 16px',
    boxSizing: 'border-box',
    marginBottom: 20,
  },
  button: {
    width: '100%',
    height: 56,
    fontSize: 17,
    fontWeight: 600,
    color: '#fff',
    border: 'none',
    borderRadius: 14,
    cursor: 'pointer',
    background: 'linear-gradient(135deg, #E95721 0%, #ff7043 50%, #E95721 100%)',
    boxShadow: '0 4px 20px rgba(233, 87, 33, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
  },
  buttonDisabled: {
    background: 'linear-gradient(135deg, #ccc 0%, #999 100%)',
    boxShadow: 'none',
    cursor: 'not-allowed',
  },
  resendButton: {
    marginTop: 24,
    padding: '12px 20px',
    background: 'none',
    border: 'none',
    color: '#E95721',
    fontSize: 15,
    fontWeight: 500,
    cursor: 'pointer',
  },
};

// NATIVE STYLES
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
    height: 56,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 16,
    fontSize: 20,
    color: '#1a1a2e',
    textAlign: 'center',
    letterSpacing: 8,
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
