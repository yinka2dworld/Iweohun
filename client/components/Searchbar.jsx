import { useState } from 'react';
import { SearchBar, TouchableOpacity, Text } from 'react-native-elements'; 
import tw from 'twrnc';
import { useAppTheme } from '../app/themeContext'; 

export default function Searchbar() {
  const theme = useAppTheme();
  const [searchWord, setSearchWord] = useState('');

  const handleClear = () => {
    setSearchWord('');
  };

  return (
    <SearchBar
      placeholder="Type Here..."
      onChangeText={(newWord) => setSearchWord(newWord)}
      value={searchWord}
      containerStyle={tw`bg-transparent border-t-0 border-b-0`}
      inputContainerStyle={{
        backgroundColor: theme.box,
        borderRadius: 10,
      }}
      inputStyle={{
        color: theme.text,
      }}  
      rightIcon={
        searchWord ? (
          <TouchableOpacity
            onPress={handleClear}
            style={tw`p-2`}
          >
            <Text style={{ color: 'gray', fontSize: 25 }}>X</Text>
          </TouchableOpacity>
        ) : null
      }
    />
  );
}

