import { Tabs } from 'expo-router';
import { useUser } from '../../components/UserContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { useEffect, useState } from 'react';
import { db } from '../../services/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

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

  // Unread badge logic
  const [unreadCount, setUnreadCount] = useState(0);
  useEffect(() => {
    if (!user) return;
    // Listen to all chats for this user
    const q = query(collection(db, 'chats'), where('participants', 'array-contains', user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      let count = 0;
      snapshot.docs.forEach(docSnap => {
        const data = docSnap.data();
        // If lastMessage exists and lastMessageSender !== user.uid and lastMessageReadBy doesn't include user.uid
        if (data.lastMessage && data.lastMessageSender !== user.uid && (!data.lastMessageReadBy || !data.lastMessageReadBy.includes(user.uid))) {
          count++;
        }
      });
      setUnreadCount(count);
    });
    return () => unsub();
  }, [user]);

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
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
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