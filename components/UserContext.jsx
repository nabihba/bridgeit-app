import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { db, auth } from '../services/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Toast from 'react-native-toast-message';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { uid, type, profile }

  // Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser);
      if (firebaseUser) {
        // Try to fetch jobseeker profile
        let profile = null;
        let type = null;
        let ref = doc(db, 'jobseekers', firebaseUser.uid);
        let snap = await getDoc(ref);
        if (snap.exists()) {
          profile = snap.data();
          type = 'jobseeker';
        } else {
          // Try employer
          ref = doc(db, 'companies', firebaseUser.uid);
          snap = await getDoc(ref);
          if (snap.exists()) {
            profile = snap.data();
            type = 'employer';
          }
        }
        console.log('Fetched profile:', profile, 'Type:', type);
        if (profile && type) {
          setUser({ uid: firebaseUser.uid, type, profile });
        } else {
          Toast.show({ type: 'error', text1: 'User profile not found in Firestore. Please contact support or re-register.' });
          // Do not set user to null immediately; let user see the error
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const registerForPushNotifications = async () => {
      if (!user || !user.uid) return;
      let token;
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') {
          return;
        }
        token = (await Notifications.getExpoPushTokenAsync()).data;
        // Save token to Firestore
        let collectionName = user.type === 'employer' ? 'companies' : 'jobseekers';
        const refDoc = doc(db, collectionName, user.uid);
        await updateDoc(refDoc, { expoPushToken: token });
      } catch (err) {
        // Ignore errors
      }
      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
    };
    registerForPushNotifications();
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext); 