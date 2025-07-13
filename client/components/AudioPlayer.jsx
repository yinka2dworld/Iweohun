import React, { useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  StyleSheet,
  ActivityIndicator,
  Share,
} from 'react-native';
import tw from 'twrnc';
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

const { height } = Dimensions.get('window');

// Global variable to track the currently playing sound
let currentPlayingSound = null;

const AudioPlayer = ({ audioUrl, chapterTitle, book, onClose }) => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);

  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');

  useEffect(() => {
    let newSound;
    const loadAndPlay = async () => {
      if (!audioUrl) return;
      setLoading(true);
      try {
        // Stop the previously playing sound if it exists
        if (currentPlayingSound && currentPlayingSound._loaded) {
          await currentPlayingSound.unloadAsync();
        }

        const { sound: loadedSound } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { shouldPlay: true, rate: playbackRate }
        );
        newSound = loadedSound;
        setSound(newSound);
        currentPlayingSound = newSound; // Set the current sound globally
        setIsPlaying(true);

        const status = await newSound.getStatusAsync();
        if (status.isLoaded) {
          setDuration(status.durationMillis || 1);
        }

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            setPosition(status.positionMillis);
            setDuration(status.durationMillis || 1);
            if (status.didJustFinish) {
              setIsPlaying(false);
              setPosition(0);
            }
          }
        });
      } catch (err) {
        console.error('Playback error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAndPlay();

    return () => {
      if (newSound) {
        newSound.unloadAsync();
      }
    };
  }, [audioUrl]);

  const togglePlay = async () => {
    if (!sound) return;
    const status = await sound.getStatusAsync();
    if (status.isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
    } else {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  const handleSeek = async (value) => {
    if (!sound) return;
    await sound.setPositionAsync(value);
  };

  const skipForward = async () => {
    if (!sound) return;
    const status = await sound.getStatusAsync();
    if (status.isLoaded) {
      let newPos = status.positionMillis + 10000;
      if (newPos > status.durationMillis) newPos = status.durationMillis;
      await sound.setPositionAsync(newPos);
    }
  };

  const skipBackward = async () => {
    if (!sound) return;
    const status = await sound.getStatusAsync();
    if (status.isLoaded) {
      let newPos = status.positionMillis - 10000;
      if (newPos < 0) newPos = 0;
      await sound.setPositionAsync(newPos);
    }
  };

  const togglePlaybackRate = async () => {
    if (!sound) return;
    const newRate = playbackRate === 1.0 ? 1.5 : playbackRate === 1.5 ? 2.0 : 1.0;
    await sound.setRateAsync(newRate, true);
    setPlaybackRate(newRate);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Listen to this chapter: ${chapterTitle}\n${audioUrl}`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <>
      {isExpanded ? (
        <ThemedView style={[tw`absolute inset-0 z-50`, { height }]}>
          <ImageBackground
            source={{ uri: book.bookCover }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover" >
            <View style={tw`flex-row justify-between items-center py-8 px-5`}>
              <TouchableOpacity onPress={() => setIsExpanded(false)}>
                <MaterialCommunityIcons name="chevron-down" size={40} color='#ff1493' />
              </TouchableOpacity>
              <View style={tw`flex-row items-center gap-4`}>
                <TouchableOpacity onPress={onClose}>
                  <MaterialCommunityIcons name="close" size={30} color='#ff1493' />
                </TouchableOpacity>
              </View>
            </View>

            <View style={tw`flex-1 justify-center items-center  pt-30`}>
              <ThemedText style={tw`text-2xl text-[#070c70] font-bold text-center pb-2`}>
                {chapterTitle}
              </ThemedText>

              <View style={tw`flex-row gap-6`}>
                <TouchableOpacity onPress={handleShare}>
                  <MaterialCommunityIcons  style={tw`mt-1`} name="share-variant" size={30} color='#ff1493' />
                </TouchableOpacity>
                
                <TouchableOpacity onPress={togglePlaybackRate}>
                  <ThemedText style={tw`text-center font-bold text-2xl text-[#ff1493]`}>{playbackRate}x</ThemedText>
                </TouchableOpacity>
              </View>

            </View>

            <View style={tw`px-6 pb-15`}>
              <Slider
                style={{ width: '100%' }}
                minimumValue={0}
                maximumValue={duration}
                value={position}
                onSlidingComplete={handleSeek}
                minimumTrackTintColor="#ff1493"
                maximumTrackTintColor="#999"
                thumbTintColor="#ff1493"
              />
              <View style={tw`flex-row justify-between mt-1`}>
                <ThemedText style={tw`text-[#070c70] text-xs`}>
                  {formatTime(position)}
                </ThemedText>
                <ThemedText style={tw`text-[#070c70] text-xs`}>
                  {formatTime(duration)}
                </ThemedText>
              </View>

              <View style={tw`flex-row justify-center items-center`}>
                <TouchableOpacity onPress={skipBackward}>
                  <MaterialCommunityIcons name="rewind-10" size={30} color="#070c70" />
                </TouchableOpacity>

                <TouchableOpacity onPress={togglePlay} style={tw`px-5`}>
                  {loading ? (
                    <ActivityIndicator size="large" color="#ff1493" />
                  ) : (
                    <MaterialCommunityIcons
                      name={isPlaying ? 'pause-circle' : 'play-circle'}
                      size={70}
                      color="#ff1493"
                    />
                  )}
                </TouchableOpacity>

                <TouchableOpacity onPress={skipForward}>
                  <MaterialCommunityIcons name="fast-forward-10" size={30} color="#070c70" />
                </TouchableOpacity>
              </View>
            </View>
          </ImageBackground>
        </ThemedView>
      ) : (
        <TouchableOpacity
          onPress={() => setIsExpanded(true)}
          style={tw`absolute bottom-0 left-0 right-0 z-50 bg-[#070c70] dark:bg-black flex-row items-center justify-between px-4 py-3 border-t border-gray-300`}>
          <ThemedText numberOfLines={1} style={tw`flex-1 font-semibold text-white mr-4`}>
            {chapterTitle}
          </ThemedText>
          <TouchableOpacity onPress={togglePlay}>
            <MaterialCommunityIcons
              name={isPlaying ? 'pause' : 'play'}
              size={26}
              color={primaryColor}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      )}
    </>
  );
};

export default AudioPlayer;
