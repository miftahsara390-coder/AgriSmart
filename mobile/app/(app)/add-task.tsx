import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS } from '../../src/constants/theme';
import { useCreateTaskMutation } from '../../src/services/tasks';
import { useCropsQuery } from '../../src/services/crops';
import { scheduleTaskReminder } from '../../src/services/notifications.service';

const TASK_TYPES = [
  { id: 'Irrigation', icon: 'water-drop', label: 'Irrigation', defaultTitle: 'Drip Line Irrigation' },
  { id: 'Fertilization', icon: 'eco', label: 'Fertilization', defaultTitle: 'Fertilization & Nutrients' },
  { id: 'Harvest', icon: 'agriculture', label: 'Harvest', defaultTitle: 'Crop Harvest' },
  { id: 'Planting', icon: 'spa', label: 'Planting', defaultTitle: 'Seed Sowing & Planting' },
  { id: 'Pest Check', icon: 'bug-report', label: 'Pest Check', defaultTitle: 'Foliar Pest Check' },
  { id: 'Crop Inspection', icon: 'fact-check', label: 'Crop Inspection', defaultTitle: 'Crop Inspection & Vigor' },
  { id: 'Other', icon: 'event-note', label: 'Other', defaultTitle: 'General Farm Task' },
];

const DEFAULT_CROPS = [
  'Tomato Field 1',
  'Olive Field',
  'Wheat Zone 3',
  'Field A • Row 4',
  'Citrus Orchard B',
];

const TIMER_OPTIONS = [
  { id: '10s', label: '10s (⚡ Test)', seconds: 10, hint: 'Fires in 10 seconds' },
  { id: '1m', label: '1 min', seconds: 60, hint: 'Fires in 1 minute' },
  { id: '5m', label: '5 min', seconds: 300, hint: 'Fires in 5 minutes' },
  { id: '15m', label: '15 min', seconds: 900, hint: 'Fires 15 minutes before' },
  { id: '30m', label: '30 min', seconds: 1800, hint: 'Fires 30 minutes before' },
  { id: 'task', label: 'At Task Time', seconds: 0, hint: 'Fires at scheduled task time' },
];

