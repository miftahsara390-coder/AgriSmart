import React from 'react';
import {View,Text,StyleSheet,ImageBackground,TouchableOpacity,Platform,Image,} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      
      <ImageBackground
        source={require('../../assets/images/home_bg.jpg')}
        style={styles.bgImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.08)', 'transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.95)']}
          locations={[0, 0.25, 0.6, 1]}
          style={styles.gradient}
        />

        {/* Top Header */}
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 24) + 24 }]}>
          <Image
            source={require('../../assets/agrismart_logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Bottom Content */}
        <View style={styles.bottomContent}>
          <View style={styles.welcomePill}>
            <MaterialIcons name="star" size={14} color="#FBBF24" />
            <Text style={styles.welcomePillText}>WELCOME TO MODERN AGRONOMY</Text>
          </View>

          <Text style={styles.headline}>Grow smarter.</Text>
          <Text style={styles.headlineGreen}>Farm better.</Text>

          <Text style={styles.subtitle}>
            Manage crops with real-time telemetry, coordinate field operations seamlessly, and harness bespoke agronomic intelligence.
          </Text>

          {/* Features Grid */}
          <View style={styles.featuresRow}>
            <View style={styles.featureCard}>
              <MaterialIcons name="eco" size={26} color="#4ADE80" style={styles.featureIcon} />
              <Text style={styles.featureText}>Precision{'\n'}Vitals</Text>
            </View>
            <View style={styles.featureCard}>
              <MaterialIcons name="satellite" size={26} color="#4ADE80" style={styles.featureIcon} />
              <Text style={styles.featureText}>Satellite{'\n'}Telemetry</Text>
            </View>
            <View style={styles.featureCard}>
              <MaterialIcons name="psychology" size={26} color="#4ADE80" style={styles.featureIcon} />
              <Text style={styles.featureText}>Advisory{'\n'}AI</Text>
            </View>
          </View>

          {/* Get Started Button */}
          <TouchableOpacity 
            style={styles.ctaButtonOuter}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#22c55e', '#16a34a', '#15803d']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaButtonInner}
            >
              <Text style={styles.ctaText}>Get Started</Text>
              <View style={styles.ctaIconWrap}>
                <MaterialIcons name="arrow-forward" size={16} color="#15803d" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.signInRow}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.signInLink}>Sign in</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footerRow}>
            <MaterialIcons name="lock" size={12} color="#a8a29e" />
            <Text style={styles.footerText}>AgriTech Cloud · Encrypted & Offline Ready</Text>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#1c1917',
  },
  bgImage: {
    flex: 1,
    width: '100%',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    alignItems: 'center',
    zIndex: 10,
  },
  logoImage: {
    width: 170,
    height: 95,
  },
  bottomContent: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 80,
    zIndex: 10,
  },
  welcomePill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  welcomePillText: {
    color: '#FBBF24',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  headline: {
    fontSize: 44,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -1,
    lineHeight: 48,
  },
  headlineGreen: {
    fontSize: 44,
    fontWeight: '800',
    color: '#4ade80',
    letterSpacing: -1,
    lineHeight: 48,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#e7e5e4',
    lineHeight: 22,
    marginBottom: 24,
  },
  featuresRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  featureCard: {
    flex: 1,
    backgroundColor: 'rgba(16,37,24,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1,
  },
  featureIcon: {
    marginBottom: 8,
  },
  featureText: {
    color: '#f5f5f4',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
  },
  ctaButtonOuter: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 16,
  },
  ctaButtonInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  ctaText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  ctaIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  signInText: {
    color: '#d6d3d1',
    fontSize: 14,
    fontWeight: '500',
  },
  signInLink: {
    color: '#4ade80',
    fontSize: 14,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    opacity: 0.75,
  },
  footerText: {
    color: '#a8a29e',
    fontSize: 11,
    fontWeight: '500',
  }
});
