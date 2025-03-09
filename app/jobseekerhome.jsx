import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Image, StyleSheet, Text } from 'react-native';
import { database } from '../services/appwrite';
import EmployerCard from '../components/EmployerCard';

const JobSeekerHome = () => {
  const [employers, setEmployers] = useState([]);

  useEffect(() => {
    const fetchEmployers = async () => {
      try {
        const response = await database.listDocuments('67bc33790033a3d1dfb7', '67cc46680012c093478f');
        setEmployers(response.documents);
      } catch (error) {
        console.error('Error fetching employers:', error);
      }
    };
    fetchEmployers();
  }, []);

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Employers Looking for Talent</Text>

      <FlatList
        data={employers}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <TouchableOpacity>
            <EmployerCard companyName={item.companyName} industry={item.industry} location={item.location} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0', paddingTop: 20 },
  logo: { width: 100, height: 100, alignSelf: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
});

export default JobSeekerHome;
