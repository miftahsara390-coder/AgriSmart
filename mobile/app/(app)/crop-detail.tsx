import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  useCropQuery,
  useCropIntelligenceQuery,
  useCropAiAdviceMutation,
  useCropsQuery,
} from '../../src/services/crops';
import {
  useCompleteTaskMutation,
  useUpdateTaskMutation,
  useCreateTaskMutation,
} from '../../src/services/tasks';

import { COLORS } from '../../src/constants/theme';
import Header from '../../src/components/Header';

const ALL_STAGES = ['Seed', 'Growth', 'Flowering', 'Fruit', 'Harvest'];

function formatDisplayDate(dateStr?: string, fallback = 'N/A'): string {
  if (!dateStr) return fallback;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getTaskIcon(type?: string, title?: string): keyof typeof MaterialIcons.glyphMap {
  const str = `${type || ''} ${title || ''}`.toLowerCase();
  if (str.includes('water') || str.includes('irrigat')) return 'water';
  if (str.includes('fertil') || str.includes('nutri')) return 'eco';
  if (str.includes('harvest') || str.includes('pick')) return 'agriculture';
  if (str.includes('plant') || str.includes('sow') || str.includes('seed')) return 'spa';
  if (str.includes('pest') || str.includes('spray') || str.includes('bug')) return 'bug-report';
  if (str.includes('inspect') || str.includes('check') || str.includes('scout')) return 'fact-check';
  return 'event-available';
}

export default function CropDetailScreen() {
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    location?: string;
    stage?: string;
    status?: string;
  }>();

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  
  const { data: allCropsData } = useCropsQuery({ enabled: !params.id });
  const activeCropId = params.id || (allCropsData?.crops?.[0]?.id ? String(allCropsData.crops[0].id) : undefined);

  const { data: cropDetailData, isLoading: cropLoading } = useCropQuery(activeCropId);
  const { data: intelData, isLoading: intelLoading } = useCropIntelligenceQuery(activeCropId);

  const aiAdviceMutation = useCropAiAdviceMutation();
  const completeTaskMutation = useCompleteTaskMutation();
  const updateTaskMutation = useUpdateTaskMutation();
  const createTaskMutation = useCreateTaskMutation();

  const loading = cropLoading || intelLoading;
  const [taskDone, setTaskDone] = useState(false);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [aiVisible, setAiVisible] = useState(false);
  const [aiResponse, setAiResponse] = useState('');

  const nextTask = cropDetailData?.nextTask;

  useEffect(() => {
    if (nextTask) {
      setTaskDone(!!nextTask.completed || nextTask.status === 'done');
    }
  }, [nextTask]);

  const askAi = async () => {
    if (aiVisible) {
      setAiVisible(false);
      return;
    }
    setAiVisible(true);
    if (!aiResponse) {
      try {
        const targetId = activeCropId;
        if (targetId) {
          const res = await aiAdviceMutation.mutateAsync({
            cropId: targetId,
            question: `What is the best immediate agronomic advice for my ${cropName} crop at this ${cropStage} stage?`,
          });
          if (res?.advice) {
            setAiResponse(res.advice);
            return;
          }
        }
        setAiResponse(
          `Agronomic Advisory for ${cropName}: Keep root zone moisture between 50-65% during ${cropStage.toLowerCase()}. Apply 3.5L/plant at early morning (07:00 AM) via drip lines to maintain floral vigor.`
        );
      } catch (err) {
        setAiResponse(
          `Agronomic Advisory: Keep soil moisture between 50-65% during ${cropStage.toLowerCase()}. Avoid overhead watering to mitigate fungus risk, and inspect lower leaves for early blight spots.`
        );
      }
    }
  };

  const handleToggleTask = async () => {
    const nextDoneState = !taskDone;
    setTaskDone(nextDoneState);

    try {
      if (nextTask?.id) {
        if (nextDoneState) {
          await completeTaskMutation.mutateAsync(nextTask.id);
        } else {
          await updateTaskMutation.mutateAsync({
            id: nextTask.id,
            data: {
              completed: false,
              status: 'pending',
            },
          });
        }
      } else if (c?.id) {
        await createTaskMutation.mutateAsync({
          title: actionHeadline,
          type: actionType,
          cropId: c.id,
          date: todayStr,
          time: '08:00 AM',
          completed: nextDoneState,
          status: nextDoneState ? 'done' : 'pending',
          description: actionReason,
        });
      }
    } catch (err) {
      console.error('Failed to toggle task in backend', err);
      setTaskDone(!nextDoneState);
    }
  };

  // ── Unified Crop Data from Backend ──────────────────────────────────────────
  const c = cropDetailData?.crop;
  const intel = intelData;
  const latestSensor = intel?.latestSensor || cropDetailData?.sensorHistory?.[0];

  const cropName = c?.name || params.name || 'Tomato (San Marzano)';
  const cropVariety = c?.variety || (c?.type ? `${c.type} • Solanum lycopersicum` : 'Determinate • Solanum lycopersicum');
  const cropStage = c?.stage || params.stage || 'Flowering';
  const rawStatus = c?.status || params.status || 'Attention';
  const isHealthy = (rawStatus || '').toLowerCase() === 'healthy';

  const soilMoisture = latestSensor?.soilMoisture ?? 38;
  const temperature = latestSensor?.temperature ?? 24.5;
  const humidity = latestSensor?.humidity ?? 62;

  const location = c?.location || params.location || 'Field A • Sector 3';
  const plotArea = c?.area
    ? (typeof c.area === 'number' ? `${c.area} Hectares` : `${c.area}`)
    : (c?.plotArea || (c?.row ? `${c?.field || 'Field A'} (${c.row}) • 1.2 Ha` : '1.2 Hectares (Parcel 4)'));
  const plantingDate = formatDisplayDate(c?.plantingDate, 'May 12, 2026');
  const expectedHarvest = formatDisplayDate(c?.expectedHarvestDate, 'July 28, 2026');

  const imageUrl = c?.imageUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGPhWdhZdufDRhqMNEHZG75LPcEMtrIZkadXIFktEyd5K9Xofz4_KxaKDoFA9mXpYnBuvOJnqS3xCtcfi6MMyqwYQRwFqJSKFWKVz-zv8vNa_oC8EwOluoq6Mb4wz6ugrSESuQbOJ_6cQrVwtPCwQBBy43MmZ9wJEiv-Y4jttBMagfS1RZ77uCiyzf24OuVrwixz3VU9bBdB8yJmeKRHWbEJkVyUmwKvOqp5obzP-x0Z5YyjNu4VURIg';

  // ── Next Action Fields ──────────────────────────────────────────────────────
  const actionHeadline = nextTask?.title || intel?.nextRecommendedAction || (soilMoisture < 42 ? 'Drip Line Irrigation' : 'Crop Inspection');
  const actionType = nextTask?.type || (actionHeadline.toLowerCase().includes('irrigat') ? 'Irrigation' : 'Crop Inspection');

  const actionDueText = useMemo(() => {
    if (nextTask) {
      const isToday = nextTask.date === todayStr;
      const timeStr = nextTask.time || '08:00 AM';
      if (isToday) return `Today at ${timeStr}`;
      return `${nextTask.date || 'Tomorrow'} at ${timeStr}`;
    }
    return soilMoisture < 42 ? 'Tomorrow at 08:00' : 'Tomorrow at 08:00';
  }, [nextTask, todayStr, soilMoisture]);

  const actionReason = useMemo(() => {
    if (nextTask?.description) {
      return nextTask.description;
    }
    if (soilMoisture < 42) {
      return `Recommended because soil moisture is decreasing (${soilMoisture}%). 3.5 Liters/plant recommended to maintain flowering vigor.`;
    }
    return `Scheduled agronomic care for ${cropStage.toLowerCase()} phase. Soil condition is ${intel?.soilCondition || 'Optimal'}.`;
  }, [nextTask, soilMoisture, cropStage, intel]);

  // ── 6. Alert Trigger Condition ──────────────────────────────────────────────
  const hasLowMoisture = soilMoisture < 42;
  const hasHighTemp = temperature > 32;
  const hasDiseaseRisk = !isHealthy || (intel?.possibleRisks && intel.possibleRisks.length > 0);
  const needsAttention = hasLowMoisture || hasHighTemp || hasDiseaseRisk;
  const showAlert = needsAttention && !alertDismissed;

  const alertContent = useMemo(() => {
    if (hasLowMoisture) {
      return {
        title: 'Action Required: Low Soil Moisture',
        subtitle: `Triggered by live sensor • Moisture dropped to ${soilMoisture}%`,
        body: `Soil moisture is below the 42% threshold. During the ${cropStage.toLowerCase()} phase, water deficit can cause flower abortion and reduce final harvest yield.`,
        tag: 'Irrigation recommended today',
      };
    }
    if (hasHighTemp) {
      return {
        title: 'Warning: High Canopy Temperature',
        subtitle: `Recorded ${temperature}°C in field canopy`,
        body: `High ambient temperature accelerates soil transpiration. Ensure root zone hydration is maintained.`,
        tag: 'Monitor canopy shading',
      };
    }
    return {
      title: 'Action Required: Crop Needs Care',
      subtitle: intel?.possibleRisks?.[0] || 'Attention status active for this parcel',
      body: `Agronomic inspection advised. Check foliage, stems, and leaf undersides for signs of pests or disease.`,
      tag: 'Scouting recommended',
    };
  }, [hasLowMoisture, hasHighTemp, soilMoisture, temperature, cropStage, intel]);

  // ── 3. Crop Intelligence Body ───────────────────────────────────────────────
  const intelligenceBody = useMemo(() => {
    if (intel?.irrigationRecommendation) {
      const risks = intel.possibleRisks && intel.possibleRisks.length > 0 ? ` ${intel.possibleRisks.join('. ')}` : '';
      return `${intel.irrigationRecommendation}${risks} Ambient temperature is ${temperature}°C with ${humidity}% humidity.`;
    }
    return `Your ${cropName.toLowerCase()} crop is ${cropStage.toLowerCase()}. Maintain regular watering and monitor leaves for yellow spots. Warm ambient conditions (${temperature}°C) favor steady development.`;
  }, [intel, cropName, cropStage, temperature, humidity]);

  // ── 4. Growth Stages calculation ────────────────────────────────────────────
  const activeStageIndex = Math.max(0, ALL_STAGES.findIndex(s => s.toLowerCase() === cropStage.toLowerCase()));

  const stageEstimateText = useMemo(() => {
    if (activeStageIndex <= 2) return '~16 days until Fruit stage';
    if (activeStageIndex === 3) return '~10 days to Harvest';
    return 'Harvest window open • Check crop quality';
  }, [activeStageIndex]);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <Header title="Crop Detail" showBack style={{ backgroundColor: 'rgba(241, 252, 242, 0.85)' }} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HERO BANNER ──────────────────────────────────────────────────────── */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: imageUrl }} style={styles.heroImg} resizeMode="cover" />
          <LinearGradient
            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.65)']}
            style={styles.heroGradient}
          />

          <View style={styles.syncBadge}>
            <View style={styles.syncDot} />
            <Text style={styles.syncText}>Sensors Active • Live Telemetry</Text>
          </View>

          <TouchableOpacity
            style={styles.cameraBtn}
            onPress={() => router.push('/(app)/scan')}
            activeOpacity={0.8}
          >
            <MaterialIcons name="camera-alt" size={18} color="#141e18" />
          </TouchableOpacity>
        </View>

        {/* ── 1. CROP OVERVIEW ─────────────────────────────────────────────────── */}
        <View style={styles.overviewCard}>
          <View style={styles.overviewHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cropTitle}>{cropName}</Text>
              <Text style={styles.cropSub}>{cropVariety}</Text>
            </View>
            <View style={[styles.statusBadge, !isHealthy && styles.statusBadgeAttention]}>
              <MaterialIcons
                name={isHealthy ? "check-circle" : "warning"}
                size={15}
                color={isHealthy ? "#15803d" : "#b45309"}
              />
              <Text style={[styles.statusText, !isHealthy && styles.statusTextAttention]}>
                {isHealthy ? 'Healthy' : 'Needs Care'}
              </Text>
            </View>
          </View>

          {/* Key Vitals Grid (Stage, Health, Moisture, Temp) */}
          <View style={styles.vitalsGrid}>
            <View style={styles.vitalItem}>
              <View style={[styles.vitalIconWrap, { backgroundColor: '#e0f2fe' }]}>
                <MaterialIcons name="water-drop" size={18} color="#0284c7" />
              </View>
              <Text style={styles.vitalLabel}>SOIL MOISTURE</Text>
              <Text style={styles.vitalValue}>{soilMoisture}%</Text>
              <Text style={[styles.vitalHint, soilMoisture < 42 ? { color: '#d97706' } : { color: '#16a34a' }]}>
                {soilMoisture < 42 ? 'Decreasing' : 'Optimal'}
              </Text>
            </View>

            <View style={styles.vitalItem}>
              <View style={[styles.vitalIconWrap, { backgroundColor: '#fef3c7' }]}>
                <MaterialIcons name="thermostat" size={18} color="#d97706" />
              </View>
              <Text style={styles.vitalLabel}>TEMPERATURE</Text>
              <Text style={styles.vitalValue}>{temperature}°C</Text>
              <Text style={styles.vitalHint}>Warm & Mild</Text>
            </View>

            <View style={styles.vitalItem}>
              <View style={[styles.vitalIconWrap, { backgroundColor: '#dcfce7' }]}>
                <MaterialIcons name="eco" size={18} color="#15803d" />
              </View>
              <Text style={styles.vitalLabel}>GROWTH STAGE</Text>
              <Text style={styles.vitalValue}>{cropStage}</Text>
              <Text style={styles.vitalHint}>Stage {activeStageIndex + 1} of 5</Text>
            </View>

            <View style={styles.vitalItem}>
              <View style={[styles.vitalIconWrap, { backgroundColor: '#f3e8ff' }]}>
                <MaterialIcons name="favorite" size={18} color="#9333ea" />
              </View>
              <Text style={styles.vitalLabel}>HEALTH STATUS</Text>
              <Text style={styles.vitalValue}>{isHealthy ? 'Good' : 'Moderate'}</Text>
              <Text style={styles.vitalHint}>Vigor Score: {isHealthy ? '94%' : '78%'}</Text>
            </View>
          </View>
        </View>

        {/* ── 6. ALERTS (Conditional: Only when crop needs attention) ──────────── */}
        {showAlert && (
          <View style={styles.alertCard}>
            <View style={styles.alertTop}>
              <View style={styles.alertIconBadge}>
                <MaterialIcons name="warning" size={20} color="#b45309" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.alertTitle}>{alertContent.title}</Text>
                <Text style={styles.alertTimestamp}>{alertContent.subtitle}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setAlertDismissed(true)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialIcons name="close" size={18} color="#92400e" />
              </TouchableOpacity>
            </View>
            <Text style={styles.alertBody}>{alertContent.body}</Text>
            <View style={styles.alertFooter}>
              <View style={styles.alertTag}>
                <MaterialIcons name="schedule" size={13} color="#b45309" />
                <Text style={styles.alertTagText}>{alertContent.tag}</Text>
              </View>
              <TouchableOpacity
                style={styles.alertActionBtn}
                onPress={() => setAlertDismissed(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.alertActionBtnText}>Acknowledge</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── 2. NEXT ACTION (Farmer's Primary Focus for Today) ────────────────── */}
        <View style={styles.actionSectionCard}>
          <View style={styles.actionBadgeRow}>
            <View style={styles.actionEyebrowPill}>
              <MaterialIcons name="priority-high" size={12} color="#15803d" />
              <Text style={styles.actionEyebrowText}>WHAT TO DO TODAY</Text>
            </View>
            <Text style={styles.actionDueText}>{actionDueText}</Text>
          </View>

          <View style={styles.actionContentRow}>
            <View style={styles.actionIconWrap}>
              <MaterialIcons name={getTaskIcon(actionType, actionHeadline)} size={24} color="#15803d" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionHeadline}>{actionHeadline}</Text>
              <Text style={styles.actionReason}>{actionReason}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.doneBtn, taskDone && styles.doneBtnCompleted]}
            onPress={handleToggleTask}
            activeOpacity={0.85}
          >
            <MaterialIcons
              name={taskDone ? "check-circle" : "check"}
              size={18}
              color={taskDone ? "#15803d" : "#ffffff"}
            />
            <Text style={[styles.doneBtnText, taskDone && styles.doneBtnTextCompleted]}>
              {taskDone ? "Completed • Field Log Updated" : "Mark as Done"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── 3. CROP INTELLIGENCE ────────────────────────────────────────────── */}
        <LinearGradient
          colors={['#0e2a1d', '#153e2b']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.intelligenceCard}
        >
          <View style={styles.intelligenceHeader}>
            <View style={styles.intelligenceHeaderLeft}>
              <View style={styles.intelligenceSparkBadge}>
                <MaterialIcons name="auto-awesome" size={16} color="#4ade80" />
              </View>
              <Text style={styles.intelligenceTitle}>Crop Intelligence</Text>
            </View>
            <View style={styles.aiLiveBadge}>
              <View style={styles.aiLiveDot} />
              <Text style={styles.aiLiveText}>AI ADVISORY</Text>
            </View>
          </View>

          <Text style={styles.intelligenceBody}>{intelligenceBody}</Text>

          {/* AI Expandable response */}
          {aiVisible && (
            <View style={styles.aiDetailsBox}>
              {aiAdviceMutation.isPending ? (
                <View style={styles.aiLoadingRow}>
                  <ActivityIndicator size="small" color="#4ade80" />
                  <Text style={styles.aiLoadingText}>Querying Agronomic AI Model...</Text>
                </View>
              ) : (
                <Text style={styles.aiDetailsText}>{aiResponse}</Text>
              )}
            </View>
          )}

          {/* Actions: Ask AI & Scan Plant */}
          <View style={styles.intelligenceButtonsRow}>
            <TouchableOpacity
              style={styles.intelBtnPrimary}
              onPress={askAi}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#22c55e', '#16a34a', '#15803d']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.intelBtnInner}
              >
                <MaterialIcons name="psychology" size={17} color="#fff" />
                <Text style={styles.intelBtnText}>{aiVisible ? 'Hide Advice' : 'Ask AI'}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.intelBtnSecondary}
              onPress={() => router.push('/(app)/scan')}
              activeOpacity={0.85}
            >
              <MaterialIcons name="document-scanner" size={16} color="#4ade80" />
              <Text style={styles.intelBtnSecondaryText}>Scan Plant</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* ── 4. GROWTH PROGRESSION ────────────────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <MaterialIcons name="timeline" size={18} color="#15803d" />
              <Text style={styles.cardTitle}>Growth Progression</Text>
            </View>
            <View style={styles.stageChip}>
              <Text style={styles.stageChipText}>{cropStage} Stage</Text>
            </View>
          </View>

          {/* Stepper: Seed → Growth → Flowering → Fruit → Harvest */}
          <View style={styles.stepperContainer}>
            <View style={styles.stepperTrackBase} />
            <View
              style={[
                styles.stepperTrackProgress,
                { width: `${(activeStageIndex / (ALL_STAGES.length - 1)) * 100}%` },
              ]}
            />

            <View style={styles.stepperNodesRow}>
              {ALL_STAGES.map((stg, idx) => {
                const isCompleted = idx < activeStageIndex;
                const isActive = idx === activeStageIndex;

                return (
                  <View key={stg} style={styles.stepperNodeCol}>
                    {isCompleted ? (
                      <View style={styles.nodeCompleted}>
                        <MaterialIcons name="check" size={13} color="#ffffff" />
                      </View>
                    ) : isActive ? (
                      <View style={styles.nodeActiveOuter}>
                        <View style={styles.nodeActiveInner} />
                      </View>
                    ) : (
                      <View style={styles.nodeUpcoming} />
                    )}
                    <Text
                      style={[
                        styles.nodeLabel,
                        isActive && styles.nodeLabelActive,
                        isCompleted && styles.nodeLabelCompleted,
                      ]}
                    >
                      {stg}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.stepperFooter}>
            <MaterialIcons name="event" size={14} color="#707972" />
            <Text style={styles.stepperFooterText}>{stageEstimateText}</Text>
          </View>
        </View>

        {/* ── 5. FIELD INFORMATION ─────────────────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <MaterialIcons name="map" size={18} color="#15803d" />
              <Text style={styles.cardTitle}>Field Information</Text>
            </View>
          </View>

          <View style={styles.fieldGrid}>
            <View style={styles.fieldBox}>
              <View style={styles.fieldBoxHeader}>
                <MaterialIcons name="place" size={16} color="#15803d" />
                <Text style={styles.fieldBoxLabel}>LOCATION</Text>
              </View>
              <Text style={styles.fieldBoxValue}>{location}</Text>
            </View>

            <View style={styles.fieldBox}>
              <View style={styles.fieldBoxHeader}>
                <MaterialIcons name="crop-free" size={16} color="#15803d" />
                <Text style={styles.fieldBoxLabel}>PLOT AREA</Text>
              </View>
              <Text style={styles.fieldBoxValue}>{plotArea}</Text>
            </View>

            <View style={styles.fieldBox}>
              <View style={styles.fieldBoxHeader}>
                <MaterialIcons name="calendar-today" size={16} color="#15803d" />
                <Text style={styles.fieldBoxLabel}>PLANTING DATE</Text>
              </View>
              <Text style={styles.fieldBoxValue}>{plantingDate}</Text>
            </View>

            <View style={styles.fieldBox}>
              <View style={styles.fieldBoxHeader}>
                <MaterialIcons name="event-available" size={16} color="#15803d" />
                <Text style={styles.fieldBoxLabel}>EST. HARVEST</Text>
              </View>
              <Text style={styles.fieldBoxValue}>{expectedHarvest}</Text>
            </View>
          </View>
        </View>

        {/* ── BOTTOM ACTIONS ROW ──────────────────────────────────────────────── */}
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={() => router.push('/(app)/crops')}
            activeOpacity={0.8}
          >
            <MaterialIcons name="grid-view" size={18} color="#1f5c3f" />
            <Text style={styles.quickActionText}>All Crops</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={() => router.push('/(app)/weather')}
            activeOpacity={0.8}
          >
            <MaterialIcons name="cloud" size={18} color="#1f5c3f" />
            <Text style={styles.quickActionText}>Weather Forecast</Text>
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
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 14,
  },

  // ── Hero ──────────────────────────────────────────────────────────────────
  heroContainer: {
    width: '100%',
    height: 190,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.surfaceContainer,
    position: 'relative',
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
    backgroundColor: 'rgba(16, 37, 24, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    gap: 6,
  },
  syncDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#4ade80',
  },
  syncText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.3,
  },
  cameraBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // ── 1. Overview ───────────────────────────────────────────────────────────
  overviewCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(6, 95, 70, 0.08)',
    shadowColor: '#103823',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cropTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.onSurface,
    letterSpacing: -0.3,
  },
  cropSub: {
    fontSize: 13,
    color: '#556057',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(22, 101, 52, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 5,
  },
  statusBadgeAttention: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803d',
  },
  statusTextAttention: {
    color: '#b45309',
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  vitalItem: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(6, 95, 70, 0.05)',
  },
  vitalIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  vitalLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#657168',
    letterSpacing: 0.8,
  },
  vitalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.onSurface,
    marginTop: 2,
  },
  vitalHint: {
    fontSize: 11,
    fontWeight: '600',
    color: '#657168',
    marginTop: 2,
  },

  // ── 6. Alert Card ─────────────────────────────────────────────────────────
  alertCard: {
    backgroundColor: '#fffbeb',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#fde68a',
    shadowColor: '#d97706',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  alertTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  alertIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400e',
  },
  alertTimestamp: {
    fontSize: 11,
    color: '#b45309',
    marginTop: 1,
  },
  alertBody: {
    fontSize: 12.5,
    color: '#78350f',
    lineHeight: 18,
    marginTop: 8,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#fef3c7',
  },
  alertTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  alertTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#b45309',
  },
  alertActionBtn: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  alertActionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400e',
  },

  // ── 2. Next Action ────────────────────────────────────────────────────────
  actionSectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#16a34a',
    borderWidth: 1,
    borderColor: 'rgba(22, 101, 52, 0.12)',
    shadowColor: '#103823',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  actionBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionEyebrowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  actionEyebrowText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803d',
    letterSpacing: 0.8,
  },
  actionDueText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803d',
  },
  actionContentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  actionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionHeadline: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  actionReason: {
    fontSize: 12.5,
    color: '#556057',
    lineHeight: 18,
    marginTop: 4,
  },
  doneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#15803d',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
    shadowColor: '#15803d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  doneBtnCompleted: {
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#86efac',
    shadowOpacity: 0,
    elevation: 0,
  },
  doneBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  doneBtnTextCompleted: {
    color: '#15803d',
  },

  // ── 3. Crop Intelligence ──────────────────────────────────────────────────
  intelligenceCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  intelligenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  intelligenceHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  intelligenceSparkBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  intelligenceTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  aiLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 5,
  },
  aiLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ade80',
  },
  aiLiveText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#86efac',
    letterSpacing: 0.8,
  },
  intelligenceBody: {
    fontSize: 13.5,
    color: '#ecfdf5',
    lineHeight: 20,
    marginBottom: 14,
  },
  aiDetailsBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  aiLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiLoadingText: {
    fontSize: 12,
    color: '#a7f3d0',
  },
  aiDetailsText: {
    fontSize: 12.5,
    color: '#d1fae5',
    lineHeight: 18,
  },
  intelligenceButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  intelBtnPrimary: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  intelBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  intelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  intelBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
    paddingVertical: 10,
    gap: 6,
  },
  intelBtnSecondaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4ade80',
  },

  // ── 4. Growth Progression ─────────────────────────────────────────────────
  card: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(6, 95, 70, 0.08)',
    shadowColor: '#103823',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  stageChip: {
    backgroundColor: COLORS.surfaceContainerLow,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  stageChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803d',
  },
  stepperContainer: {
    position: 'relative',
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  stepperTrackBase: {
    position: 'absolute',
    top: 15,
    left: 20,
    right: 20,
    height: 3,
    backgroundColor: '#e5e7eb',
    borderRadius: 1.5,
  },
  stepperTrackProgress: {
    position: 'absolute',
    top: 15,
    left: 20,
    height: 3,
    backgroundColor: '#16a34a',
    borderRadius: 1.5,
  },
  stepperNodesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  stepperNodeCol: {
    alignItems: 'center',
    width: 58,
  },
  nodeCompleted: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  nodeActiveOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#15803d',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    marginTop: -1,
    zIndex: 2,
  },
  nodeActiveInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  nodeUpcoming: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginTop: 2,
    zIndex: 2,
  },
  nodeLabel: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: '500',
    marginTop: 6,
    textAlign: 'center',
  },
  nodeLabelCompleted: {
    color: '#15803d',
    fontWeight: '600',
  },
  nodeLabelActive: {
    color: '#15803d',
    fontWeight: '800',
  },
  stepperFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  stepperFooterText: {
    fontSize: 11.5,
    color: '#657168',
    fontWeight: '500',
  },

  // ── 5. Field Information ──────────────────────────────────────────────────
  fieldGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  fieldBox: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(6, 95, 70, 0.05)',
  },
  fieldBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  fieldBoxLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#657168',
    letterSpacing: 0.8,
  },
  fieldBoxValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
  },

  // ── Bottom Shortcuts ──────────────────────────────────────────────────────
  quickActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceContainerLowest,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(6, 95, 70, 0.12)',
    gap: 6,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f5c3f',
  },
});
