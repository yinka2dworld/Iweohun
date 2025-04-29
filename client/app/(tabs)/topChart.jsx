import React, { useEffect, useState } from 'react';
import { View, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import tw from 'twrnc';
import axios from 'axios';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { LinearGradient } from 'expo-linear-gradient';

export default function TopChart() {
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
  
        const response = await axios.get(`${apiUrl}/topChart`, {
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
    <ThemedView style={tw`flex-1`}>
      <FlatList
        data={books}
        keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={tw`pb-10`}
        ListHeaderComponent={
          <LinearGradient colors={['#070c70', '#ff1493']} style={tw`p-6 rounded-b-xl mb-6`}>
            <ThemedText type='title' style={[{ color: 'white' }, tw`mt-3`]}>Top Chart</ThemedText>
            <View style={tw`flex-row space-x-2 mt-7`}>
              <Image source={disc} style={tw`h-25 w-25`} resizeMode="contain" />
              <ThemedText style={[tw` text-xl ml-3 mt-5 text-xl`, { fontStyle: 'italic' }]}>
                Listen to the most rated audiobooks right now!
              </ThemedText>
            </View>
          </LinearGradient>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[tw`flex-row items-center bg-white p-4 rounded-lg mb-4 shadow-md mx-5`]}
            onPress={() => router.push(`/book-details/${item._id}`)}
          >
            <Image source={{ uri: item.bookCover }} style={tw`w-16 h-20 rounded-md`} />
            <View style={tw`ml-4 flex-1`}>
              <ThemedText type='subtitle' style={{ color: textColor }} >{item.bookName}</ThemedText>
              <ThemedText style={{ color: secondaryColor }} type='link'>by {item.bookAuthor}</ThemedText>
            </View>
          </TouchableOpacity>
        )}
      />
    </ThemedView>
  );
}














