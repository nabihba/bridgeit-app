import { View, Text, Button, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const Home = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Welcome to BridgeIT</Text>

      <Button title="Employer? Sign Up" onPress={() => router.push('/signup')} />
      <Button title="Jobseeker? Sign Up" onPress={() => router.push('/jobseekersignup')} />

      <Text style={styles.prompt}>Already have an account?</Text>
      <Button title="Login" onPress={() => router.push('/login')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' },
  logo: { width: 120, height: 120, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: 'darkgreen', marginBottom: 20 },
  prompt: { marginTop: 10, fontSize: 16, color: 'gray' }
});

export default Home;
