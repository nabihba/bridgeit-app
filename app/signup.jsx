import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Card, Text, Provider as PaperProvider, ActivityIndicator } from 'react-native-paper';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import Toast from 'react-native-toast-message';

const green = '#217a3e';
const gold = '#d4af37';

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
  const [loading, setLoading] = useState(false);

  const showToast = (type, message) => {
    Toast.show({
      type,
      text1: message,
      position: 'top',
      visibilityTime: 2500,
      topOffset: 60,
    });
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSignup = async () => {
    // Validate required fields
    if (!form.email || !form.password || !form.companyName || !form.industry || !form.size || !form.contactPerson || !form.location) {
      showToast('error', 'Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      // 1️⃣ Create User Account in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const user = userCredential.user;
      // 2️⃣ Store Company Data in Firestore
      await addDoc(collection(db, 'companies'), {
          companyName: form.companyName,
          industry: form.industry,
          size: parseInt(form.size) || 0, 
          website: form.website,
          description: form.description,
          contactPerson: form.contactPerson,
          location: form.location,
          socialLinks: form.socialLinks,
        userId: user.uid, // Use the Firebase user ID
      });
      showToast('success', 'Signup successful! Redirecting...');
      setTimeout(() => router.push('/employerhomescreen'), 1000);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        showToast('error', 'This email is already registered. Please log in or use a different email.');
      } else {
        showToast('error', error.message);
      }
      console.error('Signup Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaperProvider>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: green }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Card style={styles.card}>
            <Card.Title title="Company Signup" titleStyle={{ color: green, fontWeight: 'bold', fontSize: 26 }} />
            <Card.Content>
              <TextInput label="Email" value={form.email} onChangeText={(v) => handleChange('email', v)} keyboardType="email-address" autoCapitalize="none" style={styles.input} mode="outlined" outlineColor={gold} activeOutlineColor={green} textColor={green} theme={{ colors: { text: green, primary: gold, placeholder: gold } }} />
              <TextInput label="Password" value={form.password} onChangeText={(v) => handleChange('password', v)} secureTextEntry style={styles.input} mode="outlined" outlineColor={gold} activeOutlineColor={green} textColor={green} theme={{ colors: { text: green, primary: gold, placeholder: gold } }} />
              <TextInput label="Company Name" value={form.companyName} onChangeText={(v) => handleChange('companyName', v)} style={styles.input} mode="outlined" outlineColor={gold} activeOutlineColor={green} textColor={green} theme={{ colors: { text: green, primary: gold, placeholder: gold } }} />
              <TextInput label="Industry" value={form.industry} onChangeText={(v) => handleChange('industry', v)} style={styles.input} mode="outlined" outlineColor={gold} activeOutlineColor={green} textColor={green} theme={{ colors: { text: green, primary: gold, placeholder: gold } }} />
              <TextInput label="Company Size" value={form.size} onChangeText={(v) => handleChange('size', v)} keyboardType="numeric" style={styles.input} mode="outlined" outlineColor={gold} activeOutlineColor={green} textColor={green} theme={{ colors: { text: green, primary: gold, placeholder: gold } }} />
              <TextInput label="Website" value={form.website} onChangeText={(v) => handleChange('website', v)} style={styles.input} mode="outlined" outlineColor={gold} activeOutlineColor={green} textColor={green} theme={{ colors: { text: green, primary: gold, placeholder: gold } }} />
              <TextInput label="Company Description" value={form.description} onChangeText={(v) => handleChange('description', v)} style={styles.input} mode="outlined" outlineColor={gold} activeOutlineColor={green} textColor={green} theme={{ colors: { text: green, primary: gold, placeholder: gold } }} />
              <TextInput label="Contact Person" value={form.contactPerson} onChangeText={(v) => handleChange('contactPerson', v)} style={styles.input} mode="outlined" outlineColor={gold} activeOutlineColor={green} textColor={green} theme={{ colors: { text: green, primary: gold, placeholder: gold } }} />
              <TextInput label="Location" value={form.location} onChangeText={(v) => handleChange('location', v)} style={styles.input} mode="outlined" outlineColor={gold} activeOutlineColor={green} textColor={green} theme={{ colors: { text: green, primary: gold, placeholder: gold } }} />
              <TextInput label="Social Media Links" value={form.socialLinks} onChangeText={(v) => handleChange('socialLinks', v)} style={styles.input} mode="outlined" outlineColor={gold} activeOutlineColor={green} textColor={green} theme={{ colors: { text: green, primary: gold, placeholder: gold } }} />
              <Button mode="contained" onPress={handleSignup} loading={loading} style={styles.button} contentStyle={{ backgroundColor: gold }} labelStyle={{ color: green, fontWeight: 'bold', fontSize: 18 }}>Sign Up</Button>
            </Card.Content>
          </Card>
        </ScrollView>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator animating={true} color={gold} size="large" />
          </View>
        )}
        <Toast />
      </KeyboardAvoidingView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 20,
    elevation: 8,
    backgroundColor: '#fff',
    borderColor: gold,
    borderWidth: 2,
  },
  input: {
    marginBottom: 14,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  button: {
    marginTop: 10,
    borderRadius: 10,
    borderColor: gold,
    borderWidth: 2,
    backgroundColor: gold,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});

export default signup;
