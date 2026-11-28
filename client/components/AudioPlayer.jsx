import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Share,
} from 'react-native';
import tw from 'twrnc';
import Slider from '@react-native-community/slider';
import { Image } from 'expo-image';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAudio } from '@/context/AudioContext';
import { MINI_AUDIO_PLAYER_HEIGHT } from '@/constants/layout';

const AudioPlayer = ({ bottomOffset = 0, onCloseExpand }) => {
  const {
    audioDetails,
    isPlaying,
    loading,
    positionMillis,
    durationMillis,
    playbackRate,
    pause,
    resume,
    stopAndUnload,
    seekTo,
    setRate,
  } = useAudio();

  const [isExpanded, setIsExpanded] = useState(false);
  const primaryColor = useThemeColor({}, 'primary');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'muted');
  const borderColor = useThemeColor({}, 'border');

  if (!audioDetails) return null;

  const { chapterTitle, book } = audioDetails;

  const togglePlay = async () => {
    if (loading) return;
    if (isPlaying) {
      await pause();
    } else {
      await resume();
    }
  };

  const handleSeek = async (value) => {
    await seekTo(value);
  };

  const skipForward = async () => {
    const newPos = Math.min(positionMillis + 10000, durationMillis);
    await seekTo(newPos);
  };

  const skipBackward = async () => {
    const newPos = Math.max(positionMillis - 10000, 0);
    await seekTo(newPos);
  };

  const toggleRate = async () => {
    const newRate = playbackRate === 1.0 ? 1.5 : playbackRate === 1.5 ? 2.0 : 1.0;
    await setRate(newRate);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Listen to this chapter: ${chapterTitle}\n${audioDetails.audioUrl}`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleClose = async () => {
    // unload and close player
    await stopAndUnload();
    if (typeof onCloseExpand === 'function') onCloseExpand();
  };

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000) || 0;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <>
      {isExpanded ? (
        <ThemedView style={[tw`absolute inset-0 z-50`]}>
          

          <View style={tw`absolute top-10 left-5 right-5 flex-row justify-between items-center`}>
            <TouchableOpacity onPress={() => setIsExpanded(false)}>
              <MaterialCommunityIcons name="chevron-down" size={40} color={primaryColor} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel="Close audio player"
            >
              <MaterialCommunityIcons name="close" size={30} color={primaryColor} />
            </TouchableOpacity>
          </View>

          <View style={tw`items-center mt-30`}>
            {book?.bookCover && (
              <Image
                source={{ uri: book.bookCover }}
                style={tw`w-50 h-70 rounded-xl shadow-2xl`}
                contentFit="cover"
              />
            )}
          </View>

          <View style={tw`items-center mt-8 px-6`}>
            <ThemedText style={tw`text-xl font-bold text-center`}>{book?.bookName}</ThemedText>
            <ThemedText style={tw`text-md font-bold text-center`}>{chapterTitle}</ThemedText>
          </View>

          <View style={tw`flex-row justify-center items-center gap-12 mt-6`}>
            <TouchableOpacity
              onPress={handleShare}
              accessibilityRole="button"
              accessibilityLabel="Share this chapter"
            >
              <MaterialCommunityIcons name="share-variant" size={25} color={primaryColor} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={toggleRate}
              accessibilityRole="button"
              accessibilityLabel={`Playback speed ${playbackRate} times`}
            >
              <ThemedText style={[tw`text-xl font-bold`, { color: primaryColor }]}>{playbackRate}x</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={tw`px-5 mt-10`}>
            <Slider
              style={{ width: '100%' }}
              minimumValue={0}
              maximumValue={durationMillis}
              value={positionMillis}
              onSlidingComplete={handleSeek}
              accessibilityLabel="Playback position"
              minimumTrackTintColor={primaryColor}
              maximumTrackTintColor={borderColor}
              thumbTintColor={primaryColor}
            />
            <View style={tw`flex-row justify-between`}>
              <ThemedText style={[tw`text-xs`, { color: mutedColor }]}>{formatTime(positionMillis)}</ThemedText>
              <ThemedText style={[tw`text-xs`, { color: mutedColor }]}>{formatTime(durationMillis)}</ThemedText>
            </View>
          </View>

          <View style={tw`flex-row justify-center items-center mt-2 mb-16`}>
            <TouchableOpacity
              onPress={skipBackward}
              accessibilityRole="button"
              accessibilityLabel="Rewind 10 seconds"
            >
              <MaterialCommunityIcons name="rewind-10" size={25} color={textColor} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={togglePlay}
              style={tw`px-8`}
              accessibilityRole="button"
              accessibilityLabel={isPlaying ? 'Pause audio' : 'Play audio'}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="large" color={primaryColor} />
              ) : (
                <MaterialCommunityIcons
                  name={isPlaying ? 'pause-circle' : 'play-circle'}
                  size={65}
                  color={primaryColor}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={skipForward}
              accessibilityRole="button"
              accessibilityLabel="Forward 10 seconds"
            >
              <MaterialCommunityIcons name="fast-forward-10" size={25} color={textColor} />
            </TouchableOpacity>
          </View>
        </ThemedView>
      ) : (
        <ThemedView style={[
          tw`absolute left-0 right-0 z-50`,
          {
            bottom: bottomOffset,
            backgroundColor: surfaceColor,
            borderTopColor: borderColor,
            borderTopWidth: StyleSheet.hairlineWidth,
            elevation: 8,
            minHeight: MINI_AUDIO_PLAYER_HEIGHT,
          },
        ]}>
          <View style={tw`flex-row items-center px-4 py-3`}>
            <TouchableOpacity
              onPress={() => setIsExpanded(true)}
              style={tw`flex-1 flex-row items-center`}
              activeOpacity={0.9}
              accessibilityRole="button"
              accessibilityLabel={`Expand player for ${chapterTitle}`}
            >
              {book?.bookCover && (
                <Image
                  source={{ uri: book.bookCover }}
                  style={tw`w-12 h-12 rounded-lg mr-4`}
                  contentFit="cover"
                />
              )}

              <View style={tw`flex-1 mr-2`}>
                <ThemedText numberOfLines={1} style={tw`font-bold`}>{book?.bookName}</ThemedText>
                <ThemedText numberOfLines={1} style={[tw`text-sm`, { color: mutedColor }]}>
                  {chapterTitle}
                </ThemedText>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={togglePlay}
              accessibilityRole="button"
              accessibilityLabel={isPlaying ? 'Pause audio' : 'Play audio'}
              accessibilityState={{ disabled: loading }}
              disabled={loading}
              style={tw`ml-2 p-2`}
            >
              {loading ? (
                <ActivityIndicator size="small" color={primaryColor} />
              ) : (
                <MaterialCommunityIcons name={isPlaying ? 'pause' : 'play'} size={40} color={primaryColor} />
              )}
            </TouchableOpacity>
          </View>
        </ThemedView>
      )}
    </>
  );
};

export default AudioPlayer;

