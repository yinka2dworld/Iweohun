import React, { useCallback, useState } from 'react';
import SecureStore from '@/lib/SecureStore';
import { ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
<<<<<<< HEAD
=======
import { useFocusEffect, useRouter } from 'expo-router';
>>>>>>> f2780159c4f959ab1a343223f0569019255c3da6
import tw from 'twrnc';
import Searchbar from '@/components/Searchbar';
import LanguageList from '@/components/LanguageList';
import CategorySection from '@/components/CategorySection';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
<<<<<<< HEAD
import { useFocusEffect, useRouter } from 'expo-router';
import { API_BASE_URL } from '@/constants/api';
=======
import apiClient, { getApiErrorMessage } from '@/lib/api';
>>>>>>> f2780159c4f959ab1a343223f0569019255c3da6

export default function Main() {
  const router = useRouter();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [role, setRole] = useState(null);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
<<<<<<< HEAD
  const onPrimaryColor = useThemeColor({}, 'onPrimary');
  const apiUrl = API_BASE_URL;
=======
>>>>>>> f2780159c4f959ab1a343223f0569019255c3da6

  const fetchBooks = useCallback(async () => {
    try {
      const userRole = await SecureStore.getItemAsync('userRole');
      setRole(userRole);

      const response = await apiClient.get('/books');
      setBooks(Array.isArray(response.data?.books) ? response.data.books : []);
      setError(null);
    } catch (error) {
      setError(getApiErrorMessage(error, 'Failed to fetch books.'));
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Auto-refresh books when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchBooks();
    }, [fetchBooks])
  );

  if (loading) {
    return (
      <ThemedView style={[tw`flex-1 items-center justify-center`, { backgroundColor }]}>
        <ActivityIndicator size="large" color={primaryColor} />
        <ThemedText style={{ color: textColor, marginTop: 10 }}>Loading audiobooks</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={[tw`flex-1 items-center justify-center px-8`, { backgroundColor }]}>
        <ThemedText style={{ color: textColor, textAlign: 'center' }}>{error}</ThemedText>
        <TouchableOpacity
          onPress={() => {
            setLoading(true);
            setError(null);
            fetchBooks();
          }}
          style={[tw`mt-6 rounded-full px-6 py-3`, { backgroundColor: primaryColor }]}
        >
          <ThemedText style={tw`text-white font-semibold`}>Try again</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[tw`flex-1`, { backgroundColor }]}>
      <ThemedView style={tw`px-6 pt-15 pb-1`}>
        <ThemedText type='title' style={{ color: textColor }}>Iweohun</ThemedText>
        <ThemedText style={[tw`text-lg font-semibold`, { color: primaryColor }]}>
          Orating African literature
        </ThemedText>
      </ThemedView>

      <ScrollView>
        <Searchbar />

        {role === 'creator' && (
          <ThemedView style={tw`flex-row justify-end mb-4 mr-5`}>
            <TouchableOpacity
              style={[
                tw`rounded-3xl px-4 py-2`,
                { backgroundColor: primaryColor }
              ]}
              onPress={() => router.push('/addBook')}
            >
              <ThemedText style={[tw`text-lg font-semibold text-center`, { color: onPrimaryColor }]}>
                ✚ Create
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}

        <LanguageList />

        {/* Category Sections */}
        <ThemedView style={tw`mb-10 w-full px-5`}>
          {['History & Biographies', 'Fiction', 'Non-fiction', 'Kids', 'Personal Development', 'Adventure & Thrillers'].map((category) => (
            <CategorySection
              key={category}
              title={category}
              books={books.filter(book => book?.category === category)}
              textColor={textColor}
              primaryColor={primaryColor}
            />
          ))}
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}
