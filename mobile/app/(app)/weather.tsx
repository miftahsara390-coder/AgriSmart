import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { COLORS } from '../../src/constants/theme';
import { useWeatherQuery } from '../../src/services/weather';

export default function WeatherScreen() {
  const { data, isLoading: loading } = useWeatherQuery();
  const weatherData = data?.weather;

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.onSurface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Weather Forecast</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={COLORS.primaryContainer} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Today Overview */}
          <View style={styles.todayCard}>
            <Text style={styles.location}>{weatherData?.location || 'Unknown'}</Text>
            <View style={styles.tempRow}>
              <MaterialIcons name="wb-sunny" size={48} color="#eab308" />
              <Text style={styles.mainTemp}>{weatherData?.temperature}°C</Text>
            </View>
            <Text style={styles.condition}>{weatherData?.condition}</Text>
            
            <View style={styles.detailsRow}>
              <View style={styles.detailBox}>
                <MaterialIcons name="water-drop" size={20} color="#3b82f6" />
                <Text style={styles.detailText}>{weatherData?.humidity}% Humidity</Text>
              </View>
              <View style={styles.detailBox}>
                <MaterialIcons name="air" size={20} color="#9ca3af" />
                <Text style={styles.detailText}>{weatherData?.windSpeed} km/h Wind</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>5-Day Forecast</Text>
          <View style={styles.forecastList}>
            {weatherData?.forecast?.map((day: any, idx: number) => (
              <View key={idx} style={styles.forecastItem}>
                <Text style={styles.forecastDate}>{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</Text>
                <MaterialIcons name={day.icon?.includes('01') ? 'wb-sunny' : 'cloud'} size={24} color={day.icon?.includes('01') ? '#eab308' : '#9ca3af'} />
                <Text style={styles.forecastTemp}>{day.tempMin}° - {day.tempMax}°</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.surface },
  safe: { backgroundColor: 'rgba(241, 252, 242, 0.95)', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.onSurface },
  loaderWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16, paddingBottom: 40 },
  todayCard: { backgroundColor: COLORS.surfaceContainerLowest, padding: 24, borderRadius: 20, alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  location: { fontSize: 20, fontWeight: '600', color: COLORS.onSurface, marginBottom: 12 },
  tempRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  mainTemp: { fontSize: 48, fontWeight: 'bold', color: COLORS.onSurface },
  condition: { fontSize: 16, color: COLORS.outline, textTransform: 'capitalize', marginTop: 8, marginBottom: 20 },
  detailsRow: { flexDirection: 'row', gap: 16, width: '100%', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', paddingTop: 20 },
  detailBox: { alignItems: 'center', gap: 4 },
  detailText: { fontSize: 14, color: COLORS.secondary, fontWeight: '500' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.onSurface, marginBottom: 16 },
  forecastList: { gap: 12 },
  forecastItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.surfaceContainerLowest, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  forecastDate: { fontSize: 15, fontWeight: '600', color: COLORS.onSurface, width: 100 },
  forecastTemp: { fontSize: 15, fontWeight: '600', color: COLORS.secondary },
});
