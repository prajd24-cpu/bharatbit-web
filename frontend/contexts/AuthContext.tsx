import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import {
  registerForPushNotificationsAsync,
  registerPushTokenWithBackend,
  addNotificationListeners,
  parseNotificationData
} from '../services/pushNotifications';
import { useRouter } from 'expo-router';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface User {
  id: string;
  mobile: string;
  email: string;
  role: string;
  kyc_status: string;
  account_type?: string;
  company_name?: string;
  relationship_manager?: string;
  rm_phone?: string;
  rm_whatsapp?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<any>;
  verify2FA: (mobile: string, otp: string) => Promise<void>;
  register: (mobile: string, email: string, password: string, referralCode?: string, accountType?: string, companyName?: string) => Promise<any>;
  verifyOTP: (mobile: string, otp: string, purpose: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const notificationListenerCleanup = useRef<(() => void) | null>(null);

  useEffect(() => {
    loadStoredAuth();
    
    // Set up notification listeners
    if (Platform.OS !== 'web') {
      notificationListenerCleanup.current = addNotificationListeners(
        (notification) => {
          console.log('Notification received:', notification.request.content);
        },
        (response) => {
          const data = parseNotificationData(response);
          console.log('Notification response:', data);
          // Navigation handling can be done here based on notification type
        }
      );
    }
    
    return () => {
      if (notificationListenerCleanup.current) {
        notificationListenerCleanup.current();
      }
    };
  }, []);

  // Register push token when token is set
  useEffect(() => {
    const setupPushNotifications = async () => {
      if (token && Platform.OS !== 'web') {
        try {
          const pushToken = await registerForPushNotificationsAsync();
          if (pushToken) {
            await registerPushTokenWithBackend(pushToken, token);
          }
        } catch (error) {
          console.log('Push notification setup error:', error);
        }
      }
    };
    
    setupPushNotifications();
  }, [token]);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('auth_token');
      const storedUser = await AsyncStorage.getItem('user_data');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const register = async (mobile: string, email: string, password: string, referralCode?: string, accountType?: string, companyName?: string) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/register`, {
        mobile,
        email,
        password,
        referral_code: referralCode,
        account_type: accountType || 'individual',
        company_name: companyName
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Registration failed');
    }
  };

  const verifyOTP = async (mobile: string, otp: string, purpose: string) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/verify-otp`, {
        mobile,
        otp,
        purpose
      });
      
      const { token: newToken, user: userData } = response.data;
      setToken(newToken);
      setUser(userData);
      
      await AsyncStorage.setItem('auth_token', newToken);
      await AsyncStorage.setItem('user_data', JSON.stringify(userData));
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'OTP verification failed');
    }
  };

  const login = async (identifier: string, password: string) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
        identifier,
        password
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
  };

  const verify2FA = async (mobile: string, otp: string) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/verify-2fa`, {
        mobile,
        otp
      });
      
      const { token: newToken, user: userData } = response.data;
      setToken(newToken);
      setUser(userData);
      
      await AsyncStorage.setItem('auth_token', newToken);
      await AsyncStorage.setItem('user_data', JSON.stringify(userData));
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || '2FA verification failed');
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user_data');
  };

  const refreshUser = async () => {
    if (!token) return;
    
    try {
      const response = await axios.get(`${BACKEND_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
      await AsyncStorage.setItem('user_data', JSON.stringify(response.data));
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, verify2FA, register, verifyOTP, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
