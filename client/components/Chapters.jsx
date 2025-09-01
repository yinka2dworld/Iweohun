import React, { useState, useEffect } from 'react';
import { FlatList,Alert, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import axios from 'axios';


const Chapters = ({ book, apiUrl, onChapterSelect }) => {
  const [showMoreInfo, setShowMoreInfo] = useState(false); 
  const primaryColor = useThemeColor({}, 'primary');
  const [role, setRole] = useState(null);  
  const [userId, setUserId] = useState(null);  
     const router = useRouter();
     
useEffect(() => {
  const loadInfo = async () => {
    const role = await SecureStore.getItemAsync('userRole');
    setRole(role);
    const userId = await SecureStore.getItemAsync('userId');
     setUserId(String(userId));       
  };
  loadInfo();
}, []);
   

  const handleDelete = () => {
  Alert.alert(
    'Confirm Delete',
    'Are you sure you want to delete this book?',
    [
      {
        text: 'Cancel',
        style: 'cancel'
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const token = await SecureStore.getItemAsync('authToken');
          try {
            const response = await axios.delete(`${apiUrl}/deleteBook/${book._id}`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });

            if (response.status !== 200) {
              throw new Error("Failed to delete book");
            }
            router.back();
          } catch (error) {
            console.error("Delete error:", error);
            Alert.alert('Error', 'Failed to delete the book.', [{ text: 'OK' }]);
          }
        }
      }
    ]
  );
};

  
  if (!book?.chapters?.length) {
    return (
      <ThemedText style={tw`text-center p-4`}>
        No chapters available.
      </ThemedText>
    );
  }

  return (
    <ThemedView style={tw`p-2 mb-15`}>
      {/* Toggle More Info Section */}
      <TouchableOpacity
        onPress={() => setShowMoreInfo(prevState => !prevState)} // Toggle the visibility of more info
        style={tw`flex-row items-center justify-start`}
      >
        <ThemedText
          style={[
            tw`text-md text-blue-500 m-5`,
            { color: primaryColor },
          ]}
        >
          {showMoreInfo ? 'Show less info' : 'Show more info'}
        </ThemedText>

        <MaterialCommunityIcons
          name={showMoreInfo ? 'chevron-up' : 'chevron-down'}
          size={24}
          color={primaryColor}
        />
      </TouchableOpacity>

      {/* More Book Information Section */}
      {showMoreInfo && (
        <ThemedView style={tw`items-center justify-center`}>
       


  <ThemedView style={tw`flex-row gap-5 justify-end my-4 mb-8`}>
    {( role === 'superAdmin' || userId === book.postedBy?._id) && (
      <TouchableOpacity
        style={[tw`rounded-3xl px-6 py-2`, { backgroundColor: primaryColor }]}
        onPress={() => router.push(`edit-book/${book._id}`)}
      >
        <ThemedText style={tw`text-white text-lg font-semibold text-center`}>✎ Edit</ThemedText>
      </TouchableOpacity>
    )}

    {(role === 'superAdmin' || role === 'admin')&& (
      <TouchableOpacity
        style={[tw`rounded-3xl px-4 py-2`, { backgroundColor: primaryColor }]}
        onPress={handleDelete}>
        <ThemedText style={tw`text-white text-lg font-semibold text-center`}>✖ Delete</ThemedText>
      </TouchableOpacity>
    )}
  </ThemedView>



     <ThemedView style={tw`flex-row items-center justify-start gap-2 flex-wrap`}>
            {/* Author Icon and Text */}
            <MaterialCommunityIcons
              name="pencil"
              size={16}
              style={[{ color: primaryColor }]}
            />
            <ThemedText style={tw`text-md text-gray-600`}>
              {book.bookAuthor}
            </ThemedText>

            {/* Reciter Icon and Text */}
            <MaterialCommunityIcons
              name="microphone"
              size={16}
              style={[{ color: primaryColor }]}
            />
            <ThemedText style={tw`text-md text-gray-600`}>
              {book.reciter || 'N/A'}
            </ThemedText>
          </ThemedView>

          <ThemedText style={tw`text-sm text-gray-600 text-left my-3 mx-4`}>
            {book.bookDescription || 'N/A'}
          </ThemedText>
        </ThemedView>
      )}

      {/* Chapters List */}
      <FlatList
        data={book.chapters}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => onChapterSelect(item)} // Handle chapter selection
            style={tw`p-3 m-2 border border-gray-300 rounded-lg flex-row justify-between`}
          >
            <ThemedText style={tw`text-lg font-semibold`}>{item.title}</ThemedText>
            <ThemedText style={tw`text-sm text-gray-500`}>{item.duration}</ThemedText>
          </TouchableOpacity>
        )}
      />
    </ThemedView>
  );
};

export default Chapters;
