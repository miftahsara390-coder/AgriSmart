import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/stores/auth.store';

export default function LoginScreen() {
  const [email, setEmail]               = useState('sara@agrifarm.ma');
  const [password, setPassword]         = useState('••••••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const { login } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace('/(app)/home');
    } catch (err: any) {
      Alert.alert('Login Failed', err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >

            {/* ── Logo Badge ── */}
            <View style={styles.logoBadgeWrap}>
              <View style={styles.logoBadge}>
                <Ionicons name="leaf" size={26} color="#2D7A52" />
                <Text style={styles.logoLabel}>AgriSmart</Text>
              </View>
            </View>

            {/* ── Title ── */}
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>
              Sign in to manage your farm telemetry, soil matrices &amp; harvests.
            </Text>

            {/* ── Email Field ── */}
            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="name@agrifarm.ma"
                  placeholderTextColor="#9CB8A8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Ionicons name="shield-checkmark-outline" size={20} color="#2D7A52" />
              </View>
            </View>

            {/* ── Password Field ── */}
            <View style={styles.formGroup}>
              <View style={styles.passwordLabelRow}>
                <Text style={styles.fieldLabel}>PASSWORD</Text>
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert('Forgot Password', 'Please contact your farm administrator.')
                  }
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#9CB8A8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#527563"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* ── Biometric Card ── */}
            <View style={styles.bioCard}>
              <View style={styles.bioIconWrap}>
                <Ionicons name="finger-print-outline" size={24} color="#2D7A52" />
              </View>
              <View style={styles.bioText}>
                <Text style={styles.bioTitle}>Touch ID ready</Text>
                <Text style={styles.bioSub}>Instant field login</Text>
              </View>
              <TouchableOpacity
                style={styles.sensorBtn}
                onPress={() => Alert.alert('Touch ID', 'Sensor scan initialized')}
                activeOpacity={0.75}
              >
                <Text style={styles.sensorBtnText}>Use Sensor</Text>
              </TouchableOpacity>
            </View>

            {/* ── Sign In Button ── */}
            <TouchableOpacity
              style={styles.signInBtn}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.signInBtnText}>Sign in  →</Text>
              )}
            </TouchableOpacity>

            {/* ── Create Account Button ── */}
            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => router.push('/(auth)/register')}
              activeOpacity={0.8}
            >
              <Text style={styles.createBtnText}>Create account</Text>
            </TouchableOpacity>

            {/* ── Security Footer ── */}
            <View style={styles.secFooter}>
              <View style={styles.secRow}>
                <Ionicons name="lock-closed-outline" size={13} color="#2D7A52" />
                <Text style={styles.secTitle}>Protected by AgriSmart SecureFarm™</Text>
              </View>
              <Text style={styles.secSub}>
                Encrypted offline sync &amp; multi-node agronomic integrity.
              </Text>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F4F9F5',
  },
  safe: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 26,
    paddingVertical: 36,
  },

  // ── Logo ──────────────────────────────────────────────────────────────────
  logoBadgeWrap: {
    alignItems: 'center',
    marginBottom: 22,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D6EBE0',
    shadowColor: '#103823',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    gap: 2,
  },
  logoLabel: {
    fontSize: 7.5,
    fontWeight: '800',
    color: '#2D7A52',
    letterSpacing: 0.5,
  },

  // ── Title ─────────────────────────────────────────────────────────────────
  title: {
    fontSize: 27,
    fontWeight: '800',
    color: '#0D2B1E',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: '#527563',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
    marginBottom: 30,
  },

  // ── Form ──────────────────────────────────────────────────────────────────
  formGroup: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#4A6A58',
    letterSpacing: 1.0,
    marginBottom: 8,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  forgotText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#2D7A52',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#D5E6DC',
    paddingHorizontal: 16,
    height: 52,
    gap: 10,
    shadowColor: '#103823',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0D2B1E',
  },

  // ── Biometric ─────────────────────────────────────────────────────────────
  bioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5EE',
    borderRadius: 16,
    padding: 13,
    marginBottom: 26,
    borderWidth: 1,
    borderColor: '#CDE8D8',
    gap: 12,
  },
  bioIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#103823',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  bioText: {
    flex: 1,
  },
  bioTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0D2B1E',
  },
  bioSub: {
    fontSize: 11.5,
    color: '#527563',
    marginTop: 1,
  },
  sensorBtn: {
    backgroundColor: '#C2E4D0',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
  },
  sensorBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1B4D36',
  },

  // ── Buttons ───────────────────────────────────────────────────────────────
  signInBtn: {
    backgroundColor: '#184E38',
    borderRadius: 15,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#184E38',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 5,
  },
  signInBtnText: {
    color: '#FFFFFF',
    fontSize: 16.5,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  createBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D5E6DC',
    borderRadius: 15,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#103823',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  createBtnText: {
    color: '#0D2B1E',
    fontSize: 15,
    fontWeight: '600',
  },

  // ── Security Footer ───────────────────────────────────────────────────────
  secFooter: {
    alignItems: 'center',
  },
  secRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  secTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2D7A52',
  },
  secSub: {
    fontSize: 11,
    color: '#7A9E8C',
    textAlign: 'center',
    lineHeight: 16,
  },
});
