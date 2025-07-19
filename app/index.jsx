import { View, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Button, Text, Provider as PaperProvider } from 'react-native-paper';

const green = '#217a3e';
const gold = '#d4af37';
const bg = '#f7f7f7';

const Home = () => {
  const router = useRouter();

  return (
    <PaperProvider>
      <View style={styles.root}>
        <Card style={styles.card}>
          <Card.Content style={{ alignItems: 'center' }}>
            <Image source={require('../assets/logo.png')} style={styles.logo} />
            <Text style={styles.title}>Welcome to BridgeIT</Text>
            <Text style={styles.subtitle}>Connecting job seekers and employers with opportunity</Text>
            <Button
              mode="contained"
              style={styles.button}
              contentStyle={{ backgroundColor: green }}
              labelStyle={{ color: gold, fontWeight: 'bold', fontSize: 18 }}
              onPress={() => router.push('/signup')}
            >
              Employer? Sign Up
            </Button>
            <Button
              mode="contained"
              style={styles.button}
              contentStyle={{ backgroundColor: gold }}
              labelStyle={{ color: green, fontWeight: 'bold', fontSize: 18 }}
              onPress={() => router.push('/jobseekersignup')}
            >
              Jobseeker? Sign Up
            </Button>
            <Text style={styles.prompt}>Already have an account?</Text>
            <Button
              mode="outlined"
              style={styles.loginButton}
              labelStyle={{ color: green, fontWeight: 'bold', fontSize: 18 }}
              onPress={() => router.push('/login')}
            >
              Login
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
    borderColor: gold,
    borderWidth: 2,
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 18,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: green,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: gold,
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    marginVertical: 8,
    borderRadius: 10,
    width: '100%',
    borderColor: gold,
    borderWidth: 2,
  },
  prompt: {
    marginTop: 18,
    fontSize: 16,
    color: green,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  loginButton: {
    marginTop: 8,
    borderRadius: 10,
    borderColor: green,
    borderWidth: 2,
    width: '100%',
  },
});

export default Home;
