import React, { useEffect, useState } from 'react';
import { SafeAreaView, TouchableOpacity, Image, ActivityIndicator, FlatList } from 'react-native';
import tw from 'twrnc';
import axios from 'axios';
import Constants from 'expo-constants';
import { useRouter, useLocalSearchParams } from 'expo-router';
import StarRating from 'react-native-star-rating-widget';
import Chapters from '@/components/Chapters';
import Related from '@/components/Related';
import Reviews from '@/components/Reviews';
import AudioPlayer from '@/components/AudioPlayer';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const BookDetails = ({ defaultRating = 0 }) => {
  const { bookId } = useLocalSearchParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState('Chapters');
  const [audioDetails, setAudioDetails] = useState(null);
  const [rating, setRating] = useState(defaultRating);

  const router = useRouter();
  const apiUrl = Constants.expoConfig?.extra?.API_BASE_URL;

  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'primary');

  useEffect(() => {
    if (!bookId) return;
    setLoading(true);

    axios
      .get(`${apiUrl}/book/${bookId}`)
      .then((res) => {
        setBook(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [bookId]);

  const handleChapterSelect = (chapter) => {
    setAudioDetails({
      audioUri: chapter.audioUri,
      chapterTitle: chapter.title,
    });
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'Chapters':
        return <Chapters book={book} onChapterSelect={handleChapterSelect} />;
      case 'Related':
        return <Related />;
      case 'Reviews':
        return <Reviews />;
      default:
        return null;
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
          <ThemedView>
            {/* Header */}
            <ThemedView style={tw`flex-row items-center my-3`}>
              <TouchableOpacity onPress={() => router.back()} style={tw`p-2`}>
                <MaterialCommunityIcons name="arrow-left" size={28} color={primaryColor} />
              </TouchableOpacity>
            </ThemedView>

            {/* Book Details */}
            <ThemedView style={tw`items-center mb-6`}>
              {book.bookCover ? (
                <Image source={{ uri: book.bookCover }} style={tw`w-50 h-60 rounded-lg shadow-lg`} resizeMode="cover" />
              ) : (
                <ThemedText style={tw`text-lg font-bold`}>No Cover Available</ThemedText>
              )}

              <ThemedText style={tw`text-xl font-bold mt-3`}>{book.bookName}</ThemedText>
              <ThemedText style={[tw`text-sm font-semibold`, { color: primaryColor }]}>Author: {book.bookAuthor}</ThemedText>
              <ThemedText style={tw`text-sm`}>Reciter: {book.reciter || 'N/A'}</ThemedText>

              <ThemedView style={tw`mt-2`}>
                <StarRating rating={rating} onChange={setRating} starSize={20} color={primaryColor} />
              </ThemedView>
            </ThemedView>

            {/* Tabs */}
            <ThemedView style={tw`flex-row`}>
              {['Chapters', 'Reviews', 'Related'].map((tab) => (
                <TouchableOpacity key={tab} onPress={() => setSelectedTab(tab)} style={tw`flex-1`}>
                  <ThemedView style={tw`items-center`}>
                    <ThemedText style={[tw`text-lg p-2 font-semibold`, { color: selectedTab === tab ? primaryColor : '#999' }]}>{tab}</ThemedText>
                    {selectedTab === tab && <ThemedView style={[tw`h-1 w-10 rounded-full`, { backgroundColor: primaryColor }]} />}
                  </ThemedView>
                </TouchableOpacity>
              ))}
            </ThemedView>
          </ThemedView>
        }
        data={[]}
        renderItem={null}
        ListFooterComponent={renderTabContent()}
        keyExtractor={(item, index) => index.toString()}
      />

      {audioDetails && (
        <AudioPlayer audioUri={audioDetails.audioUri} chapterTitle={audioDetails.chapterTitle} onClose={() => setAudioDetails(null)} />
      )}
    </SafeAreaView>
  );
};

export default BookDetails;
