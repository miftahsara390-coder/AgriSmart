import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, ActivityIndicator, ScrollView, Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { scanAPI } from '../../src/services/api';

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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>📷 Scan Plant</Text>
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a2818' },
  content: { padding: 20, paddingTop: 60, paddingBottom: 80 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  subtitle: { color: '#9DC08B', marginBottom: 20, fontSize: 14 },
  imageBox: {
    height: 220, backgroundColor: '#1a5c3e', borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16, overflow: 'hidden',
  },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { color: '#666', fontSize: 16 },
  btnRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  btn: {
    flex: 1, backgroundColor: '#1a5c3e', borderRadius: 12,
    padding: 14, alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '600' },
  scanBtn: {
    backgroundColor: '#4CAF50', borderRadius: 12, padding: 16,
    alignItems: 'center', marginTop: 4, marginBottom: 20,
  },
  scanBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  resultCard: { backgroundColor: '#1a5c3e', borderRadius: 16, padding: 16 },
  resultTitle: { color: '#4CAF50', fontWeight: 'bold', fontSize: 16, marginBottom: 12 },
  resultSubtitle: { color: '#9DC08B', fontWeight: '600', marginTop: 8, marginBottom: 4 },
  resultRow: { color: '#fff', marginBottom: 6 },
  resultText: { color: '#ccc', lineHeight: 20 },
  disclaimer: { backgroundColor: '#0f3d2e', borderRadius: 8, padding: 10, marginTop: 12 },
  disclaimerText: { color: '#fb8c00', fontSize: 12, lineHeight: 18 },
});


