import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, ProgressBar, Provider as PaperProvider } from 'react-native-paper';

const courses = [
  {
    title: 'Agentic AI for Organizational Transformation',
    description: 'Learn how agentic AI can drive change in organizations.',
    progress: 0.5,
  },
  {
    title: 'Applied Generative AI for Digital Transformation',
    description: 'Explore generative AI applications in digital business.',
    progress: 0.8,
  },
  {
    title: 'Data Leadership - AI, Cloud and Governance',
    description: 'Master data leadership with a focus on AI, cloud, and governance.',
    progress: 0.2,
  },
];

export default function Courses() {
  return (
    <PaperProvider>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Courses</Text>
        {courses.map((course, idx) => (
          <Card key={idx} style={styles.card}>
            <Card.Title title={course.title} />
            <Card.Content>
              <Text style={styles.description}>{course.description}</Text>
              <View style={styles.progressContainer}>
                <ProgressBar progress={course.progress} color="#1976d2" style={styles.progressBar} />
                <Text style={styles.progressText}>{Math.round(course.progress * 100)}%</Text>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#1976d2',
  },
  card: {
    marginBottom: 20,
    elevation: 4,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  description: {
    fontSize: 16,
    marginBottom: 12,
    color: '#333',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
    backgroundColor: '#e3eafc',
  },
  progressText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: 'bold',
    minWidth: 60,
    textAlign: 'right',
  },
}); 