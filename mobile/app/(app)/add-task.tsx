import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS } from '../../src/constants/theme';
import { tasksAPI, cropsAPI } from '../../src/services/api';

export default function AddTaskScreen() {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('water');
  const [priority, setPriority] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [crops, setCrops] = useState<any[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);

  useEffect(() => {
    cropsAPI.getAll().then(res => setCrops(res.data.crops || [])).catch(console.error);
  }, []);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a task title');
      return;
    }
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      await tasksAPI.create({
        title,
        description,
        type,
        priority,
        date: today,
        dueDate: today,
        cropId: selectedCrop,
      });
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const types = [
    { id: 'water', icon: 'water-drop', label: 'Water' },
    { id: 'fertilizer', icon: 'eco', label: 'Fertilize' },
    { id: 'harvest', icon: 'agriculture', label: 'Harvest' },
    { id: 'other', icon: 'event-note', label: 'Other' },
  ];

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Task</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          <Text style={styles.label}>Task Title</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Irrigate Tomato Field"
            placeholderTextColor={COLORS.outline}
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add details..."
            placeholderTextColor={COLORS.outline}
            multiline
            numberOfLines={3}
            value={description}
            onChangeText={setDescription}
          />

          <Text style={styles.label}>Task Type</Text>
          <View style={styles.typeRow}>
            {types.map(t => (
              <TouchableOpacity
                key={t.id}
                style={[styles.typeBtn, type === t.id && styles.typeBtnActive]}
                onPress={() => setType(t.id)}
              >
                <MaterialIcons name={t.icon as any} size={20} color={type === t.id ? '#fff' : COLORS.outline} />
                <Text style={[styles.typeText, type === t.id && styles.typeTextActive]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Related Crop (Optional)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cropScroll}>
            {crops.map(c => (
              <TouchableOpacity
                key={c.id}
                style={[styles.cropBadge, selectedCrop === c.id && styles.cropBadgeActive]}
                onPress={() => setSelectedCrop(selectedCrop === c.id ? null : c.id)}
              >
                <Text style={[styles.cropBadgeText, selectedCrop === c.id && styles.cropBadgeTextActive]}>
                  {c.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
          <LinearGradient colors={['#22c55e', '#16a34a', '#15803d']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.saveBtnInner}>
            <Text style={styles.saveBtnText}>{loading ? 'Saving...' : 'Create Task'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.surface },
  safe: { backgroundColor: 'rgba(241, 252, 242, 0.95)' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.onSurface },
  content: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.onSurface, marginBottom: 8, marginTop: 16 },
  input: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 16, color: COLORS.onSurface,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surfaceContainerLowest,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', gap: 6
  },
  typeBtnActive: { backgroundColor: '#15803d', borderColor: '#15803d' },
  typeText: { fontSize: 14, color: COLORS.outline, fontWeight: '500' },
  typeTextActive: { color: '#fff' },
  cropScroll: { flexDirection: 'row', marginTop: 4 },
  cropBadge: { backgroundColor: COLORS.surfaceContainerLowest, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, marginRight: 10, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  cropBadgeActive: { backgroundColor: COLORS.primaryContainer, borderColor: COLORS.primaryContainer },
  cropBadgeText: { color: COLORS.secondary, fontWeight: '600' },
  cropBadgeTextActive: { color: COLORS.onPrimary },
  footer: { padding: 20, paddingBottom: 24, backgroundColor: COLORS.surfaceContainerLowest, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  saveBtn: { borderRadius: 16, overflow: 'hidden' },
  saveBtnInner: { padding: 16, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
