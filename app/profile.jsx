import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Appbar, Card, Text, TextInput, Button, Provider as PaperProvider, ActivityIndicator } from 'react-native-paper';
import { db } from '../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import Toast from 'react-native-toast-message';

const green = '#217a3e';
const gold = '#d4af37';
const bg = '#f7f7f7';

const ProfileScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [form, setForm] = useState({
    name: params.name || '',
    email: params.email || '',
    profession: params.profession || '',
    companyName: params.companyName || '',
    location: params.location || '',
  });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Determine collection and docId
      let collectionName = '';
      let docId = params.userId;
      if (form.companyName) {
        collectionName = 'companies';
      } else {
        collectionName = 'jobseekers';
      }
      if (!docId) throw new Error('User ID missing.');
      const ref = doc(db, collectionName, docId);
      // Only update editable fields
      const updateData = { location: form.location };
      if (form.name) updateData.name = form.name;
      if (form.profession) updateData.profession = form.profession;
      if (form.companyName) updateData.companyName = form.companyName;
      await updateDoc(ref, updateData);
      Toast.show({ type: 'success', text1: 'Profile updated!' });
      setEditing(false);
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed to update profile.' });
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PaperProvider>
      <View style={styles.root}>
        <Appbar.Header style={{ backgroundColor: green }}>
          <Appbar.BackAction color={gold} onPress={() => router.back()} />
          <Appbar.Content title="Profile" titleStyle={{ color: gold, fontWeight: 'bold', fontSize: 22 }} />
          {editing ? null : (
            <Appbar.Action icon="pencil" color={gold} onPress={() => setEditing(true)} />
          )}
        </Appbar.Header>
        <View style={styles.container}>
          <Card style={styles.card}>
            <Card.Title title={form.name || form.companyName || 'User'} titleStyle={{ color: green, fontWeight: 'bold', fontSize: 24 }} />
            <Card.Content>
              <TextInput
                label="Name"
                value={form.name}
                onChangeText={(v) => handleChange('name', v)}
                style={styles.input}
                mode="outlined"
                outlineColor={gold}
                activeOutlineColor={green}
                textColor={green}
                theme={{ colors: { text: green, primary: gold, placeholder: gold } }}
                editable={editing}
              />
              <TextInput
                label="Email"
                value={form.email}
                onChangeText={(v) => handleChange('email', v)}
                style={styles.input}
                mode="outlined"
                outlineColor={gold}
                activeOutlineColor={green}
                textColor={green}
                theme={{ colors: { text: green, primary: gold, placeholder: gold } }}
                editable={false}
              />
              {form.profession !== undefined && (
                <TextInput
                  label="Profession"
                  value={form.profession}
                  onChangeText={(v) => handleChange('profession', v)}
                  style={styles.input}
                  mode="outlined"
                  outlineColor={gold}
                  activeOutlineColor={green}
                  textColor={green}
                  theme={{ colors: { text: green, primary: gold, placeholder: gold } }}
                  editable={editing}
                />
              )}
              {form.companyName !== undefined && (
                <TextInput
                  label="Company Name"
                  value={form.companyName}
                  onChangeText={(v) => handleChange('companyName', v)}
                  style={styles.input}
                  mode="outlined"
                  outlineColor={gold}
                  activeOutlineColor={green}
                  textColor={green}
                  theme={{ colors: { text: green, primary: gold, placeholder: gold } }}
                  editable={editing}
                />
              )}
              <TextInput
                label="Location"
                value={form.location}
                onChangeText={(v) => handleChange('location', v)}
                style={styles.input}
                mode="outlined"
                outlineColor={gold}
                activeOutlineColor={green}
                textColor={green}
                theme={{ colors: { text: green, primary: gold, placeholder: gold } }}
                editable={editing}
              />
              {editing && (
                <Button
                  mode="contained"
                  style={styles.button}
                  contentStyle={{ backgroundColor: gold }}
                  labelStyle={{ color: green, fontWeight: 'bold', fontSize: 18 }}
                  onPress={handleSave}
                  loading={saving}
                >
                  Save
                </Button>
              )}
            </Card.Content>
          </Card>
        </View>
        {saving && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator animating={true} color={gold} size="large" />
          </View>
        )}
        <Toast />
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: bg,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    elevation: 8,
    backgroundColor: '#fff',
    borderColor: gold,
    borderWidth: 2,
    padding: 16,
  },
  input: {
    marginBottom: 14,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  button: {
    marginTop: 16,
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

export default ProfileScreen; 