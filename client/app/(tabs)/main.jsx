import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { ScrollView, ActivityIndicator } from 'react-native';
import tw from 'twrnc';
import Searchbar from '@/components/Searchbar';
import LanguageList from '@/components/LanguageList';
import CategorySection from '@/components/CategorySection';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Constants from 'expo-constants';

export default function Main() {
  const [books, setBooks] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');

  const apiUrl = Constants.expoConfig?.extra?.API_BASE_URL;

  const fetchBooks = useCallback(async () => {
    if (!apiUrl) {
      setError("API URL is not defined.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${apiUrl}/books`, {
        headers: { 'Content-Type': 'application/json' },
      });
      setBooks(response.data.books || []);
    } catch (error) {
      setError(error.message || "Failed to fetch books.");
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

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
      <ThemedView style={[tw`flex-1 items-center justify-center`, { backgroundColor }]}>
        <ThemedText style={{ color: textColor }}>Error: {error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[tw`flex-1`, { backgroundColor }]}>
      <ScrollView>
        {/* Header */}
        <ThemedView style={tw`ml-5 mt-5`}>
          <ThemedText type='title' style={{ color: textColor }}>Iweohun</ThemedText>
          <ThemedText style={[tw`text-lg font-semibold`, { color: primaryColor }]}>
            Orating African literature
          </ThemedText>
        </ThemedView>

        {/* Search & Language List */}
        <Searchbar />
        <LanguageList />

        {/* Category Sections */}
        <ThemedView style={tw`mb-10 w-full mx-5`}>
          {['History & Biographies', 'Fiction & Romance', 'Kids', 'Personal Development', 'Adventure & Thrillers'].map((category) => (
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
