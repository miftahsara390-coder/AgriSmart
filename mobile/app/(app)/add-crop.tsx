import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS } from '../../src/constants/theme';
import { useCreateCropMutation } from '../../src/services/crops';

export default function AddCropScreen() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [variety, setVariety] = useState('');
  const [plantingDate, setPlantingDate] = useState(new Date().toISOString().split('T')[0]);
  
  const createCropMutation = useCreateCropMutation();
  const loading = createCropMutation.isPending;

  const handleSave = async () => {
    if (!name.trim() || !type.trim()) {
      Alert.alert('Required', 'Please enter crop name and type');
      return;
    }
    try {
      await createCropMutation.mutateAsync({
        name: name.trim(),
        type: type.trim(),
        variety: variety.trim(),
        plantingDate,
        stage: 'Seed',
        status: 'Healthy',
      });
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save crop');
    }
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Crop</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          <Text style={styles.label}>Crop Name / Identifier</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Tomato Field A"
            placeholderTextColor={COLORS.outline}
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Crop Type</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Tomato, Corn, Wheat"
            placeholderTextColor={COLORS.outline}
            value={type}
            onChangeText={setType}
          />

          <Text style={styles.label}>Variety (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Cherry, Sweet"
            placeholderTextColor={COLORS.outline}
            value={variety}
            onChangeText={setVariety}
          />

          <Text style={styles.label}>Planting Date</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={COLORS.outline}
            value={plantingDate}
            onChangeText={setPlantingDate}
          />

        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
          <LinearGradient colors={['#22c55e', '#16a34a', '#15803d']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.saveBtnInner}>
            <Text style={styles.saveBtnText}>{loading ? 'Saving...' : 'Register Crop'}</Text>
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
  footer: { padding: 20, paddingBottom: 24, backgroundColor: COLORS.surfaceContainerLowest, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  saveBtn: { borderRadius: 16, overflow: 'hidden' },
  saveBtnInner: { padding: 16, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
