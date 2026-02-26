// Push notification service for scheduled reminders.
// Registers Expo push tokens and handles notification responses.

import { Platform } from 'react-native';
import { supabase } from './supabase';

// expo-notifications is optional — may not be in the dev build.
let Notifications: any = null;
let Device: any = null;
let notificationsAvailable = false;

try {
  Notifications = require('expo-notifications');
  Device = require('expo-device');
  notificationsAvailable = true;
} catch (e) {
  console.warn('expo-notifications not available, push notifications disabled');
}

/**
 * Configure how notifications appear when the app is in the foreground.
 * Call once at app startup.
 */
export function configureNotificationHandler() {
  if (!notificationsAvailable) return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

/**
 * Request push notification permissions, get the Expo push token,
 * and save it to the push_tokens table in Supabase.
 * Returns the token string or null if unavailable.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (!notificationsAvailable) {
    console.log('Push notifications not available (module not installed)');
    return null;
  }

  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

  // Check/request permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission not granted');
    return null;
  }

  // Get Expo push token
  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId: '3e923c45-cdba-4d7b-b4ac-12398bdfa674',
  });
  const token = tokenData.data;

  // Store token in Supabase
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase.from('push_tokens').upsert({
      user_id: user.id,
      token,
      platform: Platform.OS,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,token',
    });
    console.log('Push token registered:', token.substring(0, 30) + '...');
  }

  return token;
}

/**
 * Listen for when the user taps a notification.
 * Returns a subscription that should be removed on cleanup.
 */
export function addNotificationResponseListener(
  callback: (characterName: string) => void
) {
  if (!notificationsAvailable) return { remove: () => {} };

  return Notifications.addNotificationResponseReceivedListener((response: any) => {
    const data = response.notification.request.content.data;
    if (data?.type === 'reminder' && data?.characterName) {
      callback(data.characterName);
    }
  });
}

/** Check whether the notifications module is available in this build. */
export function isNotificationsAvailable(): boolean {
  return notificationsAvailable;
}
