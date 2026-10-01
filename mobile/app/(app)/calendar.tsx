import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { tasksAPI } from '../../src/services/api';

import { COLORS } from '../../src/constants/theme';
import Header from '../../src/components/Header';
import TaskCard from '../../src/components/TaskCard';

const DATES = [
  { day: 'Mon', date: '12', active: false },
  { day: 'Tue', date: '13', active: false },
  { day: 'Wed', date: '14', active: true },
  { day: 'Thu', date: '15', active: false },
  { day: 'Fri', date: '16', active: false },
  { day: 'Sat', date: '17', active: false },
];

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await tasksAPI.getAll({ from: today, to: today });
      setTasks(res.data.tasks || []);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (id: string | number) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    try {
      setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
      if (!task.completed) {
        await tasksAPI.complete(id.toString());
      } else {
        await tasksAPI.update(id.toString(), { completed: false });
      }
    } catch (error) {
      console.error(error);
      fetchTasks();
    }
  };



  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Calendar" style={{ backgroundColor: 'transparent' }} />

        {/* Date Selector */}
        <View style={styles.dateSelectorWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateSelector}>
            {DATES.map((item, idx) => (
              <TouchableOpacity 
                key={idx} 
                style={[styles.dateBox, item.active && styles.dateBoxActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.dateDay, item.active && styles.dateDayActive]}>{item.day}</Text>
                <Text style={[styles.dateNum, item.active && styles.dateNumActive]}>{item.date}</Text>
                {item.active && <View style={styles.dateActiveDot} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]} showsVerticalScrollIndicator={false}>
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Schedule</Text>
          <View style={styles.taskBadge}>
            <Text style={styles.taskBadgeText}>{tasks.filter(t=>!t.completed).length} pending</Text>
          </View>
        </View>

        {/* Timeline Tasks */}
        <View style={styles.timeline}>
          {tasks.map((task, idx) => (
            <View key={task.id} style={styles.timelineItem}>
              {/* Left Time Column */}
              <View style={styles.timeColumn}>
                <Text style={styles.timeText}>{task.time || (task.dueDate ? new Date(task.dueDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '08:00')}</Text>
                {idx !== tasks.length - 1 && <View style={styles.timelineLine} />}
              </View>

              {/* Task Card */}
              <View style={{ flex: 1 }}>
                <TaskCard task={task} onToggle={toggleTask} variant="calendar" />
              </View>
            </View>
          ))}
          {tasks.length === 0 && (
            <Text style={{color: COLORS.outline, textAlign: 'center', marginTop: 32}}>No tasks for today. Enjoy your day!</Text>
          )}
        </View>

      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity style={[styles.fabBtnOuter, { bottom: Math.max(insets.bottom, 16) + 100, zIndex: 100 }]} activeOpacity={0.8} onPress={() => router.push('/(app)/add-task')}>
        <LinearGradient
          colors={['#22c55e', '#16a34a', '#15803d']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.fabBtnInner}
        >
          <MaterialIcons name="add" size={24} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  safe: {
    backgroundColor: 'rgba(241, 252, 242, 0.95)',
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(112, 121, 114, 0.15)',
  },
  dateSelectorWrap: {
    paddingBottom: 16,
  },
  dateSelector: {
    paddingHorizontal: 16,
    gap: 8,
  },
  dateBox: {
    width: 54,
    height: 68,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dateBoxActive: {
    backgroundColor: '#15803d',
    borderColor: '#15803d',
  },
  dateDay: {
    fontSize: 11,
    color: COLORS.outline,
    fontWeight: '600',
    marginBottom: 4,
  },
  dateDayActive: {
    color: 'rgba(255,255,255,0.8)',
  },
  dateNum: {
    fontSize: 18,
    color: COLORS.onSurface,
    fontWeight: '700',
  },
  dateNumActive: {
    color: '#fff',
  },
  dateActiveDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#4ade80',
    position: 'absolute',
    bottom: 6,
  },
  scrollContent: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.onSurface,
    letterSpacing: -0.2,
  },
  taskBadge: {
    backgroundColor: COLORS.surfaceContainer,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  taskBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  timeline: {
    marginLeft: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timeColumn: {
    width: 50,
    alignItems: 'center',
    marginRight: 12,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.outline,
    marginTop: 4,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: COLORS.surfaceContainer,
    marginTop: 12,
    marginBottom: -8,
  },
  fabBtnOuter: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#00442a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  fabBtnInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
