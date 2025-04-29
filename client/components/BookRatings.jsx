import React, { useEffect, useState } from 'react';
import tw from 'twrnc';
import axios from 'axios';
import StarRating from 'react-native-star-rating-widget';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const BookRatings = ({ bookId, userId }) => {
  const [rating, setRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [avgRating, setAvgRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiUrl = Constants.expoConfig?.extra?.API_BASE_URL;

  if (!apiUrl) {
    console.error('API_BASE_URL is not defined in app config');
  }

  const primaryColor = useThemeColor({}, 'primary');

  useEffect(() => {
    if (apiUrl) {
      fetchRatings();
    }
  }, [apiUrl]);

  const fetchRatings = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) {
        setError('No auth token found');
        return;
      }

      const res = await axios.get(`${apiUrl}/getRatings/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { userRating, avgRating, total } = res.data;

      if (userRating) {
        setRating(userRating.rating);
        setHasRated(true);
      }
      setAvgRating(avgRating);
      setTotalRatings(total);
    } catch (error) {
      setError('Error fetching rating stats');
      console.error('Error fetching rating stats:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const submitRating = async (newRating) => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) {
        setError('No auth token found');
        return;
      }

      await axios.post(
        `${apiUrl}/addRatings`,
        { userId, bookId, rating: newRating },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRating(newRating);
      setHasRated(true);
      fetchRatings(); // Refresh stats
    } catch (error) {
      setError('Failed to submit rating');
      console.error('Failed to submit rating', error);
    }
  };

  const handleRatingChange = (newRating) => {
    if (!hasRated) {
      submitRating(newRating);
    }
  };

  if (loading) {
    return <ThemedText>Loading...</ThemedText>;
  }

  return (
    <ThemedView style={tw`mt-4`}>
      {error && <ThemedText style={tw`text-red-500`}>{error}</ThemedText>}
      <StarRating
        rating={rating}
        onChange={hasRated ? undefined : handleRatingChange}
        starSize={28}
        color={primaryColor}
        enableSwiping={!hasRated}
      />
      <ThemedText style={tw`text-center text-sm mt-2 text-gray-400`}>
        {avgRating.toFixed(1)} stars • {totalRatings} rating{totalRatings !== 1 ? 's' : ''}
      </ThemedText>
    </ThemedView>
  );
};

export default BookRatings;
