import React, { useEffect, useState } from 'react';
import { View, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import tw from 'twrnc';
import axios from 'axios';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

export default function TopChart() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const router = useRouter();
  const disc = require('../../assets/images/disc.png');

  const backgroundColor = useThemeColor({}, 'background');
  const secondaryColor = useThemeColor({}, 'secondary');
  const textColor = useThemeColor({}, 'text');
  const apiUrl = Constants.expoConfig?.extra?.API_BASE_URL;

  useEffect(() => {
    axios.get(`${apiUrl}/books`, {
        headers: { 'Content-Type': 'application/json' },
      })
      .then((res) => {
        setBooks(Array.isArray(res.data.books) ? res.data.books : []);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

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
            <ThemedText type='title' style={{ color: 'white' }}>Top Chart</ThemedText>
            <View style={tw`flex-row space-x-3 mt-10`}>
              <Image source={disc} style={tw`h-30 w-30`} resizeMode="contain" />
              <ThemedText style={[tw`text-[#a6a6a6] text-3xl ml-3 mt-8 text-xl`, { fontStyle: 'italic' }]}>
                Listen to the most rated audiobooks right now!
              </ThemedText>
            </View>
          </LinearGradient>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[tw`flex-row items-center bg-white p-4 rounded-lg mb-4 shadow-md mx-5`]}
            onPress={() => router.push(`/book-details/${item._id}`, { book: item })}
          >
            <Image source={{ uri: item.bookCover }} style={tw`w-16 h-20 rounded-md`} />
            <View style={tw`ml-4 flex-1`}>
              <ThemedText type='subtitle'>{item.bookName}</ThemedText>
              <ThemedText style={{ color: secondaryColor }} type='link'>by {item.bookAuthor}</ThemedText>
            </View>
          </TouchableOpacity>
        )}
      />
    </ThemedView>
  );
}
