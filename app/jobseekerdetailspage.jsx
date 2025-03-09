import React from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

const JobSeekerDetailsPage = () => {
  const { name, profession, experienceYears, funFact } = useLocalSearchParams();

  return (
    <View>
      <Text>Job Seeker Details</Text>
      <Text>Name: {name}</Text>
      <Text>Profession: {profession}</Text>
      <Text>Experience: {experienceYears} years</Text>
      <Text>Fun Fact: {funFact}</Text>
    </View>
  );
};

export default JobSeekerDetailsPage;
