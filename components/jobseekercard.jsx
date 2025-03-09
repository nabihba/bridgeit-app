import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const jobseekercard = ({ seeker }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{seeker.name}</Text>
      <Text>Profession: {seeker.profession}</Text>
      <Text>Experience: {seeker.experienceYears} years</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { padding: 10, margin: 10, backgroundColor: '#ddd', borderRadius: 5 },
  name: { fontWeight: 'bold', fontSize: 16 },
});

export default jobseekercard;
