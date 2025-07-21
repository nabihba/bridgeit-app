import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Card, Text, Provider as PaperProvider, ActivityIndicator, Avatar, Badge } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { db } from '../services/firebase';
import { collection, query, where, onSnapshot, orderBy, doc, getDoc } from 'firebase/firestore';
import { useUser } from '../components/UserContext';

const accent = '#1976d2';
const bg = '#f7f7f7';
const cardBg = '#fff';
const textMain = '#222';
const textSub = '#757575';

const avatarCache = {};

const ChatList = () => {
  const { user } = useUser();
  const router = useRouter();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [avatars, setAvatars] = useState({});
  // Placeholder for unread badge logic
  const unreadCount = 0;

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid),
      orderBy('lastMessageAt', 'desc')
    );
    const unsub = onSnapshot(q, async (snapshot) => {
      const chatData = await Promise.all(snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        return { ...data, id: docSnap.id };
      }));
      setChats(chatData);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    // Fetch avatars for chat participants
    const fetchAvatars = async () => {
      if (!user) return;
      const ids = new Set();
      chats.forEach(chat => {
        chat.participants.forEach(id => { if (id !== user.uid) ids.add(id); });
      });
      const newAvatars = {};
      for (const id of ids) {
        if (avatarCache[id]) {
          newAvatars[id] = avatarCache[id];
        } else {
          // Try jobseekers first
          let ref = doc(db, 'jobseekers', id);
          let snap = await getDoc(ref);
          if (!snap.exists()) {
            ref = doc(db, 'companies', id);
            snap = await getDoc(ref);
          }
          if (snap.exists()) {
            const data = snap.data();
            if (data.photoURL) {
              avatarCache[id] = data.photoURL;
              newAvatars[id] = data.photoURL;
            }
          }
        }
      }
      setAvatars(newAvatars);
    };
    fetchAvatars();
  }, [chats, user]);

  const openChat = (chat) => {
    router.push({ pathname: '/chatRoom', params: { chatId: chat.id } });
  };

  const renderItem = ({ item }) => {
    const otherId = item.participants.find(id => id !== user.uid);
    const avatarUrl = avatars[otherId];
    const otherName = item.title?.split('&').find(n => !n.includes(user.profile.name || user.profile.companyName || 'User'))?.trim() || 'User';
    const initials = otherName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    return (
      <TouchableOpacity onPress={() => openChat(item)}>
        <Card style={styles.chatCard}>
          <Card.Content style={{ flexDirection: 'row', alignItems: 'center' }}>
            {avatarUrl ? (
              <Avatar.Image size={44} source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <Avatar.Text size={44} label={initials} style={styles.avatar} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.chatTitle}>{otherName}</Text>
              <Text style={styles.lastMessage}>{item.lastMessage || 'No messages yet.'}</Text>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <PaperProvider>
      <View style={styles.root}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Messages</Text>
          <TouchableOpacity onPress={() => router.push('/profile')}>
            {user?.profile?.photoURL ? (
              <Avatar.Image size={38} source={{ uri: user.profile.photoURL }} />
            ) : (
              <Avatar.Icon size={38} icon="account-circle" color={accent} style={{ backgroundColor: '#e3eafc' }} />
            )}
            {unreadCount > 0 && (
              <Badge style={styles.badge}>{unreadCount}</Badge>
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.container}>
          {loading ? (
            <ActivityIndicator animating={true} color={accent} size="large" style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={chats}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              ListEmptyComponent={<Text style={styles.emptyText}>No chats yet.</Text>}
            />
          )}
        </View>
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 8,
    backgroundColor: cardBg,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: accent,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  chatCard: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: cardBg,
    borderColor: accent,
    borderWidth: 2,
    elevation: 4,
    padding: 8,
    width: 340,
    maxWidth: '95%',
    alignSelf: 'center',
  },
  avatar: {
    marginRight: 16,
    backgroundColor: '#e3eafc',
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: textMain,
  },
  lastMessage: {
    fontSize: 14,
    color: textSub,
    marginTop: 2,
  },
  emptyText: {
    color: textSub,
    fontSize: 18,
    textAlign: 'center',
    marginTop: 40,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: accent,
    color: '#fff',
    zIndex: 1,
  },
});

export default ChatList; 