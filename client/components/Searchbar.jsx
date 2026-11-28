import { useState, useEffect } from 'react';
import { TouchableOpacity, FlatList, View, TextInput, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import tw from 'twrnc';
<<<<<<< HEAD
import axios from 'axios';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { API_BASE_URL } from '@/constants/api';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { navigateToBookDetails } from '@/utils/navigation';
import * as SecureStore from 'expo-secure-store';
=======
import apiClient, { getApiErrorMessage } from '@/lib/api';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
>>>>>>> f2780159c4f959ab1a343223f0569019255c3da6

export default function Searchbar() {
  const router = useRouter();
  const [searchWord, setSearchWord] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
<<<<<<< HEAD
  const apiUrl = API_BASE_URL;
=======
>>>>>>> f2780159c4f959ab1a343223f0569019255c3da6


  const surfaceColor = useThemeColor({}, 'surface');
  const surfaceAltColor = useThemeColor({}, 'surfaceAlt');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'muted');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'border');
  const dangerColor = useThemeColor({}, 'danger');

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
        tw`flex-row items-center rounded-lg px-3 mb-3 border`,
        { backgroundColor: surfaceAltColor, borderColor }
      ]}>
        <TextInput
          style={[
            tw`flex-1 py-2 text-base`,
            { color: textColor }
          ]}
          placeholder="Search for audiobook..."
          placeholderTextColor={mutedColor}
          onChangeText={setSearchWord}
          value={searchWord}
        />
        {searchWord ? (
          <TouchableOpacity onPress={handleClear} style={tw`p-2`}>
            <ThemedText style={[tw`text-lg`, { color: mutedColor }]}>✕</ThemedText>
          </TouchableOpacity>
        ) : null}
      </View>

      {isPending && (
        <ActivityIndicator size="large" color={primaryColor} style={tw`mt-4`} />
      )}

      <View style={tw`flex-1`}>
        {results.length > 0 ? (
          <FlatList
            data={results}
            keyExtractor={(item) => item._id.toString()}
            contentContainerStyle={tw`mt-4`}
            renderItem={({ item }) => (
              <SearchResult
                item={item}
                onPress={() => navigateToBookDetails(router, item._id)}
                surfaceColor={surfaceColor}
                surfaceAltColor={surfaceAltColor}
                textColor={textColor}
                mutedColor={mutedColor}
                primaryColor={primaryColor}
                borderColor={borderColor}
              />
            )}
            nestedScrollEnabled={true}
            scrollEnabled={false}
          />
        ) : searchWord && !isPending && !error ? (
          <ThemedText style={[tw`text-center mt-4`, { color: mutedColor }]}>
            No results found
          </ThemedText>
        ) : null}
      </View>

      {error && (
        <ThemedText style={[tw`text-center mt-4`, { color: dangerColor }]}>{error}</ThemedText>
      )}
    </ThemedView>
  );
}

function SearchResult({
  item,
  onPress,
  surfaceColor,
  surfaceAltColor,
  textColor,
  mutedColor,
  primaryColor,
  borderColor,
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const hasCover = typeof item.bookCover === 'string' && item.bookCover.trim() && !imageFailed;

  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.bookName}, by ${item.bookAuthor}`}
      style={[
        tw`flex-row items-center p-3 rounded-lg mb-3 border`,
        { backgroundColor: surfaceColor, borderColor },
      ]}
    >
      {hasCover ? (
        <Image
          source={{ uri: item.bookCover }}
          style={[tw`w-14 h-18 rounded-md`, { backgroundColor: surfaceAltColor }]}
          resizeMode="cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <View style={[tw`w-14 h-18 rounded-md items-center justify-center`, { backgroundColor: surfaceAltColor }]}>
          <MaterialCommunityIcons name="book-open-page-variant" size={26} color={mutedColor} />
        </View>
      )}
      <View style={tw`ml-3 flex-1`}>
        <ThemedText style={[tw`font-bold text-lg`, { color: textColor }]}>
          {item.bookName}
        </ThemedText>
        <ThemedText style={{ color: mutedColor }}>{item.bookAuthor}</ThemedText>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={22} color={primaryColor} />
    </TouchableOpacity>
  );
}
