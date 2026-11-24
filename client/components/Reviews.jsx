import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, useColorScheme } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import apiClient, { getApiErrorMessage } from '@/lib/api';
import tw from 'twrnc';

import { Colors } from '@/constants/Colors';

const Reviews = ({ bookId }) => {
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const inputRef = useRef(null);
  const colorScheme = useColorScheme(); // Get the current theme (light or dark)

  // Use the Colors object to get the correct colors based on the current theme
  const currentColors = Colors[colorScheme || 'light']; // Default to light theme

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get(`/bookReviews/${bookId}`);
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching reviews:', error.message);
      setError(getApiErrorMessage(error, "Couldn't load reviews. Try again."));
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleAddReview = async () => {
    if (!reviewText.trim()) return;

    const sendingText = reviewText;
    setReviewText('');
    const replyingTo = replyTo;
    setReplyTo(null);

    try {
      setError(null);
      await apiClient.post('/addReview', {
        bookId,
        review: sendingText.trim(),
        parentReview: replyingTo,
      });

      fetchReviews(); // Refresh reviews after adding
    } catch (error) {
      console.error('Error adding review:', error.message);
      setError(getApiErrorMessage(error, 'Could not post your review.'));
      setReviewText(sendingText); // restore the text so nothing is lost
    }
  };

  const renderReview = ({ item }) => (
    <View style={[tw`mb-2 p-2 mx-6 rounded-lg shadow-md border border-gray-300`, { backgroundColor: currentColors.background }]}>
      <Text style={[tw`font-bold text-base mb-2`, { color: currentColors.primary }]}>
        {item.reviewedBy}
      </Text>
      <Text style={[tw`text-base p-2 mb-2`, { color: currentColors.text }]}>
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
        contentContainerStyle={tw`py-2`}
        ListEmptyComponent={
          <Text style={tw`text-center text-gray-400 dark:text-gray-500 py-4`}>
            {error || 'No reviews yet. Be the first!'}
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
