import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Appbar, Card, Text, Provider as PaperProvider, ActivityIndicator, Avatar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { db } from '../services/firebase';
import { collection, query, where, onSnapshot, orderBy, doc, getDoc } from 'firebase/firestore';
import { useUser } from '../components/UserContext';

const green = '#217a3e';
const gold = '#d4af37';
const bg = '#f7f7f7';

const avatarCache = {};

const ChatList = () => {
  const { user } = useUser();
  const router = useRouter();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [avatars, setAvatars] = useState({});

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid),
      orderBy('lastMessageAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chatList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChats(chatList);
      setLoading(false);
      // Fetch avatars for the other participant in each chat
      const newAvatars = { ...avatarCache };
      for (const chat of chatList) {
        const otherId = chat.participants.find(id => id !== user.uid);
        if (otherId && !newAvatars[otherId]) {
          let profileDoc = await getDoc(doc(db, 'jobseekers', otherId));
          if (!profileDoc.exists()) {
            profileDoc = await getDoc(doc(db, 'companies', otherId));
          }
          if (profileDoc.exists()) {
            const data = profileDoc.data();
            newAvatars[otherId] = data.photoURL || null;
            avatarCache[otherId] = data.photoURL || null;
          } else {
            newAvatars[otherId] = null;
            avatarCache[otherId] = null;
          }
        }
      }
      setAvatars({ ...newAvatars });
    });
    return unsubscribe;
  }, [user]);

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
        <Appbar.Header style={{ backgroundColor: green }}>
          <Appbar.Content title="Chats" titleStyle={{ color: gold, fontWeight: 'bold', fontSize: 22 }} />
        </Appbar.Header>
        <View style={styles.container}>
          {loading ? (
            <ActivityIndicator animating={true} color={green} size="large" style={{ marginTop: 40 }} />
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
  container: {
    flex: 1,
    padding: 16,
  },
  chatCard: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderColor: gold,
    borderWidth: 2,
    elevation: 4,
    padding: 8,
  },
  avatar: {
    marginRight: 12,
    backgroundColor: gold,
  },
  chatTitle: {
    color: green,
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 4,
  },
  lastMessage: {
    color: gold,
    fontSize: 15,
  },
  emptyText: {
    color: gold,
    fontSize: 18,
    textAlign: 'center',
    marginTop: 40,
  },
});

export default ChatList; 