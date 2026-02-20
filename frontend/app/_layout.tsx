import React from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#FFFFFF' },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/register" />
        <Stack.Screen name="auth/verify-otp" />
        <Stack.Screen name="auth/verify-2fa" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="kyc/submit" />
        <Stack.Screen name="orders/create" />
        <Stack.Screen name="orders/[id]" />
        <Stack.Screen name="admin/index" />
      </Stack>
    </AuthProvider>
  );
}
