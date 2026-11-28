import tw from 'twrnc';
import React, { useEffect, useState } from 'react';
import {
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
  View,
} from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '@/constants/api';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { navigateToBookDetails } from '@/utils/navigation';
import { useAudio } from '@/context/AudioContext';
import { MINI_AUDIO_PLAYER_CLEARANCE } from '@/constants/layout';

const Related = ({ bookId }) => {
  const apiUrl = API_BASE_URL;
  const router = useRouter();
  const { audioDetails } = useAudio();

  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');
  const mutedColor = useThemeColor({}, 'muted');

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
  }, [apiUrl, bookId]);

  if (loading) {
    return (
      <ThemedView style={[tw`flex-1 justify-center items-center`, { backgroundColor }]}>
        <ActivityIndicator size="large" color={primaryColor} />
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
