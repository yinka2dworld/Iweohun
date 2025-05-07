import React, { useEffect, useState } from 'react';
import tw from 'twrnc';
import axios from 'axios';
import StarRating from 'react-native-star-rating-widget';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const BookRatings = ({ bookId }) => {
  const [avgRating, setAvgRating] = useState(0);
  const [totalRating, setTotalRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiUrl = Constants?.expoConfig?.extra?.API_BASE_URL;
  const primaryColor = useThemeColor({}, 'primary');

  useEffect(() => {
    if (apiUrl && bookId) fetchRatings();
  }, [apiUrl, bookId]);

  const fetchRatings = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await SecureStore.getItemAsync('authToken');
      const res = await axios.get(`${apiUrl}/getRatings/${bookId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const { avgRating, total, userRating } = res.data;
      setAvgRating(avgRating || 0);
      setTotalRating(total || 0);
      setUserRating(userRating || 0);
    } catch (error) {
      setError('Error fetching rating stats');
      console.error('Error fetching rating stats:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const submitRating = async (newRating) => {
    if (userRating > 0) return; // Only allow one rating

    try {
      const userId = await SecureStore.getItemAsync('userId');
      const token = await SecureStore.getItemAsync('authToken');

      if (!userId || !bookId) {
        setError('Missing user or book information');
        return;
      }

      const res = await axios.post(
        `${apiUrl}/addRatings`,
        {
          userId,
          bookId,
          rating: Math.round(newRating),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUserRating(Math.round(newRating));
      setAvgRating(res.data.avgRating || newRating);
      setTotalRating(res.data.total || 1);
    } catch (error) {
      setError('Failed to submit rating');
      console.error('Failed to submit rating:', error.message);
    }
  };

  if (loading) return <ThemedText>Loading ratings...</ThemedText>;

  return (
    <ThemedView style={tw`mt-2`}>
      {error && <ThemedText style={tw`text-red-500 text-center`}>{error}</ThemedText>}
      <StarRating
        rating={userRating}
        onChange={(newRating) => {
          if (userRating === 0) submitRating(newRating);
        }}
        maxStars={5}
        starSize={25}
        color={primaryColor}
        starStyle={{ marginHorizontal: 3 }}
        enableSwiping={false}
        starFraction={1}
        readonly={userRating > 0}
        accessibilityLabel="Book Rating"
      />
      <ThemedText style={tw`text-center text-sm mt-2 text-gray-400`}>
        {avgRating.toFixed(1)} stars • {totalRating} rating{totalRating !== 1 ? 's' : ''}
      </ThemedText>
    </ThemedView>
  );
};

export default BookRatings;
