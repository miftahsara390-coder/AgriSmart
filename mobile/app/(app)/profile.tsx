import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Switch } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuthStore } from '../../src/stores/auth.store';
import { COLORS } from '../../src/constants/theme';
import Header from '../../src/components/Header';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const [pushEnabled, setPushEnabled] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const renderSettingItem = (icon: string, label: string, trailing?: React.ReactNode, onPress?: () => void) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
    >
      <View style={styles.settingIconWrap}>
        <MaterialIcons name={icon as any} size={22} color={COLORS.secondary} />
      </View>
      <Text style={styles.settingLabel}>{label}</Text>
      {trailing || <MaterialIcons name="chevron-right" size={24} color={COLORS.outline} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Profile" showBack style={{ backgroundColor: 'transparent' }} />
      </SafeAreaView>
      
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <LinearGradient
          colors={['#ffffff', '#ffffff', 'rgba(194,236,211,0.3)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileCard}
        >
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || '?'}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user?.name}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Premium Member</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Farm Settings</Text>
          <View style={styles.card}>
            {renderSettingItem('agriculture', 'Crop Varieties')}
            <View style={styles.divider} />
            {renderSettingItem('water-drop', 'Irrigation Schedules')}
            <View style={styles.divider} />
            {renderSettingItem('eco', 'Soil & Fertilizers')}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.card}>
            {renderSettingItem('notifications', 'Push Notifications', 
              <Switch 
                value={pushEnabled} 
                onValueChange={setPushEnabled}
                trackColor={{ false: COLORS.surfaceContainer, true: '#15803d' }}
              />
            )}
            <View style={styles.divider} />
            {renderSettingItem('dark-mode', 'Dark Theme', 
              <Switch 
                value={darkMode} 
                onValueChange={setDarkMode}
                trackColor={{ false: COLORS.surfaceContainer, true: '#15803d' }}
              />
            )}
            <View style={styles.divider} />
            {renderSettingItem('language', 'Language', <Text style={styles.settingValue}>English</Text>)}
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <MaterialIcons name="logout" size={20} color="#ef4444" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        
        <Text style={styles.versionText}>AgriSmart v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.surface },
  safe: { backgroundColor: 'rgba(241, 252, 242, 0.95)', borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  container: { padding: 16, paddingBottom: 40 },
  
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(112, 121, 114, 0.2)',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  avatarCircle: {
    width: 72, 
    height: 72, 
    borderRadius: 36,
    backgroundColor: COLORS.primaryContainer, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 16,
    borderWidth: 2, 
    borderColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  avatarText: { fontSize: 28, fontWeight: 'bold', color: COLORS.onPrimary },
  profileInfo: { flex: 1 },
  name: { fontSize: 20, fontWeight: '700', color: COLORS.onSurface, marginBottom: 2 },
  email: { color: COLORS.outline, fontSize: 14, marginBottom: 8 },
  badge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(253, 230, 138, 0.6)',
  },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#b45309' },

  section: { marginBottom: 24 },
  sectionTitle: { color: COLORS.outline, fontWeight: '600', fontSize: 14, marginBottom: 8, paddingHorizontal: 4 },
  card: { 
    backgroundColor: COLORS.surfaceContainerLowest, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: 'rgba(0,0,0,0.05)',
    overflow: 'hidden'
  },
  
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(21, 128, 61, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingLabel: { flex: 1, fontSize: 16, color: COLORS.onSurface, fontWeight: '500' },
  settingValue: { fontSize: 15, color: COLORS.outline, fontWeight: '500' },
  divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.05)', marginLeft: 64 },

  logoutBtn: {
    flexDirection: 'row',
    backgroundColor: 'rgba(239, 68, 68, 0.05)', 
    borderRadius: 16,
    padding: 16, 
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1, 
    borderColor: 'rgba(239, 68, 68, 0.2)',
    marginTop: 8,
  },
  logoutText: { color: '#ef4444', fontWeight: 'bold', fontSize: 16 },
  
  versionText: {
    textAlign: 'center',
    color: COLORS.outline,
    fontSize: 12,
    marginTop: 24,
    fontWeight: '500'
  }
});
