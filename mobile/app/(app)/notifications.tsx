import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS } from '../../src/constants/theme';
import { useNotificationStore, AppNotification } from '../../src/stores/notification.store';
import {
  checkNotificationPermissions,
  requestNotificationPermissions,
  sendTestNotification,
  sendFrostWarningAlert,
  sendIrrigationAlert,
  sendSprayingWindowAlert,
} from '../../src/services/notifications.service';

export default function NotificationsScreen() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotificationStore();

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [testing, setTesting] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    checkPermissionStatus();
  }, []);

  const checkPermissionStatus = async () => {
    const granted = await checkNotificationPermissions();
    setHasPermission(granted);
  };

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermissions();
    setHasPermission(granted);
    if (granted) {
      Alert.alert('Success', 'Notification permissions granted! You can now send test alerts.');
    } else {
      Alert.alert(
        'Permission Needed',
        'Please enable notifications for AgriSmart in your device settings to receive instant farm alerts.'
      );
    }
  };

  const handleTriggerTest = async () => {
    setTesting(true);
    try {
      await sendTestNotification();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to trigger notification');
    } finally {
      setTimeout(() => setTesting(false), 500);
    }
  };

  const handleTriggerFrost = async () => {
    try {
      await sendFrostWarningAlert();
    } catch (e) {
      console.error(e);
    }
  };

  const handleTriggerIrrigation = async () => {
    try {
      await sendIrrigationAlert('Tomato Field 1');
    } catch (e) {
      console.error(e);
    }
  };

  const handleTriggerSpraying = async () => {
    try {
      await sendSprayingWindowAlert();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === 'unread') return !item.read;
    return true;
  });

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.onSurface} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Notifications</Text>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{unreadCount} new</Text>
              </View>
            )}
          </View>
          {notifications.length > 0 ? (
            <TouchableOpacity onPress={markAllAsRead} style={styles.headerActionBtn}>
              <MaterialIcons name="done-all" size={20} color="#15803d" />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Permission status card */}
        {hasPermission === false && (
          <View style={styles.permBanner}>
            <View style={styles.permBannerLeft}>
              <MaterialIcons name="notifications-off" size={24} color="#b45309" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.permBannerTitle}>Notifications are disabled</Text>
                <Text style={styles.permBannerSub}>
                  Enable permissions to receive real-time weather warnings & task reminders.
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.permBtn} onPress={handleRequestPermission}>
              <Text style={styles.permBtnText}>Enable</Text>
            </TouchableOpacity>
          </View>
        )}

        {hasPermission === true && (
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Expo Notifications Active & Ready</Text>
          </View>
        )}

        {/* Live notification tester controls */}
        <View style={styles.testerSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeaderTitle}>EXPO NOTIFICATIONS TESTER</Text>
            <Text style={styles.sectionHeaderSub}>Tap to trigger instant local alert</Text>
          </View>

          {/* Main Test Button */}
          <TouchableOpacity
            style={styles.mainTestBtn}
            onPress={handleTriggerTest}
            disabled={testing}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#22c55e', '#16a34a', '#15803d']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.mainTestBtnInner}
            >
              {testing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialIcons name="notifications-active" size={20} color="#fff" />
                  <Text style={styles.mainTestBtnText}>Send Test Notification</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Quick presets */}
          <View style={styles.presetsGrid}>
            <TouchableOpacity
              style={[styles.presetCard, styles.presetFrost]}
              onPress={handleTriggerFrost}
              activeOpacity={0.8}
            >
              <MaterialIcons name="ac-unit" size={18} color="#eab308" />
              <Text style={styles.presetText}>Frost Alert</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.presetCard, styles.presetIrrigation]}
              onPress={handleTriggerIrrigation}
              activeOpacity={0.8}
            >
              <MaterialIcons name="water-drop" size={18} color="#0284c7" />
              <Text style={styles.presetText}>Irrigation Alert</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.presetCard, styles.presetSpray]}
              onPress={handleTriggerSpraying}
              activeOpacity={0.8}
            >
              <MaterialIcons name="air" size={18} color="#16a34a" />
              <Text style={styles.presetText}>Spray Window</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Tabs & History */}
        <View style={styles.historyHeader}>
          <View style={styles.tabsRow}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'all' && styles.tabBtnActive]}
              onPress={() => setActiveTab('all')}
            >
              <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
                All ({notifications.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'unread' && styles.tabBtnActive]}
              onPress={() => setActiveTab('unread')}
            >
              <Text style={[styles.tabText, activeTab === 'unread' && styles.tabTextActive]}>
                Unread ({unreadCount})
              </Text>
            </TouchableOpacity>
          </View>

          {notifications.length > 0 && (
            <TouchableOpacity onPress={clearAll} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>Clear all</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Notifications list */}
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="notifications-none" size={48} color="#94a3b8" />
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptySub}>
              {activeTab === 'unread'
                ? "You've caught up with all your farm alerts!"
                : 'Trigger a test notification above to see it in action.'}
            </Text>
          </View>
        ) : (
          filteredNotifications.map((notif: AppNotification) => (
            <TouchableOpacity
              key={notif.id}
              style={[styles.card, !notif.read && styles.cardUnread]}
              activeOpacity={0.9}
              onPress={() => markAsRead(notif.id)}
            >
              <View
                style={[
                  styles.iconWrap,
                  notif.type === 'alert'
                    ? styles.iconAlert
                    : notif.type === 'info'
                    ? styles.iconInfo
                    : notif.type === 'warning'
                    ? styles.iconWarning
                    : styles.iconSuccess,
                ]}
              >
                <MaterialIcons
                  name={
                    notif.type === 'alert'
                      ? 'warning'
                      : notif.type === 'info'
                      ? 'info'
                      : notif.type === 'warning'
                      ? 'water-drop'
                      : 'check-circle'
                  }
                  size={24}
                  color={
                    notif.type === 'alert'
                      ? '#eab308'
                      : notif.type === 'info'
                      ? '#3b82f6'
                      : notif.type === 'warning'
                      ? '#0284c7'
                      : '#22c55e'
                  }
                />
              </View>
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{notif.title}</Text>
                  <Text style={styles.cardTime}>{notif.time}</Text>
                </View>
                <Text style={styles.cardMessage}>{notif.message}</Text>
              </View>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => deleteNotification(notif.id)}
              >
                <MaterialIcons name="close" size={16} color="#94a3b8" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.surface },
  safe: {
    backgroundColor: 'rgba(241, 252, 242, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 4,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.onSurface },
  unreadBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  unreadBadgeText: { fontSize: 11, fontWeight: '700', color: '#15803d' },
  headerActionBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(21, 128, 61, 0.08)',
    borderRadius: 12,
  },
  content: { padding: 16, gap: 14, paddingBottom: 40 },

  permBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fef3c7',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  permBannerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  permBannerTitle: { fontSize: 13, fontWeight: '700', color: '#92400e' },
  permBannerSub: { fontSize: 11, color: '#b45309', marginTop: 2 },
  permBtn: {
    backgroundColor: '#d97706',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  permBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },

  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
    marginRight: 6,
  },
  statusText: { fontSize: 12, fontWeight: '600', color: '#15803d' },

  testerSection: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    gap: 12,
  },
  sectionHeaderRow: { marginBottom: 2 },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803d',
    letterSpacing: 0.8,
  },
  sectionHeaderSub: { fontSize: 12, color: COLORS.outline, marginTop: 2 },

  mainTestBtn: { borderRadius: 12, overflow: 'hidden' },
  mainTestBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  mainTestBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  presetsGrid: { flexDirection: 'row', gap: 8 },
  presetCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  presetFrost: { backgroundColor: '#fefce8', borderColor: '#fef08a' },
  presetIrrigation: { backgroundColor: '#f0f9ff', borderColor: '#bae6fd' },
  presetSpray: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  presetText: { fontSize: 11, fontWeight: '600', color: COLORS.onSurface },

  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  tabsRow: { flexDirection: 'row', gap: 6 },
  tabBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  tabBtnActive: { backgroundColor: '#15803d' },
  tabText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  tabTextActive: { color: '#ffffff' },
  clearBtn: { paddingVertical: 4, paddingHorizontal: 8 },
  clearBtnText: { fontSize: 12, color: '#ef4444', fontWeight: '600' },

  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceContainerLowest,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    alignItems: 'flex-start',
  },
  cardUnread: {
    backgroundColor: 'rgba(21, 128, 61, 0.04)',
    borderColor: 'rgba(21, 128, 61, 0.2)',
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconAlert: { backgroundColor: 'rgba(234, 179, 8, 0.12)' },
  iconInfo: { backgroundColor: 'rgba(59, 130, 246, 0.12)' },
  iconWarning: { backgroundColor: 'rgba(2, 132, 199, 0.12)' },
  iconSuccess: { backgroundColor: 'rgba(34, 197, 94, 0.12)' },
  cardContent: { flex: 1 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  cardTitle: { fontSize: 14.5, fontWeight: '700', color: COLORS.onSurface, flex: 1 },
  cardTime: { fontSize: 11, color: COLORS.outline, marginLeft: 8 },
  cardMessage: { fontSize: 13, color: COLORS.secondary, lineHeight: 18 },
  deleteBtn: { padding: 4, marginLeft: 6 },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.onSurface },
  emptySub: {
    fontSize: 13,
    color: COLORS.outline,
    textAlign: 'center',
    maxWidth: 260,
  },
});
