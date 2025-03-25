import React, { useState, useEffect } from 'react';
import { SafeAreaView, FlatList, View, TouchableOpacity, Image, Modal, Pressable } from 'react-native';
import tw from 'twrnc';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function Library() {
  const router = useRouter();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const modalBackgroundColor = useThemeColor({}, 'modalBackground');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const apiUrl = Constants.expoConfig?.extra?.API_BASE_URL;


  // Fetch books data
  useEffect(() => {
    // const token = AsyncStorage.getItem("authToken");

    axios.get(`${apiUrl}/books`, {
      headers: { 'Content-Type': 'application/json' },
    })
    .then((res) => {
      //console.log(res.data.books);  
      if (Array.isArray(res.data.books)) {
        setBooks(res.data.books); 
      } else {
        setBooks([]); 
      }
      setLoading(false);
    })
    .catch((error) => {
      setError(error.message);
      setLoading(false);
    });
  }, [apiUrl]);

  // Handle book press
  const handlePress = (book) => {
    setSelectedBook(book);
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

  // Loading or error states
  if (loading) {
    return (
      <ThemedView style={[tw`flex-1 items-center justify-center`, { backgroundColor }]}>
           <ActivityIndicator size="large" color="#ff1493" />
           <ThemedText style={{ color: textColor, marginTop: 10 }}>Loading</ThemedText>
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
        <ThemedText type ='title' style={[tw`mt-2`, { color: textColor }]}>Library</ThemedText>
        {books.length === 0 ? (
          <ThemedText style={{ color: textColor }}>No books available.</ThemedText>
        ) : (
          <FlatList
            data={books}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            contentContainerStyle={tw`pb-10 mt-5`}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => router.push(`/book/${item.id}`)}
                style={[tw`mb-4 p-4 rounded-lg`, { backgroundColor: primaryColor }]}>
                <View style={tw`flex-row`}>
                  <Image source={{ uri: item.bookCover }} style={tw`w-20 h-25 rounded-lg mr-4`} />
                  <View style={tw`flex-1 justify-center`}>
                    <ThemedText style={tw`text-lg font-bold text-white`}>{item.bookName}</ThemedText>
                    <ThemedText style={tw`text-sm text-white`}>{item.bookAuthor}</ThemedText>
                  </View>
                  <TouchableOpacity onPress={() => handlePress(item)} style={tw`justify-center pl-2`}>
                    <Icon name="more-vert" size={24} color="white" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}
          />
        )}

        {/* Modal */}
        <Modal transparent={true} visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
          <Pressable
            style={[tw`flex-1 justify-center items-center`, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}
            onPress={() => setModalVisible(false)}>
            <View style={[tw`p-5 rounded-lg`, { backgroundColor: modalBackgroundColor }]}>
              <ThemedText style={tw`text-xl font-bold mb-4 text-${textColor}`}>Actions</ThemedText>
              <TouchableOpacity onPress={() => handleAction('edit')} style={tw`p-3 border-b`}>
                <ThemedText style={tw`text-lg text-${textColor}`}>Edit</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleAction('delete')} style={tw`p-3`}>
                <ThemedText style={tw`text-lg text-${textColor}`}>Delete</ThemedText>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
      </ThemedView>
    </SafeAreaView>
  );
}