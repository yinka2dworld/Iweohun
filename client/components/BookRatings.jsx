import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import tw from 'twrnc';
import axios from 'axios';
import StarRating, { StarRatingDisplay } from 'react-native-star-rating-widget';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '@/constants/api';

const parseRatingStats = (data, fallbackUserRating = 0) => {
  const responseUserRating = data.userRating == null
    ? fallbackUserRating
    : Number(data.userRating);
  const stats = {
    avgRating: Number(data.avgRating),
    totalRating: Number(data.total),
    userRating: responseUserRating,
  };

  if (
    !Number.isFinite(stats.avgRating) ||
    stats.avgRating < 0 ||
    stats.avgRating > 5 ||
    !Number.isInteger(stats.totalRating) ||
    stats.totalRating < 0 ||
    !Number.isInteger(stats.userRating) ||
    stats.userRating < 0 ||
    stats.userRating > 5
  ) {
    throw new Error('The server returned invalid rating information.');
  }

  return stats;
};

const BookRatings = ({ bookId }) => {
  const [avgRating, setAvgRating] = useState(0);
  const [totalRating, setTotalRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const submittingRef = useRef(false);

  const apiUrl = API_BASE_URL;
  const primaryColor = useThemeColor({}, 'primary');
  const mutedColor = useThemeColor({}, 'muted');
  const dangerColor = useThemeColor({}, 'danger');

  const fetchRatings = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!apiUrl || !bookId) throw new Error('Rating information is unavailable.');
      if (!token) throw new Error('Please sign in to view ratings.');

      setLoading(true);
      setError(null);
      const { data } = await axios.get(`${apiUrl}/getRatings/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const stats = parseRatingStats(data);
      setAvgRating(stats.avgRating);
      setTotalRating(stats.totalRating);
      setUserRating(stats.userRating);
      setSelectedRating(stats.userRating);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Unable to load ratings.');
      console.error('Error fetching rating stats:', requestError);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, bookId]);

  useEffect(() => {
    void Promise.resolve().then(fetchRatings);
  }, [fetchRatings]);

  const submitRating = useCallback(async (newRating) => {
    if (userRating > 0 || submittingRef.current) return;

    if (!apiUrl || !bookId) {
      setError('Rating information is unavailable.');
      return;
    }

    const rating = Math.round(newRating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return;

    submittingRef.current = true;
    setIsSubmitting(true);
    setSelectedRating(rating);
    setError(null);

    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) throw new Error('Please sign in to submit a rating.');
      const userId = await SecureStore.getItemAsync('userId');

      const { data } = await axios.post(
        `${apiUrl}/addRatings`,
        { userId, bookId, rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const stats = parseRatingStats(data, rating);
      if (stats.userRating < 1) throw new Error('The server did not confirm your rating.');
      setUserRating(stats.userRating);
      setSelectedRating(stats.userRating);
      setAvgRating(stats.avgRating);
      setTotalRating(stats.totalRating);
    } catch (requestError) {
      if (requestError.response?.status === 409) {
        await fetchRatings();
      } else {
        setSelectedRating(0);
        setError(requestError.response?.data?.message || requestError.message || 'Failed to submit your rating.');
        console.error('Failed to submit rating:', requestError);
      }
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }, [apiUrl, bookId, fetchRatings, userRating]);

  if (loading) {
    return (
      <ThemedView style={tw`mt-2 items-center`}>
        <ActivityIndicator color={primaryColor} />
        <ThemedText style={tw`mt-2`}>Loading ratings...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={tw`mt-2 items-center`}>
      <View style={tw`items-center`}>
        <StarRatingDisplay
          rating={avgRating}
          maxStars={5}
          starSize={20}
          color={primaryColor}
          emptyColor={mutedColor}
          accessibilityLabel={`${avgRating.toFixed(1)} out of 5 stars`}
        />
        <ThemedText style={[tw`text-sm mt-1`, { color: mutedColor }]}>
          {avgRating.toFixed(1)} stars · {totalRating} rating{totalRating !== 1 ? 's' : ''}
        </ThemedText>
      </View>

      <View style={tw`items-center mt-2`}>
        {userRating > 0 ? (
          <View style={tw`flex-row items-center`}>
            <ThemedText style={[tw`text-sm mr-2`, { color: mutedColor }]}>Your rating</ThemedText>
            <StarRatingDisplay
              rating={userRating}
              maxStars={5}
              step="full"
              starSize={22}
              color={primaryColor}
              emptyColor={mutedColor}
              accessibilityLabel={`Your rating: ${userRating} out of 5 stars`}
            />
          </View>
        ) : (
          <>
            <ThemedText style={[tw`text-sm mb-1`, { color: mutedColor }]}>Tap a star to rate this book</ThemedText>
            <View pointerEvents={isSubmitting ? 'none' : 'auto'}>
              <StarRating
                rating={selectedRating}
                onChange={submitRating}
                maxStars={5}
                step="full"
                starSize={25}
                color={primaryColor}
                emptyColor={mutedColor}
                starStyle={{ marginHorizontal: 3 }}
                enableSwiping={false}
                accessibilityLabel="Rate this book: %value% stars"
              />
            </View>
            {isSubmitting && <ActivityIndicator size="small" color={primaryColor} />}
          </>
        )}
      </View>

      {error && (
        <View style={tw`items-center mt-2`}>
          <ThemedText style={[tw`text-center`, { color: dangerColor }]}>{error}</ThemedText>
          <TouchableOpacity
            onPress={fetchRatings}
            accessibilityRole="button"
            accessibilityLabel="Retry loading ratings"
            style={tw`mt-1 p-1`}
          >
            <ThemedText style={{ color: primaryColor }}>Try again</ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </ThemedView>
  );
};

export default BookRatings;
