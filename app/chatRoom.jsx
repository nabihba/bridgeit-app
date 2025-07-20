import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { Appbar, Card, Text, TextInput, Button, Provider as PaperProvider, ActivityIndicator, Divider, Avatar } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { db } from '../services/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { useUser } from '../components/UserContext';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';
dayjs.extend(isToday);
dayjs.extend(isYesterday);

const green = '#217a3e';
const gold = '#d4af37';
const bg = '#f7f7f7';

function groupMessagesByDay(messages) {
  const groups = [];
  let lastDate = null;
  messages.forEach((msg) => {
    const date = msg.timestamp?.toDate ? msg.timestamp.toDate() : null;
    const dayKey = date ? dayjs(date).format('YYYY-MM-DD') : 'unknown';
    if (!lastDate || lastDate !== dayKey) {
      groups.push({ type: 'header', dayKey, date });
      lastDate = dayKey;
    }
    groups.push({ type: 'message', ...msg });
  });
  return groups;
}

const avatarCache = {};

const ChatRoom = () => {
  const { chatId } = useLocalSearchParams();
  const { user } = useUser();
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [avatars, setAvatars] = useState({});
  const flatListRef = useRef();

  useEffect(() => {
    if (!chatId) return;
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'asc')
    );
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      setLoading(false);
      // Fetch avatars for all unique senderIds
      const uniqueIds = Array.from(new Set(msgs.map(m => m.senderId)));
      const newAvatars = { ...avatarCache };
      for (const uid of uniqueIds) {
        if (!newAvatars[uid]) {
          // Try jobseekers first, then companies
          let profileDoc = await getDoc(doc(db, 'jobseekers', uid));
          if (!profileDoc.exists()) {
            profileDoc = await getDoc(doc(db, 'companies', uid));
          }
          if (profileDoc.exists()) {
            const data = profileDoc.data();
            newAvatars[uid] = data.photoURL || null;
            avatarCache[uid] = data.photoURL || null;
          } else {
            newAvatars[uid] = null;
            avatarCache[uid] = null;
          }
        }
      }
      setAvatars({ ...newAvatars });
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    });
    return unsubscribe;
  }, [chatId]);

  const sendMessage = async () => {
    if (!text.trim() || !user) return;
    setSending(true);
    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        senderId: user.uid,
        senderName: user.profile.name || user.profile.companyName || 'User',
        text: text.trim(),
        timestamp: serverTimestamp(),
      });
      setText('');
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const renderItem = ({ item }) => {
    if (item.type === 'header') {
      let label = '';
      if (item.date) {
        if (dayjs(item.date).isToday()) label = 'Today';
        else if (dayjs(item.date).isYesterday()) label = 'Yesterday';
        else label = dayjs(item.date).format('MMMM D, YYYY');
      } else {
        label = 'Unknown';
      }
      return (
        <View style={styles.headerRow}>
          <Divider style={{ marginVertical: 8 }} />
          <Text style={styles.headerText}>{label}</Text>
        </View>
      );
    }
    // Message
    const date = item.timestamp?.toDate ? item.timestamp.toDate() : null;
    const time = date ? dayjs(date).format('h:mm A') : '';
    const avatarUrl = avatars[item.senderId];
    const initials = item.senderName ? item.senderName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'U';
    return (
      <View style={[styles.messageRow, item.senderId === user.uid ? styles.myRow : styles.theirRow]}>
        {item.senderId !== user.uid && (
          avatarUrl ? (
            <Avatar.Image size={36} source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <Avatar.Text size={36} label={initials} style={styles.avatar} />
          )
        )}
        <View style={[styles.messageBubble, item.senderId === user.uid ? styles.myMessage : styles.theirMessage]}>
          <Text style={styles.sender}>{item.senderName}</Text>
          <Text style={styles.messageText}>{item.text}</Text>
          <Text style={styles.timestamp}>{time}</Text>
        </View>
        {item.senderId === user.uid && (
          avatarUrl ? (
            <Avatar.Image size={36} source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <Avatar.Text size={36} label={initials} style={styles.avatar} />
          )
        )}
      </View>
    );
  };

  const grouped = groupMessagesByDay(messages);

  return (
    <PaperProvider>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: bg }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <Appbar.Header style={{ backgroundColor: green }}>
          <Appbar.BackAction color={gold} onPress={() => router.back()} />
          <Appbar.Content title="Chat" titleStyle={{ color: gold, fontWeight: 'bold', fontSize: 22 }} />
        </Appbar.Header>
        <View style={styles.container}>
          {loading ? (
            <ActivityIndicator animating={true} color={green} size="large" style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              ref={flatListRef}
              data={grouped}
              keyExtractor={(item, idx) => item.type === 'header' ? `header-${item.dayKey}` : item.id}
              renderItem={renderItem}
              contentContainerStyle={{ paddingVertical: 16 }}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />
          )}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder="Type a message..."
              mode="outlined"
              outlineColor={gold}
              activeOutlineColor={green}
              textColor={green}
              theme={{ colors: { text: green, primary: gold, placeholder: gold } }}
              disabled={sending}
            />
            <Button
              mode="contained"
              style={styles.sendButton}
              contentStyle={{ backgroundColor: gold }}
              labelStyle={{ color: green, fontWeight: 'bold', fontSize: 18 }}
              onPress={sendMessage}
              loading={sending}
              disabled={sending || !text.trim()}
            >
              Send
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  headerRow: {
    alignItems: 'center',
    marginVertical: 4,
  },
  headerText: {
    color: gold,
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 2,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  myRow: {
    justifyContent: 'flex-end',
  },
  theirRow: {
    justifyContent: 'flex-start',
  },
  avatar: {
    marginHorizontal: 4,
    backgroundColor: gold,
  },
  messageBubble: {
    marginBottom: 4,
    padding: 12,
    borderRadius: 16,
    maxWidth: '80%',
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderColor: gold,
    borderWidth: 1.5,
    elevation: 2,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#e6ffe6',
    borderColor: green,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fffbe6',
    borderColor: gold,
  },
  sender: {
    fontWeight: 'bold',
    color: green,
    marginBottom: 2,
  },
  messageText: {
    fontSize: 16,
    color: green,
  },
  timestamp: {
    fontSize: 12,
    color: gold,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  sendButton: {
    borderRadius: 10,
    borderColor: gold,
    borderWidth: 2,
    backgroundColor: gold,
    minWidth: 80,
  },
});

export default ChatRoom; 