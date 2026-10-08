import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, ActivityIndicator, ScrollView, Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useScanImageMutation } from '../../src/services/scan';
import { COLORS } from '../../src/constants/theme';
import Header from '../../src/components/Header';
import { useTranslation } from '../../src/stores/language.store';

export default function ScanScreen() {
  const { t } = useTranslation();
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const scanMutation = useScanImageMutation();
  const loading = scanMutation.isPending;

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('scan.permissionNeeded'), t('scan.permissionMsg'));
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
      Alert.alert(t('scan.permissionNeeded'), t('scan.permissionMsg'));
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
    try {
      const data = await scanMutation.mutateAsync({ imageUri: image });
      setResult(data);
    } catch (err: any) {
      Alert.alert(t('scan.scanFailed'), err.response?.data?.error || t('common.error'));
    }
  };
  return (
    <View style={styles.root}>
      <Header title={t('scan.title')} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>{t('scan.subtitle')}</Text>

      <View style={styles.imageBox}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
        ) : (
          <Text style={styles.imagePlaceholder}>{t('scan.noImageSelected')}</Text>
        )}
      </View>

      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.btn} onPress={takePhoto}>
          <Text style={styles.btnText}>{t('scan.camera')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={pickImage}>
          <Text style={styles.btnText}>{t('scan.gallery')}</Text>
        </TouchableOpacity>
      </View>

      {image && (
        <TouchableOpacity style={styles.scanBtn} onPress={handleScan} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.scanBtnText}>{t('scan.analyzePlant')}</Text>
          )}
        </TouchableOpacity>
      )}

      {result && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>{t('scan.resultTitle')}</Text>
          {result.diagnosis?.plant && (
            <Text style={styles.resultRow}>{t('scan.plant')}: {result.diagnosis.plant}</Text>
          )}
          {result.diagnosis?.problem && (
            <Text style={styles.resultRow}>{t('scan.problem')}: {result.diagnosis.problem}</Text>
          )}
          {result.diagnosis?.confidence && (
            <Text style={styles.resultRow}>{t('scan.confidence')}: {result.diagnosis.confidence}</Text>
          )}
          {result.diagnosis?.recommendations && (
            <>
              <Text style={styles.resultSubtitle}>{t('scan.recommendations')}:</Text>
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


