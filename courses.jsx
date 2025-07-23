import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, ProgressBar, Provider as PaperProvider } from 'react-native-paper';

const olive = '#7B7A3A';
const yellow = '#FFD600';

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
          <Card key={idx} style={[styles.card, { borderColor: yellow }]}> {/* Yellow border */}
            <Card.Title title={course.title} />
            <Card.Content>
              <View style={styles.badgeRow}>
                <Text style={[styles.badge, { backgroundColor: yellow, color: olive }]}> {/* Yellow badge */}
                  {course.progress >= 1 ? 'Completed' : 'In Progress'}
                </Text>
              </View>
              <Text style={styles.description}>{course.description}</Text>
              <View style={styles.progressContainer}>
                <ProgressBar progress={course.progress} color={yellow} style={styles.progressBar} /> {/* Yellow progress */}
                <Text style={[styles.progressText, { color: olive }]}>{Math.round(course.progress * 100)}%</Text>
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
    color: olive,
    letterSpacing: 0.5,
  },
  card: {
    marginBottom: 20,
    elevation: 4,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 2,
    padding: 16,
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
    color: olive,
    fontWeight: 'bold',
    minWidth: 60,
    textAlign: 'right',
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 6,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    fontWeight: 'bold',
    fontSize: 13,
    overflow: 'hidden',
  },
}); 