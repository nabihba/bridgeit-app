import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const EmployerCard = ({ companyName, industry, location }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.company}>{companyName}</Text>
      <Text style={styles.industry}>Industry: {industry}</Text>
      <Text style={styles.location}>Location: {location}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 2, height: 2 },
    elevation: 3,
  },
  company: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  industry: {
    fontSize: 14,
    color: 'gray',
  },
  location: {
    fontSize: 16,
    marginTop: 5,
  },
});

export default EmployerCard;
