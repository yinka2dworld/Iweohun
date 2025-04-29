import tw from 'twrnc';
import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Image, ActivityIndicator, FlatList, View } from 'react-native';
import axios from 'axios';
import Constants from 'expo-constants';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';

const Related = ({ bookId }) => {
  const apiUrl = Constants.expoConfig?.extra?.API_BASE_URL;
   const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'primary');

  const [relatedBooks, setRelatedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedBooks = async () => {
      try {
        const token = await SecureStore.getItemAsync('authToken'); 
        const response = await axios.get(`${apiUrl}/relatedBooks/${bookId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setRelatedBooks(response.data.relatedBooks);
      } catch (error) {
        console.error('Error fetching related books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedBooks();
  }, [bookId]);

  if (loading) {
    return (
      <ThemedView style={[tw`flex-1 justify-center items-center`, { backgroundColor }]}>
        <ActivityIndicator size="large" color={primaryColor} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[tw`p-4`, { backgroundColor }]}>

      <FlatList
        data={relatedBooks}
        keyExtractor={(item) => item._id}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={tw`mr-4`}  onPress={() => router.push(`/book-details/${item._id}`)} >
            <Image
              source={{ uri: item.coverImage }}
              style={tw`w-24 h-36 rounded-lg`}
              resizeMode="cover"
            />
            <ThemedText style={tw`mt-2 text-center text-xs`} numberOfLines={2}>
              {item.title}
            </ThemedText>
          </TouchableOpacity>
        )}
      />
    </ThemedView>
  );
};

export default Related;
