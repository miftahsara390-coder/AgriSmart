import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/stores/auth.store';
import { cropsAPI, tasksAPI } from '../../src/services/api';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const [crops, setCrops] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    cropsAPI.getAll().then((r) => setCrops(r.data.crops.slice(0, 3)));
    tasksAPI.getAll({ status: 'pending' }).then((r) => setTasks(r.data.tasks.slice(0, 3)));
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>👋 Hello, {user?.name}</Text>
      <Text style={styles.subtitle}>Here's your farm overview</Text>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{crops.length}</Text>
          <Text style={styles.statLabel}>Active Crops</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{tasks.length}</Text>
          <Text style={styles.statLabel}>Pending Tasks</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(app)/scan')}>
          <Text style={styles.actionIcon}>📷</Text>
          <Text style={styles.actionText}>Scan Plant</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(app)/assistant')}>
          <Text style={styles.actionIcon}>🤖</Text>
          <Text style={styles.actionText}>AI Assistant</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(app)/crops')}>
          <Text style={styles.actionIcon}>🌱</Text>
          <Text style={styles.actionText}>My Crops</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Tasks */}
      {tasks.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Upcoming Tasks</Text>
          {tasks.map((task) => (
            <View key={task.id} style={styles.taskCard}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskDate}>{task.dueDate || 'No due date'}</Text>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a2818' },
  content: { padding: 20, paddingTop: 60 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subtitle: { color: '#9DC08B', marginBottom: 24, fontSize: 14 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1, backgroundColor: '#1a5c3e', borderRadius: 16,
    padding: 20, alignItems: 'center',
  },
  statNumber: { fontSize: 32, fontWeight: 'bold', color: '#4CAF50' },
  statLabel: { color: '#9DC08B', fontSize: 13 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  actionsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  actionBtn: {
    flex: 1, backgroundColor: '#1a5c3e', borderRadius: 16,
    padding: 16, alignItems: 'center',
  },
  actionIcon: { fontSize: 28, marginBottom: 6 },
  actionText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  taskCard: {
    backgroundColor: '#1a5c3e', borderRadius: 12,
    padding: 16, marginBottom: 8,
  },
  taskTitle: { color: '#fff', fontWeight: '600' },
  taskDate: { color: '#9DC08B', fontSize: 12, marginTop: 4 },
});


