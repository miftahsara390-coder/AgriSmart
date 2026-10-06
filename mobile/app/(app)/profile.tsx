import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Switch,
  Modal,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuthStore } from '../../src/stores/auth.store';
import { useTranslation } from '../../src/stores/language.store';
import { COLORS } from '../../src/constants/theme';
import Header from '../../src/components/Header';
import {
  checkNotificationPermissions,
  requestNotificationPermissions,
  sendLocalNotification,
} from '../../src/services/notifications.service';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const { t, language, setLanguage } = useTranslation();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);

  useEffect(() => {
    checkNotificationPermissions().then((granted) => {
      setPushEnabled(granted);
    });
  }, []);

  const handleTogglePushNotifications = async (val: boolean) => {
    if (val) {
      const granted = await requestNotificationPermissions();
      setPushEnabled(granted);
      if (granted) {
        await sendLocalNotification({
          title: t('profile.notifActiveTitle'),
          body: t('profile.notifActiveBody'),
          type: 'success',
        });
      } else {
        Alert.alert(
          t('profile.permissionRequired'),
          t('profile.permissionPrompt')
        );
      }
    } else {
      setPushEnabled(false);
      Alert.alert(
        t('profile.notifDisabledTitle'),
        t('profile.notifDisabledBody')
      );
    }
  };

  const handleSelectLanguage = async (newLang: 'en' | 'fr') => {
    try {
      await setLanguage(newLang);
    } catch (err) {
      console.error('Failed to set language:', err);
    } finally {
      setLangModalVisible(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(t('profile.logoutTitle'), t('profile.logoutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('profile.logout'),
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const renderSettingItem = (
    icon: string,
    label: string,
    trailing?: React.ReactNode,
    onPress?: () => void
  ) => (
    <TouchableOpacity
      style={styles.settingItem}
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingIconWrap}>
        <MaterialIcons name={icon as any} size={22} color={COLORS.secondary} />
      </View>
      <Text style={styles.settingLabel}>{label}</Text>
      {trailing !== undefined ? (
        trailing
      ) : (
        <MaterialIcons name="chevron-right" size={24} color={COLORS.outline} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      <Header title={t('profile.title')} showBack />

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
              <Text style={styles.badgeText}>{t('profile.premiumMember')}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Farm Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.farmSettings')}</Text>
          <View style={styles.card}>
            {renderSettingItem('agriculture', t('profile.cropVarieties'))}
            <View style={styles.divider} />
            {renderSettingItem('water-drop', t('profile.irrigationSchedules'))}
            <View style={styles.divider} />
            {renderSettingItem('eco', t('profile.soilFertilizers'))}
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.preferences')}</Text>
          <View style={styles.card}>
            {renderSettingItem(
              'notifications',
              t('profile.pushNotifications'),
              <Switch
                value={pushEnabled}
                onValueChange={handleTogglePushNotifications}
                trackColor={{ false: COLORS.surfaceContainer, true: '#15803d' }}
              />
            )}
            <View style={styles.divider} />
            {renderSettingItem(
              'dark-mode',
              t('profile.darkTheme'),
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: COLORS.surfaceContainer, true: '#15803d' }}
              />
            )}
            <View style={styles.divider} />
            {renderSettingItem(
              'language',
              t('profile.language'),
              <View style={styles.langBadge}>
                <Text style={styles.settingValue}>
                  {language === 'fr' ? 'Français' : 'English'}
                </Text>
                <MaterialIcons name="chevron-right" size={20} color={COLORS.outline} />
              </View>,
              () => setLangModalVisible(true)
            )}
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <MaterialIcons name="logout" size={20} color="#ef4444" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>{t('profile.logout')}</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>{t('profile.version')}</Text>
      </ScrollView>

      {/* ── Language Switcher Modal ────────────────────────────────────────── */}
      <Modal
        visible={langModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          {/* Backdrop dismiss */}
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setLangModalVisible(false)}
          />

          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={styles.modalIconWrap}>
                  <MaterialIcons name="language" size={24} color="#15803d" />
                </View>
                <View>
                  <Text style={styles.modalTitle}>{t('profile.selectLanguage')}</Text>
                  <Text style={styles.modalSub}>{t('profile.chooseLanguageSub')}</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setLangModalVisible(false)}
                style={styles.closeBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <MaterialIcons name="close" size={22} color={COLORS.outline} />
              </TouchableOpacity>
            </View>

            {/* Language Choices */}
            <View style={styles.langOptionsList}>
              {/* English */}
              <TouchableOpacity
                style={[
                  styles.langOptionItem,
                  language === 'en' && styles.langOptionItemActive,
                ]}
                activeOpacity={0.7}
                onPress={() => handleSelectLanguage('en')}
              >
                <View style={styles.langOptionLeft}>
                  <Text style={styles.flagEmoji}>🇬🇧</Text>
                  <View>
                    <Text
                      style={[
                        styles.langOptionTitle,
                        language === 'en' && styles.langOptionTitleActive,
                      ]}
                    >
                      English
                    </Text>
                    <Text style={styles.langOptionSub}>English (US/UK)</Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.radioCircle,
                    language === 'en' && styles.radioCircleActive,
                  ]}
                >
                  {language === 'en' && (
                    <View style={styles.radioInnerDot} />
                  )}
                </View>
              </TouchableOpacity>

              {/* French */}
              <TouchableOpacity
                style={[
                  styles.langOptionItem,
                  language === 'fr' && styles.langOptionItemActive,
                ]}
                activeOpacity={0.7}
                onPress={() => handleSelectLanguage('fr')}
              >
                <View style={styles.langOptionLeft}>
                  <Text style={styles.flagEmoji}>🇫🇷</Text>
                  <View>
                    <Text
                      style={[
                        styles.langOptionTitle,
                        language === 'fr' && styles.langOptionTitleActive,
                      ]}
                    >
                      Français
                    </Text>
                    <Text style={styles.langOptionSub}>Langue française</Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.radioCircle,
                    language === 'fr' && styles.radioCircleActive,
                  ]}
                >
                  {language === 'fr' && (
                    <View style={styles.radioInnerDot} />
                  )}
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.modalDoneBtn}
              onPress={() => setLangModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalDoneBtnText}>{t('common.done')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.surface },
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
  sectionTitle: {
    color: COLORS.outline,
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    overflow: 'hidden',
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
  settingValue: { fontSize: 15, color: '#15803d', fontWeight: '600', marginRight: 4 },
  langBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
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
    fontWeight: '500',
  },

  // ── Modal Styles ──────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  modalIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  modalSub: {
    fontSize: 12,
    color: COLORS.outline,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  langOptionsList: {
    gap: 12,
    marginBottom: 20,
  },
  langOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    backgroundColor: '#fafafa',
  },
  langOptionItemActive: {
    borderColor: '#15803d',
    backgroundColor: '#f0fdf4',
  },
  langOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  flagEmoji: {
    fontSize: 26,
  },
  langOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  langOptionTitleActive: {
    color: '#15803d',
    fontWeight: '700',
  },
  langOptionSub: {
    fontSize: 12,
    color: COLORS.outline,
    marginTop: 2,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: '#15803d',
  },
  radioInnerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#15803d',
  },
  modalDoneBtn: {
    backgroundColor: '#15803d',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#15803d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  modalDoneBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
