import { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, Alert, ActivityIndicator, TextInput,
} from 'react-native';
import { cropsAPI } from '../../src/services/api';

export default function CropsScreen() {
  const [crops, setCrops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [variety, setVariety] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchCrops = async () => {
    try {
      const res = await cropsAPI.getAll();
      setCrops(res.data.crops);
    } catch {
      Alert.alert('Error', 'Failed to load crops');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCrops(); }, []);

  const handleAdd = async () => {
    if (!name) return Alert.alert('Error', 'Crop name is required');
    setAdding(true);
    try {
      await cropsAPI.create({ name, variety });
      setName(''); setVariety(''); setShowAdd(false);
      fetchCrops();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || 'Failed to add crop');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Crop', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await cropsAPI.delete(id);
          fetchCrops();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color="#4CAF50" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🌱 My Crops</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(!showAdd)}>
          <Text style={styles.addBtnText}>{showAdd ? '✕' : '+ Add'}</Text>
        </TouchableOpacity>
      </View>

      {showAdd && (
        <View style={styles.addForm}>
          <TextInput
            style={styles.input} placeholder="Crop name *" placeholderTextColor="#888"
            value={name} onChangeText={setName}
          />
          <TextInput
            style={styles.input} placeholder="Variety (optional)" placeholderTextColor="#888"
            value={variety} onChangeText={setVariety}
          />
          <TouchableOpacity style={styles.saveBtn} onPress={handleAdd} disabled={adding}>
            {adding ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Crop</Text>}
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={crops}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cropCard}>
            <View style={styles.cropInfo}>
              <Text style={styles.cropName}>{item.name}</Text>
              {item.variety && <Text style={styles.cropVariety}>{item.variety}</Text>}
              <View style={[styles.badge, { backgroundColor: item.status === 'growing' ? '#2d7a4e' : '#666' }]}>
                <Text style={styles.badgeText}>{item.status}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Text style={styles.deleteBtn}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No crops yet. Add your first crop!</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a2818', paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  addBtn: { backgroundColor: '#4CAF50', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  addBtnText: { color: '#fff', fontWeight: 'bold' },
  addForm: { backgroundColor: '#1a5c3e', margin: 16, borderRadius: 16, padding: 16 },
  input: { backgroundColor: '#0a2818', borderRadius: 8, padding: 12, color: '#fff', marginBottom: 10 },
  saveBtn: { backgroundColor: '#4CAF50', borderRadius: 8, padding: 14, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
  cropCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#1a5c3e', marginHorizontal: 16, marginBottom: 10, borderRadius: 14, padding: 16,
  },
  cropInfo: { flex: 1 },
  cropName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cropVariety: { color: '#9DC08B', fontSize: 13, marginTop: 2 },
  badge: { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, marginTop: 6 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  deleteBtn: { fontSize: 22 },
  empty: { color: '#666', textAlign: 'center', marginTop: 60, fontSize: 16 },
});


