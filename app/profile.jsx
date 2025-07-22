import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Platform, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Card, Text, TextInput, Button, Provider as PaperProvider, ActivityIndicator, Avatar } from 'react-native-paper';
import { db } from '../services/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as WebBrowser from 'expo-web-browser';
import { uploadToAppwrite, getAppwriteFileUrl } from '../services/appwrite';

function ProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    photoURL: '',
    cvUrl: '',
    // ... other fields
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cvFile, setCvFile] = useState(null);
  const [cvUploading, setCvUploading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);

  useEffect(() => {
    if (!params.userId) return;
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const collectionName = params.companyName ? 'companies' : 'jobseekers';
        const userDoc = await getDoc(doc(db, collectionName, params.userId));
        if (userDoc.exists()) {
          setForm(userDoc.data());
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        Toast.show({
          type: 'error',
          text1: 'Error loading profile',
          text2: error.message
        });
      }
      setLoading(false);
    };
    fetchProfile();
  }, [params.userId]);

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setPhotoUploading(true);
        try {
          let fileToUpload;
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          if (Platform.OS === 'web') {
            fileToUpload = new File([blob], asset.fileName || 'profile_photo.jpg', { type: blob.type });
          } else {
            fileToUpload = blob;
          }
          const { url } = await uploadToAppwrite(fileToUpload);
          console.log('Profile photo uploaded, url:', url);
          // Update Firestore
          const collectionName = form.companyName ? 'companies' : 'jobseekers';
          const userRef = doc(db, collectionName, params.userId);
          await updateDoc(userRef, { photoURL: url });
          setForm(prev => ({ ...prev, photoURL: url }));
          Toast.show({ type: 'success', text1: 'Profile photo updated!' });
        } catch (error) {
          console.error('Error uploading photo:', error);
          Toast.show({ type: 'error', text1: 'Failed to upload photo', text2: error.message });
        }
        setPhotoUploading(false);
      } else {
        Toast.show({ type: 'error', text1: 'No photo selected' });
        console.log('ImagePicker cancelled or no asset.');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Toast.show({ type: 'error', text1: 'Error selecting photo', text2: error.message });
    }
  };

  const pickCV = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true
      });
      console.log('DocumentPicker result:', result);
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setCvFile(asset);
        setCvUploading(true);
        try {
          let fileToUpload;
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          if (Platform.OS === 'web') {
            fileToUpload = new File([blob], asset.name || 'cv.pdf', { type: blob.type });
          } else {
            fileToUpload = blob;
          }
          const { fileId, url } = await uploadToAppwrite(fileToUpload);
          console.log('CV uploaded, url:', url, 'fileId:', fileId);
          // Update Firestore with both fileId and url
          const userRef = doc(db, 'jobseekers', params.userId);
          await updateDoc(userRef, { cvUrl: url, cvFileId: fileId });
          setForm(prev => ({ ...prev, cvUrl: url, cvFileId: fileId }));
          Toast.show({ type: 'success', text1: 'CV uploaded successfully!' });
        } catch (error) {
          console.error('Error uploading CV:', error);
          Toast.show({ type: 'error', text1: 'Failed to upload CV', text2: error.message });
        }
        setCvUploading(false);
      } else {
        Toast.show({ type: 'error', text1: 'No file selected' });
        console.log('DocumentPicker cancelled or no file.');
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Toast.show({ type: 'error', text1: 'Error selecting CV', text2: error.message });
    }
  };

  const handleViewCV = async () => {
    if (!form.cvFileId) {
      Toast.show({
        type: 'error',
        text1: 'No CV uploaded yet'
      });
      return;
    }
    try {
      const url = getAppwriteFileUrl(form.cvFileId);
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      console.error('Error opening CV:', error);
      Toast.show({
        type: 'error',
        text1: 'Error opening CV',
        text2: error.message
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const collectionName = form.companyName ? 'companies' : 'jobseekers';
      const userRef = doc(db, collectionName, params.userId);
      await updateDoc(userRef, form);
      Toast.show({
        type: 'success',
        text1: 'Profile updated successfully!'
      });
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to update profile',
        text2: error.message
      });
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Card style={styles.card}>
          <View style={styles.header}>
            <View style={styles.photoContainer}>
              {photoUploading ? (
                <ActivityIndicator size="large" style={styles.avatar} />
              ) : form.photoURL ? (
                <>
                  <Avatar.Image size={90} source={{ uri: form.photoURL }} style={styles.avatar} />
                </>
              ) : (
                <Avatar.Text 
                  size={90} 
                  label={(form.name || form.companyName || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)} 
                  style={styles.avatar} 
                />
              )}
              {editing && (
                <Button
                  mode="contained"
                  onPress={pickImage}
                  style={styles.photoButton}
                  disabled={photoUploading}
                >
                  Change Photo
                </Button>
              )}
            </View>

            <View style={styles.headerContent}>
              <Text style={styles.name}>{form.name || form.companyName}</Text>
              <Text style={styles.email}>{form.email}</Text>
            </View>
          </View>

          {editing ? (
            <View style={styles.form}>
              <TextInput
                label={form.companyName ? "Company Name" : "Full Name"}
                value={form.companyName || form.name}
                onChangeText={(text) => handleChange(form.companyName ? 'companyName' : 'name', text)}
                style={styles.input}
              />
              <TextInput
                label="Phone"
                value={form.phone}
                onChangeText={(text) => handleChange('phone', text)}
                style={styles.input}
              />
              {/* Add other fields as needed */}
            </View>
          ) : (
            <View style={styles.info}>
              <Text style={styles.label}>Phone</Text>
              <Text style={styles.value}>{form.phone || 'Not provided'}</Text>
              {/* Display other fields */}
            </View>
          )}

          <View style={styles.actions}>
            {editing ? (
              <>
                <Button
                  mode="contained"
                  onPress={handleSave}
                  style={styles.button}
                  loading={loading}
                  disabled={loading}
                >
                  Save Changes
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => setEditing(false)}
                  style={styles.button}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                mode="contained"
                onPress={() => setEditing(true)}
                style={styles.button}
              >
                Edit Profile
              </Button>
            )}
          </View>
        </Card>

        {/* CV Section - Only show for jobseekers */}
        {!form.companyName && (
          <Card style={[styles.card, styles.cvCard]}>
            <Card.Title title="CV / Resume" />
            <Card.Content>
              <View style={styles.cvSection}>
                {form.cvUrl ? (
                  <>
                    <Text style={styles.cvStatus}>Current CV uploaded</Text>
                    <Button
                      mode="contained"
                      onPress={handleViewCV}
                      style={styles.button}
                      icon="file-document"
                    >
                      View CV
                    </Button>
                  </>
                ) : (
                  <Text style={styles.cvStatus}>No CV uploaded yet</Text>
                )}
                <Button
                  mode="outlined"
                  onPress={pickCV}
                  style={styles.button}
                  loading={cvUploading}
                  disabled={cvUploading}
                  icon="upload"
                >
                  {cvUploading ? 'Uploading...' : (form.cvUrl ? 'Update CV' : 'Upload CV')}
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}
        <Button
          mode="contained"
          style={{ marginTop: 24, alignSelf: 'center', width: 180 }}
          onPress={() => router.push('/courses')}
          icon="book-open-variant"
        >
          View Courses
        </Button>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  cvCard: {
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  photoContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  avatar: {
    marginBottom: 8,
  },
  photoButton: {
    marginTop: 8,
  },
  headerContent: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    padding: 16,
  },
  info: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    marginBottom: 16,
  },
  actions: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    marginLeft: 8,
  },
  cvSection: {
    marginTop: 8,
  },
  cvStatus: {
    marginBottom: 16,
    color: '#666',
  },
});

export default ProfileScreen; 