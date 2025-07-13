import React, { useEffect, useState } from 'react'; 
import { SafeAreaView, TouchableOpacity, Image, ActivityIndicator, FlatList, View } from 'react-native';
import tw from 'twrnc';
import axios from 'axios';
import Constants from 'expo-constants';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Chapters from '@/components/Chapters';
import Related from '@/components/Related';
import Reviews from '@/components/Reviews';
import AudioPlayer from '@/components/AudioPlayer';
import BookRatings from '@/components/BookRatings';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import * as SecureStore from 'expo-secure-store';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function BookDetails () {
  const { bookId } = useLocalSearchParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState('Chapters');
  const [audioDetails, setAudioDetails] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [hasListened, setHasListened] = useState(false);

  const router = useRouter();
  const apiUrl = Constants.expoConfig?.extra?.API_BASE_URL;

  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'primary');

  useEffect(() => {
    const fetchBook = async () => {
      if (!bookId) return;

      try {
        setLoading(true);
        setError(null);
        const token = await SecureStore.getItemAsync('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }
        const response = await axios.get(`${apiUrl}/book/${bookId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        setBook(response.data);
        setHasListened(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [bookId]);

  // Reset tab to "Chapters" when book changes
  useEffect(() => {
    if (book) {
      setSelectedTab('Chapters');
    }
  }, [book]);

  const handleChapterSelect = async (chapter) => {
    setAudioDetails({
      audioUrl: chapter.audioUrl,
      chapterTitle: chapter.title,
    });

    if (book?._id && !hasListened) { 
      await handleListen(book._id);
      setHasListened(true); 
    }
  };

  const handleListen = async (bookId) => {
    try {
      const userId = await SecureStore.getItemAsync('userId');
      const token = await SecureStore.getItemAsync('authToken');
      
      if (!userId || !token) {
        console.warn('User ID or Token not found.');
        return;
      }

      await axios.post(`${apiUrl}/addListener/${bookId}`, { userId }, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      console.log('Listener counted successfully.');
    } catch (error) {
      console.error('Error counting listener:', error);
    }
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'Chapters':
        return <Chapters book={book} onChapterSelect={handleChapterSelect} />;
      case 'Related':
        return <Related bookId={book._id} />;
      case 'Reviews':
        return <Reviews bookId={book._id} />;
      default:
        return null;
    }
  };

  useEffect(() => {
    const checkIfSaved = async () => {
      const saved = await SecureStore.getItemAsync('savedBooks');
      const savedBooks = saved ? JSON.parse(saved) : [];
      const exists = savedBooks.some((b) => b._id === book?._id);
      setIsSaved(exists);
    };
    if (book) checkIfSaved();
  }, [book]);

  const handleSave = async () => {
    try {
      const saved = await SecureStore.getItemAsync('savedBooks');
      let savedBooks = saved ? JSON.parse(saved) : [];

      const exists = savedBooks.some((b) => b._id === book._id);

      if (exists) {
        savedBooks = savedBooks.filter((b) => b._id !== book._id);
      } else {
        savedBooks.push(book);
      }

      await SecureStore.setItemAsync('savedBooks', JSON.stringify(savedBooks));
      setIsSaved(!exists);
    } catch (error) {
      console.error('Error saving book:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[tw`flex-1 justify-center items-center`, { backgroundColor }]}>
        <ActivityIndicator size="large" color={primaryColor} />
        <ThemedText style={tw`mt-3`}>Loading audiobook</ThemedText>
      </SafeAreaView>
    );
  }

  if (error || !book) {
    return (
      <SafeAreaView style={[tw`flex-1 justify-center items-center p-4`, { backgroundColor }]}>
        <ThemedText>{error ? `Error: ${error}` : 'Book not found'}</ThemedText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor }]}>
      <FlatList
        ListHeaderComponent={
          <View style={[tw`w-full`, { backgroundColor }]}>
            {/* Header */}
            <ThemedView style={tw`flex-row items-center pt-8 pb-2 px-2`}>
              <TouchableOpacity onPress={() => router.back()} style={tw`p-2`}>
                <MaterialCommunityIcons name="arrow-left" size={28} color={primaryColor} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={tw`ml-auto p-2`}>
                <MaterialCommunityIcons
                  name={isSaved ? 'bookmark' : 'bookmark-outline'}
                  size={28}
                  color={primaryColor}
                />
              </TouchableOpacity>
            </ThemedView>

            {/* Book Info */}
            <ThemedView style={tw`items-center`}>
              {book.bookCover ? (
                <Image
                  source={{ uri: book.bookCover }}
                  style={tw`w-35 h-45 rounded-lg shadow-lg`}
                  resizeMode="cover"
                />
              ) : (
                <ThemedText style={tw`text-lg font-bold`}>No Cover Available</ThemedText>
              )}

              <ThemedText style={tw`text-xl font-bold mt-3`}>{book.bookName}</ThemedText>
              <BookRatings bookId={bookId} />
            </ThemedView>

            {/* Tabs */}
            <ThemedView style={tw`flex-row`}>
              {['Chapters', 'Reviews', 'Related'].map((tab) => (
                <TouchableOpacity key={tab} onPress={() => setSelectedTab(tab)} style={tw`flex-1`}>
                  <ThemedView style={tw`items-center`}>
                    <ThemedText
                      style={[
                        tw`text-lg p-2 font-semibold`,
                        { color: selectedTab === tab ? primaryColor : '#999' },
                      ]}
                    >
                      {tab}
                    </ThemedText>
                    {selectedTab === tab && (
                      <ThemedView style={[tw`h-1 w-10 rounded-full`, { backgroundColor: primaryColor }]} />
                    )}
                  </ThemedView>
                </TouchableOpacity>
              ))}
            </ThemedView>
          </View>
        }
        data={[]}
        renderItem={null}
        ListFooterComponent={renderTabContent()}
        keyExtractor={(item, index) => index.toString()}
        stickyHeaderIndices={[0]}
      />

      {audioDetails && (
        <AudioPlayer
          audioUrl={audioDetails.audioUrl}
          chapterTitle={audioDetails.chapterTitle}
          onClose={() => setAudioDetails(null)}
          book={book}
        />
      )}
    </SafeAreaView>
  );
};

 

