import React from 'react';
import tw from 'twrnc';
import axios from 'axios';
import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { ActivityIndicator } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";



export default function TopChart() {
    const [books, setBooks] = useState([]); // Ensure books is an array
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  const router = useRouter();

  const backgroundColor = useThemeColor({}, 'background');
  const secondaryColor = useThemeColor({}, 'secondary');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const apiUrl = Constants.expoConfig?.extra?.API_BASE_URL;


  useEffect(() => {
    const token = AsyncStorage.getItem("authToken");

    axios.get(`${apiUrl}/books`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then((res) => {
        if (Array.isArray(res.data.books)) {
          setBooks(res.data.books); 
        } else {
          setBooks([]); 
        }
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []); // Removed unnecessary dependency array

  if (loading) {
    return (
      <ThemedView style={[tw`flex-1 items-center justify-center`, { backgroundColor }]}>
           <ActivityIndicator size="large" color="#ff1493" />
           <ThemedText style={{ color: textColor, marginTop: 10 }}>Loading</ThemedText>
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
    <ThemedView  style={[tw`flex-1`]}>
      <View style={tw`mx-5 mt-8`}>
        <ThemedText type ='title' style={{ color: textColor }}>Top Chart</ThemedText>
        <FlatList
          data={books}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={tw`pb-10 mt-5`}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[tw`flex-row items-center bg-white p-4 rounded-lg mb-4 shadow-md`]}
              onPress={() => router.push(`/book/${item.id}`, { book: item })}
            >
              <Image
                source={{ uri: item.bookCover }}
                style={tw`w-16 h-20 rounded-md`}
              />
              <View style={tw`ml-4 flex-1`}>
                <ThemedText type ='subtitle' >{item.bookName}</ThemedText>
                <ThemedText style={{ color: secondaryColor }}  type='link' >by {item.bookAuthor}</ThemedText>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </ThemedView>
  );
}
