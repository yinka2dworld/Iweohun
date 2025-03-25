import React from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';


const Related = () => {

  return (
    <View style={tw`p-4`}>
      <Text style={[tw`text-lg`]}>Related Books:</Text>
      {/* Add content for related books here */}
    </View>
  );
};

export default Related;