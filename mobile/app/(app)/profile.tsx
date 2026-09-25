import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/stores/auth.store';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || '?'}</Text>
      </View>

      <Text style={styles.name}>{user?.name}</Text>
      <Text style={styles.email}>{user?.email}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.card}>
          <Text style={styles.cardText}>🌿 AgriSmart Farmer</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a2818', paddingTop: 80, alignItems: 'center', padding: 20 },
  avatarCircle: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  avatarText: { fontSize: 36, fontWeight: 'bold', color: '#fff' },
  name: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  email: { color: '#9DC08B', fontSize: 14, marginBottom: 32 },
  section: { width: '100%', marginBottom: 20 },
  sectionTitle: { color: '#9DC08B', fontWeight: '600', marginBottom: 8 },
  card: { backgroundColor: '#1a5c3e', borderRadius: 14, padding: 16 },
  cardText: { color: '#fff', fontSize: 15 },
  logoutBtn: {
    marginTop: 'auto',
    backgroundColor: '#2d1a1a', borderRadius: 14,
    padding: 16, width: '100%', alignItems: 'center',
  },
  logoutText: { color: '#e53935', fontWeight: 'bold', fontSize: 15 },
});


