import React, { useCallback, useEffect, useState } from 'react';
import tw from 'twrnc';
import StarRating from 'react-native-star-rating-widget';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import apiClient, { getApiErrorMessage } from '@/lib/api';

const BookRatings = ({ bookId }) => {
  const [avgRating, setAvgRating] = useState(0);
  const [totalRating, setTotalRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const primaryColor = useThemeColor({}, 'primary');

  const fetchRatings = useCallback(async () => {
    if (!bookId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(`/getRatings/${bookId}`);

      const { avgRating, total, userRating } = res.data;
      setAvgRating(avgRating || 0);
      setTotalRating(total || 0);
      setUserRating(userRating || 0);
    } catch (error) {
      setError(getApiErrorMessage(error, 'Error fetching rating stats'));
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  const submitRating = async (newRating) => {
    if (userRating > 0) return; // Only allow one rating

    try {
      setError(null);
      const res = await apiClient.post('/addRatings', {
        bookId,
        rating: Math.round(newRating),
      });

      setUserRating(Math.round(newRating));
      setAvgRating(res.data.avgRating || newRating);
      setTotalRating(res.data.total || 1);
    } catch (error) {
      setError(getApiErrorMessage(error, 'Failed to submit rating'));
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
