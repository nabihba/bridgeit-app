import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Card, Text, Provider as PaperProvider, ActivityIndicator } from 'react-native-paper';
import { useUser } from '../components/UserContext';
import { db, auth } from '../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import Toast from 'react-native-toast-message';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const green = '#217a3e';
const gold = '#d4af37';
const bg = '#f7f7f7';

const PhoneVerification = () => {
  const { user } = useUser();
  const [phone, setPhone] = useState(user?.profile?.phone || '');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('enterPhone'); // 'enterPhone' | 'enterCode' | 'verified'
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  // Setup reCAPTCHA verifier (web fallback)
  let recaptchaVerifier;
  if (typeof window !== 'undefined' && !window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
      size: 'invisible',
      callback: () => {},
    }, auth);
  }
  recaptchaVerifier = window.recaptchaVerifier;

  const sendCode = async () => {
    setLoading(true);
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phone, recaptchaVerifier);
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
      const collectionName = user.type === 'employer' ? 'companies' : 'jobseekers';
      const ref = doc(db, collectionName, user.uid);
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

  return (
    <PaperProvider>
      <View style={styles.root}>
        <Card style={styles.card}>
          <Card.Title title="Phone Verification" titleStyle={{ color: green, fontWeight: 'bold', fontSize: 24 }} />
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
                  outlineColor={gold}
                  activeOutlineColor={green}
                  textColor={green}
                  theme={{ colors: { text: green, primary: gold, placeholder: gold } }}
                />
                <Button
                  mode="contained"
                  style={styles.button}
                  contentStyle={{ backgroundColor: gold }}
                  labelStyle={{ color: green, fontWeight: 'bold', fontSize: 18 }}
                  onPress={sendCode}
                  disabled={loading || !phone}
                >
                  Send Code
                </Button>
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
                  outlineColor={gold}
                  activeOutlineColor={green}
                  textColor={green}
                  theme={{ colors: { text: green, primary: gold, placeholder: gold } }}
                />
                <Button
                  mode="contained"
                  style={styles.button}
                  contentStyle={{ backgroundColor: gold }}
                  labelStyle={{ color: green, fontWeight: 'bold', fontSize: 18 }}
                  onPress={verifyCode}
                  disabled={loading || !code}
                >
                  Verify Code
                </Button>
              </>
            )}
            {step === 'verified' && (
              <Text style={{ color: green, fontWeight: 'bold', fontSize: 20, textAlign: 'center' }}>
                Your phone is verified!
              </Text>
            )}
          </Card.Content>
        </Card>
        <div id="recaptcha-container" />
        {loading && (
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
    borderColor: gold,
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

export default PhoneVerification; 