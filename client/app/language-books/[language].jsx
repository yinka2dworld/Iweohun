import React, { useEffect, useState } from 'react';
import { View, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import tw from 'twrnc';
import axios from 'axios';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { LinearGradient } from 'expo-linear-gradient';



export default function LanguageBooks() {
  const { language } = useLocalSearchParams();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const router = useRouter();
  const disc = require('../../assets/images/disc.png');

  const backgroundColor = useThemeColor({}, 'background');
  const secondaryColor = useThemeColor({}, 'secondary');
  const textColor = '#070c70';
  const apiUrl = Constants.expoConfig?.extra?.API_BASE_URL;


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
        setError(err instanceof Error ? err.message : 'Failed to fetch books');
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [apiUrl]);

  
  if (loading) {
    return (
      <ThemedView style={[tw`flex-1 items-center justify-center`, { backgroundColor }]}>
        <ActivityIndicator size="large" color="#ff1493" />
        <ThemedText style={{ color: textColor, marginTop: 10 }}>Loading topchart...</ThemedText>
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
    <ThemedView style={tw`flex-1 p-4`}>
      <FlatList
        data={books}
        keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={tw`pb-10`}
        ListHeaderComponent={
            <ThemedView style={tw`mt-8 p-10`}>
              <ThemedText type='title' style={{ color: '#ff1493' }}>{language}</ThemedText>
            </ThemedView>
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/book-details/${item._id}`)}>
             <LinearGradient colors={['#070c70', '#ff1493']} style={tw`mb-4 p-4 rounded-lg`}>
                  <View style={tw`flex-row`}>
                    <Image source={{ uri: item.bookCover }} style={tw`w-20 h-25 rounded-lg mr-4`} />
                    <View style={tw`flex-1 justify-center`}>
                      <ThemedText style={tw`text-lg font-bold text-white`}>{item.bookName}</ThemedText>
                      <ThemedText style={tw`text-sm text-white`}>{item.bookAuthor}</ThemedText>
                    </View>
                  </View>
                </LinearGradient>
          </TouchableOpacity>
        )}
      />
    </ThemedView>
  );
}