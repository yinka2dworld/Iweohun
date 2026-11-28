import React, { useEffect, useState, useCallback } from 'react';
import {
  TouchableOpacity,
  Image,
  ActivityIndicator,
<<<<<<< HEAD
  Keyboard,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';
import axios from 'axios';
import { API_BASE_URL } from '@/constants/api';
import { useFocusEffect, useRouter, useLocalSearchParams } from 'expo-router';
=======
  FlatList,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';
import apiClient, { getApiErrorMessage } from '@/lib/api';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
>>>>>>> f2780159c4f959ab1a343223f0569019255c3da6
import Chapters from '@/components/Chapters';
import Related from '@/components/Related';
import Reviews from '@/components/Reviews';
import BookRatings from '@/components/BookRatings';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
<<<<<<< HEAD
import * as SecureStore from 'expo-secure-store';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
=======
import SecureStore from '@/lib/SecureStore';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
>>>>>>> f2780159c4f959ab1a343223f0569019255c3da6
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

<<<<<<< HEAD
  const apiUrl = API_BASE_URL;
=======
>>>>>>> f2780159c4f959ab1a343223f0569019255c3da6
  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'primary');
  const mutedColor = useThemeColor({}, 'muted');

  const fetchBook = useCallback(async () => {
    if (!bookId) return;
    try {
      setLoading(true);
      setError(null);

<<<<<<< HEAD
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
=======
      const response = await apiClient.get(`/book/${bookId}`);
      setBook(response.data);
      setHasListened(false);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to load this book'));
    } finally {
      setLoading(false);
    }
  }, [bookId]);
>>>>>>> f2780159c4f959ab1a343223f0569019255c3da6

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
        <ThemedText style={tw`text-center`}>{error || 'Book not found'}</ThemedText>
        <TouchableOpacity onPress={fetchBook} style={tw`mt-6`}>
          <ThemedText style={{ color: primaryColor }}>Try again</ThemedText>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
<<<<<<< HEAD
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
=======
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
>>>>>>> f2780159c4f959ab1a343223f0569019255c3da6

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
<<<<<<< HEAD
              );
            })}
          </ThemedView>
        </View>

        <View style={tw`flex-1`}>
          {renderTabContent()}
        </View>
      </View>
    </SafeAreaView>
=======
              ))}
            </ThemedView>
          </View>
        }
        data={[]}
        ListFooterComponent={renderTabContent()}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
>>>>>>> f2780159c4f959ab1a343223f0569019255c3da6
  );
}
