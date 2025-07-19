import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Menu } from 'react-native';
import JobSeekerCard from '../components/jobseekercard';
import FilterBar from '../components/Filterbar';
import { useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Appbar, Card, Text, Provider as PaperProvider } from 'react-native-paper';
import { useUser } from '../components/UserContext';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import Toast from 'react-native-toast-message';

const green = '#217a3e';
const gold = '#d4af37';

// Mocked user info for demonstration (replace with real user context)
const mockUser = {
  companyName: 'Acme Corp',
  email: 'employer@acme.com',
  location: 'Jerusalem',
};

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
        const seekers = snapshot.docs.map(doc => ({ ...doc.data(), $id: doc.id }));
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

  return (
    <PaperProvider>
      <View style={styles.root}>
        <Appbar.Header style={{ backgroundColor: green }}>
          <Appbar.Content title="Employers Home" titleStyle={{ color: gold, fontWeight: 'bold', fontSize: 22 }} />
          {user && (
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <Appbar.Action icon="account-circle" color={gold} onPress={() => setMenuVisible(true)} />
              }
            >
              <Menu.Item onPress={() => router.push({ pathname: '/profile', params: { ...user.profile, userId: user.uid } })} title="Profile" />
              <Menu.Item onPress={handleLogout} title="Logout" />
            </Menu>
          )}
        </Appbar.Header>
        <View style={styles.container}>
          <Image source={require('../assets/logo.png')} style={styles.logo} />
          <Card style={styles.filterCard}>
            <FilterBar onApplyFilters={applyFilters} />
          </Card>
          {loading ? (
            <ActivityIndicator animating={true} color={green} size="large" style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={filteredSeekers}
              keyExtractor={(item) => item.$id}
              contentContainerStyle={{ paddingBottom: 30 }}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => router.push({ pathname: '/jobseekerdetailspage', params: { ...item } })}>
                  <Card style={styles.seekerCard}>
                    <JobSeekerCard seeker={item} />
                  </Card>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>No jobseekers found.</Text>}
            />
          )}
        </View>
      </View>
      <Toast />
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: green,
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
    backgroundColor: '#fff',
    borderColor: gold,
    borderWidth: 2,
    elevation: 4,
    padding: 8,
  },
  seekerCard: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderColor: gold,
    borderWidth: 2,
    elevation: 4,
    padding: 8,
  },
  emptyText: {
    color: gold,
    fontSize: 18,
    textAlign: 'center',
    marginTop: 40,
  },
});

export default EmployerHomeScreen;
