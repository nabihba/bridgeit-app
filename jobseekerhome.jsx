import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import EmployerCard from '../components/EmployerCard';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Card, Text, Provider as PaperProvider, Button, Portal, Modal, Avatar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useUser } from '../components/UserContext';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import Toast from 'react-native-toast-message';

const accent = '#1976d2'; // blue accent
const bg = '#f7f7f7';
const cardBg = '#fff';
const textMain = '#222';
const textSub = '#757575';

const JobSeekerHome = () => {
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const router = useRouter();
  const { user, setUser } = useUser();

  useEffect(() => {
    const fetchEmployers = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'companies'));
        const companies = snapshot.docs.map(doc => ({ ...doc.data(), $id: doc.id }));
        setEmployers(companies);
      } catch (error) {
        console.error('Error fetching employers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployers();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    Toast.show({ type: 'success', text1: 'Logged out successfully!' });
    router.replace('/');
  };

  const handleProfile = () => {
    setMenuVisible(false);
    if (!user || !user.profile) return;
    router.push({ pathname: '/profile', params: { ...user.profile, userId: user.uid } });
  };

  return (
    <PaperProvider>
      <View style={styles.root}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Jobseeker Home</Text>
          <TouchableOpacity onPress={() => setMenuVisible(true)} disabled={!user}>
            {user?.profile?.photoURL ? (
              <Avatar.Image size={38} source={{ uri: user.profile.photoURL }} />
            ) : (
              <Avatar.Icon size={38} icon="account-circle" color={accent} style={{ backgroundColor: '#e3eafc' }} />
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.container}>
          <Image source={require('../assets/logo.png')} style={styles.logo} />
          <Text style={styles.title}>Employers Looking for Talent</Text>
          {loading ? (
            <ActivityIndicator animating={true} color={accent} size="large" style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={employers}
              keyExtractor={(item) => item.$id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => router.push({ pathname: '/employerdetailspage', params: { ...item } })}
                  style={styles.gridItem}
                >
                  <EmployerCard {...item} cardStyle={styles.gridCard} />
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>No employers found.</Text>}
              numColumns={3}
            />
          )}
        </View>
        <Portal>
          <Modal
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            contentContainerStyle={styles.modalContainer}
          >
            <Card style={styles.menuCard}>
              <Card.Content>
                <Button 
                  mode="text" 
                  onPress={handleProfile}
                  style={styles.menuButton}
                  labelStyle={{ color: accent, fontSize: 16 }}
                >
                  Profile
                </Button>
                <Button 
                  mode="text" 
                  onPress={handleLogout}
                  style={styles.menuButton}
                  labelStyle={{ color: accent, fontSize: 16 }}
                >
                  Logout
                </Button>
              </Card.Content>
            </Card>
          </Modal>
        </Portal>
      </View>
      <Toast />
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
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: textMain,
    textAlign: 'center',
    marginBottom: 18,
  },
  listContent: {
    paddingBottom: 30,
    width: '100%',
    alignItems: 'center',
  },
  emptyText: {
    color: textSub,
    fontSize: 18,
    textAlign: 'center',
    marginTop: 40,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 20,
  },
  menuCard: {
    backgroundColor: cardBg,
    borderRadius: 12,
    elevation: 8,
    minWidth: 150,
  },
  menuButton: {
    marginVertical: 4,
  },
  gridItem: {
    flex: 1,
    margin: 6,
    minWidth: 0,
  },
  gridCard: {
    width: '100%',
    minWidth: 100,
    maxWidth: 180,
    height: 120,
    borderRadius: 16,
    backgroundColor: cardBg,
    borderColor: accent,
    borderWidth: 2,
    elevation: 4,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default JobSeekerHome;
