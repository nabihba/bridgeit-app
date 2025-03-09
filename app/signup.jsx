import React, { useState } from 'react';
import { account, database } from '../services/appwrite'; 
import { useRouter } from 'expo-router';
import { Alert, View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';

const signup = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    email: '',
    password: '',
    companyName: '',
    industry: '',
    size: '',
    website: '',
    description: '',
    contactPerson: '',
    location: '',
    socialLinks: '',
  });

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSignup = async () => {
    try {
      // 1️⃣ Create User Account in Appwrite Auth
      const user = await account.create('unique()', form.email, form.password);
      
      // 2️⃣ Store Company Data in the Database
      await database.createDocument(
        '67bc33790033a3d1dfb7', // Your Database ID
        '67cc46680012c093478f', // Your Companies Collection ID
        'unique()', 
        {
          companyName: form.companyName,
          industry: form.industry,
          size: parseInt(form.size) || 0, 
          website: form.website,
          description: form.description,
          contactPerson: form.contactPerson,
          location: form.location,
          socialLinks: form.socialLinks,
          userId: user.$id,  // Use the unique user ID
        }
      );

      Alert.alert('Signup successful! Redirecting...');
      router.push('/employerhomescreen'); // Redirect to login page

    } catch (error) {
      console.error('Signup Error:', error);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Company Signup</Text>

      <TextInput style={styles.input} placeholder="Email" onChangeText={(value) => handleChange('email', value)} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry onChangeText={(value) => handleChange('password', value)} />

      <TextInput style={styles.input} placeholder="Company Name" onChangeText={(value) => handleChange('companyName', value)} />
      <TextInput style={styles.input} placeholder="Industry" onChangeText={(value) => handleChange('industry', value)} />
      <TextInput style={styles.input} placeholder="Company Size" keyboardType="numeric" onChangeText={(value) => handleChange('size', value)} />
      <TextInput style={styles.input} placeholder="Website" onChangeText={(value) => handleChange('website', value)} />
      <TextInput style={styles.input} placeholder="Company Description" onChangeText={(value) => handleChange('description', value)} />
      <TextInput style={styles.input} placeholder="Contact Person" onChangeText={(value) => handleChange('contactPerson', value)} />
      <TextInput style={styles.input} placeholder="Location" onChangeText={(value) => handleChange('location', value)} />
      <TextInput style={styles.input} placeholder="Social Media Links" onChangeText={(value) => handleChange('socialLinks', value)} />

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

export default signup;
