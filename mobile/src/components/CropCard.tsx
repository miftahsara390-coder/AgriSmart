import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { router } from 'expo-router';

export interface Crop {
  id: string | number;
  name: string;
  stage?: string;
  location?: string;
  status?: string;
  imageUrl?: string;
  icon?: string;
  isTuber?: boolean;
  actionText?: string;
  actionIcon?: string;
  actionColor?: string;
}

interface CropCardProps {
  crop: Crop;
  variant?: 'home' | 'list';
}

export default function CropCard({ crop, variant = 'home' }: CropCardProps) {
  const isHealthy = crop.status === 'healthy' || crop.status === 'Healthy';
  const isPotato = crop.name?.toLowerCase().includes('potato') || crop.isTuber;

  if (variant === 'list') {
    return (
      <TouchableOpacity 
        style={[styles.listCard, !isHealthy && { borderColor: 'rgba(245, 158, 11, 0.2)' }]}
        onPress={() => router.push({
          pathname: '/(app)/crop-detail',
          params: {
            id: crop.id.toString(),
            name: crop.name,
            location: crop.location,
            stage: crop.stage,
            status: isHealthy ? 'Healthy' : 'Attention'
          }
        })}
      >
        <View style={styles.listImageWrap}>
          {isPotato ? (
            <View style={styles.tuberBg}>
              <MaterialIcons name="spa" size={32} color={COLORS.secondary} />
              <Text style={styles.tuberText}>TUBER</Text>
              {!isHealthy && <View style={styles.attentionDot} />}
            </View>
          ) : (
            <>
              <Image source={{ uri: crop.imageUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGPhWdhZdufDRhqMNEHZG75LPcEMtrIZkadXIFktEyd5K9Xofz4_KxaKDoFA9mXpYnBuvOJnqS3xCtcfi6MMyqwYQRwFqJSKFWKVz-zv8vNa_oC8EwOluoq6Mb4wz6ugrSESuQbOJ_6cQrVwtPCwQBBy43MmZ9wJEiv-Y4jttBMagfS1RZ77uCiyzf24OuVrwixz3VU9bBdB8yJmeKRHWbEJkVyUmwKvOqp5obzP-x0Z5YyjNu4VURIg' }} style={styles.listImage} />
              <View style={styles.cardIconBadge}>
                <MaterialIcons name={(crop.icon || 'eco') as any} size={12} color={COLORS.primaryContainer} />
              </View>
            </>
          )}
        </View>
        <View style={styles.listContent}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>{crop.name}</Text>
            {isHealthy ? (
              <View style={styles.statusPill}>
                <View style={[styles.statusPillDot, { backgroundColor: '#16a34a' }]} />
                <Text style={[styles.statusPillText, { color: '#15803d' }]}>Healthy</Text>
              </View>
            ) : (
              <View style={[styles.statusPill, { backgroundColor: '#fef3c7' }]}>
                <View style={[styles.statusPillDot, { backgroundColor: '#d97706' }]} />
                <Text style={[styles.statusPillText, { color: '#92400e' }]}>Attention</Text>
              </View>
            )}
          </View>
          <Text style={styles.listSubtitle}>Stage: {crop.stage} · {crop.location}</Text>
          
          <View style={styles.listFooter}>
            <View style={styles.listAction}>
              <MaterialIcons name={(crop.actionIcon || 'event') as any} size={16} color={crop.actionColor || COLORS.primaryContainer} />
              <Text style={[styles.listActionText, { color: crop.actionColor || COLORS.primaryContainer }]} numberOfLines={1}>
                {crop.actionText || 'Next task scheduled'}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={18} color={COLORS.outline} />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // home variant
  return (
    <TouchableOpacity 
      style={styles.homeCard} 
      activeOpacity={0.9}
      onPress={() => router.push({
        pathname: '/(app)/crop-detail',
        params: { id: crop.id.toString(), name: crop.name }
      })}
    >
      <View style={styles.homeImgWrap}>
        <Image 
          source={{ uri: crop.imageUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMFNR9uqvGUcmdggs0PTP68M-bQWrYjw5SDt8ATsvQecFjqrisOLSy13-JN2dUO8RvjEOvoUntp3B48O4xNptcxEelcPHrCwQKgek21dJMSvTrsINW6nRQbl6_2VkS375PyHaAZHoGINC88ZXI6_Z22lxV_xIg64pFpJsz0z-vDvLsSmKiZh5fT0Q6ahwKFOcc6HSVsIELxGLvplIN9Jr4HG7TXGqieABS_eZngAkJ9pz9xJfwhKLjtQ' }} 
          style={styles.homeImg} 
        />
        <View style={styles.homeSecBadge}>
          <Text style={styles.homeSecText}>{crop.location}</Text>
        </View>
      </View>
      <View style={styles.homeInfo}>
        <Text style={styles.homeName}>{crop.name}</Text>
        <Text style={styles.homeStage}>{crop.stage}</Text>
        <View style={[styles.homeHealthWrap, !isHealthy && { backgroundColor: '#fef3c7', borderColor: '#fcd34d' }]}>
          <View style={[styles.homeHealthDot, !isHealthy && { backgroundColor: '#f59e0b' }]} />
          <Text style={[styles.homeHealthText, !isHealthy && { color: '#92400e' }]}>{isHealthy ? 'Healthy' : 'Attention'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // List styles
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    gap: 14,
  },
  listImageWrap: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  cardIconBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  tuberBg: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: COLORS.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tuberText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.secondary,
    letterSpacing: 1,
    marginTop: 2,
  },
  attentionDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#facc15',
    borderWidth: 2,
    borderColor: '#fff',
  },
  listContent: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: COLORS.onSurface,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 6,
  },
  statusPillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  listSubtitle: {
    fontSize: 12,
    color: COLORS.outline,
    marginBottom: 8,
  },
  listFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    paddingRight: 10,
  },
  listActionText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Home styles
  homeCard: {
    width: 160,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(112, 121, 114, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  homeImgWrap: {
    width: '100%',
    height: 105,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceContainer,
    overflow: 'hidden',
  },
  homeImg: {
    width: '100%',
    height: '100%',
  },
  homeSecBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  homeSecText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#fff',
  },
  homeInfo: {
    marginTop: 8,
    paddingHorizontal: 2,
  },
  homeName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  homeStage: {
    fontSize: 11,
    color: COLORS.outline,
    marginTop: 2,
  },
  homeHealthWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#c2ecd3',
    borderWidth: 1,
    borderColor: '#a7d0b8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 6,
    gap: 4,
  },
  homeHealthDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  homeHealthText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#00442a',
  },
});
