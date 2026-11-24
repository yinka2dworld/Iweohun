import React, { useCallback, useState } from 'react';
import { View, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import tw from 'twrnc';
import apiClient, { getApiErrorMessage } from '@/lib/api';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useRouter, useFocusEffect } from 'expo-router';
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

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/topChart');
      const booksData = Array.isArray(response.data?.books) ? response.data.books : [];
      setBooks(booksData);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to fetch books'));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchBooks();
    }, [fetchBooks])
  );

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
      <ThemedView style={[tw`flex-1 items-center justify-center px-8`, { backgroundColor }]}>
        <ThemedText style={{ color: textColor, textAlign: 'center' }}>{error}</ThemedText>
        <ThemedText
          onPress={fetchBooks}
          style={[tw`mt-6 font-semibold`, { color: '#ff1493' }]}
        >
          Try again
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={tw`flex-1`}>
      <LinearGradient colors={['#070c70', '#ff1493']} style={tw`p-5 rounded-b-xl`}>
        <ThemedText type='title' style={[{ color: 'white' }, tw`pt-9`]}>Top Chart</ThemedText>
        <View style={tw`flex-row space-x-2 mx-3 mt-2`}>
          <Image source={disc} style={tw`h-25 w-25`} resizeMode="contain" />
          <ThemedText style={[tw` text-xl pl-3 pt-5`, { fontStyle: 'italic', color: 'white' }]}>
            Listen to the most rated audiobooks right now!
          </ThemedText>
        </View>
      </LinearGradient>

      <FlatList
        data={books}
        keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={tw`px-6 py-6`}
        ListEmptyComponent={
          <ThemedText style={tw`text-center text-gray-500 py-8`}>
            No books on the chart yet.
          </ThemedText>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[tw`flex-row items-center bg-white p-4 rounded-lg mb-4 shadow-md`]}
            onPress={() => router.push(`/book-details/${item._id}`)}
          >
            <Image source={{ uri: item.bookCover }} style={tw`w-16 h-20 rounded-md`} />
            <View style={tw`ml-4 flex-1`}>
              <ThemedText type='subtitle' style={{ color: textColor }}>{item.bookName}</ThemedText>
              <ThemedText style={{ color: secondaryColor }} type='link'>by {item.bookAuthor}</ThemedText>
            </View>
          </TouchableOpacity>
        )}
      />
    </ThemedView>
  );
}












