import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import tw from 'twrnc';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '@/constants/api';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAudio } from '@/context/AudioContext';
import { MINI_AUDIO_PLAYER_CLEARANCE, TAB_BAR_CONTENT_HEIGHT } from '@/constants/layout';

const getInitials = (name = '') => {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('');
  return initials.toUpperCase() || '?';
};

const formatCommentTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const elapsedMinutes = Math.floor(Math.max(0, Date.now() - date.getTime()) / 60000);
  if (elapsedMinutes < 1) return 'now';
  if (elapsedMinutes < 60) return `${elapsedMinutes}m`;

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours}h`;

  const elapsedDays = Math.floor(elapsedHours / 24);
  if (elapsedDays < 7) return `${elapsedDays}d`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const Reviews = ({ bookId }) => {
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [replyName, setReplyName] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const { audioDetails } = useAudio();
  const apiUrl = API_BASE_URL;
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const surfaceAltColor = useThemeColor({}, 'surfaceAlt');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'muted');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'border');
  const placeholderColor = useThemeColor({}, 'placeholder');
  const dangerColor = useThemeColor({}, 'danger');

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('authToken');
      const { data } = await axios.get(`${apiUrl}/bookReviews/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!Array.isArray(data)) throw new Error('The server returned an invalid comments list.');
      setReviews(data);
      setError('');
    } catch (requestError) {
      console.error('Error fetching reviews:', requestError);
      setError(requestError.response?.data?.message || requestError.message || 'Unable to load comments.');
    } finally {
      setLoading(false);
    }
  }, [apiUrl, bookId]);

  useEffect(() => {
    void Promise.resolve().then(fetchReviews);
  }, [fetchReviews]);

  const handleReply = (item) => {
    setReplyTo(item._id);
    setReplyName(item.reviewedBy || 'comment');
    setTimeout(() => inputRef.current?.focus(), 100);
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

      if (!token || !userId || !reviewedBy) {
        throw new Error('Sign in to post a comment.');
      }

      await axios.post(
        `${apiUrl}/addReview`,
        {
          bookId,
          reviewedBy,
          userId,
          review: sendingText,
          parentReview: replyTo,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsername(reviewedBy);
      setReviewText('');
      setReplyTo(null);
      setReplyName('');
      await fetchReviews();
    } catch (requestError) {
      console.error('Error adding review:', requestError);
      setError(requestError.response?.data?.message || requestError.message || 'Unable to post your comment.');
    } finally {
      setSending(false);
    }
  };

  const renderReview = (item, depth = 0) => {
    const displayName = item.reviewedBy || 'Reader';
    const timeLabel = formatCommentTime(item.createdAt);
    const isReply = depth > 0;

    return (
      <View
        key={item._id}
        style={[
          tw`rounded-xl border p-3`,
          {
            backgroundColor: isReply ? surfaceAltColor : surfaceColor,
            borderColor,
            marginTop: isReply ? 10 : 12,
            marginLeft: Math.min(depth * 12, 32)
          },
        ]}
      >
        <View style={tw`flex-row`}>
          <View
            style={[
              tw`w-9 h-9 rounded-full items-center justify-center`,
              { backgroundColor: isReply ? surfaceColor : surfaceAltColor },
            ]}
          >
            <Text style={[tw`text-xs font-bold`, { color: mutedColor }]}>
              {getInitials(displayName)}
            </Text>
          </View>

          <View style={tw`flex-1 ml-3`}>
            <View style={tw`flex-row items-center`}>
              <Text style={[tw`text-xs font-semibold`, { color: mutedColor }]} numberOfLines={1}>
                {displayName}
              </Text>
              {timeLabel ? (
                <Text style={[tw`text-xs ml-2`, { color: mutedColor }]}>{timeLabel}</Text>
              ) : null}
            </View>

            <Text style={[tw`text-sm leading-5 mt-1`, { color: textColor }]}>
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
        renderItem={({ item }) => renderReview(item)}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 2,
          paddingBottom: audioDetails
            ? MINI_AUDIO_PLAYER_CLEARANCE + TAB_BAR_CONTENT_HEIGHT
            : 16,
          flexGrow: 1,
        }}
        scrollIndicatorInsets={{
          bottom: audioDetails
            ? MINI_AUDIO_PLAYER_CLEARANCE + TAB_BAR_CONTENT_HEIGHT
            : 0,
        }}
        ListEmptyComponent={
          loading ? null : (
            <View style={tw`flex-1 items-center justify-center py-12`}>
              <MaterialCommunityIcons name="message-text-outline" size={30} color={mutedColor} />
              <Text style={[tw`text-sm mt-2`, { color: mutedColor }]}>
                No reviews yet. Start the conversation.
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          loading ? <ActivityIndicator style={tw`py-4`} color={primaryColor} /> : null
        }
      />

    </KeyboardAvoidingView>
  );
};

export default Reviews;
