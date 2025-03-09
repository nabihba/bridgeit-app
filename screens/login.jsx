import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { account } from '../../services/appwrite';

const login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const login = async () => {
    try {
      await account.createEmailSession(email, password);
      Alert.alert('Success', 'Logged in!');
      navigation.navigate('EmployerHome');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View>
      <Text>Login</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <Button title="Login" onPress={login} />
    </View>
  );
};

export default login;
