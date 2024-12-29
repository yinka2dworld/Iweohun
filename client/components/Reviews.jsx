import React from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';
import { useAppTheme } from '../app/themeContext';

const Reviews = () => {
  const { text } = useAppTheme();

  return (
    <View style={tw`p-4`}>
      <Text style={[tw`text-lg`, { color: text }]}>Reviews:</Text>
    
    </View>
  );
};

export default Reviews;
