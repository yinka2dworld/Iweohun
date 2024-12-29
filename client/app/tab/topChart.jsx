import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import tw from 'twrnc';
import { useAppTheme } from '../themeContext'; // Adjust the path as necessary

export default function TopChart() {
  const router = useRouter();
  const theme = useAppTheme();

  const books = [
    { id: '1', title: 'Book 1', author: 'Author 1', category: "History & Biographies",
      chapters: [ { id: '1', title: 'Chapter 1' }, { id: '2', title: 'Chapter 2' }, { id: '3', title: 'Chapter 3' } ],
      coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1tf3QiePLGWrYYU0hiSD594zkUHdspxc6Og&s' },

    { id: '2', title: 'Book 2', author: 'Author 2', category: "Fiction & Romance",
      chapters: [ { id: '1', title: 'Chapter 1' }, { id: '2', title: 'Chapter 2' }, { id: '3', title: 'Chapter 3' } ], 
      coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvnCXxT-uP1cIGWq7Scy45pzGSN9V6VoVUWw&s' },

    { id: '3', title: 'Book 3', author: 'Author 3', category: "Kids",
      chapters: [ { id: '1', title: 'Chapter 1' }, { id: '2', title: 'Chapter 2' }, { id: '3', title: 'Chapter 3' } ],
      coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1tf3QiePLGWrYYU0hiSD594zkUHdspxc6Og&s' },

    { id: '4', title: 'Book 4', author: 'Author 4', category: "Personal Development", 
      chapters: [ { id: '1', title: 'Chapter 1' }, { id: '2', title: 'Chapter 2' }, { id: '3', title: 'Chapter 3' } ],
      coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvnCXxT-uP1cIGWq7Scy45pzGSN9V6VoVUWw&s' },

    { id: '5', title: 'Book 5', author: 'Author 5', category: "Adventure & Thrillers",
      chapters: [ { id: '1', title: 'Chapter 1' }, { id: '2', title: 'Chapter 2' }, { id: '3', title: 'Chapter 3' } ],
      coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1tf3QiePLGWrYYU0hiSD594zkUHdspxc6Og&s' },

    { id: '6', title: 'Book 6', author: 'Author 6', category: "Kids",
      chapters: [ { id: '1', title: 'Chapter 1' }, { id: '2', title: 'Chapter 2' }, { id: '3', title: 'Chapter 3' } ],
      coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvnCXxT-uP1cIGWq7Scy45pzGSN9V6VoVUWw&s' },

    { id: '7', title: 'Book 7', author: 'Author 7', category: "Fiction & Romance",
      chapters: [ { id: '1', title: 'Chapter 1' }, { id: '2', title: 'Chapter 2' }, { id: '3', title: 'Chapter 3' } ],
      coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1tf3QiePLGWrYYU0hiSD594zkUHdspxc6Og&s' },
  ];

  const renderBookItem = ({ item }) => (
    <TouchableOpacity
      style={[tw`flex-row items-center bg-white p-4 rounded-lg mb-4 shadow-md`, { backgroundColor: theme.box}]}
      onPress={() => router.push(`/book/${item.id}`, { book: item })}
    >
      <Image
        source={{ uri: item.coverImage }}
        style={tw`w-16 h-20 rounded-md`}
      />
      <View style={tw`ml-4 flex-1`}>
        <Text style={[tw`text-lg font-semibold`, { color: theme.text }]}>{item.title}</Text>
        <Text style={[tw`text-sm`, { color: theme.secondary }]}>by {item.author}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: theme.background }]}>
      <View style={tw`mx-5 mt-10`}>
        <Text style={[tw`text-3xl font-bold mb-5`, { color: theme.text }]}>Top Chart</Text>
        <FlatList
          data={books}
          renderItem={renderBookItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={tw`pb-10`}
        />
      </View>
    </SafeAreaView>
  );
}
