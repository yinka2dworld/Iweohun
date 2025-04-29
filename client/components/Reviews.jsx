import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import axios from 'axios';
import tw from 'twrnc';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';


const Reviews = ({ bookId }) => {
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(false);

  const apiUrl = Constants.expoConfig?.extra?.API_BASE_URL;
  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'primary');

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
        review: reviewText,
        parentReview: replyTo,
      };

      await axios.post(`${apiUrl}/addReview`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setReviewText('');
      setReplyTo(null);
      fetchReviews(); // refresh after post
    } catch (error) {
      console.error('Error adding review:', error);
    }
  };

  const renderReview = ({ item }) => (
    <View style={tw`mb-4 p-3 rounded-lg`}>

      <Text style={tw`font-bold text-base mb-1 text-[${primaryColor}]`}>
        {item.reviewedBy}
      </Text>
      <Text style={tw`text-sm text-gray-700 mb-2`}>
        {item.review}
      </Text>

      <TouchableOpacity
        style={tw`self-start`}
        onPress={() => setReplyTo(item._id)}
      >
        <Text style={tw`text-blue-500 text-xs`}>Reply</Text>
      </TouchableOpacity>

      {/* Render Replies */}
      {item.replies && item.replies.length > 0 && (
        <View style={tw`mt-2 pl-4 border-l border-gray-300`}>
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
    <ThemedView style={[tw`p-4`, { backgroundColor }]}>

      {loading ? (
        <ActivityIndicator size="large" color={primaryColor} />
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item._id}
          renderItem={renderReview}
          ListEmptyComponent={<ThemedText>No reviews yet. Be the first!</ThemedText>}
        />
      )}

<ThemedView style={tw`mt-6 flex-row items-center`}>
  <TextInput
    style={[
      tw`border rounded-lg px-3 py-2 mb-3 flex-1 text-base text-black`, // add padding + fontSize + text color
      { minHeight: 40, maxHeight: 100 }, // allow multiple lines but prevent overflow
    ]}
    placeholder={replyTo ? 'Write a reply...' : 'Write a review...'}
    value={reviewText}
    onChangeText={setReviewText}
    multiline
    placeholderTextColor="#999"
  />
  <TouchableOpacity onPress={handleAddReview} style={tw`ml-2 mb-3`}>
    <MaterialCommunityIcons name="send" size={28} color={primaryColor} />
  </TouchableOpacity>
</ThemedView>

       
    </ThemedView>
  );
};

export default Reviews;
