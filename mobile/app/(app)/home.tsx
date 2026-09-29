import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/stores/auth.store';
import { cropsAPI, tasksAPI } from '../../src/services/api';

const QUICK_ACTIONS = [
  { icon: 'scan-outline' as const, label: 'Scan Plant', color: '#E8F5EE', iconColor: '#2D7A52', route: '/(app)/scan' },
  { icon: 'chatbubble-ellipses-outline' as const, label: 'AI Assistant', color: '#EEF3FF', iconColor: '#4A6BD4', route: '/(app)/assistant' },
  { icon: 'leaf-outline' as const, label: 'My Crops', color: '#FFF8E8', iconColor: '#C8860A', route: '/(app)/crops' },
  { icon: 'calendar-outline' as const, label: 'Calendar', color: '#FFF0F0', iconColor: '#D44A4A', route: '/(app)/calendar' },
];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending:   { bg: '#FFF3CD', text: '#856404' },
  done:      { bg: '#D1E7DD', text: '#0F5132' },
  cancelled: { bg: '#F8D7DA', text: '#842029' },
};

export default function HomeScreen() {
  const { user } = useAuthStore();
  const [crops, setCrops]   = useState<any[]>([]);
  const [tasks, setTasks]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    Promise.all([
      cropsAPI.getAll().then((r) => setCrops(r.data.crops?.slice(0, 4) ?? [])),
      tasksAPI.getAll({ status: 'pending' }).then((r) => setTasks(r.data.tasks?.slice(0, 4) ?? [])),
    ]).finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting} 👋</Text>
            <Text style={styles.userName}>{user?.name ?? 'Farmer'}</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={22} color="#2D7A52" />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator color="#2D7A52" size="large" style={{ marginTop: 60 }} />
        ) : (
          <>
            {/* ── Stats Row ── */}
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: '#E8F5EE' }]}>
                <View style={styles.statIcon}>
                  <Ionicons name="leaf" size={18} color="#2D7A52" />
                </View>
                <Text style={styles.statNum}>{crops.length}</Text>
                <Text style={styles.statLabel}>Active Crops</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#FFF8E8' }]}>
                <View style={[styles.statIcon, { backgroundColor: '#FFF0C8' }]}>
                  <Ionicons name="checkmark-circle" size={18} color="#C8860A" />
                </View>
                <Text style={[styles.statNum, { color: '#C8860A' }]}>{tasks.length}</Text>
                <Text style={styles.statLabel}>Pending Tasks</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#EEF3FF' }]}>
                <View style={[styles.statIcon, { backgroundColor: '#DDE5FF' }]}>
                  <Ionicons name="sunny" size={18} color="#4A6BD4" />
                </View>
                <Text style={[styles.statNum, { color: '#4A6BD4' }]}>24°</Text>
                <Text style={styles.statLabel}>Weather</Text>
              </View>
            </View>

            {/* ── Quick Actions ── */}
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              {QUICK_ACTIONS.map((a, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.actionCard, { backgroundColor: a.color }]}
                  onPress={() => router.push(a.route as any)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.actionIcon, { backgroundColor: a.iconColor + '22' }]}>
                    <Ionicons name={a.icon} size={22} color={a.iconColor} />
                  </View>
                  <Text style={[styles.actionLabel, { color: a.iconColor }]}>{a.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ── Recent Crops ── */}
            {crops.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>My Crops</Text>
                  <TouchableOpacity onPress={() => router.push('/(app)/crops')}>
                    <Text style={styles.seeAll}>See all</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {crops.map((crop) => (
                    <View key={crop.id} style={styles.cropChip}>
                      <Ionicons name="leaf" size={14} color="#2D7A52" />
                      <Text style={styles.cropChipText}>{crop.name}</Text>
                    </View>
                  ))}
                </ScrollView>
              </>
            )}

            {/* ── Upcoming Tasks ── */}
            {tasks.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Upcoming Tasks</Text>
                </View>
                {tasks.map((task) => (
                  <View key={task.id} style={styles.taskCard}>
                    <View style={styles.taskLeft}>
                      <View style={[
                        styles.taskDot,
                        { backgroundColor: task.priority === 'high' ? '#E53935' : task.priority === 'medium' ? '#F9A825' : '#43A047' }
                      ]} />
                      <View>
                        <Text style={styles.taskTitle}>{task.title}</Text>
                        <Text style={styles.taskDate}>{task.dueDate ?? 'No due date'}</Text>
                      </View>
                    </View>
                    <View style={[styles.taskBadge, STATUS_COLORS[task.status] ?? STATUS_COLORS.pending]}>
                      <Text style={[styles.taskBadgeText, { color: (STATUS_COLORS[task.status] ?? STATUS_COLORS.pending).text }]}>
                        {task.status}
                      </Text>
                    </View>
                  </View>
                ))}
              </>
            )}

            {crops.length === 0 && tasks.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="leaf-outline" size={56} color="#C5DDD0" />
                <Text style={styles.emptyTitle}>Your farm awaits</Text>
                <Text style={styles.emptySub}>Add your first crop to get started</Text>
                <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/(app)/crops')}>
                  <Text style={styles.emptyBtnText}>Add First Crop</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4F9F5' },
  safe: { backgroundColor: '#F4F9F5' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 22, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#E5F0EA',
    backgroundColor: '#F4F9F5',
  },
  greeting: { fontSize: 13, color: '#6A8E7C', fontWeight: '500' },
  userName: { fontSize: 20, fontWeight: '800', color: '#0D2B1E', marginTop: 1 },
  notifBtn: { width: 42, height: 42, backgroundColor: '#FFFFFF', borderRadius: 13, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#D8EBE0', position: 'relative' },
  notifDot: { position: 'absolute', top: 9, right: 9, width: 7, height: 7, borderRadius: 4, backgroundColor: '#E53935', borderWidth: 1.5, borderColor: '#F4F9F5' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 30 },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 26 },
  statCard: { flex: 1, borderRadius: 16, padding: 14, alignItems: 'flex-start' },
  statIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#C8EDD8', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  statNum: { fontSize: 22, fontWeight: '800', color: '#2D7A52' },
  statLabel: { fontSize: 10.5, fontWeight: '600', color: '#527563', marginTop: 2 },

  // Quick Actions
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0D2B1E', marginBottom: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 6 },
  seeAll: { fontSize: 12.5, fontWeight: '600', color: '#2D7A52' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 26 },
  actionCard: { width: '47.5%', borderRadius: 16, padding: 16, gap: 10 },
  actionIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  actionLabel: { fontSize: 13, fontWeight: '700' },

  // Crops
  cropChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#E8F5EE', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, marginBottom: 20 },
  cropChipText: { fontSize: 13, fontWeight: '600', color: '#2D7A52' },

  // Tasks
  taskCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#E8F0EB' },
  taskLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  taskDot: { width: 8, height: 8, borderRadius: 4 },
  taskTitle: { fontSize: 14, fontWeight: '700', color: '#0D2B1E' },
  taskDate: { fontSize: 11.5, color: '#7A9E8C', marginTop: 2 },
  taskBadge: { borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4 },
  taskBadgeText: { fontSize: 11, fontWeight: '700' },

  // Empty state
  emptyState: { alignItems: 'center', paddingTop: 50 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#0D2B1E', marginTop: 16 },
  emptySub: { fontSize: 13.5, color: '#7A9E8C', marginTop: 6, marginBottom: 24 },
  emptyBtn: { backgroundColor: '#184E38', borderRadius: 14, paddingHorizontal: 28, paddingVertical: 13 },
  emptyBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
});
