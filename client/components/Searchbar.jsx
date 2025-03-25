import { useState } from 'react';
import { SearchBar } from 'react-native-elements';
import { TouchableOpacity, FlatList, View } from 'react-native';
import tw from 'twrnc';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import Constants from 'expo-constants';
import axios from 'axios';

export default function Searchbar() {
  const [searchWord, setSearchWord] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [results, setResults] = useState([]); // State to hold search results
  const apiUrl = Constants.expoConfig?.extra?.API_BASE_URL;

  // Function to handle the search
  const handleSearch = async () => {
    if (!searchWord) return; // Avoid empty searches
    setIsPending(true); // Set loading state
    try {
      const response = await axios.get(`${apiUrl}/searchBar?searchTerm=${searchWord}`);
      setResults(response.data); // Update results state with the response data
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsPending(false); // Reset loading state
    }
  };

  // Function to clear the search input and results
  const handleClear = () => {
    setSearchWord('');
    setResults([]); // Clear the results when the search is cleared
  };

  return (
    <ThemedView style={tw`p-2`}>
      {/* Search Bar */}
      <SearchBar
        placeholder="Type Here..."
        onChangeText={(newWord) => setSearchWord(newWord)}
        value={searchWord}
        containerStyle={tw`bg-transparent border-t-0 border-b-0`}
        inputContainerStyle={{
          backgroundColor: ThemedView.box, 
          borderRadius: 10,
        }}
        inputStyle={{
          color: ThemedView.text, 
        }}
        rightIcon={
          searchWord ? (
            <TouchableOpacity onPress={handleClear} style={tw`p-2`}>
              <ThemedText style={tw`text-gray-500`}>X</ThemedText>
            </TouchableOpacity>
          ) : null
        }
        onSubmitEditing={handleSearch} // Trigger search on submit
        showLoading={isPending} // Show loading indicator when request is pending
      />

      {/* Display search results if available */}
      {results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id.toString()} // Ensure unique keys
          renderItem={({ item }) => (
            <View style={tw`p-4 mb-4 bg-white rounded-lg`}>
              <ThemedText style={tw`font-bold`}>{item.name}</ThemedText>
              {/* <ThemedText>{item.description}</ThemedText> */}
            </View>
          )}
        />
      )}

      
      { searchWord != results && (
        <ThemedText style={tw`text-center text-gray-500`}>No results found</ThemedText>
      )}
    </ThemedView>
  );
}
