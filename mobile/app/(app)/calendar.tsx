import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Switch,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import {
  useCalendarTasksQuery,
  useTaskRecommendationQuery,
  useCompleteTaskMutation,
  useUpdateTaskMutation,
  useCreateTaskMutation,
} from '../../src/services/tasks';
import { useCropsQuery } from '../../src/services/crops';

import { COLORS } from '../../src/constants/theme';
import Header from '../../src/components/Header';
import { useTranslation } from '../../src/stores/language.store';

export type TaskType =
  | 'Irrigation'
  | 'Fertilization'
  | 'Harvest'
  | 'Planting'
  | 'Pest Check'
  | 'Crop Inspection'
  | 'Other';

interface TaskItem {
  id: string | number;
  title: string;
  type: TaskType | string;
  cropField: string;
  time: string;
  date: string;
  completed: boolean;
  reminder?: boolean;
}

const TASK_TYPE_CONFIG: Record<
  string,
  { label: string; icon: keyof typeof MaterialIcons.glyphMap; color: string; bg: string; defaultTitle: string }
> = {
  Irrigation: {
    label: 'Irrigation',
    icon: 'water-drop',
    color: '#0284c7',
    bg: '#e0f2fe',
    defaultTitle: 'Drip Line Irrigation',
  },
  Fertilization: {
    label: 'Fertilization',
    icon: 'eco',
    color: '#16a34a',
    bg: '#dcfce7',
    defaultTitle: 'Fertilization & Nutrients',
  },
  Harvest: {
    label: 'Harvest',
    icon: 'agriculture',
    color: '#d97706',
    bg: '#fef3c7',
    defaultTitle: 'Crop Harvest',
  },
  Planting: {
    label: 'Planting',
    icon: 'spa',
    color: '#059669',
    bg: '#d1fae5',
    defaultTitle: 'Seed Sowing & Planting',
  },
  'Pest Check': {
    label: 'Pest Check',
    icon: 'bug-report',
    color: '#dc2626',
    bg: '#fee2e2',
    defaultTitle: 'Foliar Pest Check',
  },
  'Crop Inspection': {
    label: 'Crop Inspection',
    icon: 'fact-check',
    color: '#7c3aed',
    bg: '#f3e8ff',
    defaultTitle: 'Vigor & Leaf Inspection',
  },
  Other: {
    label: 'Other',
    icon: 'event-note',
    color: '#4b5563',
    bg: '#f3f4f6',
    defaultTitle: 'General Field Task',
  },
};

