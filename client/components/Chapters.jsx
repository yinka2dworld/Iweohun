import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { Audio } from 'expo-av';

const Chapters = ({ book, selectedChapter, setSelectedChapter, currentSound, setCurrentSound }) => {
  const [chapterDurations, setChapterDurations] = useState({});

  useEffect(() => {
    const loadDurations = async () => {
      const durations = {};
      for (let chapter of book.chapters) {
        const { duration } = await getAudioDuration(chapter.audio);
        durations[chapter.id] = formatTime(duration / 1000); // Convert to seconds and format
      }
      setChapterDurations(durations);
    };

    loadDurations();

    // Cleanup function
    return () => {
      if (currentSound) {
        currentSound.unloadAsync(); // Stop and unload the currently playing audio
      }
    };
  }, [book.chapters, currentSound]);

  const handleChapterPress = async (chapter) => {
    if (currentSound) {
      await currentSound.unloadAsync(); // Stop and unload the currently playing audio
    }
    setSelectedChapter(chapter); // Set the selected chapter to be played

    const { sound } = await Audio.Sound.createAsync(chapter.audio);
    setCurrentSound(sound);
    await sound.playAsync(); // Automatically play the selected chapter
  };

  const getAudioDuration = async (audio) => {
    const { sound } = await Audio.Sound.createAsync(audio);
    const status = await sound.getStatusAsync();
    await sound.unloadAsync();
    return { duration: status.durationMillis };
  };

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <FlatList
      data={book.chapters}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => handleChapterPress(item)}>
          <View style={[tw`p-4 border-b flex-row justify-between items-center`]}>
            <Text style={[tw`text-base`]}>
              {item.title}
            </Text>
            <Text style={[tw`text-xs`]}>
              {chapterDurations[item.id] || 'Loading...'}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
};

export default Chapters;
