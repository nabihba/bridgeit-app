import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import EmployerCard from '../components/EmployerCard';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Appbar, Card, Text, Provider as PaperProvider, Button, Portal, Modal } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useUser } from '../components/UserContext';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import Toast from 'react-native-toast-message';

const green = '#217a3e';
const gold = '#d4af37';
const bg = '#f7f7f7';

// Mocked user info for demonstration (replace with real user context)
const mockUser = {
  name: 'John Doe',
  email: 'john@example.com',
  profession: 'Software Engineer',
  location: 'Ramallah',
};

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
    router.push({ pathname: '/profile', params: { ...user.profile, userId: user.uid } });
  };

  return (
    <PaperProvider>
      <View style={styles.root}>
        <Appbar.Header style={{ backgroundColor: green }}>
          <Appbar.Content title="Jobseeker Home" titleStyle={{ color: gold, fontWeight: 'bold', fontSize: 22 }} />
          {user && (
            <Appbar.Action icon="account-circle" color={gold} onPress={() => setMenuVisible(true)} />
          )}
        </Appbar.Header>
        <View style={styles.container}>
          <Image source={require('../assets/logo.png')} style={styles.logo} />
          <Text style={styles.title}>Employers Looking for Talent</Text>
          {loading ? (
            <ActivityIndicator animating={true} color={green} size="large" style={{ marginTop: 40 }} />
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
                >
                  <Card style={styles.employerCard}>
                    <Card.Title
                      title={item.companyName}
                      subtitle={item.industry}
                      titleStyle={{ color: green, fontWeight: 'bold', fontSize: 22 }}
                      subtitleStyle={{ color: gold, fontSize: 16 }}
                    />
                    <Card.Content>
                      <Text style={styles.cardText}>Location: {item.location}</Text>
                      <Text style={styles.cardText}>Size: {item.size}</Text>
                    </Card.Content>
                  </Card>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>No employers found.</Text>}
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
                  labelStyle={{ color: green, fontSize: 16 }}
                >
                  Profile
                </Button>
                <Button 
                  mode="text" 
                  onPress={handleLogout}
                  style={styles.menuButton}
                  labelStyle={{ color: green, fontSize: 16 }}
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
    fontSize: 28,
    fontWeight: 'bold',
    color: green,
    textAlign: 'center',
    marginBottom: 18,
  },
  listContent: {
    paddingBottom: 30,
    width: '100%',
    alignItems: 'center',
  },
  employerCard: {
    marginBottom: 20,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderColor: gold,
    borderWidth: 2,
    elevation: 6,
    padding: 12,
    width: 340,
    maxWidth: '95%',
    alignSelf: 'center',
  },
  cardText: {
    fontSize: 16,
    color: green,
    marginBottom: 4,
  },
  emptyText: {
    color: gold,
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
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 8,
    minWidth: 150,
  },
  menuButton: {
    marginVertical: 4,
  },
});

export default JobSeekerHome;
