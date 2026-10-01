import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { COLORS } from '../../src/constants/theme';
import Header from '../../src/components/Header';

export default function NotificationsScreen() {
  const [notifications] = useState([
    {
      id: '1',
      type: 'alert',
      title: 'Frost Warning Tonight',
      message: 'Temperatures expected to drop to 2°C. Protect sensitive crops.',
      time: '1h ago',
      read: false,
    },
    {
      id: '2',
      type: 'info',
      title: 'Optimal Spraying Conditions',
      message: 'Wind speed is below 5km/h for the next 4 hours.',
      time: '3h ago',
      read: false,
    },
    {
      id: '3',
      type: 'success',
      title: 'Harvest Completed',
      message: 'Tomato Field A harvest task was marked as completed.',
      time: '1d ago',
      read: true,
    }
  ]);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {notifications.map((notif) => (
          <View key={notif.id} style={[styles.card, !notif.read && styles.cardUnread]}>
            <View style={[styles.iconWrap, notif.type === 'alert' ? styles.iconAlert : notif.type === 'info' ? styles.iconInfo : styles.iconSuccess]}>
              <MaterialIcons 
                name={notif.type === 'alert' ? 'warning' : notif.type === 'info' ? 'info' : 'check-circle'} 
                size={24} 
                color={notif.type === 'alert' ? '#eab308' : notif.type === 'info' ? '#3b82f6' : '#22c55e'} 
              />
            </View>
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{notif.title}</Text>
                <Text style={styles.cardTime}>{notif.time}</Text>
              </View>
              <Text style={styles.cardMessage}>{notif.message}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.surface },
  safe: { backgroundColor: 'rgba(241, 252, 242, 0.95)', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.onSurface },
  content: { padding: 16, gap: 12 },
  card: { flexDirection: 'row', backgroundColor: COLORS.surfaceContainerLowest, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  cardUnread: { backgroundColor: 'rgba(21, 128, 61, 0.05)', borderColor: 'rgba(21, 128, 61, 0.15)' },
  iconWrap: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  iconAlert: { backgroundColor: 'rgba(234, 179, 8, 0.1)' },
  iconInfo: { backgroundColor: 'rgba(59, 130, 246, 0.1)' },
  iconSuccess: { backgroundColor: 'rgba(34, 197, 94, 0.1)' },
  cardContent: { flex: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: COLORS.onSurface, flex: 1 },
  cardTime: { fontSize: 12, color: COLORS.outline, marginLeft: 8 },
  cardMessage: { fontSize: 14, color: COLORS.secondary, lineHeight: 20 },
});
