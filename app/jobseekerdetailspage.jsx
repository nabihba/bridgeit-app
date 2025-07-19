import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Appbar, Card, Text, Provider as PaperProvider } from 'react-native-paper';

const green = '#217a3e';
const gold = '#d4af37';

const JobSeekerDetailsPage = () => {
  const { name, profession, experienceYears, funFact } = useLocalSearchParams();

  return (
    <PaperProvider>
      <View style={styles.root}>
        <Appbar.Header style={{ backgroundColor: green }}>
          <Appbar.Content title="Jobseeker Details" titleStyle={{ color: gold, fontWeight: 'bold', fontSize: 22 }} />
        </Appbar.Header>
        <View style={styles.container}>
          <Card style={styles.card}>
            <Card.Title title={name || 'Job Seeker'} titleStyle={{ color: green, fontWeight: 'bold', fontSize: 24 }} />
            <Card.Content>
              <Text style={styles.label}>Profession:</Text>
              <Text style={styles.value}>{profession}</Text>
              <Text style={styles.label}>Experience:</Text>
              <Text style={styles.value}>{experienceYears} years</Text>
              <Text style={styles.label}>Fun Fact:</Text>
              <Text style={styles.value}>{funFact}</Text>
            </Card.Content>
          </Card>
        </View>
      </View>
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
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    elevation: 8,
    backgroundColor: '#fff',
    borderColor: gold,
    borderWidth: 2,
    padding: 16,
  },
  label: {
    color: gold,
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 10,
  },
  value: {
    color: green,
    fontSize: 18,
    marginBottom: 6,
  },
});

export default JobSeekerDetailsPage;
