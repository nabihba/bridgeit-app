import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const jobOffers = [
  {
    title: 'Microminder Cyber Security - Data Scientist',
    description: 'Microminder Cyber Security is a specialist information security consultancy offering services like penetration testing and security reviews.',
  },
  {
    title: 'Cloud Technologies - Cloud Engineer',
    description: 'Cloud Technologies is an IT services and solutions provider based in Dubai, UAE. They specialize in delivering tailored IT solutions to businesses across the UAE and the Gulf region.',
  },
  {
    title: 'G42 (Group 42) – Business Intelligence Analyst',
    description: 'A UAE-based AI and cloud computing company driving AI innovations.',
  },
];

export default function JobOffers() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.header}>Job Offers</Text>
      {jobOffers.map((offer, idx) => (
        <View key={idx} style={styles.card}>
          <Text style={styles.title}>{offer.title}</Text>
          <Text style={styles.description}>{offer.description}</Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Apply</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 16,
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    alignSelf: 'center',
    color: '#7B7A3A',
  },
  card: {
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#222',
  },
  description: {
    fontSize: 15,
    color: '#555',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#7B7A3A',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
}); 