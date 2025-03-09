import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { account, database } from '../services/appwrite';

const JobseekerSignup = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    profession: '',
    experienceYears: '',
    funFact: '',
    skills: '', // Skills as a comma-separated string
    location: '',
  });

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSignup = async () => {
    try {
      // 1️⃣ Ensure all fields are filled
      if (!form.email || !form.password || !form.name || !form.profession || !form.experienceYears || !form.funFact || !form.skills || !form.location) {
        Alert.alert('Error', 'Please fill in all fields.');
        return;
      }

      // 2️⃣ Create User Account in Appwrite Auth
      const user = await account.create('unique()', form.email, form.password);

      // 3️⃣ Store Jobseeker Data in Appwrite Database
      await database.createDocument(
        '67bc33790033a3d1dfb7', // Database ID
        '67bc338c00003b000562', // Jobseekers Collection ID
        'unique()',
        {
          name: form.name,
          profession: form.profession,
          experienceYears: parseFloat(form.experienceYears) || 0, // Convert to number
          funFact: form.funFact,
          skills: form.skills.split(',').map(skill => skill.trim()), // Convert skills to an array
          location: form.location,
          userId: user.$id, // Store user ID
        }
      );

      Alert.alert('Signup successful! Redirecting...');
      router.push('/jobseekerhome'); // Redirect to login

    } catch (error) {
      console.error('Signup Error:', error);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Jobseeker Signup</Text>

      <TextInput style={styles.input} placeholder="Email" onChangeText={(value) => handleChange('email', value)} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry onChangeText={(value) => handleChange('password', value)} />
      <TextInput style={styles.input} placeholder="Name" onChangeText={(value) => handleChange('name', value)} />
      <TextInput style={styles.input} placeholder="Profession" onChangeText={(value) => handleChange('profession', value)} />
      <TextInput style={styles.input} placeholder="Years of Experience" keyboardType="numeric" onChangeText={(value) => handleChange('experienceYears', value)} />
      <TextInput style={styles.input} placeholder="Fun Fact About You" onChangeText={(value) => handleChange('funFact', value)} />
      <TextInput style={styles.input} placeholder="Skills (comma-separated)" onChangeText={(value) => handleChange('skills', value)} />
      <TextInput style={styles.input} placeholder="Location" onChangeText={(value) => handleChange('location', value)} />

      <Button title="Sign Up" onPress={handleSignup} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#F9F9F9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: 'white',
  },
});

export default JobseekerSignup;
