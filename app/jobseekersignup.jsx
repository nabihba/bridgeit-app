import React, { useState } from 'react';
import { View, Text, ScrollView, Button } from 'react-native';
import { TextInput, Provider, RadioButton } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import Toast from 'react-native-toast-message';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { addDoc, collection } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { uploadToAppwrite } from '../services/appwrite';
import { useRouter } from 'expo-router';

export default function SignupScreen() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    goal: '',
    location: '',
    experience: '',
    field: '',
    languages: '',
    resume: null,
  });
  const [step, setStep] = useState(0);
  const router = useRouter();

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const pickResume = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
    if (result.assets && result.assets.length > 0) {
      const file = result.assets[0];
      handleChange('resume', file);
    }
  };

  const handleSubmit = async () => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, form.email, form.password);

      let resumeUrl = '';
      if (form.resume) {
        const fileObj = {
          name: form.resume.name,
          type: form.resume.mimeType || 'application/pdf',
          uri: form.resume.uri,
        };
        const response = await fetch(fileObj.uri);
        const blob = await response.blob();
        const { url } = await uploadToAppwrite(blob);
        resumeUrl = url;
      }

      await addDoc(collection(db, 'users'), {
        uid: user.uid,
        ...form,
        resumeUrl,
      });

      Toast.show({ type: 'success', text1: 'Signup successful' });
      router.push('/jobseekerhome');
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Signup failed', text2: error.message });
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <>
            <TextInput
              label="Full Name"
              name="fullName"
              value={form.fullName}
              onChangeText={(text) => handleChange('fullName', text)}
              autoComplete="name"
              mode="outlined"
            />
            <TextInput
              label="Email"
              name="email"
              value={form.email}
              onChangeText={(text) => handleChange('email', text)}
              autoComplete="email"
              mode="outlined"
            />
            <TextInput
              label="Password"
              name="password"
              value={form.password}
              onChangeText={(text) => handleChange('password', text)}
              secureTextEntry
              autoComplete="new-password"
              mode="outlined"
            />
          </>
        );
      case 1:
        return (
          <>
            <Text>What's your main goal?</Text>
            <RadioButton.Group
              onValueChange={(value) => handleChange('goal', value)}
              value={form.goal}
            >
              <RadioButton.Item label="Find a job" value="job" />
              <RadioButton.Item label="Hire talent" value="hire" />
              <RadioButton.Item label="Explore opportunities" value="explore" />
            </RadioButton.Group>
          </>
        );
      case 2:
        return (
          <>
            <TextInput
              label="Where in the West Bank are you located?"
              name="location"
              value={form.location}
              onChangeText={(text) => handleChange('location', text)}
              autoComplete="address-level2"
              mode="outlined"
            />
            <TextInput
              label="Describe your prior experience"
              name="experience"
              value={form.experience}
              onChangeText={(text) => handleChange('experience', text)}
              autoComplete="off"
              multiline
              mode="outlined"
            />
          </>
        );
      case 3:
        return (
          <>
            <TextInput
              label="What field are you in?"
              name="field"
              value={form.field}
              onChangeText={(text) => handleChange('field', text)}
              autoComplete="off"
              mode="outlined"
            />
            <TextInput
              label="Languages spoken"
              name="languages"
              value={form.languages}
              onChangeText={(text) => handleChange('languages', text)}
              autoComplete="off"
              mode="outlined"
            />
          </>
        );
      case 4:
        return (
          <>
            <Button title="Upload Resume/CV" onPress={pickResume} />
            {form.resume && <Text>Selected: {form.resume.name}</Text>}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Provider>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontSize: 24, marginBottom: 20 }}>Signup - Step {step + 1}</Text>
        {renderStep()}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
          {step > 0 && <Button title="Back" onPress={() => setStep(step - 1)} />}
          {step < 4 ? (
            <Button title="Next" onPress={() => setStep(step + 1)} />
          ) : (
            <Button title="Submit" onPress={handleSubmit} />
          )}
        </View>
      </ScrollView>
    </Provider>
  );
}
