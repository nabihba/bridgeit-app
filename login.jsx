import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Card, Text, useTheme, Provider as PaperProvider } from 'react-native-paper';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useUser } from '../components/UserContext';

const olive = '#7B7A3A';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useUser();

  const showToast = (type, message) => {
    Toast.show({
      type,
      text1: message,
      position: 'top',
      visibilityTime: 2500,
      topOffset: 60,
    });
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showToast('error', 'Please enter both email and password.');
      return;
    }
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Jobseeker check
      const jobseekerQuery = query(collection(db, 'jobseekers'), where('userId', '==', user.uid));
      const jobseekerSnapshot = await getDocs(jobseekerQuery);
      // Company check
      const companyQuery = query(collection(db, 'companies'), where('userId', '==', user.uid));
      const companySnapshot = await getDocs(companyQuery);
      if (!jobseekerSnapshot.empty) {
        const jobseeker = jobseekerSnapshot.docs[0].data();
        setUser({ uid: user.uid, type: 'jobseeker', profile: { ...jobseeker, userId: user.uid, email: user.email } });
        showToast('success', `Welcome, ${jobseeker.name}!`);
        setTimeout(() => router.push('/jobseekerhome'), 1000);
      } else if (!companySnapshot.empty) {
        const company = companySnapshot.docs[0].data();
        setUser({ uid: user.uid, type: 'employer', profile: { ...company, userId: user.uid, email: user.email } });
        showToast('success', `Welcome, ${company.companyName}!`);
        setTimeout(() => router.push('/employerhomescreen'), 1000);
      } else {
        showToast('error', 'No matching user found.');
      }
    } catch (error) {
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        showToast('error', 'Invalid email or password.');
      } else {
        showToast('error', 'Something went wrong. Please try again.');
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaperProvider>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: olive }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <Card style={styles.card}>
            <Card.Title title="Login" titleStyle={{ color: olive, fontWeight: 'bold', fontSize: 28 }} />
            <Card.Content>
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                mode="outlined"
                outlineColor={olive}
                activeOutlineColor={olive}
                textColor={olive}
                theme={{ colors: { text: olive, primary: olive, placeholder: olive } }}
              />
              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
                mode="outlined"
                outlineColor={olive}
                activeOutlineColor={olive}
                textColor={olive}
                theme={{ colors: { text: olive, primary: olive, placeholder: olive } }}
              />
              <Button
                mode="contained"
                onPress={handleLogin}
                loading={loading}
                style={styles.button}
                contentStyle={{ backgroundColor: olive }}
                labelStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}
              >
                Login
              </Button>
            </Card.Content>
          </Card>
        </View>
        <Toast />
      </KeyboardAvoidingView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  input: {
    marginBottom: 18,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  button: {
    marginTop: 10,
    borderRadius: 10,
    borderColor: olive,
    borderWidth: 2,
    backgroundColor: olive,
  },
});

export default Login;
