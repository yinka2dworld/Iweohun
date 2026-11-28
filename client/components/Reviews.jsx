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
  const [replyName, setReplyName] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
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
    setError(null);
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
    const sendingText = reviewText.trim();
    if (!sendingText || sending) return;

    setSending(true);
    setError('');
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

            <View style={tw`flex-row items-center mt-2`}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`Reply to ${displayName}`}
                onPress={() => handleReply(item)}
                hitSlop={8}
              >
                <Text style={[tw`text-xs font-semibold`, { color: mutedColor }]}>Reply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {item.replies?.map((reply) => renderReview(reply, depth + 1))}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[tw`flex-1`, { backgroundColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View
        style={[
          tw`px-4 pt-3 pb-3 border-b`,
          { backgroundColor: surfaceColor, borderColor },
        ]}
      >
        {error ? (
          <Text style={[tw`text-xs mb-2`, { color: dangerColor }]}>{error}</Text>
        ) : null}

        {replyTo ? (
          <View style={tw`flex-row items-center justify-between mb-2`}>
            <Text style={[tw`text-xs`, { color: mutedColor }]}>
              Replying to <Text style={{ color: primaryColor }}>{replyName}</Text>
            </Text>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Cancel reply"
              onPress={() => {
                setReplyTo(null);
                setReplyName('');
              }}
              hitSlop={8}
            >
              <MaterialCommunityIcons name="close" size={17} color={mutedColor} />
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={tw`flex-row items-center`}>
          <View
            style={[
              tw`w-9 h-9 rounded-full items-center justify-center mr-3`,
              { backgroundColor: surfaceAltColor },
            ]}
          >
            <Text style={[tw`text-xs font-bold`, { color: mutedColor }]}>
              {username ? getInitials(username) : <MaterialCommunityIcons name="account" size={18} color={mutedColor} />}
            </Text>
          </View>

          <View
            style={[
              tw`flex-1 flex-row items-center rounded-full px-4`,
              { backgroundColor: surfaceAltColor, borderColor },
            ]}
          >
            <TextInput
              ref={inputRef}
              style={[tw`flex-1 py-2 text-sm`, { color: textColor, maxHeight: 88 }]}
              placeholder={replyTo ? 'Add a reply...' : 'Add a review...'}
              value={reviewText}
              onChangeText={setReviewText}
              multiline
              placeholderTextColor={placeholderColor}
              accessibilityLabel={replyTo ? 'Write a reply' : 'Write a review'}
            />
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={replyTo ? 'Post reply' : 'Post review'}
              disabled={!reviewText.trim() || sending}
              onPress={handleAddReview}
              style={tw`ml-2 p-1`}
            >
              {sending ? (
                <ActivityIndicator size="small" color={primaryColor} />
              ) : (
                <MaterialCommunityIcons
                  name="send"
                  size={20}
                  color={reviewText.trim() ? primaryColor : mutedColor}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <FlatList
        style={tw`flex-1`}
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
          loading ? <ActivityIndicator style={tw`py-4`} color={primaryColor} /> : null
        }
      />

    </KeyboardAvoidingView>
  );
};

export default Reviews;
