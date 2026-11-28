import tw from 'twrnc';
import React, { useEffect, useState } from 'react';
import {
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
  View,
} from 'react-native';
<<<<<<< HEAD
import axios from 'axios';
import { API_BASE_URL } from '@/constants/api';
=======
import apiClient, { getApiErrorMessage } from '@/lib/api';
>>>>>>> f2780159c4f959ab1a343223f0569019255c3da6
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useRouter } from 'expo-router';
import { navigateToBookDetails } from '@/utils/navigation';
import { useAudio } from '@/context/AudioContext';
import { MINI_AUDIO_PLAYER_CLEARANCE } from '@/constants/layout';

const Related = ({ bookId }) => {
<<<<<<< HEAD
  const apiUrl = API_BASE_URL;
=======
>>>>>>> f2780159c4f959ab1a343223f0569019255c3da6
  const router = useRouter();
  const { audioDetails } = useAudio();

  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');
<<<<<<< HEAD
  const mutedColor = useThemeColor({}, 'muted');
=======
  const secondaryColor = useThemeColor({}, 'secondary');
>>>>>>> f2780159c4f959ab1a343223f0569019255c3da6

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
  }, [apiUrl, bookId]);

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
    <ThemedView style={[tw`flex-1 p-4`, { backgroundColor }]}>
      <FlatList
        style={tw`flex-1`}
        data={relatedBooks}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{
          paddingBottom: audioDetails ? MINI_AUDIO_PLAYER_CLEARANCE : 16,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <ThemedText style={tw`text-center text-gray-400 py-6`}>
            No related books yet.
          </ThemedText>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              tw`flex-row items-center p-4 rounded-lg mb-4 border`,
              { backgroundColor: surfaceColor, borderColor },
            ]}
            onPress={() => navigateToBookDetails(router, item._id)}
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
              <ThemedText type="link" style={{ color: mutedColor }}>
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
