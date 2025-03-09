import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { database } from '../services/appwrite';
import JobSeekerCard from '../components/jobseekercard';
import FilterBar from '../components/Filterbar';
import { useRouter } from 'expo-router';
const router = useRouter();

const EmployerHomeScreen = ({ navigation }) => {
  const [jobSeekers, setJobSeekers] = useState([]);
  const [filteredSeekers, setFilteredSeekers] = useState([]);
  

  useEffect(() => {
    const fetchJobSeekers = async () => {
      try {
        const response = await database.listDocuments('67bc33790033a3d1dfb7', 'jobseekers');
        setJobSeekers(response.documents);
        setFilteredSeekers(response.documents);
      } catch (error) {
        console.error(error);
      }
   }});

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

  return (
    <View style={styles.container}>
      {/* Logo Placeholder */}
      <Image source={require('../assets/logo.png')} style={styles.logo} />

      <FilterBar onApplyFilters={applyFilters} />

      <FlatList
      
        data={filteredSeekers}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('JobSeekerDetails', { seeker: item })}>
            <JobSeekerCard seeker={item} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0', paddingTop: 20 },
  logo: { width: 100, height: 100, alignSelf: 'center', marginBottom: 20 }
});

export default EmployerHomeScreen;
