import { Tabs } from 'expo-router';
import { useUser } from '../../components/UserContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';

export default function TabLayout() {
  const { user } = useUser();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Modern neutral palette
  const activeColor = '#1976d2'; // blue accent
  const inactiveColor = '#757575'; // gray
  const barStyle = {
    backgroundColor: isDark ? '#222' : '#fff',
    borderTopColor: isDark ? '#333' : '#eee',
    height: 60,
    paddingBottom: 6,
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: barStyle,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-variant" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="message-text" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-circle" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
} 