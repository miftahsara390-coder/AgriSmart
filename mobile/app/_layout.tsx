import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../src/stores/auth.store';
import { ActivityIndicator, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import { initNotifications } from '../src/services/notifications.service';
import { useNotificationStore } from '../src/stores/notification.store';
import { useLanguageStore } from '../src/stores/language.store';

export default function RootLayout() {
  const { isAuthenticated, isLoading, loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
    useLanguageStore.getState().loadLanguage();
    initNotifications();

    // Listen for foreground notification delivery (e.g. when task reminder timer fires)
    const foregroundSub = Notifications.addNotificationReceivedListener((notification) => {
      const { title, body, data } = notification.request.content;
      console.log('[Notification Received]:', title);
      useNotificationStore.getState().addNotification({
        title: title || 'Task Reminder',
        message: body || 'You have an upcoming farm task',
        type: (data?.type as any) || 'info',
        time: 'Just now',
        data,
      });
    });

    // Listen for user clicking or tapping on a notification banner
    const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      if (data?.screen) {
        router.push(data.screen as any);
      } else {
        router.push('/(app)/notifications');
      }
    });

    return () => {
      foregroundSub.remove();
      responseSub.remove();
    };
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/(app)/home');
      } else {
        router.replace('/(auth)/welcome');
      }
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f3d2e' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
        <Stack.Screen name="index" />
      </Stack>
    </>
  );
}


