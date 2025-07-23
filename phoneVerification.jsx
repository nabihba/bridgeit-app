import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { TextInput, Button, Card, Text, Provider as PaperProvider, ActivityIndicator } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useUser } from '../components/UserContext';
import { db, auth } from '../services/firebase';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import Toast from 'react-native-toast-message';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const olive = '#7B7A3A';
const bg = '#f7f7f7';

const PhoneVerification = () => {
  const router = useRouter();
  const { userId, role, phone: initialPhone } = useLocalSearchParams();
  const { setUser } = useUser();
  const [phone, setPhone] = useState(initialPhone || '');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('enterPhone'); // 'enterPhone' | 'enterCode' | 'verified'
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [redirecting, setRedirecting] = useState(false);

  const recaptchaContainerId = 'recaptcha-container';

  useEffect(() => {
    // Only run on web, not on native
    if (
      typeof window !== 'undefined' &&
      typeof document !== 'undefined' &&
      Platform.OS === 'web' &&
      auth
    ) {
      try {
        if (!window.recaptchaVerifier) {
          window.recaptchaVerifier = new RecaptchaVerifier(
            recaptchaContainerId,
            {
              size: 'invisible',
              callback: (response) => {
                // reCAPTCHA solved
              },
            },
            auth
          );
        }
      } catch (err) {
        console.error('RecaptchaVerifier init error:', err);
      }
    }
  }, []);

  const sendCode = async () => {
    setLoading(true);
    try {
      let verifier = undefined;
      if (Platform.OS === 'web') {
        verifier = window.recaptchaVerifier;
        if (!verifier) throw new Error('reCAPTCHA not initialized');
      } else {
        // Native: implement native verifier if needed
        throw new Error('Phone verification is only supported on web in this build.');
      }
      const confirmationResult = await signInWithPhoneNumber(auth, phone, verifier);
      setConfirmation(confirmationResult);
      setStep('enterCode');
      Toast.show({ type: 'success', text1: 'Verification code sent!' });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed to send code.' });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    setLoading(true);
    try {
      await confirmation.confirm(code);
      // Mark phone as verified in Firestore
      const collectionName = role === 'employer' ? 'companies' : 'jobseekers';
      const ref = doc(db, collectionName, userId);
      await updateDoc(ref, { phone, phoneVerified: true });
      Toast.show({ type: 'success', text1: 'Phone verified!' });
      setStep('verified');
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Invalid code.' });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSuccess = async () => {
    // Mark user as verified in Firestore
    const collectionName = role === 'employer' ? 'companies' : 'jobseekers';
    const refDoc = doc(db, collectionName, userId);
    await updateDoc(refDoc, { verified: true });
    // Fetch user profile
    const snap = await getDoc(refDoc);
    const profile = snap.data();
    setUser({ uid: userId, type: role, profile });
    Toast.show({ type: 'success', text1: 'Phone verified!' });
    goHome();
  };

  const goHome = () => {
    setRedirecting(true);
    setTimeout(() => {
      if (role === 'jobseeker') {
        router.replace('/jobseekerhome');
      } else {
        router.replace('/employerhomescreen');
      }
    }, 1500);
  };

  // On mount, check if already verified
  useEffect(() => {
    const checkVerified = async () => {
      if (!userId || !role) return;
      const collectionName = role === 'employer' ? 'companies' : 'jobseekers';
      const refDoc = doc(db, collectionName, userId);
      const snap = await getDoc(refDoc);
      if (snap.exists() && snap.data().verified) {
        setUser({ uid: userId, type: role, profile: snap.data() });
        router.replace('/');
      }
    };
    checkVerified();
  }, [userId, role]);

  const isRecaptchaReady = () => {
    if (Platform.OS !== 'web') return true;
    return typeof window !== 'undefined' && !!window.recaptchaVerifier;
  };

  const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  return (
    <PaperProvider>
      <View style={styles.root}>
        <Card style={styles.card}>
          <Card.Title title="Phone Verification" titleStyle={{ color: olive, fontWeight: 'bold', fontSize: 24 }} />
          <Card.Content>
            {step === 'enterPhone' && (
              <>
                <TextInput
                  label="Phone Number"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  style={styles.input}
                  mode="outlined"
                  outlineColor={olive}
                  activeOutlineColor={olive}
                  textColor={olive}
                  theme={{ colors: { text: olive, primary: olive, placeholder: olive } }}
                />
                <Button
                  mode="contained"
                  style={styles.button}
                  contentStyle={{ backgroundColor: olive }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}
                  onPress={sendCode}
                  loading={loading}
                  disabled={!isRecaptchaReady() || loading || !phone}
                >
                  Send Code
                </Button>
                {Platform.OS === 'web' && !isRecaptchaReady() && (
                  <Text style={{ color: 'red', marginTop: 8 }}>
                    reCAPTCHA failed to initialize. Please refresh the page or check your network.
                  </Text>
                )}
              </>
            )}
            {step === 'enterCode' && (
              <>
                <TextInput
                  label="Verification Code"
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  style={styles.input}
                  mode="outlined"
                  outlineColor={olive}
                  activeOutlineColor={olive}
                  textColor={olive}
                  theme={{ colors: { text: olive, primary: olive, placeholder: olive } }}
                />
                <Button
                  mode="contained"
                  style={styles.button}
                  contentStyle={{ backgroundColor: olive }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}
                  onPress={verifyCode}
                  disabled={loading || !code}
                >
                  Verify Code
                </Button>
              </>
            )}
            {step === 'verified' && (
              <Text style={{ color: olive, fontWeight: 'bold', fontSize: 20, textAlign: 'center' }}>
                Your phone is verified!
              </Text>
            )}
            {isLocalhost && (
              <Button
                mode="outlined"
                style={{ marginTop: 16, borderColor: olive }}
                labelStyle={{ color: olive, fontWeight: 'bold' }}
                onPress={async () => {
                  // Mark user as verified in Firestore
                  const collectionName = role === 'employer' ? 'companies' : 'jobseekers';
                  const refDoc = doc(db, collectionName, userId);
                  await setDoc(refDoc, { verified: true }, { merge: true });
                  // Fetch user profile
                  const snap = await getDoc(refDoc);
                  const profile = snap.data();
                  setUser({ uid: userId, type: role, profile });
                  Toast.show({ type: 'success', text1: 'Bypassed phone verification (dev mode)' });
                  goHome();
                }}
              >
                Bypass Verification (Dev Only)
              </Button>
            )}
            {redirecting && (
              <View style={{ alignItems: 'center', marginTop: 24 }}>
                <ActivityIndicator animating={true} color={olive} size="large" />
                <Text style={{ marginTop: 8, color: olive }}>Redirecting...</Text>
              </View>
            )}
          </Card.Content>
        </Card>
        {typeof window !== 'undefined' && <div id="recaptcha-container"></div>}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator animating={true} color={olive} size="large" />
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    elevation: 8,
    backgroundColor: '#fff',
    borderColor: olive,
    borderWidth: 2,
    padding: 16,
  },
  input: {
    marginBottom: 18,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  button: {
    marginTop: 10,
    borderRadius: 10,
    borderColor: olive,
    borderWidth: 2,
    backgroundColor: olive,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});

export default PhoneVerification; 