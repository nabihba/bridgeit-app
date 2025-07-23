import React from 'react';
import { View, StyleSheet, Linking } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Appbar, Card, Text, Provider as PaperProvider, Button } from 'react-native-paper';

const olive = '#7B7A3A';

const openUrl = (url) => {
  if (!url) return;
  let fixedUrl = url.trim();
  if (!/^https?:\/\//i.test(fixedUrl)) {
    fixedUrl = 'https://' + fixedUrl;
  }
  Linking.openURL(fixedUrl);
};

const JobSeekerDetailsPage = () => {
  const { name, profession, experienceYears, funFact, website, socialLinks } = useLocalSearchParams();

  return (
    <PaperProvider>
      <View style={styles.root}>
        <Appbar.Header style={{ backgroundColor: olive }}>
          <Appbar.Content title="Jobseeker Details" titleStyle={{ color: olive, fontWeight: 'bold', fontSize: 22 }} />
        </Appbar.Header>
        <View style={styles.container}>
          <Card style={styles.card}>
            <Card.Title title={name || 'Job Seeker'} titleStyle={{ color: olive, fontWeight: 'bold', fontSize: 24 }} />
            <Card.Content>
              <Text style={styles.label}>Profession:</Text>
              <Text style={styles.value}>{profession}</Text>
              <Text style={styles.label}>Experience:</Text>
              <Text style={styles.value}>{experienceYears} years</Text>
              <Text style={styles.label}>Fun Fact:</Text>
              <Text style={styles.value}>{funFact}</Text>
              {website && (
                <Button
                  mode="outlined"
                  onPress={() => openUrl(website)}
                  style={{ marginTop: 8, borderColor: olive }}
                  labelStyle={{ color: olive }}
                >
                  Visit Website
                </Button>
              )}
              {socialLinks && socialLinks.split(',').map((link, idx) => (
                <Button
                  key={idx}
                  mode="outlined"
                  onPress={() => openUrl(link)}
                  style={{ marginTop: 8, borderColor: olive }}
                  labelStyle={{ color: olive }}
                >
                  {link.trim()}
                </Button>
              ))}
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
    backgroundColor: olive,
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
    borderColor: olive,
    borderWidth: 2,
    padding: 16,
  },
  label: {
    color: olive,
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 10,
  },
  value: {
    color: olive,
    fontSize: 18,
    marginBottom: 6,
  },
});

export default JobSeekerDetailsPage;
