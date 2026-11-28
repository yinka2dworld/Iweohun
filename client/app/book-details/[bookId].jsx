import React, { useEffect, useState, useCallback } from 'react';
import {
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Keyboard,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';
import axios from 'axios';
import { API_BASE_URL } from '@/constants/api';
import { useFocusEffect, useRouter, useLocalSearchParams } from 'expo-router';
import Chapters from '@/components/Chapters';
import Related from '@/components/Related';
import Reviews from '@/components/Reviews';
import BookRatings from '@/components/BookRatings';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import * as SecureStore from 'expo-secure-store';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
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

  const apiUrl = API_BASE_URL;
  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'primary');
  const mutedColor = useThemeColor({}, 'muted');

  useEffect(() => {
    const fetchBook = async () => {
      if (!bookId) return;
      try {
        setLoading(true);
        const token = await SecureStore.getItemAsync('authToken');
        if (!token) throw new Error('No authentication token found');

        const response = await axios.get(`${apiUrl}/book/${bookId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
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
  }, [apiUrl, bookId]);

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
      const userId = await SecureStore.getItemAsync('userId');
      const token = await SecureStore.getItemAsync('authToken');
      if (!userId || !token) return;

      await axios.post(`${apiUrl}/addListener/${id}`, { userId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (e) {
      console.error('Error counting listener:', e);
    }
  };

  const handleChapterSelect = async (chapter) => {
    if (!book) return;
    playChapter({
      audioUrl: chapter.audioUrl,
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
        return <Chapters book={book} apiUrl={apiUrl} onChapterSelect={handleChapterSelect} />;
      case 'Related':
        return <Related bookId={book._id} />;
      case 'Reviews':
        return <Reviews bookId={book._id} />;
      default:
        return null;
    }
  };

  const handleTabChange = (tab) => {
    Keyboard.dismiss();
    setSelectedTab(tab);
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
        <ThemedText>{error ? `Error: ${error}` : 'Book not found'}</ThemedText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor }]}>
      <View style={tw`flex-1`}>
        <View style={[tw`w-full`, { backgroundColor }]}>
          <ThemedView style={tw`flex-row items-center pb-2 px-2`}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={tw`p-2`}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <MaterialCommunityIcons name="arrow-left" size={28} color={primaryColor} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              style={tw`ml-auto p-2`}
              accessibilityRole="button"
              accessibilityLabel={isSaved ? 'Remove saved book' : 'Save book'}
            >
              <MaterialCommunityIcons
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={28}
                color={primaryColor}
              />
            </TouchableOpacity>
          </ThemedView>

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

          <ThemedView style={tw`flex-row`}>
            {['Chapters', 'Reviews', 'Related'].map((tab) => {
              const isSelected = selectedTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => handleTabChange(tab)}
                  style={tw`flex-1`}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`${tab} tab`}
                >
                  <ThemedView style={tw`items-center`}>
                    <ThemedText
                      style={[
                        tw`text-lg p-2 font-semibold`,
                        { color: isSelected ? primaryColor : mutedColor },
                      ]}
                    >
                      {tab}
                    </ThemedText>
                    {isSelected && (
                      <ThemedView style={[tw`h-1 w-10 rounded-full`, { backgroundColor: primaryColor }]} />
                    )}
                  </ThemedView>
                </TouchableOpacity>
              );
            })}
          </ThemedView>
        </View>

        <View style={tw`flex-1`}>
          {renderTabContent()}
        </View>
      </View>
    </SafeAreaView>
  );
}
