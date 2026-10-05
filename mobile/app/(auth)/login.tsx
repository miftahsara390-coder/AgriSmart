import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView, Image } from 'react-native';
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
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace('/(app)/home');
    } catch (err: any) {
      const message = err.response?.data?.message || err.response?.data?.error || err.message || 'Something went wrong';
      Alert.alert('Login Failed', message);
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
              <Image
                source={require('../../assets/agrismart_logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
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
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 4,
  },
  logoImage: {
    width: 140,
    height: 70,
  },
  titleWrap: {
    alignItems: 'center',
    marginBottom: 24,
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
  signInBtnOuter: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    marginTop: 8,
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
