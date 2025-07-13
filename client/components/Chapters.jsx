import React, { useState } from 'react';
import { FlatList, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const Chapters = ({ book, onChapterSelect }) => {
  const [showMoreInfo, setShowMoreInfo] = useState(false); // Track if additional info is visible
  const primaryColor = useThemeColor({}, 'primary');

  // Return a message if there are no chapters
  if (!book?.chapters?.length) {
    return (
      <ThemedText style={tw`text-center p-4`}>
        No chapters available.
      </ThemedText>
    );
  }

  return (
    <ThemedView style={tw`p-2`}>
      {/* Toggle More Info Section */}
      <TouchableOpacity
        onPress={() => setShowMoreInfo(prevState => !prevState)} // Toggle the visibility of more info
        style={tw`flex-row items-center justify-start`}
      >
        <ThemedText
          style={[
            tw`text-md text-blue-500 m-3`,
            { color: primaryColor },
          ]}
        >
          {showMoreInfo ? 'Show less info' : 'Show more info'}
        </ThemedText>

        <MaterialCommunityIcons
          name={showMoreInfo ? 'chevron-up' : 'chevron-down'}
          size={24}
          color={primaryColor}
        />
      </TouchableOpacity>

      {/* More Book Information Section */}
      {showMoreInfo && (
        <ThemedView style={tw`items-center justify-center`}>
            <ThemedView style={tw`flex-row items-center justify-start gap-2 flex-wrap`}>
            {/* Author Icon and Text */}
            <MaterialCommunityIcons
              name="pencil"
              size={16}
              style={[{ color: primaryColor }]}
            />
            <ThemedText style={tw`text-md text-gray-600`}>
              {book.bookAuthor}
            </ThemedText>

            {/* Reciter Icon and Text */}
            <MaterialCommunityIcons
              name="microphone"
              size={16}
              style={[{ color: primaryColor }]}
            />
            <ThemedText style={tw`text-md text-gray-600`}>
              {book.reciter || 'N/A'}
            </ThemedText>
          </ThemedView>

          <ThemedText style={tw`text-sm text-gray-600 text-left my-3 mx-4`}>
            {book.bookDescription || 'N/A'}
          </ThemedText>
        </ThemedView>
      )}

      {/* Chapters List */}
      <FlatList
        data={book.chapters}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => onChapterSelect(item)} // Handle chapter selection
            style={tw`p-3 m-2 border border-gray-300 rounded-lg flex-row justify-between`}
          >
            <ThemedText style={tw`text-lg font-semibold`}>{item.title}</ThemedText>
            <ThemedText style={tw`text-sm text-gray-500`}>{item.duration}</ThemedText>
          </TouchableOpacity>
        )}
      />
    </ThemedView>
  );
};

export default Chapters;
