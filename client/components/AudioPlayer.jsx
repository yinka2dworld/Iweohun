import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import tw from 'twrnc';
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

const AudioPlayer = ({ audioUrl, chapterTitle, onClose }) => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(1);

  const primaryColor = useThemeColor({}, 'primary');

  // Auto-play when `audioUrl` changes
  useEffect(() => {
    let newSound;
    
    const loadAndPlay = async () => {
      if (!audioUrl) return; // Prevent errors if audioUrl is null
      
      setLoading(true);

      try {
        // Unload previous sound if it exists
        if (sound) {
          await sound.unloadAsync();
        }

        // Load and play new audio
        const { sound: loadedSound } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { shouldPlay: true }
        );

        newSound = loadedSound;
        setSound(newSound);
        setIsPlaying(true);

        // Get duration
        const status = await newSound.getStatusAsync();
        if (status.isLoaded) {
          setDuration(status.durationMillis || 1);
        }

        // Listen for playback updates
        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            setPosition(status.positionMillis);
            setDuration(status.durationMillis || 1);
            if (status.didJustFinish) {
              setIsPlaying(false); // Stop when audio finishes
            }
          }
        });

      } catch (error) {
        console.error('Error playing audio', error);
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
  }, [audioUrl]); // Runs whenever audioUrl changes

  // Toggle play/pause
  const togglePlay = async () => {
    if (!sound) return;
    try {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Error toggling playback', error);
    }
  };

  const handleSeek = async (value) => {
    if (sound) {
      await sound.setPositionAsync(value);
      setPosition(value);
    }
  };

  const skipForward = async () => {
    if (sound) {
      let newPosition = position + 10000; // Skip 10s forward
      if (newPosition > duration) newPosition = duration;
      await sound.setPositionAsync(newPosition);
      setPosition(newPosition);
    }
  };

  const skipBackward = async () => {
    if (sound) {
      let newPosition = position - 10000; // Skip 10s backward
      if (newPosition < 0) newPosition = 0;
      await sound.setPositionAsync(newPosition);
      setPosition(newPosition);
    }
  };

  return (
    <ThemedView style={[tw`absolute bottom-0 w-full p-2 bg-[#070c70]`]}>
      <ThemedText style={tw`font-bold text-center text-white`}>{chapterTitle}</ThemedText>

      <View style={tw`flex-row justify-center items-center `}>
        <TouchableOpacity onPress={skipBackward}>
          <MaterialCommunityIcons name="rewind-10" size={20} color={primaryColor} />
        </TouchableOpacity>

        <TouchableOpacity onPress={togglePlay} style={tw`mx-6`}>
          {loading ? (
            <ActivityIndicator size="small" color={primaryColor} />
          ) : (
            <MaterialCommunityIcons
              name={isPlaying ? 'pause-circle-outline' : 'play-circle-outline'}
              size={40}
              color={primaryColor}
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={skipForward}>
          <MaterialCommunityIcons name="fast-forward-10" size={20} color={primaryColor} />
        </TouchableOpacity>
      </View>

      <Slider
        style={tw`w-full my-2`}
        minimumValue={0}
        maximumValue={duration}
        value={position}
        onSlidingComplete={handleSeek}
        minimumTrackTintColor={primaryColor}
        maximumTrackTintColor="#ccc"
        thumbTintColor={primaryColor}
      />

      <TouchableOpacity onPress={onClose} style={tw`1`}>
        <MaterialCommunityIcons name="close-circle-outline" size={15} color={primaryColor} />
      </TouchableOpacity>
    </ThemedView>
  );
};

export default AudioPlayer;
