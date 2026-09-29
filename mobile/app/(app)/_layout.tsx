import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';

type IoniconName = keyof typeof Ionicons.glyphMap;

function TabIcon({
  name,
  color,
  focused,
}: {
  name: IoniconName;
  color: string;
  focused: boolean;
}) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Ionicons name={name} size={22} color={color} />
    </View>
  );
}

const TAB_SCREENS: {
  name: string;
  title: string;
  icon: IoniconName;
  iconActive: IoniconName;
}[] = [
  { name: 'home',      title: 'Home',      icon: 'home-outline',              iconActive: 'home' },
  { name: 'crops',     title: 'Crops',     icon: 'leaf-outline',              iconActive: 'leaf' },
  { name: 'scan',      title: 'Scan',      icon: 'scan-outline',              iconActive: 'scan' },
  { name: 'assistant', title: 'AI',        icon: 'chatbubble-ellipses-outline', iconActive: 'chatbubble-ellipses' },
  { name: 'profile',   title: 'Profile',   icon: 'person-outline',            iconActive: 'person' },
];

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#2D7A52',
        tabBarInactiveTintColor: '#8CA898',
        tabBarLabelStyle: styles.tabLabel,
        tabBarShowLabel: true,
      }}
    >
      {TAB_SCREENS.map((s) => (
        <Tabs.Screen
          key={s.name}
          name={s.name}
          options={{
            title: s.title,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                name={focused ? s.iconActive : s.icon}
                color={color}
                focused={focused}
              />
            ),
          }}
        />
      ))}
      {/* Hide calendar from tab bar but keep routing */}
      <Tabs.Screen
        name="calendar"
        options={{ href: null }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8F2EC',
    height: Platform.OS === 'ios' ? 88 : 65,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
    paddingTop: 8,
    shadowColor: '#103823',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 10,
  },
  tabLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 2,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapActive: {
    backgroundColor: '#E8F5EE',
  },
});
