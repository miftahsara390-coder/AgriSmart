import { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { tasksAPI } from '../../src/services/api';

const PRIORITY_COLORS: Record<string, string> = {
  high: '#e53935',
  medium: '#fb8c00',
  low: '#43a047',
};

const TYPE_ICONS: Record<string, string> = {
  watering: '💧', fertilizing: '🌿', harvesting: '🌾',
  planting: '🌱', pesticide: '🧪', other: '📋',
};

export default function CalendarScreen() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('pending');

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await tasksAPI.getAll({ status: filter !== 'all' ? filter : undefined });
      setTasks(res.data.tasks);
    } catch {
      Alert.alert('Error', 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, [filter]);

  const handleComplete = async (id: string) => {
    await tasksAPI.update(id, { status: 'done' });
    fetchTasks();
  };

  const handleDelete = async (id: string) => {
    await tasksAPI.delete(id);
    fetchTasks();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📅 Agricultural Calendar</Text>

      <View style={styles.filterRow}>
        {['all', 'pending', 'done'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color="#4CAF50" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.taskCard}>
              <Text style={styles.taskIcon}>{TYPE_ICONS[item.type] || '📋'}</Text>
              <View style={styles.taskInfo}>
                <Text style={styles.taskTitle}>{item.title}</Text>
                {item.dueDate && <Text style={styles.taskDate}>📅 {item.dueDate}</Text>}
                {item.Crop && <Text style={styles.taskCrop}>🌱 {item.Crop.name}</Text>}
              </View>
              <View style={styles.taskActions}>
                <View style={[styles.priorityDot, { backgroundColor: PRIORITY_COLORS[item.priority] || '#666' }]} />
                {item.status === 'pending' && (
                  <TouchableOpacity onPress={() => handleComplete(item.id)}>
                    <Text style={{ fontSize: 20 }}>✅</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <Text style={{ fontSize: 20 }}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>No tasks found</Text>}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a2818', paddingTop: 60 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff', paddingHorizontal: 20, marginBottom: 16 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 12, gap: 8 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1a5c3e' },
  filterActive: { backgroundColor: '#4CAF50' },
  filterText: { color: '#9DC08B', fontSize: 13 },
  filterTextActive: { color: '#fff', fontWeight: 'bold' },
  taskCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a5c3e',
    marginHorizontal: 16, marginBottom: 10, borderRadius: 14, padding: 14, gap: 12,
  },
  taskIcon: { fontSize: 28 },
  taskInfo: { flex: 1 },
  taskTitle: { color: '#fff', fontWeight: '600', fontSize: 15 },
  taskDate: { color: '#9DC08B', fontSize: 12, marginTop: 2 },
  taskCrop: { color: '#9DC08B', fontSize: 12 },
  taskActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  priorityDot: { width: 10, height: 10, borderRadius: 5 },
  empty: { color: '#666', textAlign: 'center', marginTop: 60, fontSize: 16 },
});


