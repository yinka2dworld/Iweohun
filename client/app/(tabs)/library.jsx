import React, { useState, useCallback } from 'react';
import { SafeAreaView, FlatList, View, TouchableOpacity, Image, Modal, Pressable, Dimensions, ActivityIndicator } from 'react-native';
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

  const backgroundColor = useThemeColor({}, 'background');
  const modalBackgroundColor = useThemeColor({}, 'modalBackground');
  const textColor = useThemeColor({}, 'text');

  // Fetch saved books every time screen is focused
  useFocusEffect(
    useCallback(() => {
      const fetchSavedBooks = async () => {
        try {
          const saved = await SecureStore.getItemAsync('savedBooks');
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
      const updatedBooks = savedBooks.filter((book) => book._id !== bookId);
      setSavedBooks(updatedBooks);
      await SecureStore.setItemAsync('savedBooks', JSON.stringify(updatedBooks));
      setModalVisible(false);
    } catch (error) {
      console.error('Error removing book:', error);
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
      <ThemedView style={tw`p-4`}>
        <ThemedText type="title" style={[tw`mt-5 mb-10`, { color: textColor }]}>My Library</ThemedText>

        {savedBooks.length === 0 ? (
          <ThemedText style={{ color: textColor }}>No books in your library.</ThemedText>
        ) : (
          <FlatList
            data={savedBooks}
            keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
            contentContainerStyle={tw`pb-10 mt-5`}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => router.push(`/book-details/${item._id}`)}>
                <LinearGradient colors={['#070c70', '#ff1493']} style={tw`mb-4 p-4 rounded-lg`}>
                  <View style={tw`flex-row`}>
                    <Image source={{ uri: item.bookCover }} style={tw`w-20 h-25 rounded-lg mr-4`} />
                    <View style={tw`flex-1 justify-center`}>
                      <ThemedText style={tw`text-lg font-bold text-white`}>{item.bookName}</ThemedText>
                      <ThemedText style={tw`text-sm text-white`}>{item.bookAuthor}</ThemedText>
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

        {modalVisible && selectedBook && (
          <Pressable
            style={[tw`absolute`, { top: buttonPosition.top, right: buttonPosition.right }]}
            onPress={() => setModalVisible(false)}
          >
            <View style={[tw`p-3 rounded-lg shadow-lg`, { backgroundColor: modalBackgroundColor }]}>
              <TouchableOpacity onPress={() => handleRemove(selectedBook._id)} style={tw`p-3`}>
                <ThemedText style={tw`text-lg text-white`}>Remove from Library</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleAction('share')} style={tw`p-3`}>
                <ThemedText style={tw`text-lg text-white`}>share book</ThemedText>
              </TouchableOpacity>
            </View>
          </Pressable>
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

