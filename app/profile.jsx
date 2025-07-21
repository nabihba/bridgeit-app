import React, { useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Card, Text, TextInput, Button, Provider as PaperProvider, ActivityIndicator, Avatar } from 'react-native-paper';
import { db } from '../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const accent = '#1976d2';
const bg = '#f7f7f7';
const cardBg = '#fff';
const textMain = '#222';
const textSub = '#757575';

const ProfileScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [form, setForm] = useState({
    name: params.name || '',
    email: params.email || '',
    profession: params.profession || '',
    companyName: params.companyName || '',
    location: params.location || '',
    photoURL: params.photoURL || '',
  });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handlePickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setUploading(true);
      try {
        const asset = result.assets[0];
        const storage = getStorage();
        const storageRef = ref(storage, `profilePhotos/${Date.now()}_${asset.fileName || 'photo.jpg'}`);
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        await uploadBytes(storageRef, blob);
        const url = await getDownloadURL(storageRef);
        setForm((prev) => ({ ...prev, photoURL: url }));
      } catch (err) {
        Alert.alert('Upload failed', 'Could not upload photo.');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save to Firestore (jobseeker or company)
      let collectionName = form.companyName ? 'companies' : 'jobseekers';
      const refDoc = doc(db, collectionName, params.userId);
      await updateDoc(refDoc, { ...form });
      Toast.show({ type: 'success', text1: 'Profile updated!' });
      setEditing(false);
    } catch (err) {
      Alert.alert('Save failed', 'Could not save profile.');
    } finally {
      setSaving(false);
    }
  };

  const initials = (form.name || form.companyName || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <PaperProvider>
      <View style={styles.root}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Avatar.Icon size={36} icon="arrow-left" color={accent} style={{ backgroundColor: '#e3eafc' }} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.container}>
          <Card style={styles.card}>
            <Card.Content style={{ alignItems: 'center' }}>
              {form.photoURL ? (
                <Avatar.Image size={90} source={{ uri: form.photoURL }} style={styles.avatar} />
              ) : (
                <Avatar.Text size={90} label={initials} style={styles.avatar} />
              )}
              {editing && (
                <Button
                  mode="outlined"
                  style={styles.editPhotoButton}
                  labelStyle={{ color: accent, fontWeight: 'bold' }}
                  onPress={handlePickPhoto}
                  loading={uploading}
                  disabled={uploading}
                >
                  Edit Photo
                </Button>
              )}
              <TextInput
                label="Name"
                value={form.name}
                onChangeText={(v) => handleChange('name', v)}
                style={styles.input}
                mode="outlined"
                outlineColor={accent}
                activeOutlineColor={accent}
                textColor={textMain}
                theme={{ colors: { text: textMain, primary: accent, placeholder: textSub } }}
                editable={editing}
              />
              {form.companyName ? (
                <TextInput
                  label="Company Name"
                  value={form.companyName}
                  onChangeText={(v) => handleChange('companyName', v)}
                  style={styles.input}
                  mode="outlined"
                  outlineColor={accent}
                  activeOutlineColor={accent}
                  textColor={textMain}
                  theme={{ colors: { text: textMain, primary: accent, placeholder: textSub } }}
                  editable={editing}
                />
              ) : (
                <TextInput
                  label="Profession"
                  value={form.profession}
                  onChangeText={(v) => handleChange('profession', v)}
                  style={styles.input}
                  mode="outlined"
                  outlineColor={accent}
                  activeOutlineColor={accent}
                  textColor={textMain}
                  theme={{ colors: { text: textMain, primary: accent, placeholder: textSub } }}
                  editable={editing}
                />
              )}
              <TextInput
                label="Location"
                value={form.location}
                onChangeText={(v) => handleChange('location', v)}
                style={styles.input}
                mode="outlined"
                outlineColor={accent}
                activeOutlineColor={accent}
                textColor={textMain}
                theme={{ colors: { text: textMain, primary: accent, placeholder: textSub } }}
                editable={editing}
              />
              <TextInput
                label="Email"
                value={form.email}
                onChangeText={(v) => handleChange('email', v)}
                style={styles.input}
                mode="outlined"
                outlineColor={accent}
                activeOutlineColor={accent}
                textColor={textMain}
                theme={{ colors: { text: textMain, primary: accent, placeholder: textSub } }}
                editable={false}
              />
              {editing ? (
                <Button
                  mode="contained"
                  style={styles.saveButton}
                  contentStyle={{ backgroundColor: accent }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                  onPress={handleSave}
                  loading={saving}
                  disabled={saving}
                >
                  Save
                </Button>
              ) : (
                <Button
                  mode="outlined"
                  style={styles.editButton}
                  labelStyle={{ color: accent, fontWeight: 'bold' }}
                  onPress={() => setEditing(true)}
                >
                  Edit Profile
                </Button>
              )}
            </Card.Content>
          </Card>
        </View>
      </View>
      <Toast />
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 8,
    backgroundColor: cardBg,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: accent,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    elevation: 8,
    backgroundColor: cardBg,
    borderColor: accent,
    borderWidth: 2,
    padding: 16,
  },
  avatar: {
    marginBottom: 12,
    backgroundColor: '#e3eafc',
  },
  input: {
    marginBottom: 12,
    backgroundColor: cardBg,
  },
  editPhotoButton: {
    marginBottom: 12,
    borderColor: accent,
    borderWidth: 1,
    borderRadius: 8,
  },
  saveButton: {
    marginTop: 8,
    borderRadius: 10,
    backgroundColor: accent,
  },
  editButton: {
    marginTop: 8,
    borderRadius: 10,
    borderColor: accent,
    borderWidth: 1,
  },
});

export default ProfileScreen; 