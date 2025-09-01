import React, { useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Dimensions,
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

const { height } = Dimensions.get('window');

const AudioPlayer = ({ onCloseExpand }) => {
  const {
    audioDetails,
    isPlaying,
    loading,
    positionMillis,
    durationMillis,
    playbackRate,
    downloadState,
    pause,
    resume,
    stopAndUnload,
    seekTo,
    setRate,
    downloadCurrent,
  } = useAudio();

  const [isExpanded, setIsExpanded] = useState(false);
  const primaryColor = useThemeColor({}, 'primary');

  useEffect(() => {
    // when audioDetails becomes null, collapse the player
    if (!audioDetails) setIsExpanded(false);
  }, [audioDetails]);

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

  const handleDownload = async () => {
    if (!audioDetails?.audioUrl) return;
    await downloadCurrent(audioDetails.audioUrl);
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
              <MaterialCommunityIcons name="chevron-down" size={40} color="#ff1493" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClose}>
              <MaterialCommunityIcons name="close" size={30} color="#ff1493" />
            </TouchableOpacity>
          </View>

          <View style={tw`items-center mt-30`}>
            {book?.bookCover && (
              <Image
                source={{ uri: book.bookCover }}
                style={tw`w-50 h-70 rounded-xl shadow-2xl`}
                resizeMode="cover"
              />
            )}
          </View>

          <View style={tw`items-center mt-8 px-6`}>
            <ThemedText style={tw`text-xl font-bold text-center`}>{book?.bookName}</ThemedText>
            <ThemedText style={tw`text-md font-bold text-center`}>{chapterTitle}</ThemedText>
          </View>

          <View style={tw`flex-row justify-center items-center gap-12 mt-6`}>
            <TouchableOpacity onPress={handleShare}>
              <MaterialCommunityIcons name="share-variant" size={25} color="#ff1493" />
            </TouchableOpacity>

            <TouchableOpacity onPress={toggleRate}>
              <ThemedText style={tw`text-xl font-bold text-[#ff1493]`}>{playbackRate}x</ThemedText>
            </TouchableOpacity>

            {/* <TouchableOpacity onPress={handleDownload}>
              {downloadState?.status === 'downloading' ? (
                <ActivityIndicator />
              ) : downloadState?.status === 'done' ? (
                <MaterialCommunityIcons name="download-circle" size={25} color="#ff1493" />
              ) : (
                <MaterialCommunityIcons name="download" size={25} color="#ff1493" />
              )}
            </TouchableOpacity> */}
          </View>

          <View style={tw`px-5 mt-10`}>
            <Slider
              style={{ width: '100%' }}
              minimumValue={0}
              maximumValue={durationMillis}
              value={positionMillis}
              onSlidingComplete={handleSeek}
              minimumTrackTintColor="#ff1493"
              maximumTrackTintColor="#fff"
              thumbTintColor="#ff1493"
            />
            <View style={tw`flex-row justify-between`}>
              <ThemedText style={tw`text-xs text-white`}>{formatTime(positionMillis)}</ThemedText>
              <ThemedText style={tw`text-xs text-white`}>{formatTime(durationMillis)}</ThemedText>
            </View>
          </View>

          <View style={tw`flex-row justify-center items-center mt-2 mb-16`}>
            <TouchableOpacity onPress={skipBackward}>
              <MaterialCommunityIcons name="rewind-10" size={25} color="#070c70" />
            </TouchableOpacity>

            <TouchableOpacity onPress={togglePlay} style={tw`px-8`}>
              {loading ? (
                <ActivityIndicator size="large" color="#ff1493" />
              ) : (
                <MaterialCommunityIcons
                  name={isPlaying ? 'pause-circle' : 'play-circle'}
                  size={65}
                  color="#ff1493"
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={skipForward}>
              <MaterialCommunityIcons name="fast-forward-10" size={25} color="#070c70" />
            </TouchableOpacity>
          </View>
        </ThemedView>
      ) : (
        <ThemedView style={tw`absolute bottom-0 left-0 right-0 z-50 mb-20`}>
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.6)' }]} />

          <TouchableOpacity
            onPress={() => setIsExpanded(true)}
            style={tw`flex-row items-center px-4 py-4`}
            activeOpacity={0.9}
          >
            {book?.bookCover && (
              <Image
                source={{ uri: book.bookCover }}
                style={tw`w-12 h-12 rounded-lg mr-4`}
                resizeMode="cover"
              />
            )}

            <View style={tw`flex-1`}>
              <ThemedText style={tw`font-bold text-white`}>{book?.bookName}</ThemedText>
              <ThemedText numberOfLines={1} style={tw`text-sm text-gray-200`}>
                {chapterTitle}
              </ThemedText>
            </View>

            <TouchableOpacity onPress={togglePlay}>
              <MaterialCommunityIcons name={isPlaying ? 'pause' : 'play'} size={40} color={primaryColor} />
            </TouchableOpacity>
          </TouchableOpacity>
        </ThemedView>
      )}
    </>
  );
};

export default AudioPlayer;

