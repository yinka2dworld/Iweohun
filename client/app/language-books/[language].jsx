import React, { useEffect, useState } from 'react';
import { View, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import tw from 'twrnc';
import axios from 'axios';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { API_BASE_URL } from '@/constants/api';
import * as SecureStore from 'expo-secure-store';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { navigateToBookDetails } from '@/utils/navigation';


export default function LanguageBooks() {
  const { language } = useLocalSearchParams();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const router = useRouter();

  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'primary');
  const gradientStart = useThemeColor({}, 'gradientStart');
  const gradientEnd = useThemeColor({}, 'gradientEnd');
  const onGradient = useThemeColor({}, 'onGradient');
  const textColor = useThemeColor({}, 'text');
  const apiUrl = API_BASE_URL;

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = await SecureStore.getItemAsync('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get(`${apiUrl}/books/${language}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const booksData = Array.isArray(response.data?.books)
          ? response.data.books
          : [];
        setBooks(booksData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Coming soon');
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [apiUrl]);

  if (loading) {
    return (
      <ThemedView style={[tw`flex-1 items-center justify-center`, { backgroundColor }]}>
        <ActivityIndicator size="large" color={primaryColor} />
        <ThemedText style={{ color: textColor, marginTop: 10 }}>Loading books...</ThemedText>
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

      {/* Static Header */}
      <ThemedView style={tw`flex-row gap-4 pt-13 px-4 pb-3`}>
        <TouchableOpacity onPress={() => router.back()} >
                        <MaterialCommunityIcons name="arrow-left" size={28} color={primaryColor} />
                      </TouchableOpacity>
        <ThemedText type="title" style={{ color: primaryColor }}>
          {language}
        </ThemedText>
      </ThemedView>

      {/* Scrollable List */}
      <FlatList
        data={books}
        keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={tw`py-6 px-4`}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigateToBookDetails(router, item._id)}>
            <LinearGradient colors={[gradientStart, gradientEnd]} style={tw`mb-4 p-4 rounded-lg`}>
              <View style={tw`flex-row`}>
                <Image source={{ uri: item.bookCover }} style={tw`w-20 h-25 rounded-lg mr-4`} />
                <View style={tw`flex-1 justify-center`}>
                  <ThemedText style={[tw`text-lg font-bold`, { color: onGradient }]}>
                    {item.bookName}
                  </ThemedText>
                  <ThemedText style={[tw`text-sm`, { color: onGradient }]}>
                    {item.bookAuthor}
                  </ThemedText>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}
      />
    </ThemedView>
  );
}
