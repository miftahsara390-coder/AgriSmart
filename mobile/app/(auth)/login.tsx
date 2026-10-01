import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../src/stores/auth.store';

const COLORS = {
  surface: '#f1fcf2',
  onSurface: '#141e18',
  secondary: '#406653',
  surfaceContainerLowest: '#ffffff',
  outline: '#707972',
  primaryContainer: '#1f5c3f',
  onPrimary: '#ffffff',
  surfaceContainerLow: '#ebf7ed',
};

export default function LoginScreen() {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const { login } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      router.replace('/(app)/home');
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
            {/* Header Logo */}
            <View style={styles.logoWrap}>
              <View style={styles.logoIcon}>
                <MaterialIcons name="eco" size={32} color="#FBBF24" />
              </View>
              <View style={styles.logoLineRow}>
                <View style={styles.line} />
                <Text style={styles.intelligentFarmingText}>INTELLIGENT FARMING</Text>
                <View style={styles.line} />
              </View>
            </View>

            {/* Title */}
            <View style={styles.titleWrap}>
              <Text style={styles.title}>Welcome <Text style={{color: '#15803d'}}>back</Text></Text>
              <Text style={styles.subtitle}>
                Sign in to manage your farm telemetry, soil matrices & harvests.
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="sara@agrifarm.ma"
                    placeholderTextColor="#a3a3a3"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <MaterialIcons name="verified-user" size={20} color="#406653" />
                </View>
              </View>

              <View style={styles.formGroup}>
                <View style={styles.passwordLabelRow}>
                  <Text style={styles.fieldLabel}>PASSWORD</Text>
                  <TouchableOpacity onPress={() => Alert.alert('Forgot Password', 'Please contact admin.')}>
                    <Text style={styles.forgotText}>Forgot password?</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••••••"
                    placeholderTextColor="#a3a3a3"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={{top:10,bottom:10,left:10,right:10}}>
                    <MaterialIcons
                      name={showPassword ? 'visibility-off' : 'visibility'}
                      size={20}
                      color="#a3a3a3"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Biometric Card */}
              <View style={styles.bioCard}>
                <View style={styles.bioLeft}>
                  <View style={styles.bioIconWrap}>
                    <MaterialIcons name="fingerprint" size={22} color="#15803d" />
                    <View style={styles.bioDot} />
                  </View>
                  <View>
                    <Text style={styles.bioTitle}>Touch ID ready</Text>
                    <Text style={styles.bioSub}>Instant field login</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.sensorBtn} activeOpacity={0.8} onPress={() => Alert.alert('Touch ID', 'Scanned')}>
                  <Text style={styles.sensorBtnText}>Use Sensor</Text>
                </TouchableOpacity>
              </View>

              {/* Action Buttons */}
              <TouchableOpacity 
                style={styles.signInBtnOuter}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#22c55e', '#16a34a', '#15803d']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.signInBtnInner}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.signInBtnText}>Sign in</Text>
                      <View style={styles.signInBtnIcon}>
                        <MaterialIcons name="arrow-forward" size={14} color="#15803d" />
                      </View>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.createBtn} onPress={() => router.push('/(auth)/register')} activeOpacity={0.8}>
                <Text style={styles.createBtnText}>Create account</Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <View style={styles.footerRow}>
                <MaterialIcons name="lock" size={14} color="#00442a" />
                <Text style={styles.footerTitle}>Protected by AgriSmart SecureFarm™</Text>
              </View>
              <Text style={styles.footerSub}>
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
    backgroundColor: COLORS.surface,
  },
  safe: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoIcon: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  line: {
    height: 1,
    width: 20,
    backgroundColor: '#065f46',
    opacity: 0.4,
  },
  intelligentFarmingText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0f3d25',
    letterSpacing: 2,
  },
  titleWrap: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#141e18',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#404943',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  form: {
    width: '100%',
  },
  formGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#404943',
    letterSpacing: 1,
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  forgotText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803d',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    shadowColor: '#17211b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#141e18',
  },
  bioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(6, 95, 70, 0.1)',
    marginTop: 4,
    marginBottom: 20,
  },
  bioLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bioIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: 'rgba(6, 95, 70, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bioDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: '#fff',
  },
  bioTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#141e18',
  },
  bioSub: {
    fontSize: 11,
    color: '#404943',
  },
  sensorBtn: {
    backgroundColor: '#c2ecd3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  sensorBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#002113',
  },
  signInBtnOuter: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  signInBtnInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  signInBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  signInBtnIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createBtn: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(6, 95, 70, 0.1)',
    shadowColor: '#17211b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  createBtnText: {
    color: '#141e18',
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
    gap: 8,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerTitle: {
    fontSize: 11,
    color: '#404943',
  },
  footerSub: {
    fontSize: 11,
    color: '#707972',
    textAlign: 'center',
  }
});
