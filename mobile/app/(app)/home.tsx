import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Platform,
  RefreshControl,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useHomeDashboardQuery } from '../../src/services/home';
import { useCompleteTaskMutation, useUpdateTaskMutation } from '../../src/services/tasks';
import { useAuthStore } from '../../src/stores/auth.store';
import { useTranslation } from '../../src/stores/language.store';

import { COLORS } from '../../src/constants/theme';
import Header from '../../src/components/Header';
import TaskCard, { Task } from '../../src/components/TaskCard';
import CropCard, { Crop } from '../../src/components/CropCard';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { t } = useTranslation();

  const { data, isLoading: loading, isRefetching, refetch } = useHomeDashboardQuery();
  const completeTaskMutation = useCompleteTaskMutation();
  const updateTaskMutation = useUpdateTaskMutation();

  // Refresh dashboard whenever the screen regains focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const onRefresh = async () => {
    await refetch();
  };

  const toggleTask = async (id: string | number) => {
    if (!data?.todayTasks) return;
    const task = data.todayTasks.find((t) => t.id === id);
    if (!task) return;

    try {
      if (!task.completed) {
        await completeTaskMutation.mutateAsync(id);
      } else {
        await updateTaskMutation.mutateAsync({
          id,
          data: { completed: false, status: 'pending' },
        });
      }
    } catch (error) {
      console.error('Failed to toggle task', error);
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
      
      <Header title={t('tabs.home')} />

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            colors={['#15803d']}
            tintColor="#15803d"
          />
        }
      >
        {/* Greeting */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingSub}>{t('home.yourFarmToday')}</Text>
          <Text style={styles.greetingMain}>{t('home.greetingMorning')}, {user?.name?.split(' ')[0] || 'Farmer'}</Text>
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
                <Text style={styles.weatherDescText}>{weather?.condition || 'Sunny'} · <Text style={{color: '#10b981', fontWeight: '600'}}>{t('home.optimalMoisture')}</Text></Text>
              </View>
            </View>
            <View style={styles.weatherIconWrap}>
              <MaterialIcons name="light-mode" size={32} color="#f59e0b" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Today's Tasks */}
        <View style={styles.sectionHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={styles.sectionTitle}>{t('home.todayTasks')}</Text>
            <View style={[styles.taskBadge, remainingCount === 0 && styles.taskBadgeDone]}>
              <Text style={[styles.taskBadgeText, remainingCount === 0 && styles.taskBadgeTextDone]}>
                {remainingCount === 0 ? 'All done! 🎉' : `${remainingCount} ${t('home.tasksLeft')}`}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.addTaskBtn}
            onPress={() => router.push('/(app)/add-task')}
            activeOpacity={0.7}
          >
            <MaterialIcons name="add" size={16} color="#15803d" />
            <Text style={styles.addTaskBtnText}>{t('home.newTask')}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.tasksContainer}>
          {tasks.length === 0 ? (
            <View style={styles.emptyTasksCard}>
              <MaterialIcons name="event-available" size={32} color="#15803d" />
              <Text style={styles.emptyTasksTitle}>{t('home.noTasksScheduled')}</Text>
              <Text style={styles.emptyTasksSub}>{t('home.createTaskHint')}</Text>
            </View>
          ) : (
            tasks.map((task: any) => (
              <TaskCard key={task.id} task={task} onToggle={toggleTask} variant="home" />
            ))
          )}
        </View>

        {/* My Crops */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('home.myCrops')}</Text>
          <TouchableOpacity onPress={() => router.push('/(app)/crops')}>
            <Text style={styles.viewAllText}>{t('home.viewAll')}</Text>
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
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push('/(app)/assistant')}
        >
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
            <TouchableOpacity
              style={styles.aiBtnOuter}
              activeOpacity={0.8}
              onPress={() => router.push('/(app)/assistant')}
            >
              <LinearGradient
                colors={['#22c55e', '#16a34a']}
                style={styles.aiBtnInner}
              >
                <Text style={styles.aiBtnText}>Ask AgriSmart</Text>
                <MaterialIcons name="arrow-forward" size={16} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </TouchableOpacity>
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
  addTaskBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(21, 128, 61, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(21, 128, 61, 0.2)',
  },
  addTaskBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803d',
  },
  emptyTasksCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  emptyTasksTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginTop: 4,
  },
  emptyTasksSub: {
    fontSize: 12,
    color: COLORS.outline,
    textAlign: 'center',
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
