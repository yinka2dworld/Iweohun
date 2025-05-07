import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, FlatList, ActivityIndicator, TouchableOpacity, Keyboard } from 'react-native';
import axios from 'axios';
import tw from 'twrnc';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { useColorScheme } from 'react-native'; // Use for detecting the current theme
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Assuming you have your Colors object in a separate file and imported here
import { Colors } from '@/constants/Colors';

const Reviews = ({ bookId }) => {
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef(null);
  const colorScheme = useColorScheme(); // Get the current theme (light or dark)

  const apiUrl = Constants.expoConfig?.extra?.API_BASE_URL;

  // Use the Colors object to get the correct colors based on the current theme
  const currentColors = Colors[colorScheme || 'light']; // Default to light theme

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    const token = await SecureStore.getItemAsync('authToken');
    setLoading(true);
    try {
      const { data } = await axios.get(`${apiUrl}/bookReviews/${bookId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReview = async () => {
    if (!reviewText.trim()) return;

    const sendingText = reviewText; // Store for submission
    setReviewText('');
    const replyingTo = replyTo;
    setReplyTo(null);

    try {
      const token = await SecureStore.getItemAsync('authToken');
      const userId = await SecureStore.getItemAsync('userId');
      const reviewedBy = await SecureStore.getItemAsync('username');

      if (!token || !userId) {
        console.error('User not logged in');
        return;
      }

      const payload = {
        bookId,
        reviewedBy,
        userId,
        review: sendingText,
        parentReview: replyingTo,
      };

      await axios.post(`${apiUrl}/addReview`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchReviews();
    } catch (error) {
      console.error('Error adding review:', error);
    }
  };

  const renderReview = ({ item }) => (
    <View style={tw`mb-2 p-2  rounded-lg shadow-md bg-[${currentColors.background}]`}>
      <Text style={tw`font-bold text-base text-[${currentColors.primary}] mb-2 dark:text-[${currentColors.text}]`}>
        {item.reviewedBy}
      </Text>
      <Text style={tw`text-md p-2 text-gray-700 mb-2 dark:text-[${currentColors.text}]`}>
        {item.review}
      </Text>

      {/* Reply Button */}
      <TouchableOpacity
        style={tw`self-end mb-3 mr-2`}
        onPress={() => {
          setReplyTo(item._id);
          setTimeout(() => {
            inputRef.current?.focus();
          }, 100);
        }}
      >
        <Text style={tw`text-blue-500 text-xs dark:text-blue-300`}>Reply</Text>
      </TouchableOpacity>

      {/* Nested Replies */}
      {item.replies && item.replies.length > 0 && (
        <View style={tw`mt-4 pl-4 border-l border-gray-300 dark:border-gray-600`}>
          <FlatList
            data={item.replies}
            keyExtractor={(reply) => reply._id}
            renderItem={renderReview}
          />
        </View>
      )}
    </View>
  );

  return (
    <View style={[tw`p-4`, { backgroundColor: currentColors.background }]}>
      {/* Input Section */}
      <View style={tw`flex-row items-center  pb-4 mb-6 `}>
        <TextInput
          ref={inputRef}
          style={[
            tw`border rounded-lg px-3 py-2 flex-1 text-base`,
            {
              minHeight: 40,
              maxHeight: 100,
              color: currentColors.text, // Use dynamic text color
            },
          ]}
          placeholder={replyTo ? 'Write a reply...' : 'Write a review...'}
          value={reviewText}
          onChangeText={setReviewText}
          multiline
          placeholderTextColor={currentColors.placeholder} 
        />
        <TouchableOpacity onPress={handleAddReview} style={tw`ml-3`}>
          <MaterialCommunityIcons name="send" size={28} color={currentColors.primary} />
        </TouchableOpacity>
      </View>

      {/* Review List */}
      {loading ? (
        <View style={tw`items-center justify-center`}>
          <ActivityIndicator size="large" color={currentColors.primary} />
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item._id}
          renderItem={renderReview}
          ListEmptyComponent={
            <Text style={tw`text-center text-gray-400 dark:text-gray-500`}>
              No reviews yet. Be the first!
            </Text>
          }
        />
      )}
    </View>
  );
};

export default Reviews;
