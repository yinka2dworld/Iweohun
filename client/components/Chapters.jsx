import React from 'react';
import { FlatList, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { ThemedText } from '@/components/ThemedText';



const Chapters = ({ book, onChapterSelect }) => {
  if (!book?.chapters?.length) {
    return <ThemedText style={tw`text-center p-4`}>No chapters available.</ThemedText>;
  }

  return (
    <FlatList
      data={book.chapters}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => onChapterSelect(item)} style={tw`p-3 m-2 border border-gray-300 rounded-lg flex-row justify-between`}>
          <ThemedText style={tw`text-lg font-semibold`}>{item.title}</ThemedText>
          <ThemedText style={tw`text-sm text-gray-500`}>{item.duration}</ThemedText>
        </TouchableOpacity>
      )}
    />
  );
};

export default Chapters;
