import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useNotificationStore } from '../stores/notification.store';

// Configure foreground notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Configure Android Notification Channels for high priority alerts
 */
export async function setupAndroidChannels() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'General AgriSmart Alerts',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#22c55e',
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('farm-alerts', {
      name: 'Weather & Crop Hazards',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 350, 200, 350],
      lightColor: '#ef4444',
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync('task-reminders', {
      name: 'Task & Field Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 200, 200, 200],
      lightColor: '#15803d',
      sound: 'default',
    });
  }
}

/**
 * Check existing notification permissions
 */
export async function checkNotificationPermissions(): Promise<boolean> {
  try {
    const settings = await Notifications.getPermissionsAsync();
    return settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  } catch (error) {
    console.warn('[Notifications] Error checking permissions:', error);
    return false;
  }
}

/**
 * Request notification permissions from system
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === 'granted';
  } catch (error) {
    console.warn('[Notifications] Error requesting permissions:', error);
    return false;
  }
}

/**
 * Initialize all notification prerequisites
 */
export async function initNotifications(): Promise<boolean> {
  try {
    await setupAndroidChannels();
    return await requestNotificationPermissions();
  } catch (error) {
    console.warn('[Notifications] Initialization error:', error);
    return false;
  }
}

export interface SendNotificationOptions {
  title: string;
  body: string;
  type?: 'alert' | 'info' | 'success' | 'warning';
  channelId?: 'default' | 'farm-alerts' | 'task-reminders';
  data?: Record<string, any>;
  addToList?: boolean;
}

/**
 * Send an immediate local notification
 */
export async function sendLocalNotification(options: SendNotificationOptions): Promise<string | null> {
  try {
    await setupAndroidChannels();
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn('[Notifications] Permission not granted to trigger notification');
    }

    const channelId = options.channelId || (options.type === 'alert' ? 'farm-alerts' : 'default');

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: options.title,
        body: options.body,
        sound: 'default',
        data: {
          ...options.data,
          type: options.type || 'info',
        },
      },
      trigger: null, // deliver immediately
    });

    // Optionally sync with the in-app notification center store
    if (options.addToList !== false) {
      useNotificationStore.getState().addNotification({
        title: options.title,
        message: options.body,
        type: options.type || 'info',
        time: 'Just now',
        data: options.data,
      });
    }

    return notificationId;
  } catch (error) {
    console.error('[Notifications] Failed to send notification:', error);
    return null;
  }
}

/**
 * Schedule a task reminder notification (e.g. 30 minutes before, or delayed interval)
 */
export async function scheduleTaskReminder(params: {
  taskId?: string | number;
  title: string;
  cropField?: string;
  dueDate?: string;
  time?: string;
  delaySeconds?: number;
}): Promise<string | null> {
  try {
    await setupAndroidChannels();
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn('[Notifications] Permissions not granted for task reminder');
      return null;
    }

    let triggerSeconds = params.delaySeconds;

    if (triggerSeconds === undefined || triggerSeconds === null) {
      if (params.dueDate) {
        try {
          const [year, month, day] = params.dueDate.split('-').map(Number);
          let hours = 8;
          let mins = 0;
          if (params.time) {
            const timeMatch = params.time.match(/(\d+):(\d+)\s*(AM|PM)?/i);
            if (timeMatch) {
              hours = parseInt(timeMatch[1], 10);
              mins = parseInt(timeMatch[2], 10);
              const period = timeMatch[3]?.toUpperCase();
              if (period === 'PM' && hours < 12) hours += 12;
              if (period === 'AM' && hours === 12) hours = 0;
            }
          }
          const targetDate = new Date(year, month - 1, day, hours, mins, 0);
          const diffSecs = Math.floor((targetDate.getTime() - Date.now()) / 1000);
          if (diffSecs > 1800) {
            triggerSeconds = diffSecs - 1800; // 30 minutes before task
          } else if (diffSecs > 5) {
            triggerSeconds = diffSecs;
          } else {
            // If time is already in past or right now, fire in 10 seconds
            triggerSeconds = 10;
          }
        } catch (e) {
          console.warn('[Notifications] Failed to parse target date/time:', e);
          triggerSeconds = 10;
        }
      } else {
        triggerSeconds = 10;
      }
    }

    const safeSeconds = Math.max(3, Math.round(triggerSeconds));

    const notifTitle = `⏰ Task Reminder: ${params.title}`;
    const notifBody = params.cropField
      ? `It's time to attend to ${params.title} on ${params.cropField}!`
      : `It's time for your scheduled farm task: ${params.title}!`;

    console.log(`[Notifications] Scheduling reminder in ${safeSeconds}s for "${params.title}"`);

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: notifTitle,
        body: notifBody,
        sound: 'default',
        data: {
          taskId: params.taskId,
          screen: '/(app)/home',
          type: 'alert',
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: safeSeconds,
        repeats: false,
        channelId: 'task-reminders',
      },
    });

    console.log(`[Notifications] Successfully scheduled reminder with ID: ${id}`);
    return id;
  } catch (error) {
    console.error('[Notifications] Failed to schedule reminder:', error);
    return null;
  }
}

/**
 * Convenient farm presets
 */
export async function sendTestNotification(): Promise<string | null> {
  return sendLocalNotification({
    title: 'AgriSmart Notification Test',
    body: 'Expo Notifications are active and working properly on your device!',
    type: 'success',
    channelId: 'default',
  });
}

export async function sendFrostWarningAlert(): Promise<string | null> {
  return sendLocalNotification({
    title: 'Frost Warning Tonight',
    body: 'Temperatures expected to drop to 2°C. Cover sensitive nursery crops and activate irrigation.',
    type: 'alert',
    channelId: 'farm-alerts',
  });
}

export async function sendSprayingWindowAlert(): Promise<string | null> {
  return sendLocalNotification({
    title: 'Optimal Spraying Window',
    body: 'Wind speed is currently 3 km/h with low humidity. Ideal conditions for foliar application.',
    type: 'info',
    channelId: 'farm-alerts',
  });
}

export async function sendIrrigationAlert(field = 'Tomato Field 1'): Promise<string | null> {
  return sendLocalNotification({
    title: 'Irrigation Required',
    body: `Soil moisture in ${field} dropped to 28%. Start automated drip cycle.`,
    type: 'warning',
    channelId: 'farm-alerts',
  });
}
