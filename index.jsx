import { View, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button, Text, Provider as PaperProvider } from 'react-native-paper';

const olive = '#7B7A3A';
const bg = '#fff';

const Home = () => {
  const router = useRouter();

  return (
    <PaperProvider>
      <View style={styles.root}>
        <Card style={styles.card}>
          <Card.Content style={{ alignItems: 'center' }}>
            <Image source={require('../assets/logo.png')} style={styles.logo} />
            <Text style={styles.title}>Welcome to Bridge-IT!</Text>
            <Text style={styles.subtitle}>Join us and make your life as a west banker better!</Text>
            <Button
              mode="contained"
              style={styles.button}
              contentStyle={{ backgroundColor: olive }}
              labelStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}
              onPress={() => router.push('/signup')}
            >
              Lets Start
            </Button>
          </Card.Content>
        </Card>
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: bg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    elevation: 10,
    backgroundColor: '#fff',
    borderColor: olive,
    borderWidth: 2,
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 18,
    borderRadius: 20,
    backgroundColor: '#f2f2f2',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: olive,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    marginVertical: 8,
    borderRadius: 10,
    width: '100%',
    borderColor: olive,
    borderWidth: 2,
    marginTop: 16,
  },
});

export default Home;
