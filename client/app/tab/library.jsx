import React, { useState } from 'react';
import { SafeAreaView, FlatList, View, TouchableOpacity, Text, Image, Modal, Pressable } from 'react-native';
import tw from 'twrnc';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Import MaterialIcons
import { useAppTheme } from '../themeContext'; // Import useAppTheme

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

export default function Library() {
  const router = useRouter();
  const [selectedBook, setSelectedBook] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const theme = useAppTheme(); // Use the theme context

  const handlePress = (book) => {
    setSelectedBook(book);
    setModalVisible(true);
  };

  const handleAction = (action) => {
    setModalVisible(false);
    switch (action) {
      case 'view':
        router.push(`/book/${selectedBook.id}`); // Navigate to book details page
        break;
      case 'edit':
        router.push(`/edit/${selectedBook.id}`);
        break;
      case 'delete':
        alert('Book deleted');
        break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: theme.background }]}>
      <View style={tw`p-4`}>
        <Text style={[tw`text-3xl font-bold`, { color: theme.text }]}>Library</Text>
        <FlatList
          data={books}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => router.push(`/book/${item.id}`)} 
              style={[tw`mb-4 p-4 rounded-lg`, { backgroundColor: theme.box}]}
            >
              <View style={tw`flex-row`}>
                <Image source={{ uri: item.coverImage }} style={tw`w-20 h-25 rounded-lg mr-4`} />
                <View style={tw`flex-1 justify-center`}>
                  <Text style={[tw`text-lg font-bold`, { color: theme.text }]}>
                    {item.title}
                  </Text>
                  <Text style={[tw`text-sm`, { color: theme.text }]}>
                    {item.author}
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={() => handlePress(item)} 
                  style={tw`justify-center pl-2`}
                >
                  <Icon name="more-vert" size={24} color={theme.primary} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />

        {/* Dropdown Menu Modal */}
        <Modal
          transparent={true}
          visible={modalVisible}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <Pressable 
            style={[tw`flex-1 justify-center items-center`, { backgroundColor: theme.background + '80' }]} 
            onPress={() => setModalVisible(false)}
          >
            <View style={[tw`p-5 rounded-lg`, { backgroundColor: theme.background }]}>
              <Text style={[tw`text-xl font-bold mb-4`, { color: theme.text }]}>
                Actions
              </Text>
              <TouchableOpacity onPress={() => handleAction('edit')} style={tw`p-3 border-b`}>
                <Text style={[tw`text-lg`, { color: theme.text }]}>
                  Edit
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleAction('delete')} style={tw`p-3`}>
                <Text style={[tw`text-lg`, { color: theme.primary }]}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
