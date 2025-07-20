import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { db } from '../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { uid, type, profile }

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