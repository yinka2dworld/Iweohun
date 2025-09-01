import React, { useState, useCallback } from 'react';
import {
  SafeAreaView,
  FlatList,
  View,
  TouchableOpacity,
  Image,
  Pressable,
  Dimensions,
  ActivityIndicator,
  Share,
} from 'react-native';
import tw from 'twrnc';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

export default function Library() {
  const router = useRouter();
  const [savedBooks, setSavedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, right: 0 });
  const [userId, setUserId] = useState(null);

  const backgroundColor = useThemeColor({}, 'background');
  const modalBackgroundColor = useThemeColor({}, 'modalBackground');
  const textColor = useThemeColor({}, 'text');

  useFocusEffect(
    useCallback(() => {
      const fetchSavedBooks = async () => {
        try {
          const id = await SecureStore.getItemAsync('userId');
          setUserId(id);
          if (!id) {
            setSavedBooks([]);
            setLoading(false);
            return;
          }

          const saved = await SecureStore.getItemAsync(`savedBooks_${id}`);
          setSavedBooks(saved ? JSON.parse(saved) : []);
        } catch (error) {
          console.error('Error loading saved books:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchSavedBooks();
    }, [])
  );

  const handlePress = (book, event) => {
    const { pageX, pageY } = event.nativeEvent;
    const screenWidth = Dimensions.get('window').width;

    setSelectedBook(book);
    setButtonPosition({
      top: pageY,
      right: Math.max(10, screenWidth - pageX - 40),
    });
    setModalVisible(true);
  };

  const handleRemove = async (bookId) => {
    try {
      if (!userId) return;
      const updatedBooks = savedBooks.filter((book) => book._id !== bookId);
      setSavedBooks(updatedBooks);
      await SecureStore.setItemAsync(`savedBooks_${userId}`, JSON.stringify(updatedBooks));
      setModalVisible(false);
    } catch (error) {
      console.error('Error removing book:', error);
    }
  };

  const handleShare = async () => {
    if (!selectedBook) return;

    try {
      const result = await Share.share({
        message: `Check out this audiobook: ${selectedBook.bookName} by ${selectedBook.bookAuthor}`,
        url: selectedBook.bookCover,
        title: selectedBook.bookName,
      });

      if (result.action === Share.sharedAction) {
        console.log('Shared successfully');
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing:', error.message);
    }
  };

  if (loading) {
    return (
      <ThemedView style={[tw`flex-1 items-center justify-center`, { backgroundColor }]}>
        <ActivityIndicator size="large" color="#ff1493" />
        <ThemedText style={{ color: textColor, marginTop: 10 }}>Loading library...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor }]}>
      {/* Header */}
      <ThemedView style={tw`px-6  pb-4`}>
        <ThemedText type="title" style={[tw`text-2xl font-bold`, { color: textColor }]}>
          My Library
        </ThemedText>
      </ThemedView>

      {/* Book List */}
      {savedBooks.length === 0 ? (
        <View style={tw`px-4`}>
          <ThemedText style={{ color: textColor }}>No books in your library.</ThemedText>
        </View>
      ) : (
        <FlatList
          data={savedBooks}
          keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
          contentContainerStyle={tw`py-6 px-6`}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => router.push(`/book-details/${item._id}`)}>
              <LinearGradient colors={['#070c70', '#ff1493']} style={tw`mb-4 p-4 rounded-lg`}>
                <View style={tw`flex-row`}>
                  <Image source={{ uri: item.bookCover }} style={tw`w-20 h-25 rounded-lg mr-4`} />
                  <View style={tw`flex-1 justify-center`}>
                    <ThemedText style={tw`text-lg font-bold text-white`}>
                      {item.bookName}
                    </ThemedText>
                    <ThemedText style={tw`text-sm text-white`}>
                      {item.bookAuthor}
                    </ThemedText>
                  </View>
                  <TouchableOpacity
                    onPress={(event) => handlePress(item, event)}
                    style={tw`justify-center pl-2`}
                  >
                    <Icon name="more-vert" size={24} color="white" />
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Modal Overlay */}
      {modalVisible && selectedBook && (
        <Pressable
          style={[tw`absolute inset-0`, { backgroundColor: 'rgba(0, 0, 0, 0.3)' }]}
          onPress={() => setModalVisible(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={[
              tw`absolute p-3 rounded-lg shadow-lg`,
              {
                top: buttonPosition.top,
                right: buttonPosition.right,
                backgroundColor: modalBackgroundColor,
              },
            ]}
          >
            <TouchableOpacity onPress={() => handleRemove(selectedBook._id)} style={tw`p-3`}>
              <ThemedText style={tw`text-lg text-white`}>Remove from Library</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={tw`p-3`}>
              <ThemedText style={tw`text-lg text-white`}>Share book</ThemedText>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      )}
    </SafeAreaView>
  );
}
