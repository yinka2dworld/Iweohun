import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Modal, Image, Text, useColorScheme } from 'react-native';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemedView } from '@/components/ThemedView.jsx';
import { ThemedText } from '@/components/ThemedText';
import tw from 'twrnc';


const AudioPlayer = ({ audio, bookName, chapterTitle }) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(1);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (audio) {
      loadSound();
    }
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [audio]);

  const loadSound = async () => {
    try {
      const { sound: loadedSound } = await Audio.Sound.createAsync(audio);
      setSound(loadedSound);
      loadedSound.setOnPlaybackStatusUpdate(updateStatus);
      await loadedSound.playAsync();
      setIsPlaying(true);
    } catch (error) {
      console.error('Error loading sound:', error);
    }
  };

  const updateStatus = (status) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 1); // Avoid division by zero
      setIsPlaying(status.isPlaying);
    }
  };

  const playPause = async () => {
    if (sound) {
      try {
        if (isPlaying) {
          await sound.pauseAsync();
        } else {
          await sound.playAsync();
        }
        setIsPlaying(!isPlaying);
      } catch (error) {
        console.error('Error during playback:', error);
      }
    }
  };

  const seek = async (time) => {
    if (sound) {
      try {
        let newPosition = position + time;
        if (newPosition > duration) newPosition = duration;
        if (newPosition < 0) newPosition = 0;
        await sound.setPositionAsync(newPosition);
        setPosition(newPosition);
      } catch (error) {
        console.error('Error seeking:', error);
      }
    }
  };

  const openModal = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const toggleSave = () => {
    setIsSaved(!isSaved);
  };

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <ThemedView style={[tw`absolute bottom-0 w-full p-2`, { zIndex: 10 }]}>
      <TouchableOpacity 
        onPress={openModal} 
        style={tw`flex-row items-center justify-between p-2 rounded-lg bg-[#070c70]`}
      >
        <Image 
          source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvnCXxT-uP1cIGWq7Scy45pzGSN9V6VoVUWw&s' }} 
          style={tw`w-16 h-16 rounded-md mr-4`}
        />
        <ThemedView>
          <Text style={tw`text-lg font-bold text-[#ffffff]`}>{bookName}</Text>
          <Text style={tw`text-sm text-[#ffffff]`}>{chapterTitle}</Text>
        </ThemedView>
        <TouchableOpacity style={tw`ml-15`} onPress={playPause}>
          <MaterialCommunityIcons 
            name={isPlaying ? "pause-circle" : "play-circle"} 
            size={50}
            color="#ff1493"
          />
        </TouchableOpacity>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={closeModal}
      >
        <ThemedView style={[tw`flex-1 justify-center items-center`, { backgroundColor: isDarkMode ? '#000000' : '#f8f8f8' }]}>
          <TouchableOpacity onPress={closeModal} style={tw`absolute top-15 left-5`}>
            <ThemedText style={[tw`text-lg`, { color: isDarkMode ? '#ffffff' : '#070c70' }]}>Done</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={tw`absolute top-15 right-5`} onPress={toggleSave}>
            <MaterialCommunityIcons 
              name={isSaved ? "bookmark" : "bookmark-outline"} 
              size={30}
              color={isDarkMode ? '#ffffff' : '#070c70'}
            />
          </TouchableOpacity>
          <Image 
            source={{ uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvnCXxT-uP1cIGWq7Scy45pzGSN9V6VoVUWw&s' }} 
            style={tw`w-64 h-64 rounded-lg mb-5`}
          />
          <ThemedText style={tw`text-2xl font-bold mb-5 text-[#ff1493]`}>{bookName}</ThemedText>
          <ThemedText style={[tw`text-lg mb-5`, { color: isDarkMode ? '#ffffff' : '#070c70' }]}>{chapterTitle}</ThemedText>
          <Slider
            value={position / duration}
            onSlidingComplete={(value) => seek(value * duration)}
            style={{ width: '80%' }}
            minimumTrackTintColor="#ff1493"
            maximumTrackTintColor="#ffffff"
            thumbTintColor="#ff1493"
          />
          <ThemedView style={tw`flex-row justify-between w-64 mt-4`}>
            <ThemedText style={[tw``, { color: isDarkMode ? '#ffffff' : '#070c70' }]}>{formatTime(position / 1000)}</ThemedText>
            <ThemedText style={[tw``, { color: isDarkMode ? '#ffffff' : '#070c70' }]}>{formatTime(duration / 1000)}</ThemedText>
          </ThemedView>
          <ThemedView style={tw`flex-row items-center mt-5`}>
            <TouchableOpacity onPress={() => seek(-15000)}>
              <MaterialCommunityIcons name="rewind-15" size={30} color={isDarkMode ? '#ffffff' : '#070c70'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={playPause} style={tw`ml-10 mr-10`}>
              <MaterialCommunityIcons 
                name={isPlaying ? "pause-circle" : "play-circle"} 
                size={60}
                color={isDarkMode ? '#ffffff' : '#070c70'}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => seek(15000)}>
              <MaterialCommunityIcons name="fast-forward-15" size={30} color={isDarkMode ? '#ffffff' : '#070c70'} />
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
};

export default AudioPlayer;
