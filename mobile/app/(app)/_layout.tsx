import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type MaterialIconName = keyof typeof MaterialIcons.glyphMap;

function TabItem({
  name,
  label,
  focused,
}: {
  name: MaterialIconName;
  label: string;
  focused: boolean;
}) {
  return (
    <View style={styles.tabItem}>
      <MaterialIcons 
        name={name} 
        size={24} 
        color={focused ? '#00442a' : '#707972'} 
      />
      <Text numberOfLines={1} style={[styles.tabLabel, focused && styles.tabLabelActive]}>
        {label}
      </Text>
    </View>
  );
}

import { useTranslation } from '../../src/stores/language.store';

function ScanTabItem({ label }: { label: string }) {
  return (
    <View style={styles.scanItem}>
      <LinearGradient
        colors={['#15803d', '#22c55e']}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={styles.scanBtnOuter}
      >
        <MaterialIcons name="photo-camera" size={24} color="#FFFFFF" />
      </LinearGradient>
      <Text numberOfLines={1} style={[styles.tabLabel, { marginTop: 4 }]}>{label}</Text>
    </View>
  );
}

export default function AppLayout() {
  const insets = useSafeAreaInsets();
  const { t, language } = useTranslation();
  
  return (
    <Tabs
      key={language}
      screenOptions={{
        headerShown: false,
        tabBarStyle: [styles.tabBar, { height: 60 + insets.bottom }],
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabItem name="home" label={t('tabs.home')} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="crops"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabItem name="spa" label={t('tabs.crops')} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          tabBarIcon: () => <ScanTabItem label={t('tabs.scan')} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabItem name="calendar-today" label={t('tabs.calendar')} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabItem name="auto-awesome" label={t('tabs.ai')} focused={focused} />
          ),
        }}
      />
      
      {/* Hidden Screens */}
      <Tabs.Screen name="profile" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="crop-detail" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="add-task" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="add-crop" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="weather" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="notifications" options={{ href: null, tabBarStyle: { display: 'none' } }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(241, 252, 242, 0.85)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(112, 121, 114, 0.3)',
    position: 'absolute',
    elevation: 0,
    paddingTop: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 56,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#707972',
    marginTop: 2,
  },
  tabLabelActive: {
    color: '#00442a',
    fontWeight: '600',
  },
  scanItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64,
    top: -16,
  },
  scanBtnOuter: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 16px rgba(34, 197, 94, 0.35)',
      } as any,
      default: {
        shadowColor: '#22c55e',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
      },
    }),
    elevation: 6,
  },
});