export default function AddTaskScreen() {
  const insets = useSafeAreaInsets();
  const todayStr = new Date().toISOString().split('T')[0];

  const getUpcomingTimeStr = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 30);
    let h = d.getHours();
    const m = d.getMinutes() < 30 ? '30' : '00';
    if (d.getMinutes() >= 30) h = (h + 1) % 24;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = (h % 12 || 12).toString().padStart(2, '0');
    return `${displayH}:${m} ${ampm}`;
  };

  const [type, setType] = useState('Irrigation');
  const [title, setTitle] = useState('Drip Line Irrigation');
  const [cropField, setCropField] = useState('Tomato Field 1');
  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState(getUpcomingTimeStr());
  const [reminder, setReminder] = useState(true);
  const [selectedTimer, setSelectedTimer] = useState('10s');

  const { data: cropsData } = useCropsQuery();
  const createTaskMutation = useCreateTaskMutation();
  const loading = createTaskMutation.isPending;

  const cropsList = React.useMemo(() => {
    if (cropsData?.crops && cropsData.crops.length > 0) {
      const names = cropsData.crops.map((c: any) => c.name + (c.location ? ` (${c.location})` : ''));
      return Array.from(new Set([...names, ...DEFAULT_CROPS]));
    }
    return DEFAULT_CROPS;
  }, [cropsData]);

  const handleSelectType = (typeId: string) => {
    setType(typeId);
    const item = TASK_TYPES.find((t) => t.id === typeId);
    if (item) {
      setTitle(item.defaultTitle);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a task title');
      return;
    }
    try {
      const res = await createTaskMutation.mutateAsync({
        title: title.trim(),
        description: `Farm task for ${cropField}`,
        type,
        priority: 'high',
        date,
        dueDate: date,
        time,
      });

      if (reminder) {
        const timerItem = TIMER_OPTIONS.find((t) => t.id === selectedTimer);
        const delay = timerItem && timerItem.seconds > 0 ? timerItem.seconds : undefined;
        await scheduleTaskReminder({
          taskId: res.task?.id,
          title: title.trim(),
          cropField,
          dueDate: date,
          time,
          delaySeconds: delay,
        });

        const confirmMsg =
          timerItem && timerItem.seconds > 0
            ? `Notification timer set to fire in ${timerItem.label}!`
            : `Notification scheduled for ${time}!`;

        Alert.alert('Task Created 🎉', `"${title.trim()}" is now in Today's Tasks.\n\n${confirmMsg}`, [
          { text: 'Great!', onPress: () => router.back() },
        ]);
        return;
      }

      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save task');
    }
  };

  const selectedTimerObj = TIMER_OPTIONS.find((t) => t.id === selectedTimer);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Farm Task</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* 1. Task Type */}
          <Text style={styles.label}>TASK TYPE</Text>
          <View style={styles.typeGrid}>
            {TASK_TYPES.map((t) => {
              const active = type === t.id;
              return (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.typeBtn, active && styles.typeBtnActive]}
                  onPress={() => handleSelectType(t.id)}
                  activeOpacity={0.8}
                >
                  <MaterialIcons
                    name={t.icon as any}
                    size={18}
                    color={active ? '#ffffff' : '#15803d'}
                  />
                  <Text style={[styles.typeText, active && styles.typeTextActive]}>{t.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 2. Task Title */}
          <Text style={styles.label}>TASK TITLE</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Drip Line Irrigation"
            placeholderTextColor={COLORS.outline}
            value={title}
            onChangeText={setTitle}
          />

          {/* 3. Crop / Field */}
          <Text style={styles.label}>CROP / FIELD</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Tomato Field 1"
            placeholderTextColor={COLORS.outline}
            value={cropField}
            onChangeText={setCropField}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cropScroll}>
            {cropsList.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.cropBadge, cropField === c && styles.cropBadgeActive]}
                onPress={() => setCropField(c)}
              >
                <Text style={[styles.cropBadgeText, cropField === c && styles.cropBadgeTextActive]}>
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* 4. Date & Time */}
          <View style={styles.formRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>DATE</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={COLORS.outline}
                value={date}
                onChangeText={setDate}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>TIME</Text>
              <TextInput
                style={styles.input}
                placeholder="04:30 PM"
                placeholderTextColor={COLORS.outline}
                value={time}
                onChangeText={setTime}
              />
            </View>
          </View>

          {/* 5. Optional Reminder & Timer */}
          <View style={styles.reminderCard}>
            <View style={styles.reminderLeft}>
              <MaterialIcons name="notifications-active" size={20} color="#15803d" />
              <View>
                <Text style={styles.reminderTitle}>Task Reminder Notification</Text>
                <Text style={styles.reminderSub}>
                  {reminder ? (selectedTimerObj ? selectedTimerObj.hint : 'Timer active') : 'Disabled'}
                </Text>
              </View>
            </View>
            <Switch
              value={reminder}
              onValueChange={setReminder}
              trackColor={{ false: '#e5e7eb', true: '#86efac' }}
              thumbColor={reminder ? '#15803d' : '#f4f4f5'}
            />
          </View>

          {/* 6. Notification Timer Selector */}
          {reminder && (
            <View style={styles.timerBox}>
              <Text style={styles.timerBoxLabel}>REMINDER TIMER</Text>
              <View style={styles.timerGrid}>
                {TIMER_OPTIONS.map((opt) => {
                  const isSelected = selectedTimer === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[styles.timerPill, isSelected && styles.timerPillActive]}
                      onPress={() => setSelectedTimer(opt.id)}
                      activeOpacity={0.8}
                    >
                      <MaterialIcons
                        name={opt.id === '10s' ? 'flash-on' : 'alarm'}
                        size={14}
                        color={isSelected ? '#ffffff' : '#15803d'}
                      />
                      <Text style={[styles.timerPillText, isSelected && styles.timerPillTextActive]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.timerNotice}>
                <MaterialIcons name="info-outline" size={16} color="#15803d" />
                <Text style={styles.timerNoticeText}>
                  {selectedTimer === '10s'
                    ? '⚡ Quick Test: Expo notification banner will fire 10 seconds after saving.'
                    : selectedTimer === 'task'
                    ? `🔔 Reminder will fire at scheduled time (${time}).`
                    : `⏱️ Notification will alert you in ${selectedTimerObj?.label}.`}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading} activeOpacity={0.85}>
          <LinearGradient
            colors={['#22c55e', '#16a34a', '#15803d']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.saveBtnInner}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialIcons name="check" size={20} color="#fff" />
                <Text style={styles.saveBtnText}>Save Task</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.surface },
  safe: {
    backgroundColor: 'rgba(241, 252, 242, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.onSurface },
  content: { padding: 20, paddingBottom: 40 },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#406653',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 14,
  },
  input: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: 'rgba(6, 95, 70, 0.12)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.onSurface,
  },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLowest,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(6, 95, 70, 0.12)',
    gap: 6,
  },
  typeBtnActive: { backgroundColor: '#15803d', borderColor: '#15803d' },
  typeText: { fontSize: 12.5, color: '#141e18', fontWeight: '600' },
  typeTextActive: { color: '#fff' },
  cropScroll: { flexDirection: 'row', marginTop: 8 },
  cropBadge: {
    backgroundColor: COLORS.surfaceContainerLowest,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(6, 95, 70, 0.08)',
  },
  cropBadgeActive: { backgroundColor: '#dcfce7', borderColor: '#86efac' },
  cropBadgeText: { color: '#406653', fontWeight: '600', fontSize: 12 },
  cropBadgeTextActive: { color: '#15803d' },
  formRow: { flexDirection: 'row', gap: 12 },

  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceContainerLowest,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(6, 95, 70, 0.08)',
    marginTop: 18,
  },
  reminderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  reminderTitle: { fontSize: 13, fontWeight: '700', color: COLORS.onSurface },
  reminderSub: { fontSize: 11, color: '#657168', marginTop: 2 },

  timerBox: {
    backgroundColor: 'rgba(21, 128, 61, 0.04)',
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(21, 128, 61, 0.15)',
  },
  timerBoxLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#15803d',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  timerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(21, 128, 61, 0.2)',
  },
  timerPillActive: {
    backgroundColor: '#15803d',
    borderColor: '#15803d',
  },
  timerPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803d',
  },
  timerPillTextActive: {
    color: '#ffffff',
  },
  timerNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(21, 128, 61, 0.1)',
  },
  timerNoticeText: {
    fontSize: 11.5,
    color: '#166534',
    flex: 1,
    lineHeight: 16,
  },

  footer: {
    padding: 20,
    paddingBottom: 24,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  saveBtn: { borderRadius: 14, overflow: 'hidden' },
  saveBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, gap: 8 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
