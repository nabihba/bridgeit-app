import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Text as RNText } from 'react-native';
import { TextInput, Button, Card, Text, Provider as PaperProvider, ActivityIndicator, Checkbox, RadioButton } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import * as DocumentPicker from 'expo-document-picker';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const olive = '#7B7A3A';
const yellow = '#FFD600';

const initialForm = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  age: '',
  q1: '',
  region: '',
  q2: '',
  q3: [],
  q4: [],
  files: [],
};

const q1Options = [
  'Looking for a new career',
  'Continuing my education',
  'Finding a job in my field of expertise',
  'Receiving new certification',
  'Other',
];
const q2Options = [
  "Bachelor's or Undergraduate",
  'Higher form of Education',
  'Field Experience',
  'High school Diploma',
  'Other',
];
const q3Options = [
  'IT- ICT',
  'Data Analysis',
  'Cybersecurity',
  'Social & behavioural sci.',
  'AI Consulting',
  'Other',
];
const q4Options = [
  'Arabic',
  'English',
  'French',
  'Other',
];

export default function JobseekerSignup() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
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

  // Handlers for form fields
  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const handleCheckbox = (key, value) => {
    setForm((prev) => {
      const arr = prev[key];
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  };

  // File picker for multiple files
  const pickFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        multiple: true,
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setForm((prev) => ({ ...prev, files: result.assets }));
      }
    } catch (err) {
      showToast('error', 'Failed to pick files.');
    }
  };

  // Validation for each step
  const validateStep1 = () => {
    if (!form.email || !form.password || !form.firstName || !form.lastName || !form.age) {
      showToast('error', 'Please fill in all fields.');
      return false;
    }
    if (isNaN(Number(form.age)) || Number(form.age) < 18) {
      showToast('error', 'Age must be 18 or older.');
      return false;
    }
    return true;
  };
  const validateStep2 = () => {
    if (!form.q1 || !form.region || !form.q2 || form.q3.length === 0 || form.q4.length === 0) {
      showToast('error', 'Please answer all questions.');
      return false;
    }
    return true;
  };
  const validateStep3 = () => {
    if (!form.files || form.files.length === 0) {
      showToast('error', 'Please upload at least one file.');
      return false;
    }
    return true;
  };

  // Final submit
  const handleSubmit = async () => {
    if (!validateStep3()) return;
    setLoading(true);
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const user = userCredential.user;
      // Prepare data for Firestore
      const data = {
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        age: form.age,
        lookingFor: form.q1,
        region: form.region,
        priorExperience: form.q2,
        experienceFields: form.q3,
        languages: form.q4,
        // File upload logic would go here (Appwrite/Cloudinary)
        // For now, just store file names
        files: form.files.map(f => ({ name: f.name, uri: f.uri })),
        userId: user.uid,
        verified: false,
      };
      await setDoc(doc(db, 'jobseekers', user.uid), data);
      showToast('success', 'Signup successful!');
      // Redirect or reset as needed
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

  // Step content
  const renderStep1 = () => (
    <Card style={styles.card}>
      <Card.Title title="Sign Up" titleStyle={styles.cardTitle} />
      <Card.Content>
        <TextInput label="Email" value={form.email} onChangeText={v => handleChange('email', v)} keyboardType="email-address" autoCapitalize="none" style={styles.input} mode="outlined" outlineColor={olive} activeOutlineColor={olive} textColor={olive} theme={{ colors: { text: olive, primary: olive, placeholder: olive } }} />
        <TextInput label="Password" value={form.password} onChangeText={v => handleChange('password', v)} secureTextEntry style={styles.input} mode="outlined" outlineColor={olive} activeOutlineColor={olive} textColor={olive} theme={{ colors: { text: olive, primary: olive, placeholder: olive } }} />
        <TextInput label="First Name" value={form.firstName} onChangeText={v => handleChange('firstName', v)} style={styles.input} mode="outlined" outlineColor={olive} activeOutlineColor={olive} textColor={olive} theme={{ colors: { text: olive, primary: olive, placeholder: olive } }} />
        <TextInput label="Last Name" value={form.lastName} onChangeText={v => handleChange('lastName', v)} style={styles.input} mode="outlined" outlineColor={olive} activeOutlineColor={olive} textColor={olive} theme={{ colors: { text: olive, primary: olive, placeholder: olive } }} />
        <TextInput label="Age" value={form.age} onChangeText={v => handleChange('age', v)} keyboardType="numeric" style={styles.input} mode="outlined" outlineColor={olive} activeOutlineColor={olive} textColor={olive} theme={{ colors: { text: olive, primary: olive, placeholder: olive } }} />
      </Card.Content>
      <Card.Actions style={styles.actions}>
        <Button mode="contained" style={styles.nextButton} onPress={() => { if (validateStep1()) setStep(2); }}>Next</Button>
      </Card.Actions>
    </Card>
  );

  const renderStep2 = () => (
    <Card style={styles.card}>
      <Card.Title title="Questions" titleStyle={styles.cardTitle} />
      <Card.Content>
        <Text style={styles.question}>Hey there, what are you looking for?</Text>
        <RadioButton.Group onValueChange={v => handleChange('q1', v)} value={form.q1}>
          {q1Options.map(opt => (
            <RadioButton.Item key={opt} label={opt} value={opt} color={olive} uncheckedColor={olive} labelStyle={styles.radioLabel} />
          ))}
        </RadioButton.Group>
        <Text style={styles.question}>Where do you live in the west bank?</Text>
        <TextInput label="Region" value={form.region} onChangeText={v => handleChange('region', v)} style={styles.input} mode="outlined" outlineColor={olive} activeOutlineColor={olive} textColor={olive} theme={{ colors: { text: olive, primary: olive, placeholder: olive } }} />
        <Text style={styles.question}>What Prior Experience do you have?</Text>
        <RadioButton.Group onValueChange={v => handleChange('q2', v)} value={form.q2}>
          {q2Options.map(opt => (
            <RadioButton.Item key={opt} label={opt} value={opt} color={olive} uncheckedColor={olive} labelStyle={styles.radioLabel} />
          ))}
        </RadioButton.Group>
        <Text style={styles.question}>What field is your experience in? (multiple answer)</Text>
        <View style={styles.checkboxGroup}>
          {q3Options.map(opt => (
            <TouchableOpacity key={opt} style={styles.checkboxRow} onPress={() => handleCheckbox('q3', opt)}>
              <Checkbox status={form.q3.includes(opt) ? 'checked' : 'unchecked'} color={olive} />
              <RNText style={styles.checkboxLabel}>{opt}</RNText>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.question}>What languages are you fluent in? (multiple answer)</Text>
        <View style={styles.checkboxGroup}>
          {q4Options.map(opt => (
            <TouchableOpacity key={opt} style={styles.checkboxRow} onPress={() => handleCheckbox('q4', opt)}>
              <Checkbox status={form.q4.includes(opt) ? 'checked' : 'unchecked'} color={olive} />
              <RNText style={styles.checkboxLabel}>{opt}</RNText>
            </TouchableOpacity>
          ))}
        </View>
      </Card.Content>
      <Card.Actions style={styles.actions}>
        <Button mode="outlined" style={styles.backButton} onPress={() => setStep(1)}>Back</Button>
        <Button mode="contained" style={styles.nextButton} onPress={() => { if (validateStep2()) setStep(3); }}>Next</Button>
      </Card.Actions>
    </Card>
  );

  const renderStep3 = () => (
    <Card style={styles.card}>
      <Card.Title title="Upload Credentials & Resume" titleStyle={styles.cardTitle} />
      <Card.Content>
        <Text style={styles.question}>Please enter your credentials and resume (Multiple File Enter)</Text>
        <Button mode="outlined" style={styles.uploadButton} onPress={pickFiles} loading={cvUploading} disabled={cvUploading} icon="upload">
          {form.files.length > 0 ? 'Change Files' : 'Upload Files'}
        </Button>
        {form.files.length > 0 && (
          <View style={{ marginTop: 10 }}>
            {form.files.map((f, idx) => (
              <Text key={idx} style={styles.fileName}>{f.name}</Text>
            ))}
          </View>
        )}
      </Card.Content>
      <Card.Actions style={styles.actions}>
        <Button mode="outlined" style={styles.backButton} onPress={() => setStep(2)}>Back</Button>
        <Button mode="contained" style={styles.nextButton} onPress={handleSubmit} loading={loading}>Submit</Button>
      </Card.Actions>
    </Card>
  );

  return (
    <PaperProvider>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: olive }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </ScrollView>
        <Toast />
      </KeyboardAvoidingView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: olive,
  },
  card: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 20,
    elevation: 8,
    backgroundColor: '#fff',
    borderColor: yellow,
    borderWidth: 2,
    marginBottom: 24,
  },
  cardTitle: {
    color: olive,
    fontWeight: 'bold',
    fontSize: 26,
    textAlign: 'center',
  },
  input: {
    marginBottom: 14,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 4,
    paddingHorizontal: 8,
  },
  nextButton: {
    backgroundColor: olive,
    borderRadius: 10,
    borderColor: yellow,
    borderWidth: 2,
    flex: 1,
    marginLeft: 8,
  },
  backButton: {
    borderColor: olive,
    borderWidth: 2,
    borderRadius: 10,
    flex: 1,
    marginRight: 8,
  },
  question: {
    fontSize: 16,
    fontWeight: 'bold',
    color: olive,
    marginTop: 10,
    marginBottom: 4,
  },
  radioLabel: {
    color: olive,
    fontSize: 15,
  },
  checkboxGroup: {
    marginBottom: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  checkboxLabel: {
    fontSize: 15,
    color: olive,
    marginLeft: 4,
  },
  uploadButton: {
    borderColor: olive,
    borderWidth: 2,
    borderRadius: 10,
    marginTop: 10,
    backgroundColor: yellow,
  },
  fileName: {
    color: olive,
    fontSize: 14,
    marginBottom: 2,
  },
});
