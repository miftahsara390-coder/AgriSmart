import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { cropsAPI } from '../../src/services/api';

import { COLORS } from '../../src/constants/theme';
import Header from '../../src/components/Header';

const GROWTH_STAGES = [
  { label: 'Seed', completed: true },
  { label: 'Growth', completed: true },
  { label: 'Flowering', active: true },
  { label: 'Fruit' },
  { label: 'Harvest' },
];

export default function CropDetailScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    location?: string;
    stage?: string;
    status?: string;
  }>();

  const [crop, setCrop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [taskDone, setTaskDone] = useState(false);
  const [aiVisible, setAiVisible] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  React.useEffect(() => {
    if (params.id) {
      fetchCropData(params.id);
    }
  }, [params.id]);

  const fetchCropData = async (id: string) => {
    try {
      const res = await cropsAPI.getById(id);
      setCrop(res.data);
    } catch (error) {
      console.error('Failed to fetch crop data', error);
    } finally {
      setLoading(false);
    }
  };

  const askAi = async () => {
    setAiVisible(!aiVisible);
    if (!aiVisible && !aiResponse && crop?.id) {
      setAiLoading(true);
      try {
        const res = await cropsAPI.getAiAdvice(crop.id);
        setAiResponse(res.data.advice);
      } catch (err) {
        console.error(err);
      } finally {
        setAiLoading(false);
      }
    }
  };

  const cropData = crop || {
    name: params.name || 'Tomatoes',
    variety: 'Cherry Tomato • Solanum lycopersicum',
    location: params.location || 'Field A • Row 4',
    stage: params.stage || 'Flowering',
    status: params.status || 'Healthy',
    plantedDate: 'May 12',
    harvestDate: 'July 28',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGPhWdhZdufDRhqMNEHZG75LPcEMtrIZkadXIFktEyd5K9Xofz4_KxaKDoFA9mXpYnBuvOJnqS3xCtcfi6MMyqwYQRwFqJSKFWKVz-zv8vNa_oC8EwOluoq6Mb4wz6ugrSESuQbOJ_6cQrVwtPCwQBBy43MmZ9wJEiv-Y4jttBMagfS1RZ77uCiyzf24OuVrwixz3VU9bBdB8yJmeKRHWbEJkVyUmwKvOqp5obzP-x0Z5YyjNu4VURIg',
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      
      <Header title="Crop Detail" showBack style={{ backgroundColor: 'rgba(241, 252, 242, 0.8)' }} />

      <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]} showsVerticalScrollIndicator={false}>
        
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: cropData.imageUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGPhWdhZdufDRhqMNEHZG75LPcEMtrIZkadXIFktEyd5K9Xofz4_KxaKDoFA9mXpYnBuvOJnqS3xCtcfi6MMyqwYQRwFqJSKFWKVz-zv8vNa_oC8EwOluoq6Mb4wz6ugrSESuQbOJ_6cQrVwtPCwQBBy43MmZ9wJEiv-Y4jttBMagfS1RZ77uCiyzf24OuVrwixz3VU9bBdB8yJmeKRHWbEJkVyUmwKvOqp5obzP-x0Z5YyjNu4VURIg' }} style={styles.heroImg} resizeMode="cover" />
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.4)']}
            style={styles.heroGradient}
          />
          <View style={styles.syncBadge}>
            <View style={styles.syncDot} />
            <Text style={styles.syncText}>Vitals Synced 4m ago</Text>
          </View>
          <TouchableOpacity style={styles.cameraBtn}>
            <MaterialIcons name="photo-camera" size={18} color={COLORS.onSurface} />
          </TouchableOpacity>
        </View>

        {/* Title Block */}
        <View style={styles.titleBlock}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cropName}>{cropData.name}</Text>
            <Text style={styles.cropVariety}>{cropData.variety || 'Variety Unknown'}</Text>
          </View>
          <View style={styles.statusBadge}>
            <MaterialIcons name="check-circle" size={16} color="#15803d" />
            <Text style={styles.statusText}>{cropData.status}</Text>
          </View>
        </View>

        {/* 2x2 Metric Grid */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <MaterialIcons name="calendar-today" size={16} color={COLORS.outline} />
              <Text style={styles.metricLabel}>Planted</Text>
            </View>
            <Text style={styles.metricValue}>{cropData.plantedDate ? new Date(cropData.plantedDate).toLocaleDateString([], {month: 'short', day: 'numeric'}) : 'N/A'}</Text>
          </View>
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <MaterialIcons name="psychology" size={16} color={COLORS.outline} />
              <Text style={styles.metricLabel}>Stage</Text>
            </View>
            <Text style={styles.metricValue}>{cropData.stage}</Text>
          </View>
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <MaterialIcons name={"event" as any} size={16} color={COLORS.outline} />
              <Text style={styles.metricLabel}>Harvest Est.</Text>
            </View>
            <Text style={styles.metricValue}>{cropData.harvestDate ? new Date(cropData.harvestDate).toLocaleDateString([], {month: 'short', day: 'numeric'}) : 'N/A'}</Text>
          </View>
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <MaterialIcons name="grid-view" size={16} color={COLORS.outline} />
              <Text style={styles.metricLabel}>Plot Area</Text>
            </View>
            <Text style={styles.metricValue}>{cropData.location}</Text>
          </View>
        </View>

        {/* Growth Stage */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Text style={styles.cardTitle}>Growth Progression</Text>
              <MaterialIcons name="eco" size={16} color={COLORS.primaryContainer} />
            </View>
            <View style={styles.stageBadge}>
              <Text style={styles.stageBadgeText}>Stage 3 of 5</Text>
            </View>
          </View>

          <View style={styles.timelineWrap}>
            <View style={styles.timelineTrackBase} />
            <View style={styles.timelineTrackActive} />
            
            <View style={styles.timelineSteps}>
              {GROWTH_STAGES.map((stage, i) => (
                <View key={i} style={styles.timelineStep}>
                  {stage.completed ? (
                    <View style={styles.stepDotCompleted}>
                      <MaterialIcons name="check" size={14} color={COLORS.primaryContainer} />
                    </View>
                  ) : stage.active ? (
                    <View style={styles.stepDotActiveOuter}>
                      <View style={styles.stepDotActiveInner} />
                    </View>
                  ) : (
                    <View style={styles.stepDotUpcoming}>
                      <View style={styles.stepDotUpcomingInner} />
                    </View>
                  )}
                  <Text style={[
                    styles.stepLabel, 
                    stage.active && styles.stepLabelActive,
                    (!stage.active && !stage.completed) && styles.stepLabelUpcoming
                  ]}>
                    {stage.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Next Task Card */}
        <View style={styles.taskCard}>
          <View style={styles.taskLeft}>
            <View style={styles.taskIconWrap}>
              <MaterialIcons name="water-drop" size={22} color={COLORS.primaryContainer} />
            </View>
            <View style={styles.taskContent}>
              <Text style={styles.taskEyebrow}>NEXT TASK</Text>
              <Text style={styles.taskTitle}>Drip Line Irrigation</Text>
              <View style={styles.taskTimeRow}>
                <MaterialIcons name="schedule" size={14} color={COLORS.primaryContainer} />
                <Text style={styles.taskTime}>Tomorrow • 08:00 AM</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.taskBtn, taskDone && styles.taskBtnDone]}
            onPress={() => setTaskDone(!taskDone)}
          >
            <MaterialIcons name={taskDone ? "done-all" : "check"} size={20} color={taskDone ? "#fff" : COLORS.onSurface} />
          </TouchableOpacity>
        </View>

        {/* AI Copilot */}
        <LinearGradient
          colors={['#0e2a1d', '#153e2b']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.aiCard}
        >
          <View style={styles.aiHeader}>
            <View style={styles.aiHeaderLeft}>
              <View style={styles.aiIconBadge}>
                <MaterialIcons name="auto-awesome" size={17} color="#4ade80" />
              </View>
              <Text style={styles.aiTitle}>Crop Intelligence</Text>
            </View>
            <View style={styles.aiAutomatedBadge}>
              <Text style={styles.aiAutomatedText}>AUTOMATED</Text>
            </View>
          </View>

          <Text style={styles.aiText}>
            Maintain regular watering during flowering and monitor leaf color closely. Low humidity spike anticipated Thursday.
          </Text>

          <View style={styles.aiFooter}>
            <Text style={styles.aiRec}>Recommended: {cropData?.moistureLevel ? `${cropData.moistureLevel}% moisture limit` : 'Check vitals periodically'}</Text>
            <TouchableOpacity 
              style={styles.aiBtnOuter}
              onPress={askAi}
            >
              <LinearGradient
                colors={['#22c55e', '#16a34a', '#15803d']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.aiBtnInner}
              >
                <Text style={styles.aiBtnText}>{aiVisible ? 'Hide Details' : 'Ask AI'}</Text>
                {!aiVisible && <MaterialIcons name="arrow-forward" size={16} color="#fff" />}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {aiVisible && (
            <View style={styles.aiResponseBox}>
              <Text style={styles.aiResponseText}>
                {aiLoading ? 'Analyzing telemetry...' : aiResponse || 'Checking microclimate sensors... soil moisture is currently optimal.'}
              </Text>
            </View>
          )}
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn}>
            <MaterialIcons name="edit-note" size={18} color={COLORS.primaryContainer} />
            <Text style={styles.actionBtnText}>Log Observation</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <MaterialIcons name="sensors" size={18} color={COLORS.primaryContainer} />
            <Text style={styles.actionBtnText}>Sensor History</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  heroContainer: {
    width: '100%',
    height: 224,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.surfaceContainer,
  },
  heroImg: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  syncBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 37, 24, 0.65)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    gap: 8,
  },
  syncDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ade80',
    shadowColor: '#4ade80',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  syncText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#fff',
    letterSpacing: 0.5,
  },
  cameraBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cropName: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.onSurface,
    letterSpacing: -0.2,
  },
  cropVariety: {
    fontSize: 14,
    color: COLORS.outline,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(22, 101, 52, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803d',
    letterSpacing: 0.5,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: '48%',
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    justifyContent: 'space-between',
    minHeight: 70,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.outline,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  card: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  stageBadge: {
    backgroundColor: COLORS.surfaceContainerLow,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  stageBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.primaryContainer,
  },
  timelineWrap: {
    position: 'relative',
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 8,
  },
  timelineTrackBase: {
    position: 'absolute',
    top: 15,
    left: 24,
    right: 24,
    height: 2,
    backgroundColor: COLORS.surfaceContainer,
  },
  timelineTrackActive: {
    position: 'absolute',
    top: 15,
    left: 24,
    width: '50%',
    height: 2,
    backgroundColor: COLORS.primaryContainer,
  },
  timelineSteps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  timelineStep: {
    alignItems: 'center',
    width: 56,
    gap: 6,
  },
  stepDotCompleted: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActiveOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#15803d',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4ade80',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    marginTop: -2,
  },
  stepDotActiveInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  stepDotUpcoming: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotUpcomingInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.outline,
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.outline,
  },
  stepLabelActive: {
    color: COLORS.primaryContainer,
    fontWeight: '600',
  },
  stepLabelUpcoming: {
    color: COLORS.outline,
  },
  taskCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  taskIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskContent: {
    justifyContent: 'center',
  },
  taskEyebrow: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.outline,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  taskTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  taskTime: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primaryContainer,
  },
  taskBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskBtnDone: {
    backgroundColor: COLORS.primaryContainer,
  },
  aiCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  aiHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 12,
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  aiAutomatedBadge: {
    backgroundColor: 'rgba(22, 101, 52, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  aiAutomatedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6ee7b7',
    letterSpacing: 1,
  },
  aiText: {
    fontSize: 14,
    color: 'rgba(236, 253, 245, 0.9)',
    lineHeight: 20,
    marginBottom: 16,
  },
  aiFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderColor: 'rgba(6, 95, 70, 0.4)',
    paddingTop: 8,
  },
  aiRec: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(167, 243, 208, 0.8)',
  },
  aiBtnOuter: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  aiBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  aiBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  aiResponseBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(10, 24, 17, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  aiResponseText: {
    fontSize: 14,
    color: 'rgba(209, 250, 229, 0.9)',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceContainerLowest,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(192, 201, 192, 0.6)',
    gap: 8,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.onSurface,
  }
});
