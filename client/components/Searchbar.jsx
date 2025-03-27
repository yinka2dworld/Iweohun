import { useState, useEffect } from 'react';
import { TouchableOpacity, FlatList, View, ActivityIndicator } from 'react-native';
import { SearchBar } from 'react-native-elements';
import { useRouter } from 'expo-router';
import tw from 'twrnc';
import axios from 'axios';
import Constants from 'expo-constants';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function Searchbar() {
  const router = useRouter();
  const [searchWord, setSearchWord] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [results, setResults] = useState([]); 
  const [error, setError] = useState(null);
  const apiUrl = Constants.expoConfig?.extra?.API_BASE_URL;

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  // Function to fetch search results
  const handleSearch = async (query) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setIsPending(true);
    try {
      const response = await axios.get(`${apiUrl}/searchBar?searchTerm=${query}`);
      setResults(response.data.books || []);
      setError(null);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Failed to fetch results. Please try again.');
    } finally {
      setIsPending(false);
    }
  };

  // Debounce search (Prevents excessive API calls)
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      handleSearch(searchWord);
    }, 300); // 300ms delay

    return () => clearTimeout(delayDebounce);
  }, [searchWord]);

  // Clear search input and results
  const handleClear = () => {
    setSearchWord('');
    setResults([]);
  };

  return (
    <ThemedView style={tw`p-4`}>

      {/* Search Bar */}
      <SearchBar
        placeholder="Search for audiobook..."
        onChangeText={setSearchWord}
        value={searchWord}
        containerStyle={tw`bg-transparent border-t-0 border-b-0`}
        inputContainerStyle={[
          tw`rounded-lg px-3`, 
          { backgroundColor }
        ]}
        inputStyle={{ color: textColor }}
        rightIcon={
          searchWord ? (
            <TouchableOpacity key="clear-button" onPress={handleClear} style={tw`p-2`}>
              <ThemedText key="clear-icon" style={tw`text-gray-500`}>X</ThemedText>
            </TouchableOpacity>
          ) : null
        }
        showLoading={isPending}
      />

      {/* Loading Indicator */}
      {isPending && (
        <ActivityIndicator size="large" color="#ff1493" style={tw`mt-4`} />
      )}

      {/* Search Results */}
      {results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item) => item._id.toString()}
          contentContainerStyle={tw`mt-4`}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push({ 
                pathname: `/book/${item._id}`, 
                params: { 
                  bookName: item.bookName, 
                  bookAuthor: item.bookAuthor 
                } 
              })}
              style={tw`p-4 bg-white rounded-lg mb-3`}
            >
              <ThemedText style={tw`font-bold text-lg`}>{item.bookName}</ThemedText>
              <ThemedText style={tw`text-gray-500`}>{item.bookAuthor}</ThemedText>
            </TouchableOpacity>
          )}
        />
      ) : searchWord && !isPending && !error ? (
        <ThemedText style={tw`text-center text-gray-500 mt-4`}>No results found</ThemedText>
      ) : null}

      {/* Error Message */}
      {error && (
        <ThemedText style={tw`text-center text-red-500 mt-4`}>{error}</ThemedText>
      )}

    </ThemedView>
  );
}