const DEFAULT_CROPS = [
  'Tomato Field 1',
  'Olive Field',
  'Wheat Zone 3',
  'Field A • Row 4',
  'Citrus Orchard B',
];

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const { t, language } = useTranslation();

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const { data: calendarData, isLoading: loading, refetch: refetchTasks } = useCalendarTasksQuery(selectedDate);
  const { data: recData } = useTaskRecommendationQuery();
  const { data: cropsData } = useCropsQuery();

  const completeTaskMutation = useCompleteTaskMutation();
  const updateTaskMutation = useUpdateTaskMutation();
  const createTaskMutation = useCreateTaskMutation();

  // Backend Smart Planning / AI Recommendation State
  const [aiRecDismissed, setAiRecDismissed] = useState(false);
  const [aiRecExpanded, setAiRecExpanded] = useState(false);

  // Add Task Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [taskType, setTaskType] = useState<TaskType>('Irrigation');
  const [taskTitle, setTaskTitle] = useState('Drip Line Irrigation');
  const [cropField, setCropField] = useState('Tomato Field 1');
  const [taskTime, setTaskTime] = useState('08:00 AM');
  const [reminder, setReminder] = useState(true);
  const [savingTask, setSavingTask] = useState(false);

  const cropsList = useMemo(() => {
    if (cropsData?.crops && cropsData.crops.length > 0) {
      const names = cropsData.crops.map(
        (c: any) => c.name + (c.location ? ` • ${c.location}` : '')
      );
      return Array.from(new Set([...names, ...DEFAULT_CROPS]));
    }
    return DEFAULT_CROPS;
  }, [cropsData]);

  const aiRec = useMemo(() => {
    if (recData?.recommendation) {
      return recData;
    }
    return {
      recommendation: 'Based on your crops and current conditions, irrigation is recommended tomorrow morning.',
      details: [
        'Root zone moisture dropped to 38% in your primary parcel.',
        'Projected peak temperature reaches 26°C with moderate evapotranspiration.',
        'Recommended: 3.5 Liters/plant at 07:30 AM via drip lines.',
      ],
      suggestedTask: {
        title: 'Drip Line Irrigation',
        type: 'Irrigation',
        cropField: 'Tomato Field 1',
        time: '07:30 AM',
      },
    };
  }, [recData]);

  const normalizeTaskType = (raw: string): TaskType => {
    const lower = (raw || '').toLowerCase();
    if (lower.includes('water') || lower.includes('irrigat')) return 'Irrigation';
    if (lower.includes('fertil') || lower.includes('nutri')) return 'Fertilization';
    if (lower.includes('harvest') || lower.includes('pick')) return 'Harvest';
    if (lower.includes('plant') || lower.includes('sow') || lower.includes('seed')) return 'Planting';
    if (lower.includes('pest') || lower.includes('bug') || lower.includes('spray')) return 'Pest Check';
    if (lower.includes('inspect') || lower.includes('check') || lower.includes('scout')) return 'Crop Inspection';
    return 'Other';
  };

  const tasks: TaskItem[] = useMemo(() => {
    const serverTasks = calendarData?.tasks;
    if (Array.isArray(serverTasks)) {
      return serverTasks.map((t: any) => ({
        id: t.id,
        title: t.title,
        type: normalizeTaskType(t.type || t.title),
        cropField: t.Crop?.name
          ? `${t.Crop.name}${t.Crop.location ? ' • ' + t.Crop.location : ''}`
          : t.cropField || 'Field A',
        time:
          t.time ||
          (t.dueDate
            ? new Date(t.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '08:00 AM'),
        date: t.date || selectedDate,
        completed: !!t.completed || t.status === 'done' || t.status === 'completed',
        reminder: !!t.reminder,
      }));
    }
    return [];
  }, [calendarData, selectedDate]);

  // 12-day dynamic horizontal date strip around today
  const dateStrip = useMemo(() => {
    const list = [];
    const base = new Date();
    const frDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const enDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = -2; i <= 9; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayName = language === 'fr' ? frDays[d.getDay()] : enDays[d.getDay()];
      const dayNum = d.getDate().toString();
      const isToday = iso === todayStr;
      list.push({ iso, dayName, dayNum, isToday });
    }
    return list;
  }, [todayStr, language]);

  const handleToggleTask = async (id: string | number) => {
    const task = tasks.find(t => t.id === id);
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
    } catch (err) {
      console.error('Failed to update task status in backend', err);
    }
  };

  const openAddTaskModal = (presetType?: TaskType) => {
    const initialType = presetType || 'Irrigation';
    setTaskType(initialType);
    setTaskTitle(TASK_TYPE_CONFIG[initialType]?.defaultTitle || 'New Farm Task');
    setCropField(cropsList[0] || 'Tomato Field 1');
    setTaskTime('08:00 AM');
    setReminder(true);
    setModalVisible(true);
  };

  const handleTypeSelect = (selected: TaskType) => {
    setTaskType(selected);
    setTaskTitle(TASK_TYPE_CONFIG[selected]?.defaultTitle || `${selected} Task`);
  };

  const handleSaveTask = async () => {
    if (!taskTitle.trim()) {
      Alert.alert('Title Required', 'Please enter a task title');
      return;
    }

    setSavingTask(true);
    try {
      await createTaskMutation.mutateAsync({
        title: taskTitle.trim(),
        description: `Farm operation for ${cropField.trim()}`,
        type: taskType,
        date: selectedDate,
        dueDate: selectedDate,
        time: taskTime,
        priority: 'high',
      });
      setModalVisible(false);
    } catch (err) {
      console.error('Failed to create task in backend', err);
      Alert.alert('Error', 'Failed to save task to backend.');
    } finally {
      setSavingTask(false);
    }
  };

  // Add backend AI recommendation to schedule
  const handleAddAiRecommendation = async () => {
    if (!aiRec?.suggestedTask) return;

    try {
      await createTaskMutation.mutateAsync({
        title: aiRec.suggestedTask.title,
        description: 'Auto-scheduled from AgriSmart AI Advisory',
        type: aiRec.suggestedTask.type,
        date: selectedDate,
        dueDate: selectedDate,
        time: aiRec.suggestedTask.time,
        priority: 'high',
      });
      setAiRecDismissed(true);
      Alert.alert('Scheduled in Backend', 'Irrigation task saved to backend schedule.');
    } catch (err) {
      console.error('Failed to save recommended task', err);
    }
  };

  const isToday = selectedDate === todayStr;
  const pendingCount = tasks.filter(t => !t.completed).length;
  const doneCount = tasks.filter(t => t.completed).length;

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      {/* ── Fixed Header & Date Selector ─────────────────────────────────────── */}
      <View style={styles.topHeaderArea}>
        <Header title={t('calendar.title')} style={{ backgroundColor: 'transparent' }} />

        {/* Horizontal Date Selector */}
        <View style={styles.dateSelectorWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateSelector}
          >
            {dateStrip.map(item => {
              const active = item.iso === selectedDate;
              return (
                <TouchableOpacity
                  key={item.iso}
                  style={[styles.dateBox, active && styles.dateBoxActive]}
                  onPress={() => setSelectedDate(item.iso)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.dateDay, active && styles.dateDayActive]}>
                    {item.dayName}
                  </Text>
                  <Text style={[styles.dateNum, active && styles.dateNumActive]}>
                    {item.dayNum}
                  </Text>
                  {item.isToday && !active && <View style={styles.todaySmallDot} />}
                  {active && <View style={styles.dateActiveDot} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {/* ── Scrollable Body ──────────────────────────────────────────────────── */}
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 16) + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Smart Planning / AI Recommendation Card (From Backend) ─────────── */}
        {!aiRecDismissed && aiRec && (
          <View style={styles.aiRecCard}>
            <View style={styles.aiRecTop}>
              <View style={styles.aiRecIconBadge}>
                <MaterialIcons name="auto-awesome" size={16} color="#16a34a" />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.aiRecTitleRow}>
                  <Text style={styles.aiRecTitle}>{t('calendar.smartPlanning')}</Text>
                  <View style={styles.aiRecPill}>
                    <Text style={styles.aiRecPillText}>{t('calendar.recommendedBadge')}</Text>
                  </View>
                </View>
                <Text style={styles.aiRecBody}>{aiRec.recommendation}</Text>
              </View>
            </View>

            {/* Expandable advisory details */}
            {aiRecExpanded && (
              <View style={styles.aiExpandedBox}>
                {aiRec.details?.map((bullet: string, idx: number) => (
                  <Text key={idx} style={styles.aiExpandedText}>
                    • {bullet}
                  </Text>
                ))}
                <TouchableOpacity
                  style={styles.aiAddBtn}
                  onPress={handleAddAiRecommendation}
                  activeOpacity={0.85}
                >
                  <MaterialIcons name="add-task" size={16} color="#fff" />
                  <Text style={styles.aiAddBtnText}>Add to Schedule</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.aiRecFooter}>
              <TouchableOpacity
                style={styles.aiRecActionLink}
                onPress={() => setAiRecExpanded(!aiRecExpanded)}
                activeOpacity={0.7}
              >
                <Text style={styles.aiRecActionText}>
                  {aiRecExpanded ? t('calendar.hideDetails') : t('calendar.viewRecommendation')}
                </Text>
                <MaterialIcons
                  name={aiRecExpanded ? 'expand-less' : 'chevron-right'}
                  size={16}
                  color="#15803d"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setAiRecDismissed(true)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.aiDismissText}>{t('calendar.dismiss')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── Schedule Header ─────────────────────────────────────────────────── */}
        <View style={styles.scheduleHeaderRow}>
          <View>
            <Text style={styles.scheduleTitle}>
              {isToday
                ? t('calendar.todaySchedule')
                : `Schedule for ${new Date(selectedDate + 'T12:00:00').toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', day: 'numeric' })}`}
            </Text>
            <Text style={styles.scheduleSubtitle}>
              {tasks.length > 0
                ? `${pendingCount} ${t('calendar.pending')} • ${doneCount} ${t('calendar.completed')}`
                : t('calendar.noTasksForDay')}
            </Text>
          </View>

          {tasks.length > 0 && (
            <View style={styles.counterBadge}>
              <Text style={styles.counterBadgeText}>{tasks.length} tasks</Text>
            </View>
          )}
        </View>

        {/* ── Task List (Fetched directly from Backend) ───────────────────────── */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color="#15803d" />
            <Text style={styles.loadingText}>Fetching tasks from AgriSmart backend...</Text>
          </View>
        ) : tasks.length === 0 ? (
          /* Empty State as explicitly specified */
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <MaterialIcons name="wb-sunny" size={32} color="#16a34a" />
            </View>
            <Text style={styles.emptyTitle}>No tasks scheduled today</Text>
            <Text style={styles.emptySub}>
              Your crops are looking good. Check your crops if you notice any changes.
            </Text>
            <TouchableOpacity
              style={styles.emptyActionBtn}
              onPress={() => openAddTaskModal()}
              activeOpacity={0.85}
            >
              <MaterialIcons name="add" size={18} color="#ffffff" />
              <Text style={styles.emptyActionBtnText}>Schedule a Farm Task</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.tasksList}>
            {tasks.map(task => {
              const config = TASK_TYPE_CONFIG[task.type] || TASK_TYPE_CONFIG.Other;

              return (
                <View
                  key={task.id}
                  style={[
                    styles.taskCard,
                    task.completed && styles.taskCardCompleted,
                  ]}
                >
                  <View style={styles.taskCardMain}>
                    {/* Icon Badge */}
                    <View style={[styles.taskTypeBadge, { backgroundColor: config.bg }]}>
                      <MaterialIcons name={config.icon} size={22} color={config.color} />
                    </View>

                    {/* Task Details */}
                    <View style={styles.taskInfo}>
                      <View style={styles.taskTitleRow}>
                        <Text
                          style={[
                            styles.taskTitleText,
                            task.completed && styles.taskTitleTextDone,
                          ]}
                          numberOfLines={1}
                        >
                          {task.title}
                        </Text>
                      </View>

                      {/* Crop/Field Name */}
                      <View style={styles.cropFieldRow}>
                        <MaterialIcons name="place" size={13} color="#406653" />
                        <Text style={styles.cropFieldText} numberOfLines={1}>
                          {task.cropField}
                        </Text>
                      </View>

                      {/* Time & Type pill */}
                      <View style={styles.metaRow}>
                        <View style={styles.timeTag}>
                          <MaterialIcons name="schedule" size={12} color="#15803d" />
                          <Text style={styles.timeTagText}>{task.time}</Text>
                        </View>
                        <View style={[styles.typePill, { backgroundColor: config.bg }]}>
                          <Text style={[styles.typePillText, { color: config.color }]}>
                            {config.label}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Status & Mark as Done Action */}
                    <View style={styles.taskActionCol}>
                      {task.completed ? (
                        <TouchableOpacity
                          style={styles.donePill}
                          onPress={() => handleToggleTask(task.id)}
                          activeOpacity={0.8}
                        >
                          <MaterialIcons name="check-circle" size={16} color="#15803d" />
                          <Text style={styles.donePillText}>{t('common.done')}</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={styles.markDoneBtn}
                          onPress={() => handleToggleTask(task.id)}
                          activeOpacity={0.85}
                        >
                          <MaterialIcons name="check" size={15} color="#ffffff" />
                          <Text style={styles.markDoneBtnText}>{t('calendar.markDone')}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* ── Floating + Button (Opens Add Task Form) ─────────────────────────── */}
      <TouchableOpacity
        style={[
          styles.fabOuter,
          { bottom: Math.max(insets.bottom, 16) + 76, zIndex: 100 },
        ]}
        onPress={() => openAddTaskModal()}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={['#22c55e', '#16a34a', '#15803d']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.fabInner}
        >
          <MaterialIcons name="add" size={28} color="#ffffff" />
        </LinearGradient>
      </TouchableOpacity>

      {/* ── Add Task Form Modal ──────────────────────────────────────────────── */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalSheet}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>New Farm Task</Text>
                <Text style={styles.modalSubtitle}>
                  Schedule work for {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setModalVisible(false)}
              >
                <MaterialIcons name="close" size={20} color="#141e18" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScroll}
            >
              {/* 1. Task Type Selector */}
              <Text style={styles.inputLabel}>TASK TYPE</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.typeSelectorRow}
              >
                {(Object.keys(TASK_TYPE_CONFIG) as TaskType[]).map(typeKey => {
                  const item = TASK_TYPE_CONFIG[typeKey];
                  const selected = taskType === typeKey;

                  return (
                    <TouchableOpacity
                      key={typeKey}
                      style={[styles.typeOptionBtn, selected && styles.typeOptionBtnActive]}
                      onPress={() => handleTypeSelect(typeKey)}
                      activeOpacity={0.8}
                    >
                      <MaterialIcons
                        name={item.icon}
                        size={17}
                        color={selected ? '#ffffff' : item.color}
                      />
                      <Text style={[styles.typeOptionText, selected && styles.typeOptionTextActive]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* 2. Task Title */}
              <Text style={styles.inputLabel}>TASK TITLE</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Drip Line Irrigation"
                placeholderTextColor="#9ca3af"
                value={taskTitle}
                onChangeText={setTaskTitle}
              />

              {/* 3. Crop / Field */}
              <Text style={styles.inputLabel}>CROP / FIELD</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Tomato Field 1"
                placeholderTextColor="#9ca3af"
                value={cropField}
                onChangeText={setCropField}
              />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.quickCropsRow}
              >
                {cropsList.map(item => (
                  <TouchableOpacity
                    key={item}
                    style={[styles.quickCropChip, cropField === item && styles.quickCropChipActive]}
                    onPress={() => setCropField(item)}
                  >
                    <Text style={[styles.quickCropText, cropField === item && styles.quickCropTextActive]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* 4. Date & Time Row */}
              <View style={styles.formRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>DATE</Text>
                  <View style={styles.dateDisplayBox}>
                    <MaterialIcons name="calendar-today" size={16} color="#15803d" />
                    <Text style={styles.dateDisplayText}>{selectedDate}</Text>
                  </View>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>TIME</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="08:00 AM"
                    placeholderTextColor="#9ca3af"
                    value={taskTime}
                    onChangeText={setTaskTime}
                  />
                </View>
              </View>

              {/* 5. Optional Reminder */}
              <View style={styles.reminderRow}>
                <View style={styles.reminderLeft}>
                  <View style={styles.reminderIconBadge}>
                    <MaterialIcons name="notifications-active" size={18} color="#15803d" />
                  </View>
                  <View>
                    <Text style={styles.reminderTitle}>Task Reminder</Text>
                    <Text style={styles.reminderSub}>Notify 30 minutes before operation</Text>
                  </View>
                </View>
                <Switch
                  value={reminder}
                  onValueChange={setReminder}
                  trackColor={{ false: '#e5e7eb', true: '#86efac' }}
                  thumbColor={reminder ? '#15803d' : '#f4f4f5'}
                />
              </View>

              {/* 6. Save Task Button */}
              <TouchableOpacity
                style={styles.saveBtnOuter}
                onPress={handleSaveTask}
                disabled={savingTask}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#22c55e', '#16a34a', '#15803d']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.saveBtnInner}
                >
                  {savingTask ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <MaterialIcons name="check" size={20} color="#ffffff" />
                      <Text style={styles.saveBtnText}>Save Task</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  topHeaderArea: {
    backgroundColor: 'rgba(241, 252, 242, 0.95)',
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(6, 95, 70, 0.08)',
  },

  // ── Date Selector ─────────────────────────────────────────────────────────
  dateSelectorWrap: {
    paddingBottom: 14,
    paddingTop: 4,
  },
  dateSelector: {
    paddingHorizontal: 16,
    gap: 8,
  },
  dateBox: {
    width: 52,
    height: 66,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(6, 95, 70, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#103823',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  dateBoxActive: {
    backgroundColor: '#15803d',
    borderColor: '#15803d',
  },
  dateDay: {
    fontSize: 11,
    color: '#657168',
    fontWeight: '600',
    marginBottom: 4,
  },
  dateDayActive: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  dateNum: {
    fontSize: 18,
    color: COLORS.onSurface,
    fontWeight: '800',
  },
  dateNumActive: {
    color: '#ffffff',
  },
  todaySmallDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#15803d',
    position: 'absolute',
    bottom: 5,
  },
  dateActiveDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#4ade80',
    position: 'absolute',
    bottom: 5,
  },

  // ── Scroll Content ────────────────────────────────────────────────────────
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 14,
  },

  // ── Smart Planning / AI Advisory Card ─────────────────────────────────────
  aiRecCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    shadowColor: '#15803d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  aiRecTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  aiRecIconBadge: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiRecTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  aiRecTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#14532d',
  },
  aiRecPill: {
    backgroundColor: 'rgba(22, 101, 52, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  aiRecPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803d',
    letterSpacing: 0.5,
  },
  aiRecBody: {
    fontSize: 12.5,
    color: '#166534',
    lineHeight: 18,
  },
  aiExpandedBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  aiExpandedText: {
    fontSize: 12,
    color: '#14532d',
    lineHeight: 18,
  },
  aiAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#15803d',
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
    gap: 6,
  },
  aiAddBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  aiRecFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(34, 197, 94, 0.15)',
  },
  aiRecActionLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  aiRecActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803d',
  },
  aiDismissText: {
    fontSize: 11.5,
    color: '#657168',
    fontWeight: '500',
  },

  // ── Schedule Header ───────────────────────────────────────────────────────
  scheduleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginTop: 2,
  },
  scheduleTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.onSurface,
    letterSpacing: -0.3,
  },
  scheduleSubtitle: {
    fontSize: 12,
    color: '#556057',
    marginTop: 2,
  },
  counterBadge: {
    backgroundColor: COLORS.surfaceContainerLow,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(6, 95, 70, 0.08)',
  },
  counterBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#15803d',
  },

  // ── Task List ─────────────────────────────────────────────────────────────
  tasksList: {
    gap: 10,
  },
  taskCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(6, 95, 70, 0.08)',
    shadowColor: '#103823',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  taskCardCompleted: {
    backgroundColor: '#fbfdfb',
    borderColor: 'rgba(34, 197, 94, 0.2)',
    opacity: 0.88,
  },
  taskCardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  taskTypeBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskTitleText: {
    fontSize: 15.5,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  taskTitleTextDone: {
    color: '#8a948c',
    textDecorationLine: 'line-through',
  },
  cropFieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  cropFieldText: {
    fontSize: 12.5,
    color: '#406653',
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  timeTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#15803d',
  },
  typePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typePillText: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  // Actions inside task card
  taskActionCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  markDoneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#15803d',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 4,
    shadowColor: '#15803d',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  markDoneBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#ffffff',
  },
  donePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#86efac',
    gap: 4,
  },
  donePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803d',
  },

  // ── Empty State ───────────────────────────────────────────────────────────
  emptyContainer: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(6, 95, 70, 0.08)',
    marginTop: 6,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.onSurface,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 13,
    color: '#556057',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
    paddingHorizontal: 12,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#15803d',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 16,
    gap: 6,
  },
  emptyActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  loadingBox: {
    paddingVertical: 32,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: '#657168',
  },

  // ── Floating Action Button ────────────────────────────────────────────────
  fabOuter: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#15803d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  fabInner: {
    flex: 1,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Modal Styles ──────────────────────────────────────────────────────────
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '88%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#141e18',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#556057',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#406653',
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: 10,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 6,
  },
  typeOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8faf9',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(6, 95, 70, 0.12)',
    gap: 6,
  },
  typeOptionBtnActive: {
    backgroundColor: '#15803d',
    borderColor: '#15803d',
  },
  typeOptionText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#141e18',
  },
  typeOptionTextActive: {
    color: '#ffffff',
  },
  textInput: {
    backgroundColor: '#f8faf9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(6, 95, 70, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: '#141e18',
  },
  quickCropsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  quickCropChip: {
    backgroundColor: '#f1f5f2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  quickCropChipActive: {
    backgroundColor: '#dcfce7',
    borderColor: '#86efac',
  },
  quickCropText: {
    fontSize: 11.5,
    color: '#406653',
    fontWeight: '600',
  },
  quickCropTextActive: {
    color: '#15803d',
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateDisplayBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8faf9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(6, 95, 70, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  dateDisplayText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#141e18',
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8faf9',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(6, 95, 70, 0.08)',
    marginTop: 14,
    marginBottom: 16,
  },
  reminderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reminderIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#141e18',
  },
  reminderSub: {
    fontSize: 11,
    color: '#657168',
  },
  saveBtnOuter: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 6,
    shadowColor: '#15803d',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  saveBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});
