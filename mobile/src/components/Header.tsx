import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { COLORS } from '../constants/theme';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  style?: any;
}

export default function Header({ title, showBack = false, style }: HeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }, style]}>
      <View style={styles.headerLeft}>
        {showBack && (
          <TouchableOpacity 
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color={COLORS.onSurface} />
          </TouchableOpacity>
        )}
        <Image
          source={require('../../assets/agrismart_logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <View>
          {!showBack && <Text style={styles.appName}>AGRISMART</Text>}
          <Text style={styles.screenTitle}>{title}</Text>
        </View>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity style={styles.notifBtn} onPress={() => router.push('/(app)/notifications')}>
          <MaterialIcons name="notifications-none" size={24} color={COLORS.onSurface} />
          <View style={styles.notifDot} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.profileBtn} onPress={() => router.push('/(app)/profile')}>
          <Image
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAe72X-4H5fqFtKymeXTGPMDU0a00i5FP3aciZkD1EFlSwswdAfOayQbQCx1CcUTfSJGNCjfjrRBLBaHloNNj4o3EqfWHgLN3hcbsFEjiytI9gFvvdkcZCnILmOMGh8m5sjBQ81J9NpHHHBp9_FQjcSaVO_xSQgFc21F24ikF6CaMOiXfRKE3Xr6uyrIKFv1jKs6b20MyOOtu9w-s4xJPnzXsUNK7oe-BilSMCVdCbDG6Dginrx7OPCQA' }}
            style={styles.profileImg}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(241, 252, 242, 0.8)',
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 42,
    height: 42,
  },
  appName: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondary,
    letterSpacing: 1.5,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.onSurface,
    lineHeight: 26,
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notifBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    borderWidth: 1.5,
    borderColor: '#f1fcf2',
  },
  profileBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImg: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
});
