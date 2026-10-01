import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function WelcomeScreen() {
  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      
      <ImageBackground
        source={{ uri: 'https://lh3.googleusercontent.com/aida/AEtjO1V79dv3GGegOJV7ZrHErXB-RtLeulCqcw7qn6NoeK5mtX2PmI88bm-0sahTSv2yg84bQllDnvhIfXAEIwg9MnUNAjGr4rSkkEJKtsK5t2Z2N5-Yhz9d0rYrANDTjNPL9D5ks-aTs4TgILqIDGuADHTpLftZVe448Xj-yd0LN_VX6b2tTLtqXQCbwGcjYGysATisoIjbDIWaOLxmq2I044IptwmZxwaBz_kh6rI_Gq_npJWQyG23_gT3c2c' }}
        style={styles.bgImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.95)']}
          locations={[0, 0.3, 0.6, 1]}
          style={styles.gradient}
        />

        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <View style={styles.logoIconWrap}>
              <MaterialIcons name="eco" size={24} color="#15803d" />
            </View>
            <View style={styles.logoTextWrap}>
              <Text style={styles.logoTextMain}>AgriSmart</Text>
              <Text style={styles.logoTextSub}>INTELLIGENT FARMING</Text>
            </View>
          </View>
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    alignItems: 'center',
    zIndex: 10,
  },
  logoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  logoIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoTextWrap: {
    justifyContent: 'center',
  },
  logoTextMain: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.5,
  },
  logoTextSub: {
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  bottomContent: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 40,
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
