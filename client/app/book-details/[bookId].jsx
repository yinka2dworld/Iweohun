import React, { useEffect, useState, useCallback } from 'react';
import {
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';
import apiClient, { getApiErrorMessage } from '@/lib/api';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import Chapters from '@/components/Chapters';
import Related from '@/components/Related';
import Reviews from '@/components/Reviews';
import BookRatings from '@/components/BookRatings';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import SecureStore from '@/lib/SecureStore';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useAudio } from '@/context/AudioContext';

export default function BookDetails() {
  const { bookId } = useLocalSearchParams();
  const router = useRouter();
  const { playChapter } = useAudio();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState('Chapters');
  const [hasListened, setHasListened] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'primary');

  const fetchBook = useCallback(async () => {
    if (!bookId) return;
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get(`/book/${bookId}`);
      setBook(response.data);
      setHasListened(false);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to load this book'));
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    fetchBook();
  }, [fetchBook]);

  useFocusEffect(
    useCallback(() => {
      const checkIfSaved = async () => {
        const userId = await SecureStore.getItemAsync('userId');
        if (!userId || !book?._id) return;

        const savedKey = `savedBooks_${userId}`;
        const saved = await SecureStore.getItemAsync(savedKey);
        const savedBooks = saved ? JSON.parse(saved) : [];

        const exists = savedBooks.some((b) => b._id === book._id);
        setIsSaved(exists);
      };
      if (book) checkIfSaved();
    }, [book])
  );

  const handleSave = async () => {
    try {
      const userId = await SecureStore.getItemAsync('userId');
      if (!userId) return;

      const savedKey = `savedBooks_${userId}`;
      const saved = await SecureStore.getItemAsync(savedKey);
      let savedBooks = saved ? JSON.parse(saved) : [];

      const exists = savedBooks.some((b) => b._id === book._id);
      savedBooks = exists ? savedBooks.filter((b) => b._id !== book._id) : [...savedBooks, book];

      await SecureStore.setItemAsync(savedKey, JSON.stringify(savedBooks));
      setIsSaved(!exists);
    } catch (e) {
      console.error('Error saving book:', e);
    }
  };

  const handleListen = async (id) => {
    try {
      await apiClient.post(`/addListener/${id}`);
    } catch (e) {
      console.warn('Error counting listener:', e.message);
    }
  };

  const handleChapterSelect = async (chapter) => {
    if (!book) return;

    const audioUrl = chapter.bookAudio || chapter.audioUrl;
    if (!audioUrl) {
      Alert.alert('Audio unavailable', 'This chapter audio is not available yet.');
      return;
    }

    playChapter({
      audioUrl,
      chapterTitle: chapter.title,
      book
    });
    if (book?._id && !hasListened) {
      await handleListen(book._id);
      setHasListened(true);
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

  if (loading) {
    return (
      <SafeAreaView style={[tw`flex-1 justify-center items-center` , { backgroundColor }]}>
        <ActivityIndicator size="large" color={primaryColor} />
        <ThemedText style={tw`mt-3`}>Loading audiobook</ThemedText>
      </SafeAreaView>
    );
  }

  if (error || !book) {
    return (
      <SafeAreaView style={[tw`flex-1 justify-center items-center p-4`, { backgroundColor }]}>
        <ThemedText style={tw`text-center`}>{error || 'Book not found'}</ThemedText>
        <TouchableOpacity onPress={fetchBook} style={tw`mt-6`}>
          <ThemedText style={{ color: primaryColor }}>Try again</ThemedText>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={[tw`flex-1`, { backgroundColor }]}>
      <FlatList
        ListHeaderComponent={
          <View style={[tw`w-full`, { backgroundColor }]}>
            {/* Top bar */}
            <ThemedView style={tw`flex-row items-center pb-2 px-2`}>
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
        ListFooterComponent={renderTabContent()}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
}
