import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import tw from 'twrnc';
import { useColorScheme } from 'react-native'; // for detecting dark mode
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

import { Colors } from '@/constants/Colors'; // Assuming you have Colors defined in your constants

const Reviews = ({ bookId }) => {
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
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

    const sendingText = reviewText;
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

      fetchReviews(); // Refresh reviews after adding
    } catch (error) {
      console.error('Error adding review:', error);
    }
  };

  const renderReview = ({ item }) => (
    <View style={tw`mb-2 p-2 mx-6 rounded-lg shadow-md border border-gray-300 bg-[${currentColors.background}]`}>
      <Text style={tw`font-bold text-base text-[${currentColors.primary}] mb-2 dark:text-[${currentColors.text}]`}>
        {item.reviewedBy}
      </Text>
      <Text style={tw`text-md p-2 text-gray-700 mb-2 dark:text-[${currentColors.text}]`}>
        {item.review}
      </Text>

      <TouchableOpacity
    style={tw`flex-row items-center self-end mt-1 mr-3`}
    onPress={() => {
      setReplyTo(item._id);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }}
  >
    <MaterialCommunityIcons name="reply" size={16} color="#3B82F6" />
    <Text style={tw`ml-1 text-sm text-blue-500 dark:text-blue-300`}>Reply</Text>
  </TouchableOpacity>


      {/* Nested Replies */}
      {item.replies && item.replies.length > 0 && (
        <View style={tw`border-l border-gray-300 dark:border-gray-600`}>
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
    <KeyboardAvoidingView style={[tw`flex-1`, { backgroundColor: currentColors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Static Header and Add Review Input */}
      <View style={[tw`p-3`, { backgroundColor: currentColors.headerBackground }]}>
        
        <View style={tw`flex-row items-center`}>
          <TextInput
            ref={inputRef}
            style={[
              tw`border rounded-lg px-3 py-2 flex-1 text-base`,
              {
                minHeight: 40,
                maxHeight: 100,
                color: currentColors.text,
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
      </View>

      {/* Scrollable Review List */}
      <FlatList
        data={reviews}
        keyExtractor={(item) => item._id}
        renderItem={renderReview}
        contentContainerStyle={tw`pt-16`}  // Adds top padding to avoid overlap with the fixed input field
        ListEmptyComponent={
          <Text style={tw`text-center text-gray-400 dark:text-gray-500`}>
            No reviews yet. Be the first!
          </Text>
        }
        ListFooterComponent={
          loading ? (
            <View style={tw`items-center justify-center`}>
              <ActivityIndicator size="large" color={currentColors.primary} />
            </View>
          ) : null
        }
      />
    </KeyboardAvoidingView>
  );
};

export default Reviews;
