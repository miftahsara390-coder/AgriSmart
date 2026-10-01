import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { homeAPI, tasksAPI } from '../../src/services/api';
import { useAuthStore } from '../../src/stores/auth.store';

import { COLORS } from '../../src/constants/theme';
import Header from '../../src/components/Header';
import TaskCard, { Task } from '../../src/components/TaskCard';
import CropCard, { Crop } from '../../src/components/CropCard';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const [data, setData] = useState<{
    weather: any;
    todayTasks: any[];
    crops: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await homeAPI.getDashboard();
      setData(res.data);
    } catch (error) {
      console.error('Failed to fetch dashboard', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (id: string | number) => {
    if (!data) return;
    const task = data.todayTasks.find((t) => t.id === id);
    if (!task) return;

    try {
      // Optimistic update
      setData((prev: any) => ({
        ...prev,
        todayTasks: prev.todayTasks.map((t: any) =>
          t.id === id ? { ...t, completed: !t.completed } : t
        ),
      }));
      if (!task.completed) {
        await tasksAPI.complete(id.toString());
      } else {
        await tasksAPI.update(id.toString(), { completed: false });
      }
    } catch (error) {
      console.error('Failed to toggle task', error);
      fetchDashboard(); // revert on failure
    }
  };

  const tasks = data?.todayTasks || [];
  const crops = data?.crops || [];
  const weather = data?.weather;

  const completedCount = tasks.filter(t => t.completed).length;
  const remainingCount = tasks.length - completedCount;

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      
      <Header title="Home" />

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]} showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingSub}>YOUR FARM TODAY</Text>
          <Text style={styles.greetingMain}>Good morning, {user?.name?.split(' ')[0] || 'Farmer'}</Text>
        </View>

        {/* Weather Card */}
        <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/(app)/weather')}>
          <LinearGradient
            colors={['#ffffff', '#ffffff', 'rgba(194,236,211,0.3)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.weatherCard}
          >
            <View>
              <View style={styles.locationPill}>
                <MaterialIcons name="location-on" size={14} color="#00442a" />
                <Text style={styles.locationText}>{weather?.location || 'Beni Mellal'}</Text>
              </View>
              <View style={styles.tempRow}>
                <Text style={styles.tempText}>{weather?.temperature || '24'}</Text>
                <Text style={styles.tempUnit}>°C</Text>
              </View>
              <View style={styles.weatherDescRow}>
                <View style={styles.weatherDot} />
                <Text style={styles.weatherDescText}>{weather?.condition || 'Sunny'} · <Text style={{color: '#10b981', fontWeight: '600'}}>Optimal moisture</Text></Text>
              </View>
            </View>
            <View style={styles.weatherIconWrap}>
              <MaterialIcons name="light-mode" size={32} color="#f59e0b" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Today's Tasks */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Tasks</Text>
          <View style={[styles.taskBadge, remainingCount === 0 && styles.taskBadgeDone]}>
            <Text style={[styles.taskBadgeText, remainingCount === 0 && styles.taskBadgeTextDone]}>
              {remainingCount === 0 ? 'All done! 🎉' : `${remainingCount} task${remainingCount === 1 ? '' : 's'} left`}
            </Text>
          </View>
        </View>
        
        <View style={styles.tasksContainer}>
          {tasks.map((task: any) => (
            <TaskCard key={task.id} task={task} onToggle={toggleTask} variant="home" />
          ))}
        </View>

        {/* My Crops */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My crops</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View all</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cropsScroll} contentContainerStyle={styles.cropsScrollContent}>
          {crops.length > 0 ? crops.map((crop: any) => (
            <CropCard key={crop.id} crop={crop} variant="home" />
          )) : (
            <Text style={{color: COLORS.outline, marginLeft: 16}}>No crops planted yet.</Text>
          )}
        </ScrollView>

        {/* AI Assistant */}
        <LinearGradient
          colors={['#0d2a1c', '#16422f', '#113825']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.aiCard}
        >
          <View style={styles.aiLeft}>
            <View style={styles.aiIconWrap}>
              <MaterialIcons name="auto-awesome" size={20} color="#4ade80" />
            </View>
            <View style={styles.aiTextWrap}>
              <Text style={styles.aiTitle}>Need help with your farm?</Text>
              <Text style={styles.aiSub}>Ask advice on irrigation or pests</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.aiBtnOuter} activeOpacity={0.8}>
            <LinearGradient
              colors={['#22c55e', '#16a34a']}
              style={styles.aiBtnInner}
            >
              <Text style={styles.aiBtnText}>Ask AgriSmart</Text>
              <MaterialIcons name="arrow-forward" size={16} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  greetingSection: {
    marginBottom: 16,
  },
  greetingSub: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  greetingMain: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginTop: 2,
    letterSpacing: -0.5,
  },
  weatherCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(112, 121, 114, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 24,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(235, 247, 237, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(112, 121, 114, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
    gap: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#404943',
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  tempText: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.onSurface,
    letterSpacing: -1,
  },
  tempUnit: {
    fontSize: 20,
    fontWeight: '500',
    color: COLORS.primaryContainer,
  },
  weatherDescRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  weatherDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  weatherDescText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#404943',
  },
  weatherIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: 'rgba(253, 230, 138, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: COLORS.onSurface,
    letterSpacing: -0.2,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primaryContainer,
  },
  cropsScroll: {
    marginHorizontal: -16,
  },
  cropsScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 12,
  },
  taskBadge: {
    backgroundColor: COLORS.surfaceContainer,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  taskBadgeDone: {
    backgroundColor: COLORS.primaryContainer,
  },
  taskBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primaryContainer,
  },
  taskBadgeTextDone: {
    color: COLORS.onPrimary,
  },
  tasksContainer: {
    gap: 8,
    marginBottom: 24,
  },
  aiCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(42, 99, 73, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  aiLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
    paddingRight: 10,
  },
  aiIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4ade80',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  aiTextWrap: {
    flex: 1,
  },
  aiTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  aiSub: {
    fontSize: 11,
    color: '#96d4af',
    marginTop: 2,
  },
  aiBtnOuter: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  aiBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  aiBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  }
});
