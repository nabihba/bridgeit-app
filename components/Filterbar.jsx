import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';

const filterbar = ({ onApplyFilters }) => {
  const [profession, setProfession] = useState('');
  const [experience, setExperience] = useState('');

  return (
    <View>
      <TextInput placeholder="Filter by profession" value={profession} onChangeText={setProfession} />
      <TextInput placeholder="Min experience" keyboardType="numeric" value={experience} onChangeText={setExperience} />
      <Button title="Apply Filters" onPress={() => onApplyFilters({ profession, experience })} />
    </View>
  );
};

export default filterbar;
