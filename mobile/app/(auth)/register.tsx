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
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/stores/auth.store';

export default function RegisterScreen() {
  const [name, setName]                       = useState('');
  const [email, setEmail]                     = useState('');
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword]       = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [loading, setLoading]                 = useState(false);
  const { register } = useAuthStore();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      router.replace('/(app)/home');
    } catch (err: any) {
      Alert.alert('Registration Failed', err.response?.data?.error || 'Something went wrong');
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
              <Image
                source={require('../../assets/agrismart_logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>

            {/* ── Title ── */}
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join the smart farming community & manage your agronomic data.
            </Text>

            {/* ── Full Name ── */}
            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>FULL NAME</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Your full name"
                  placeholderTextColor="#9CB8A8"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
                <Ionicons name="person-outline" size={20} color="#2D7A52" />
              </View>
            </View>

            {/* ── Email ── */}
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

            {/* ── Password ── */}
            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>PASSWORD</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Min. 6 characters"
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

            {/* ── Confirm Password ── */}
            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>CONFIRM PASSWORD</Text>
              <View style={[
                styles.inputWrapper,
                confirmPassword.length > 0 && confirmPassword !== password && styles.inputError,
              ]}>
                <TextInput
                  style={styles.input}
                  placeholder="Re-enter your password"
                  placeholderTextColor="#9CB8A8"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirm}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirm(!showConfirm)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={confirmPassword.length > 0 && confirmPassword !== password ? '#E05252' : '#527563'}
                  />
                </TouchableOpacity>
              </View>
              {confirmPassword.length > 0 && confirmPassword !== password && (
                <Text style={styles.errorText}>Passwords do not match</Text>
              )}
            </View>

            {/* ── Terms Card ── */}
            <View style={styles.termsCard}>
              <View style={styles.termsIconWrap}>
                <Ionicons name="leaf-outline" size={20} color="#2D7A52" />
              </View>
              <Text style={styles.termsText}>
                By creating an account you agree to AgriSmart's{' '}
                <Text style={styles.termsLink}>Terms of Service</Text> &{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>.
              </Text>
            </View>

            {/* ── Create Account Button ── */}
            <TouchableOpacity
              style={styles.signInBtn}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.signInBtnText}>Create account  →</Text>
              )}
            </TouchableOpacity>

            {/* ── Back to Sign In ── */}
            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => router.push('/(auth)/login')}
              activeOpacity={0.8}
            >
              <Text style={styles.createBtnText}>Already have an account? Sign in</Text>
            </TouchableOpacity>

            {/* ── Security Footer ── */}
            <View style={styles.secFooter}>
              <View style={styles.secRow}>
                <Ionicons name="lock-closed-outline" size={13} color="#2D7A52" />
                <Text style={styles.secTitle}>Protected by AgriSmart SecureFarm™</Text>
              </View>
              <Text style={styles.secSub}>
                Encrypted offline sync & multi-node agronomic integrity.
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
    paddingHorizontal: 26,
    paddingTop: 12,
    paddingBottom: 36,
  },

  // ── Logo ──────────────────────────────────────────────────────────────────
  logoBadgeWrap: {
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 4,
  },
  logoImage: {
    width: 140,
    height: 70,
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
  inputError: {
    borderColor: '#E8A0A0',
    backgroundColor: '#FFF8F8',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0D2B1E',
  },
  errorText: {
    fontSize: 11.5,
    color: '#C0392B',
    marginTop: 5,
    marginLeft: 4,
    fontWeight: '500',
  },

  // ── Terms Card ────────────────────────────────────────────────────────────
  termsCard: {
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
  termsIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#103823',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  termsText: {
    flex: 1,
    fontSize: 11.5,
    color: '#527563',
    lineHeight: 17,
  },
  termsLink: {
    color: '#2D7A52',
    fontWeight: '700',
  },

  // ── Buttons ───────────────────────────────────────────────────────────────
  signInBtn: {
    backgroundColor: '#11b91aff',
    borderRadius: 15,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#1aa16bff',
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
    shadowColor: '#15e67aff',
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
    color: '#2a8d5aff',
  },
  secSub: {
    fontSize: 11,
    color: '#7A9E8C',
    textAlign: 'center',
    lineHeight: 16,
  },
});


