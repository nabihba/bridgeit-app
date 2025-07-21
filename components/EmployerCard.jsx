import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import { useUser } from '../components/UserContext';
import { useRouter } from 'expo-router';
import { db } from '../services/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

const green = '#217a3e';
const gold = '#d4af37';

const EmployerCard = ({ companyName, industry, location, userId }) => {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const startChat = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Check if chat already exists
      const participants = [user.uid, userId].sort();
      const q = query(
        collection(db, 'chats'),
        where('participants', '==', participants)
      );
      const snapshot = await getDocs(q);
      let chatId;
      if (!snapshot.empty) {
        chatId = snapshot.docs[0].id;
      } else {
        // Create new chat
        const chatDoc = await addDoc(collection(db, 'chats'), {
          participants,
          title: `${user.profile.name || user.profile.companyName || 'User'} & ${companyName}`,
          lastMessage: '',
          lastMessageAt: serverTimestamp(),
        });
        chatId = chatDoc.id;
      }
      router.push({ pathname: '/chatRoom', params: { chatId } });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.companyName}>{companyName}</Text>
        <Text style={styles.industry}>{industry}</Text>
        <Text style={styles.location}>{location}</Text>
        {user && user.type === 'jobseeker' && user.uid !== userId && (
          <Button
            mode="contained"
            style={styles.button}
            contentStyle={{ backgroundColor: gold }}
            labelStyle={{ color: green, fontWeight: 'bold' }}
            onPress={startChat}
            loading={loading}
            disabled={loading}
          >
            Message
          </Button>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderColor: gold,
    borderWidth: 2,
    elevation: 4,
    padding: 8,
  },
  companyName: {
    color: green,
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 4,
  },
  industry: {
    color: gold,
    fontSize: 15,
    marginBottom: 2,
  },
  location: {
    color: green,
    fontSize: 14,
    marginBottom: 8,
  },
  button: {
    marginTop: 8,
    borderRadius: 10,
    borderColor: gold,
    borderWidth: 2,
    backgroundColor: gold,
  },
});

export default EmployerCard;
