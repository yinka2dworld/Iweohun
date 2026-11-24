import { useState, useEffect } from 'react';
import { TouchableOpacity, FlatList, View, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import tw from 'twrnc';
import apiClient, { getApiErrorMessage } from '@/lib/api';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function Searchbar() {
  const router = useRouter();
  const [searchWord, setSearchWord] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const backgroundColor = useThemeColor({}, 'background');
 const textColor = useThemeColor({}, 'text');

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setIsPending(true);
    try {
      const response = await apiClient.get('/searchBar', { params: { searchTerm: query.trim() } });
      setResults(Array.isArray(response.data?.books) ? response.data.books : []);
      setError(null);
    } catch (err) {
      console.error('Search failed:', err.message);
      setError(getApiErrorMessage(err, 'Failed to fetch results. Please try again.'));
    } finally {
      setIsPending(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      handleSearch(searchWord);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchWord]);

  const handleClear = () => {
    setSearchWord('');
    setResults([]);
  };

  return (
    <ThemedView style={tw`p-4`}>
      {/* Custom Search Input */}
      <View style={[
        tw`flex-row items-center rounded-lg px-3 mb-3`,
        { backgroundColor }
      ]}>
        <TextInput
          style={[
            tw`flex-1 py-2 text-base`,
            { color: textColor }
          ]}
          placeholder="Search for audiobook..."
          placeholderTextColor="#999"
          onChangeText={setSearchWord}
          value={searchWord}
        />
        {searchWord ? (
          <TouchableOpacity onPress={handleClear} style={tw`p-2`}>
            <ThemedText style={tw`text-gray-500 text-lg`}>✕</ThemedText>
          </TouchableOpacity>
        ) : null}
      </View>

      {isPending && (
        <ActivityIndicator size="large" color="#ff1493" style={tw`mt-4`} />
      )}

      <View style={tw`flex-1`}>
        {results.length > 0 ? (
          <FlatList
            data={results}
            keyExtractor={(item) => item._id.toString()}
            contentContainerStyle={tw`mt-4`}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: `/book-details/${item._id}`,
                    params: {
                      bookName: item.bookName,
                      bookAuthor: item.bookAuthor
                    }
                  })
                }
                style={tw`p-4 bg-white rounded-lg mb-3`}
              >
                <ThemedText style={[tw`font-bold text-lg`, { color: textColor }]}>
                  {item.bookName}
                </ThemedText>
                <ThemedText style={tw`text-gray-500`}>{item.bookAuthor}</ThemedText>
              </TouchableOpacity>
            )}
            nestedScrollEnabled={true}
            scrollEnabled={false}
          />
        ) : searchWord && !isPending && !error ? (
          <ThemedText style={tw`text-center text-gray-500 mt-4`}>
            No results found
          </ThemedText>
        ) : null}
      </View>

      {error && (
        <ThemedText style={tw`text-center text-red-500 mt-4`}>{error}</ThemedText>
      )}
    </ThemedView>
  );
}
