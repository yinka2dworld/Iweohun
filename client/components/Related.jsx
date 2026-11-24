import tw from 'twrnc';
import React, { useEffect, useState } from 'react';
import {
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
  View,
} from 'react-native';
import apiClient, { getApiErrorMessage } from '@/lib/api';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useRouter } from 'expo-router';

const Related = ({ bookId }) => {
  const router = useRouter();

  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');

  const [relatedBooks, setRelatedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRelatedBooks = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get(`/relatedBooks/${bookId}`);
        setRelatedBooks(
          Array.isArray(response.data?.relatedBooks) ? response.data.relatedBooks : []
        );
      } catch (err) {
        setError(getApiErrorMessage(err, 'Unable to load related books.'));
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

  if (error) {
    return (
      <ThemedView style={[tw`flex-1 justify-center items-center px-6`, { backgroundColor }]}>
        <ThemedText style={tw`text-center text-gray-500`}>{error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[tw`p-4`, { backgroundColor }]}>
      <FlatList
        data={relatedBooks}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <ThemedText style={tw`text-center text-gray-400 py-6`}>
            No related books yet.
          </ThemedText>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              tw`flex-row items-center p-4 rounded-lg mb-4 border border-gray-300`]}
            onPress={() => router.push(`/book-details/${item._id}`)}
          >
            <Image
              source={{ uri: item.bookCover }}
              style={tw`w-10 h-15 rounded-md`}
              resizeMode="cover"
            />
            <View style={tw`ml-4 flex-1`}>
              <ThemedText type="subtitle" style={{ color: primaryColor }}>
                {item.bookName}
              </ThemedText>
              <ThemedText type="link" style={{ color: secondaryColor }}>
                by {item.bookAuthor}
              </ThemedText>
            </View>
          </TouchableOpacity>
        )}
      />
    </ThemedView>
  );
};

export default Related;
