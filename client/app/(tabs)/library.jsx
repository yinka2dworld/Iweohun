import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView, FlatList, View, TouchableOpacity, 
  Image, Modal, Pressable, Dimensions, ActivityIndicator 
} from 'react-native';
import tw from 'twrnc';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import Constants from 'expo-constants';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { LinearGradient } from 'expo-linear-gradient';

export default function Library() {
  const router = useRouter();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, right: 0 });

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const modalBackgroundColor = useThemeColor({}, 'modalBackground');
  const textColor = useThemeColor({}, 'text');
  const apiUrl = Constants.expoConfig?.extra?.API_BASE_URL;

  // Fetch books
  useEffect(() => {
    axios.get(`${apiUrl}/books`)
      .then((res) => {
        setBooks(Array.isArray(res.data.books) ? res.data.books : []);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, [apiUrl]);

  // Handle book options modal
  const handlePress = (book, event) => {
    const { pageX, pageY } = event.nativeEvent;
    const screenWidth = Dimensions.get('window').width;
    
    setSelectedBook(book);
    setButtonPosition({ 
      top: pageY, 
      right: Math.max(10, screenWidth - pageX - 40) // Keeps modal inside screen
    });
    setModalVisible(true);
  };

  // Handle modal actions
  const handleAction = (action) => {
    setModalVisible(false);
    if (!selectedBook) return;
    switch (action) {
      case 'view':
        router.push(`/book/${selectedBook.id}`);
        break;
      case 'edit':
        router.push(`/edit/${selectedBook.id}`);
        break;
      case 'delete':
        alert('Book deleted');
        break;
      default:
        break;
    }
  };

  // Loading/Error states
  if (loading) {
    return (
      <ThemedView style={[tw`flex-1 items-center justify-center`, { backgroundColor }]}>
        <ActivityIndicator size="large" color="#ff1493" />
        <ThemedText style={{ color: textColor, marginTop: 10 }}>Loading library</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={[tw`flex-1 items-center justify-center`, { backgroundColor }]}>
        <ThemedText style={{ color: textColor }}>Error: {error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor }]}>
      <ThemedView style={tw`p-4`}>
        <ThemedText type="title" style={[tw` mb-10`, { color: textColor }]}>My Library</ThemedText>
        
        {books.length === 0 ? (
          <ThemedText style={{ color: textColor }}>No books available.</ThemedText>
        ) : (
          <FlatList
            data={books}
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

        {/* Modal Positioned Near Button */}
        {modalVisible && (
          <Pressable 
            style={[tw`absolute`, { top: buttonPosition.top, right: buttonPosition.right }]}
            onPress={() => setModalVisible(false)}
          >
            <View style={[tw`p-3 rounded-lg shadow-lg`, { backgroundColor: modalBackgroundColor }]}>
              <TouchableOpacity onPress={() => handleAction('share')} style={tw`p-3 border-b`}>
                <ThemedText style={tw`text-lg text-white`}>share book</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleAction('credits')} style={tw`p-3 border-b`}>
                <ThemedText style={tw`text-lg text-white`}>View credits</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleAction('remove')} style={tw`p-3`}>
                <ThemedText style={tw`text-lg text-white`}>Remove book</ThemedText>
              </TouchableOpacity>
            </View>
          </Pressable>
        )}
      </ThemedView>
    </SafeAreaView>
  );
}
