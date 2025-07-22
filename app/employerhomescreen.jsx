import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import JobSeekerCard from '../components/jobseekercard';
import FilterBar from '../components/Filterbar';
import { useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Card, Text, Provider as PaperProvider, Button, Portal, Modal, Avatar } from 'react-native-paper';
import { useUser } from '../components/UserContext';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import Toast from 'react-native-toast-message';

const accent = '#11523D'; // blue accent
const bg = '#f7f7f7';
const cardBg = '#fff';
const textMain = '#222';
const textSub = '#757575';

const EmployerHomeScreen = () => {
  const [jobSeekers, setJobSeekers] = useState([]);
  const [filteredSeekers, setFilteredSeekers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const router = useRouter();
  const { user, setUser } = useUser();

  useEffect(() => {
    const fetchJobSeekers = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'jobseekers'));
        // Filter out deleted jobseekers
        const seekers = snapshot.docs
          .map(doc => ({ ...doc.data(), $id: doc.id }))
          .filter(seeker => !seeker.deleted);
        setJobSeekers(seekers);
        setFilteredSeekers(seekers);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobSeekers();
  }, []);

  const applyFilters = (filters) => {
    let filtered = jobSeekers;
    if (filters.profession) {
      filtered = filtered.filter(seeker => seeker.profession.includes(filters.profession));
    }
    if (filters.experience) {
      filtered = filtered.filter(seeker => seeker.experienceYears >= filters.experience);
    }
    setFilteredSeekers(filtered);
  };

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
          <Text style={styles.headerTitle}>Employer Home</Text>
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
          <Card style={styles.filterCard}>
            <FilterBar onApplyFilters={applyFilters} />
          </Card>
          {loading ? (
            <ActivityIndicator animating={true} color={accent} size="large" style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={filteredSeekers}
              keyExtractor={(item) => item.$id}
              contentContainerStyle={{ paddingBottom: 30, ...styles.listContent }}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => router.push({ pathname: '/jobseekerdetailspage', params: { ...item } })} style={styles.gridItem}>
                  <Card style={styles.gridCard}>
                    <JobSeekerCard seeker={item} cardStyle={styles.gridCard} />
                  </Card>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>No jobseekers found.</Text>}
              numColumns={3}
              columnWrapperStyle={styles.gridRow}
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
  filterCard: {
    width: '100%',
    maxWidth: 500,
    marginBottom: 18,
    borderRadius: 16,
    backgroundColor: cardBg,
    borderColor: accent,
    borderWidth: 2,
    elevation: 4,
    padding: 8,
  },
  seekerCard: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: cardBg,
    borderColor: accent,
    borderWidth: 2,
    elevation: 4,
    padding: 8,
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
  listContent: {
    paddingHorizontal: 6,
  },
  gridItem: {
    flex: 1,
    margin: 10,
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
  verifyBanner: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeeba',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  verifyText: {
    color: '#856404',
    fontWeight: 'bold',
    flex: 1,
    marginRight: 12,
  },
  verifyButton: {
    backgroundColor: accent,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 18,
  },
});

export default EmployerHomeScreen;
