import React from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';
import { useAppTheme } from '../app/themeContext';

const Related = () => {
  const { text } = useAppTheme();

  return (
    <View style={tw`p-4`}>
      <Text style={[tw`text-lg`, { color: text }]}>Related Books:</Text>
      {/* Add content for related books here */}
    </View>
  );
};

export default Related;