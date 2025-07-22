import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Card, Text, Provider as PaperProvider, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, setDoc, doc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import Toast from 'react-native-toast-message';
import * as DocumentPicker from 'expo-document-picker';
import { uploadToCloudinary } from '../services/cloudinary';

const green = '#217a3e';
const gold = '#d4af37';

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
  const [loading, setLoading] = useState(false);
  const [cvFile, setCvFile] = useState(null);
  const [cvUploading, setCvUploading] = useState(false);

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

  const pickCV = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setCvFile(result.assets[0]);
      }
    } catch (err) {
      showToast('error', 'Failed to pick CV file.');
    }
  };

  const handleSignup = async () => {
    // Validate required fields
    if (!form.email || !form.password || !form.name || !form.profession || !form.experienceYears || !form.funFact || !form.skills || !form.location) {
      showToast('error', 'Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      // 2️⃣ Create User Account in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const user = userCredential.user;
      let cvUrl = '';
      if (cvFile) {
        setCvUploading(true);
        try {
          cvUrl = await uploadToCloudinary(cvFile);
        } catch (err) {
          showToast('error', 'Failed to upload CV.');
          setCvUploading(false);
        return;
        }
        setCvUploading(false);
      }
      // 3️⃣ Store Jobseeker Data in Firestore
      // Create Firestore doc with UID as ID
      await setDoc(doc(db, 'jobseekers', user.uid), {
        ...form,
        userId: user.uid,
        email: form.email,
        verified: true,
        cvUrl,
      });
      // setUser({ uid: user.uid, type: 'jobseeker', profile: { ...form, userId: user.uid, email: form.email, verified: true, cvUrl } }); // This line was removed as per the edit hint
      showToast('success', 'Signup successful! Redirecting...');
      setTimeout(() => router.push('/jobseekerhome'), 1000);
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
            <Card.Title title="Jobseeker Signup" titleStyle={{ color: green, fontWeight: 'bold', fontSize: 26 }} />
            <Card.Content>
              <TextInput label="Email" value={form.email} onChangeText={(v) => handleChange('email', v)} keyboardType="email-address" autoCapitalize="none" style={styles.input} mode="outlined" outlineColor={gold} activeOutlineColor={green} textColor={green} theme={{ colors: { text: green, primary: gold, placeholder: gold } }} />
              <TextInput label="Password" value={form.password} onChangeText={(v) => handleChange('password', v)} secureTextEntry style={styles.input} mode="outlined" outlineColor={gold} activeOutlineColor={green} textColor={green} theme={{ colors: { text: green, primary: gold, placeholder: gold } }} />
              <TextInput label="Name" value={form.name} onChangeText={(v) => handleChange('name', v)} style={styles.input} mode="outlined" outlineColor={gold} activeOutlineColor={green} textColor={green} theme={{ colors: { text: green, primary: gold, placeholder: gold } }} />
              <TextInput label="Profession" value={form.profession} onChangeText={(v) => handleChange('profession', v)} style={styles.input} mode="outlined" outlineColor={gold} activeOutlineColor={green} textColor={green} theme={{ colors: { text: green, primary: gold, placeholder: gold } }} />
              <TextInput label="Years of Experience" value={form.experienceYears} onChangeText={(v) => handleChange('experienceYears', v)} keyboardType="numeric" style={styles.input} mode="outlined" outlineColor={gold} activeOutlineColor={green} textColor={green} theme={{ colors: { text: green, primary: gold, placeholder: gold } }} />
              <TextInput label="Fun Fact About You" value={form.funFact} onChangeText={(v) => handleChange('funFact', v)} style={styles.input} mode="outlined" outlineColor={gold} activeOutlineColor={green} textColor={green} theme={{ colors: { text: green, primary: gold, placeholder: gold } }} />
              <TextInput label="Skills (comma-separated)" value={form.skills} onChangeText={(v) => handleChange('skills', v)} style={styles.input} mode="outlined" outlineColor={gold} activeOutlineColor={green} textColor={green} theme={{ colors: { text: green, primary: gold, placeholder: gold } }} />
              <TextInput label="Location" value={form.location} onChangeText={(v) => handleChange('location', v)} style={styles.input} mode="outlined" outlineColor={gold} activeOutlineColor={green} textColor={green} theme={{ colors: { text: green, primary: gold, placeholder: gold } }} />
              <Button
                mode="outlined"
                onPress={pickCV}
                style={{ marginBottom: 8 }}
                loading={cvUploading}
                disabled={cvUploading}
              >
                {cvFile ? 'Change CV' : 'Upload CV (PDF/DOC)'}
              </Button>
              {cvFile && (
                <Text style={{ marginBottom: 8, color: 'green' }}>{cvFile.name}</Text>
              )}
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

export default JobseekerSignup;
