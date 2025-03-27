import React from 'react';
import { FlatList, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import tw from 'twrnc';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function CategorySection({ title, books, textColor }) {
  const router = useRouter();
  const logo = require('../../client/assets/images/logo.png');
  return (
    <ThemedView style={tw`ml-5 mb-5`}>
      <ThemedText style={[tw`text-2xl mb-3 font-bold`, { color: textColor }]}>{title}</ThemedText>
      {books.length > 0 ? (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={books}
          keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
          initialNumToRender={5}
          getItemLayout={(data, index) => ({
            length: 120,
            offset: 120 * index,
            index,
          })}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/book/${item._id}`)}
              style={tw`mr-3`}
            >
              <Image
                source={{ uri: item.bookCover || logo}}
                style={tw`w-24 h-36 rounded-lg`}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
        />
      ) : (
        <ThemedText style={[tw`text-base italic`, { color: textColor }]}>
          No books available in this category.
        </ThemedText>
      )}
    </ThemedView>
  );
}
