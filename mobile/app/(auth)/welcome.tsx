import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Animated, Dimensions, Platform, } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');
const PILLS: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string }[] = [
  { icon: 'analytics-outline', label: 'Precision\nVitals' },
  { icon: 'earth-outline', label: 'Satellite\nTelemetry' },
  { icon: 'flash-outline', label: 'Advisory\nAI' },
];


export default function WelcomeScreen() {

  const headerAnim = useRef(new Animated.Value(0)).current;
  const tagAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(30)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(tagAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(titleOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(titleAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
      Animated.timing(contentAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ImageBackground
        source={require('../../assets/agri_hero_bg.jpg')}
        style={styles.bg}
        resizeMode="cover"
      >
        <View style={styles.overlayTop} />
        <View style={styles.overlayBottom} />

        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>

          <Animated.View style={[styles.headerBadge, { opacity: headerAnim }]}>
            <View style={styles.logoBubble}>
              <Ionicons name="leaf" size={18} color="#2D7A52" />
            </View>
            <View>
              <Text style={styles.badgeTitle}>AgriSmart</Text>
              <Text style={styles.badgeSub}>INTELLIGENT FARMING</Text>
            </View>
          </Animated.View>


          <View style={{ flex: 1 }} />
          <View style={styles.content}>


            <Animated.View style={[styles.tagRow, { opacity: tagAnim }]}>
              <View style={styles.tagDot} />
              <Text style={styles.tagText}>WELCOME TO MODERN AGRONOMY</Text>
            </Animated.View>


            <Animated.Text
              style={[
                styles.title,
                { opacity: titleOpacity, transform: [{ translateY: titleAnim }] },
              ]}
            >
              Grow smarter.{'\n'}Farm better.
            </Animated.Text>

            <Animated.Text style={[styles.subtitle, { opacity: contentAnim }]}>
              Manage crops with real-time telemetry, coordinate field operations
              seamlessly, and harness bespoke agronomic intelligence.
            </Animated.Text>


            <Animated.View style={[styles.pillsRow, { opacity: contentAnim }]}>
              {PILLS.map((p, i) => (
                <View key={i} style={styles.pill}>
                  <Ionicons name={p.icon} size={15} color="#A8D5B5" />
                  <Text style={styles.pillText}>{p.label}</Text>
                </View>
              ))}
            </Animated.View>


            <Animated.View style={{ opacity: contentAnim }}>
              <TouchableOpacity
                style={styles.ctaBtn}
                onPress={() => router.push('/(auth)/login')}
                activeOpacity={0.85}
              >
                <Text style={styles.ctaBtnText}>Get Started</Text>
                <View style={styles.ctaArrow}>
                  <Ionicons name="arrow-forward" size={18} color="#184E38" />
                </View>
              </TouchableOpacity>


              <TouchableOpacity
                style={styles.signInRow}
                onPress={() => router.push('/(auth)/login')}
                activeOpacity={0.7}
              >
                <Text style={styles.signInText}>
                  Already have an account?{'  '}
                  <Text style={styles.signInBold}>Sign in</Text>
                </Text>
              </TouchableOpacity>


              <View style={styles.footer}>
                <Ionicons name="lock-closed-outline" size={12} color="rgba(255,255,255,0.45)" />
                <Text style={styles.footerText}>
                  Agronomic Cloud • Encrypted &amp; Offline Ready
                </Text>
              </View>
            </Animated.View>

          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0D2B1E',
  },
  bg: {
    flex: 1,
  },
  overlayTop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    top: 0,
    height: height * 0.35,

  },
  overlayBottom: {
    ...StyleSheet.absoluteFillObject,
    top: height * 0.3,
    backgroundColor: 'rgba(5, 18, 11, 0.72)',
  },
  safe: {
    flex: 1,
    paddingHorizontal: 24,
  },
  headerBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
    backgroundColor: 'rgba(87, 77, 77, 0.14)',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',

  },
  logoBubble: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  badgeSub: {
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 1.2,
  },


  content: {
    paddingBottom: 60,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  tagDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#F0C040',
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F0C040',
    letterSpacing: 1.4,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 42,
    marginBottom: 14,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.72)',
    lineHeight: 22,
    marginBottom: 24,
  },


  pillsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  pill: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  pillText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 14,
  },


  ctaBtn: {
    backgroundColor: '#2D7A52',
    borderRadius: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
    shadowColor: '#0D2B1E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  ctaArrow: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  signInRow: {
    alignItems: 'center',
    marginBottom: 20,
  },
  signInText: {
    fontSize: 13.5,
    color: 'rgba(255,255,255,0.65)',
  },
  signInBold: {
    fontWeight: '800',
    color: '#FFFFFF',
  },


  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 0.3,
  },
});
