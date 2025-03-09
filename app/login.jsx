import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { account, database, Query } from '../services/appwrite'; // Import Query

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    console.log("Login button clicked!");
  
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }
  
    try {
      console.log("Checking for existing session...");
      
      // 1️⃣ Get active session
      const currentSession = await account.get();
      
      if (currentSession) {
        console.log("Active session found. Logging out first...");
        await account.deleteSessions(); // ✅ Clear all active sessions
      }
  
      // 2️⃣ Create a new session
      console.log("Logging in with new session...");
      const session = await account.createEmailPasswordSession(email, password);
      console.log("Login successful:", session);
  
      const userId = session.userId;
  
      // 3️⃣ Check if user is an employer or jobseeker
      const employerResponse = await database.listDocuments(
        '67bc33790033a3d1dfb7', // Database ID
        '67cc46680012c093478f', // Employer Collection ID
        [Query.equal('userId', userId)] // Correct query syntax
      );
  
      const jobseekerResponse = await database.listDocuments(
        '67bc33790033a3d1dfb7', // Database ID
        '67bc338c00003b000562', // Jobseeker Collection ID
        [Query.equal('userId', userId)] // Correct query syntax
      );
  
      if (jobseekerResponse.documents.length > 0) {
        console.log("Jobseeker detected, redirecting...");
        router.push('/jobseekerhome');
      } else if (employerResponse.documents.length > 0) {
        console.log("Employer detected, redirecting...");
        router.push('/employerhomescreen');
      } else {
        Alert.alert('Error', 'User type not recognized.');
      }
  
    } catch (error) {
      console.error("Login Error:", error);
      Alert.alert('Error', 'Invalid email or password.');
    }
  };
  
  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Login</Text>
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' },
  logo: { width: 100, height: 100, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: 'darkgreen', marginBottom: 20 },
  input: { width: '80%', padding: 10, marginBottom: 10, borderWidth: 1, borderColor: 'gray', borderRadius: 5, backgroundColor: 'white' },
});

export default Login;
