import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Card, Text, TextInput, Button, Provider as PaperProvider, ActivityIndicator, Divider, Avatar } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { db } from '../services/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { useUser } from '../components/UserContext';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';
dayjs.extend(isToday);
dayjs.extend(isYesterday);

const accent = '#1976d2';
const bg = '#f7f7f7';
const cardBg = '#fff';
const textMain = '#222';
const textSub = '#757575';

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
    const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('timestamp'));
    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      setLoading(false);
    });
    return () => unsub();
  }, [chatId]);

  useEffect(() => {
    // Fetch avatars for chat participants
    const fetchAvatars = async () => {
      if (!user || !chatId) return;
      const chatDoc = await getDoc(doc(db, 'chats', chatId));
      if (!chatDoc.exists()) return;
      const chat = chatDoc.data();
      const ids = chat.participants.filter(id => id !== user.uid);
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
  }, [chatId, user]);

  const grouped = groupMessagesByDay(messages);

  const sendMessage = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        sender: user.uid,
        text: text.trim(),
        timestamp: serverTimestamp(),
      });
      // Update last message in chat
      await addDoc(collection(db, 'chats', chatId, 'meta'), {
        lastMessage: text.trim(),
        lastMessageAt: serverTimestamp(),
      });
      setText('');
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err) {
      // handle error
    } finally {
      setSending(false);
    }
  };

  const renderItem = ({ item }) => {
    if (item.type === 'header') {
      let label = dayjs(item.date).isToday() ? 'Today' : dayjs(item.date).isYesterday() ? 'Yesterday' : dayjs(item.date).format('MMM D, YYYY');
      return <Text style={styles.dayHeader}>{label}</Text>;
    }
    const isMe = item.sender === user.uid;
    const avatarUrl = isMe ? user.profile?.photoURL : avatars[item.sender];
    const initials = isMe
      ? (user.profile?.name || user.profile?.companyName || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
      : (item.senderName || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    return (
      <View style={[styles.messageRow, isMe ? styles.messageRowMe : styles.messageRowOther]}>
        {!isMe && (
          avatarUrl ? (
            <Avatar.Image size={36} source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <Avatar.Text size={36} label={initials} style={styles.avatar} />
          )
        )}
        <Card style={[styles.messageCard, isMe ? styles.messageMe : styles.messageOther]}>
          <Card.Content>
            <Text style={styles.messageText}>{item.text}</Text>
            <Text style={styles.timestamp}>{item.timestamp?.toDate ? dayjs(item.timestamp.toDate()).format('h:mm A') : ''}</Text>
          </Card.Content>
        </Card>
        {isMe && (
          avatarUrl ? (
            <Avatar.Image size={36} source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <Avatar.Text size={36} label={initials} style={styles.avatar} />
          )
        )}
      </View>
    );
  };

  return (
    <PaperProvider>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: bg }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Avatar.Icon size={36} icon="arrow-left" color={accent} style={{ backgroundColor: '#e3eafc' }} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chat</Text>
          <TouchableOpacity onPress={() => router.push('/profile')}>
            {user?.profile?.photoURL ? (
              <Avatar.Image size={36} source={{ uri: user.profile.photoURL }} />
            ) : (
              <Avatar.Icon size={36} icon="account-circle" color={accent} style={{ backgroundColor: '#e3eafc' }} />
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.container}>
          {loading ? (
            <ActivityIndicator animating={true} color={accent} size="large" style={{ marginTop: 40 }} />
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
        </View>
        <View style={styles.inputRow}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Type a message..."
            style={styles.input}
            mode="outlined"
            outlineColor={accent}
            activeOutlineColor={accent}
            theme={{ colors: { text: textMain, primary: accent, placeholder: textSub } }}
          />
          <Button
            mode="contained"
            onPress={sendMessage}
            loading={sending}
            disabled={sending || !text.trim()}
            style={styles.sendButton}
            contentStyle={{ backgroundColor: accent }}
            labelStyle={{ color: '#fff', fontWeight: 'bold' }}
          >
            Send
          </Button>
        </View>
      </KeyboardAvoidingView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
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
    fontSize: 22,
    fontWeight: 'bold',
    color: accent,
  },
  container: {
    flex: 1,
    paddingHorizontal: 8,
    backgroundColor: bg,
  },
  dayHeader: {
    alignSelf: 'center',
    color: textSub,
    fontWeight: 'bold',
    fontSize: 15,
    marginVertical: 8,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  messageRowMe: {
    justifyContent: 'flex-end',
  },
  messageRowOther: {
    justifyContent: 'flex-start',
  },
  avatar: {
    marginHorizontal: 4,
    backgroundColor: '#e3eafc',
  },
  messageCard: {
    maxWidth: '75%',
    borderRadius: 16,
    elevation: 2,
    marginHorizontal: 4,
    padding: 0,
  },
  messageMe: {
    backgroundColor: accent,
    alignSelf: 'flex-end',
  },
  messageOther: {
    backgroundColor: cardBg,
    borderColor: accent,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  messageText: {
    color: textMain,
    fontSize: 16,
    marginBottom: 2,
  },
  timestamp: {
    color: textSub,
    fontSize: 12,
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: cardBg,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    flex: 1,
    marginRight: 8,
    backgroundColor: cardBg,
  },
  sendButton: {
    borderRadius: 10,
    backgroundColor: accent,
    minWidth: 70,
    height: 44,
    justifyContent: 'center',
  },
});

export default ChatRoom; 