import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { account, database } from '../../services/appwrite';

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }
    
    try {
      // Authenticate User
      await account.createEmailSession(email, password);

      // Get Logged-in User's ID
      const user = await account.get();
      console.log('User ID:', user.$id);

      // Fetch User Data from Database
      const userData = await database.getDocument(
        '67bc33790033a3d1dfb7', // Database ID
        '67bc338c00003b000562', // Collection ID
        user.$id                // Document ID
      );

      console.log('User Data:', userData);
      Alert.alert('Success', Welcome, ${userData.name}!);

      // Navigate to Home Page
      navigation.navigate('EmployerHome', { user: userData });
    } catch (error) {
      if (error.code === 401) {
        Alert.alert('Error', 'Invalid email or password.');
      } else {
        Alert.alert('Error', 'Something went wrong. Please try again.');
      }
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
});

export default Login;