import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  RefreshControl,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useCropsQuery } from '../../src/services/crops';
import { useTranslation } from '../../src/stores/language.store';

import { COLORS } from '../../src/constants/theme';
import Header from '../../src/components/Header';
import CropCard from '../../src/components/CropCard';

const INITIAL_CROPS = [
  {
    id: 1,
    name: 'Tomatoes',
    stage: 'Flowering',
    location: 'Field A',
    status: 'healthy',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGPhWdhZdufDRhqMNEHZG75LPcEMtrIZkadXIFktEyd5K9Xofz4_KxaKDoFA9mXpYnBuvOJnqS3xCtcfi6MMyqwYQRwFqJSKFWKVz-zv8vNa_oC8EwOluoq6Mb4wz6ugrSESuQbOJ_6cQrVwtPCwQBBy43MmZ9wJEiv-Y4jttBMagfS1RZ77uCiyzf24OuVrwixz3VU9bBdB8yJmeKRHWbEJkVyUmwKvOqp5obzP-x0Z5YyjNu4VURIg',
    actionText: 'Water tomorrow · 08:00',
    actionIcon: 'water-drop',
    actionColor: '#1f5c3f',
    icon: 'eco'
  },
  {
    id: 2,
    name: 'Olive Trees',
    stage: 'Growing',
    location: 'Orchard South',
    status: 'healthy',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDedyhG3LzWYlaKsfemgsTMHcgz8Tkw3tgL-_hMi69527-dXE9cpfM7TJw3PeBNRFjdqxAMrpDBXJNJdpz-Mi4907SoAwMkJEtt6oeuGlR-hiC_lJMMkWlYcBXBF5NhJRSydUIVCKOBA2DtwkqPRaqnm8fnvuhgwk9g5-rPxAuP--tAl2g6awFK0v-72XzF0XTtQY_U6iPHM2R1gCUy5FAWyRahNQ94RWK_prsO55IlyU8RzZhWTbFGGg',
    actionText: 'Inspect next Tuesday',
    actionIcon: 'checklist',
    actionColor: '#406653',
    icon: 'psychology'
  },
  {
    id: 3,
    name: 'Potatoes',
    stage: 'Vegetative',
    location: 'Plot C',
    status: 'attention',
    isTuber: true,
    actionText: 'Fertilize 16:00 today',
    actionIcon: 'science',
    actionColor: '#4b3700',
    icon: 'eco'
  }
];

export default function CropsScreen() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const { data, isLoading: loading, isRefetching, refetch } = useCropsQuery();
  const crops = data?.crops || [];

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const filteredCrops = crops.filter(crop => {
    const matchesSearch = crop.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || crop.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <Header title={t('crops.title')} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            colors={['#15803d']}
            tintColor="#15803d"
          />
        }
      >
        {/* Search */}
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color={COLORS.outline} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('crops.searchPlaceholder')}
            placeholderTextColor={COLORS.outline}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} style={styles.clearBtn}>
              <MaterialIcons name="close" size={18} color={COLORS.outline} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContent} style={styles.filtersScroll}>
          <TouchableOpacity
            style={[styles.chip, filter === 'all' && styles.chipActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.chipText, filter === 'all' && styles.chipTextActive]}>
              {t('crops.allCrops')} ({crops.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, filter === 'healthy' && styles.chipActive]}
            onPress={() => setFilter('healthy')}
          >
            <View style={[styles.chipDot, { backgroundColor: '#22c55e' }]} />
            <Text style={[styles.chipText, filter === 'healthy' && styles.chipTextActive]}>
              {t('crops.healthy')} ({crops.filter(c => c.status === 'healthy').length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, filter === 'attention' && styles.chipActive]}
            onPress={() => setFilter('attention')}
          >
            <View style={[styles.chipDot, { backgroundColor: '#fbbf24' }]} />
            <Text style={[styles.chipText, filter === 'attention' && styles.chipTextActive]}>
              {t('crops.needsAttention')} ({crops.filter(c => c.status === 'attention').length})
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* List */}
        <View style={styles.list}>
          {filteredCrops.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <MaterialIcons name="filter-list-off" size={32} color={COLORS.outline} />
              </View>
              <Text style={styles.emptyTitle}>{t('crops.noCropsFound')}</Text>
              <Text style={styles.emptySub}>{t('crops.noCropsSub')}</Text>
            </View>
          ) : (
            filteredCrops.map((crop: any) => (
              <CropCard key={crop.id} crop={crop} variant="list" />
            ))
          )}
        </View>

        {/* AI Banner */}
        <View style={styles.aiBanner}>
          <View style={styles.aiBannerIconWrap}>
            <MaterialIcons name="auto-awesome" size={20} color="#4ade80" />
          </View>
          <View style={styles.aiBannerContent}>
            <View style={styles.aiBannerHeader}>
              <Text style={styles.aiBannerTitle}>{t('crops.telemetryTitle')}</Text>
              <Text style={styles.aiBannerTime}>{t('common.justNow')}</Text>
            </View>
            <Text style={styles.aiBannerText}>
              {t('crops.telemetryBody')}
            </Text>
          </View>
        </View>

        {/* FAB */}
        <TouchableOpacity style={styles.fabBtnOuter} activeOpacity={0.8} onPress={() => router.push('/(app)/add-crop')}>
          <LinearGradient
            colors={['#22c55e', '#16a34a', '#15803d']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.fabBtnInner}
          >
            <Text style={styles.fabBtnText}>{t('crops.addCrop')}</Text>
            <View style={styles.fabBtnIcon}>
              <MaterialIcons name="add" size={18} color="#15803d" />
            </View>
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
  safe: {
    backgroundColor: 'rgba(241, 252, 242, 0.8)',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 120,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.onSurface,
  },
  clearBtn: {
    padding: 4,
  },
  filtersScroll: {
    marginBottom: 16,
    marginHorizontal: -16,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLowest,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
    gap: 6,
  },
  chipActive: {
    backgroundColor: '#15803d',
    borderColor: '#15803d',
  },
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  chipTextActive: {
    color: '#fff',
  },
  list: {
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: COLORS.onSurface,
  },
  emptySub: {
    fontSize: 14,
    color: COLORS.outline,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 240,
  },
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#0f281e',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    gap: 14,
  },
  aiBannerIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#164230',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBannerContent: {
    flex: 1,
  },
  aiBannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aiBannerTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4ade80',
    letterSpacing: 1.5,
  },
  aiBannerTime: {
    fontSize: 11,
    color: '#a8a29e',
  },
  aiBannerText: {
    fontSize: 14,
    color: '#e5e7eb',
    lineHeight: 20,
    marginTop: 6,
  },
  fabBtnOuter: {
    borderRadius: 24,
    overflow: 'hidden',
    marginTop: 20,
    shadowColor: '#00442a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
  },
  fabBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 10,
  },
  fabBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.5,
  },
  fabBtnIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  }
});
