import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, ActivityIndicator, ScrollView, Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { scanAPI } from '../../src/services/api';
import { COLORS } from '../../src/constants/theme';
import Header from '../../src/components/Header';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ScanScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll access');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!res.canceled) {
      setImage(res.assets[0].uri);
      setResult(null);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera access');
      return;
    }
    const res = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!res.canceled) {
      setImage(res.assets[0].uri);
      setResult(null);
    }
  };

  const handleScan = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const res = await scanAPI.scan(image);
      setResult(res.data);
    } catch (err: any) {
      Alert.alert('Scan Failed', err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Header title="Scan Plant" style={{ backgroundColor: 'transparent' }} />
      </SafeAreaView>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Detect diseases and get agricultural advice</Text>

      <View style={styles.imageBox}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
        ) : (
          <Text style={styles.imagePlaceholder}>No image selected</Text>
        )}
      </View>

      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.btn} onPress={takePhoto}>
          <Text style={styles.btnText}>📷 Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={pickImage}>
          <Text style={styles.btnText}>🖼️ Gallery</Text>
        </TouchableOpacity>
      </View>

      {image && (
        <TouchableOpacity style={styles.scanBtn} onPress={handleScan} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.scanBtnText}>🔍 Analyze Plant</Text>
          )}
        </TouchableOpacity>
      )}

      {result && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>🔬 Diagnosis Result</Text>
          {result.diagnosis?.plant && (
            <Text style={styles.resultRow}>🌿 Plant: {result.diagnosis.plant}</Text>
          )}
          {result.diagnosis?.problem && (
            <Text style={styles.resultRow}>⚠️ Problem: {result.diagnosis.problem}</Text>
          )}
          {result.diagnosis?.confidence && (
            <Text style={styles.resultRow}>📊 Confidence: {result.diagnosis.confidence}</Text>
          )}
          {result.diagnosis?.recommendations && (
            <>
              <Text style={styles.resultSubtitle}>💡 Recommendations:</Text>
              <Text style={styles.resultText}>{result.diagnosis.recommendations}</Text>
            </>
          )}
          {result.diagnosis?.raw && (
            <Text style={styles.resultText}>{result.diagnosis.raw}</Text>
          )}
          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>⚠️ {result.disclaimer}</Text>
          </View>
        </View>
      )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.surface },
  safe: { backgroundColor: 'rgba(241, 252, 242, 0.8)' },
  content: { padding: 16, paddingBottom: 100 },
  subtitle: { color: COLORS.outline, marginBottom: 20, fontSize: 14 },
  imageBox: {
    height: 220, backgroundColor: COLORS.surfaceContainer, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)',
  },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { color: COLORS.outline, fontSize: 16 },
  btnRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  btn: {
    flex: 1, backgroundColor: COLORS.surfaceContainerLowest, borderRadius: 12,
    padding: 14, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)',
  },
  btnText: { color: COLORS.secondary, fontWeight: '600' },
  scanBtn: {
    backgroundColor: COLORS.primaryContainer, borderRadius: 12, padding: 16,
    alignItems: 'center', marginTop: 4, marginBottom: 20,
  },
  scanBtnText: { color: COLORS.onPrimary, fontWeight: 'bold', fontSize: 16 },
  resultCard: { backgroundColor: COLORS.surfaceContainerLowest, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  resultTitle: { color: COLORS.primaryContainer, fontWeight: 'bold', fontSize: 16, marginBottom: 12 },
  resultSubtitle: { color: COLORS.secondary, fontWeight: '600', marginTop: 8, marginBottom: 4 },
  resultRow: { color: COLORS.onSurface, marginBottom: 6 },
  resultText: { color: COLORS.outline, lineHeight: 20 },
  disclaimer: { backgroundColor: COLORS.surfaceContainerLow, borderRadius: 8, padding: 10, marginTop: 12 },
  disclaimerText: { color: '#b45309', fontSize: 12, lineHeight: 18 },
});


