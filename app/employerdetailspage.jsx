import React from 'react';
import { View, StyleSheet, Linking } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Appbar, Card, Text, Provider as PaperProvider, Button } from 'react-native-paper';

const green = '#217a3e';
const gold = '#d4af37';
const bg = '#f7f7f7';

const openUrl = (url) => {
  if (!url) return;
  let fixedUrl = url.trim();
  if (!/^https?:\/\//i.test(fixedUrl)) {
    fixedUrl = 'https://' + fixedUrl;
  }
  Linking.openURL(fixedUrl);
};

const EmployerDetailPage = () => {
  const {
    companyName,
    industry,
    size,
    website,
    description,
    contactPerson,
    location,
    socialLinks,
  } = useLocalSearchParams();

  return (
    <PaperProvider>
      <View style={styles.root}>
        <Appbar.Header style={{ backgroundColor: green }}>
          <Appbar.Content title="Employer Details" titleStyle={{ color: gold, fontWeight: 'bold', fontSize: 22 }} />
        </Appbar.Header>
        <View style={styles.container}>
          <Card style={styles.card}>
            <Card.Title title={companyName || 'Company'} titleStyle={{ color: green, fontWeight: 'bold', fontSize: 24 }} />
            <Card.Content>
              <Text style={styles.label}>Industry:</Text>
              <Text style={styles.value}>{industry}</Text>
              <Text style={styles.label}>Company Size:</Text>
              <Text style={styles.value}>{size}</Text>
              <Text style={styles.label}>Location:</Text>
              <Text style={styles.value}>{location}</Text>
              <Text style={styles.label}>Contact Person:</Text>
              <Text style={styles.value}>{contactPerson}</Text>
              <Text style={styles.label}>Description:</Text>
              <Text style={styles.value}>{description}</Text>
              {website ? (
                <Button
                  mode="outlined"
                  onPress={() => openUrl(website)}
                  style={{ marginTop: 8 }}
                >
                  Visit Website
                </Button>
              ) : null}
              {socialLinks && socialLinks.split(',').map((link, idx) => (
                <Button
                  key={idx}
                  mode="outlined"
                  onPress={() => openUrl(link)}
                  style={{ marginTop: 8 }}
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
    backgroundColor: bg,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
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
  linkButton: {
    marginTop: 12,
    borderRadius: 8,
    borderColor: gold,
    borderWidth: 2,
    alignSelf: 'flex-start',
  },
});

export default EmployerDetailPage; 