import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/stores/auth.store';

export default function LoginScreen() {
  const [email, setEmail] = useState('sara@agrifarm.ma');
  const [password, setPassword] = useState('••••••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* App Logo Badge */}
        <View style={styles.logoBadgeContainer}>
          <View style={styles.logoBadge}>
            <Ionicons name="leaf" size={26} color="#2D7A52" />
            <Text style={styles.logoText}>AgriSmart</Text>
          </View>
        </View>

        {/* Title & Subtitle */}
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>
          Sign in to manage your farm telemetry, soil matrices & harvests.
        </Text>

        {/* Form Fields */}
        <View style={styles.formGroup}>
          <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="name@agrifarm.ma"
              placeholderTextColor="#8CA898"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Ionicons name="shield-checkmark-outline" size={20} color="#2D7A52" />
          </View>
        </View>

        <View style={styles.formGroup}>
          <View style={styles.passwordLabelRow}>
            <Text style={styles.fieldLabel}>PASSWORD</Text>
            <TouchableOpacity onPress={() => Alert.alert('Forgot Password', 'Please contact your farm administrator.')}>
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#8CA898"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#527563"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Biometric Card */}
        <View style={styles.biometricCard}>
          <View style={styles.biometricIconBadge}>
            <Ionicons name="finger-print-outline" size={24} color="#2D7A52" />
          </View>
          <View style={styles.biometricTextContainer}>
            <Text style={styles.biometricTitle}>Touch ID ready</Text>
            <Text style={styles.biometricSubtitle}>Instant field login</Text>
          </View>
          <TouchableOpacity
            style={styles.sensorButton}
            onPress={() => Alert.alert('Touch ID', 'Sensor scan initialized')}
          >
            <Text style={styles.sensorButtonText}>Use Sensor</Text>
          </TouchableOpacity>
        </View>

        {/* Primary Sign In Button */}
        <TouchableOpacity
          style={styles.signInButton}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={styles.signInButtonText}>Sign in</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>

        {/* Secondary Create Account Button */}
        <TouchableOpacity
          style={styles.createAccountButton}
          onPress={() => router.push('/(auth)/register')}
          activeOpacity={0.8}
        >
          <Text style={styles.createAccountButtonText}>Create account</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.securityRow}>
            <Ionicons name="lock-closed-outline" size={14} color="#2D7A52" />
            <Text style={styles.securityTitle}>Protected by AgriSmart SecureFarm™</Text>
          </View>
          <Text style={styles.securitySubtitle}>
            Encrypted offline sync & multi-node agronomic integrity.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF7F2',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoBadgeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D8EBE0',
    shadowColor: '#103823',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  logoText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#2D7A52',
    marginTop: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0D2B1E',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13.5,
    color: '#527563',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
    marginBottom: 28,
  },
  formGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4A6A58',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justify: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  forgotPasswordText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2D7A52',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D5E6DC',
    paddingHorizontal: 16,
    height: 52,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0D2B1E',
    fontWeight: '400',
  },
  biometricCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E4F3EB',
    borderRadius: 16,
    padding: 12,
    marginTop: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#D3E7DC',
  },
  biometricIconBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  biometricTextContainer: {
    flex: 1,
  },
  biometricTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0D2B1E',
  },
  biometricSubtitle: {
    fontSize: 11.5,
    color: '#527563',
    marginTop: 1,
  },
  sensorButton: {
    backgroundColor: '#C5E6D2',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  sensorButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1B4D36',
  },
  signInButton: {
    backgroundColor: '#184E38',
    borderRadius: 14,
    height: 54,
    flexDirection: 'row',
    justify: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    shadowColor: '#184E38',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  createAccountButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5E6DC',
    borderRadius: 14,
    height: 54,
    justify: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  createAccountButtonText: {
    color: '#0D2B1E',
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  securityTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2D7A52',
  },
  securitySubtitle: {
    fontSize: 11,
    color: '#6A8E7C',
    textAlign: 'center',
    lineHeight: 16,
  },
});



