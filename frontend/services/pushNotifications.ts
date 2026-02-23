import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import axios from 'axios';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

// Configure how notifications are displayed when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface PushNotificationData {
  type: string;
  screen?: string;
  order_id?: string;
  reason?: string;
}

export const registerForPushNotificationsAsync = async (): Promise<string | null> => {
  let token: string | null = null;

  // Check if we're on a physical device
  if (Platform.OS === 'web') {
    console.log('Push notifications are not supported on web');
    return null;
  }

  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

  // Get existing permission status
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permission if not granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission denied');
    return null;
  }

  try {
    // Get Expo push token
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const pushTokenString = (
      await Notifications.getExpoPushTokenAsync({
        projectId: projectId || undefined,
      })
    ).data;
    
    token = pushTokenString;
    console.log('Push token:', token);
  } catch (error) {
    console.error('Error getting push token:', error);
  }

  // Android-specific channel setup
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'BharatBit Notifications',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#E95721',
    });
  }

  return token;
};

export const registerPushTokenWithBackend = async (pushToken: string, authToken: string): Promise<boolean> => {
  try {
    await axios.post(
      `${BACKEND_URL}/api/auth/register-push-token`,
      { push_token: pushToken },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    console.log('Push token registered with backend');
    return true;
  } catch (error) {
    console.error('Failed to register push token:', error);
    return false;
  }
};

// Notification listeners
export const addNotificationListeners = (
  onNotificationReceived: (notification: Notifications.Notification) => void,
  onNotificationResponse: (response: Notifications.NotificationResponse) => void
) => {
  const notificationListener = Notifications.addNotificationReceivedListener(onNotificationReceived);
  const responseListener = Notifications.addNotificationResponseReceivedListener(onNotificationResponse);

  return () => {
    Notifications.removeNotificationSubscription(notificationListener);
    Notifications.removeNotificationSubscription(responseListener);
  };
};

// Parse notification data
export const parseNotificationData = (response: Notifications.NotificationResponse): PushNotificationData | null => {
  try {
    const data = response.notification.request.content.data as PushNotificationData;
    return data;
  } catch {
    return null;
  }
};

// Schedule a local notification (for testing)
export const scheduleLocalNotification = async (title: string, body: string, data?: any) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: 'default',
    },
    trigger: null, // Immediately
  });
};
