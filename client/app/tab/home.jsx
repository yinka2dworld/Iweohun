import React from 'react';
import { ScrollView, View, TouchableOpacity, Text, SafeAreaView, Image, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import LanguageList from "../../components/LanguageList";
// import { useQuery } from '@apollo/client';
// import { GET_BOOKS } from '../../graphql/queries';
import tw from 'twrnc';
import { useAppTheme } from '../themeContext';
import Searchbar from '../../components/Searchbar';

export default function Home() {
  const router = useRouter();
  const theme = useAppTheme()
  // const { loading, error, data } = useQuery(GET_BOOKS);

  // if (loading) return <ActivityIndicator size="large" color="#ff1493" />;
  // if (error) return <Text>Error fetching data</Text>;

  // const books = data.books;

  const books = [
    {
        id: '1',
        title: 'Book 1',
        author: 'Author 1',
        category: "History & Biographies",
        language: 'English', // Added language attribute
        chapters: [
            { id: '1', title: 'Chapter 1' },
            { id: '2', title: 'Chapter 2' },
            { id: '3', title: 'Chapter 3' }
        ],
        coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1tf3QiePLGWrYYU0hiSD594zkUHdspxc6Og&s'
    },
    {
        id: '2',
        title: 'Book 2',
        author: 'Author 2',
        category: "Fiction & Romance",
        language: 'French', // Added language attribute
        chapters: [
            { id: '1', title: 'Chapter 1' },
            { id: '2', title: 'Chapter 2' },
            { id: '3', title: 'Chapter 3' }
        ],
        coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvnCXxT-uP1cIGWq7Scy45pzGSN9V6VoVUWw&s'
    },
    {
        id: '3',
        title: 'Book 3',
        author: 'Author 3',
        category: "Kids",
        language: 'Spanish', // Added language attribute
        chapters: [
            { id: '1', title: 'Chapter 1' },
            { id: '2', title: 'Chapter 2' },
            { id: '3', title: 'Chapter 3' }
        ],
        coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1tf3QiePLGWrYYU0hiSD594zkUHdspxc6Og&s'
    },
    {
        id: '4',
        title: 'Book 4',
        author: 'Author 4',
        category: "Personal Development",
        language: 'German', // Added language attribute
        chapters: [
            { id: '1', title: 'Chapter 1' },
            { id: '2', title: 'Chapter 2' },
            { id: '3', title: 'Chapter 3' }
        ],
        coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvnCXxT-uP1cIGWq7Scy45pzGSN9V6VoVUWw&s'
    },
    {
        id: '5',
        title: 'Book 5',
        author: 'Author 5',
        category: "Adventure & Thrillers",
        language: 'Italian', // Added language attribute
        chapters: [
            { id: '1', title: 'Chapter 1' },
            { id: '2', title: 'Chapter 2' },
            { id: '3', title: 'Chapter 3' }
        ],
        coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1tf3QiePLGWrYYU0hiSD594zkUHdspxc6Og&s'
    },
    {
        id: '6',
        title: 'Book 6',
        author: 'Author 6',
        category: "Kids",
        language: 'Portuguese', // Added language attribute
        chapters: [
            { id: '1', title: 'Chapter 1' },
            { id: '2', title: 'Chapter 2' },
            { id: '3', title: 'Chapter 3' }
        ],
        coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvnCXxT-uP1cIGWq7Scy45pzGSN9V6VoVUWw&s'
    },
    {
        id: '7',
        title: 'Book 7',
        author: 'Author 7',
        category: "Fiction & Romance",
        language: 'Dutch', // Added language attribute
        chapters: [
            { id: '1', title: 'Chapter 1' },
            { id: '2', title: 'Chapter 2' },
            { id: '3', title: 'Chapter 3' }
        ],
        coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1tf3QiePLGWrYYU0hiSD594zkUHdspxc6Og&s'
    },
];

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: theme.background }]}>
    <ScrollView>
      <View style={tw`ml-5 mt-12`}>
        <Text style={[tw`text-4xl font-bold`, { color: theme.text }]}>Iweohun</Text>
        <Text style={tw`text-[#ff1493] text-xl font-semibold`}>Orating African literature</Text>
      </View>
      <Searchbar />

      <LanguageList />

      <View style={tw`mb-10 w-full mx-5`}>
        <CategorySection title="History & Biographies" books={books.filter((book) => book.category === 'History & Biographies')} />
        <CategorySection title="Fiction & Romance" books={books.filter((book) => book.category === 'Fiction & Romance')} />
        <CategorySection title="Kids" books={books.filter((book) => book.category === 'Kids')} />
        <CategorySection title="Personal Development" books={books.filter((book) => book.category === 'Personal Development')} />
        <CategorySection title="Adventure & Thrillers" books={books.filter((book) => book.category === 'Adventure & Thrillers')} />
      </View>
    </ScrollView>
  </SafeAreaView>
);
}

function CategorySection({ title, books }) {
const router = useRouter();
const theme = useAppTheme();

return (
  <View style={tw`ml-5 mb-5`}>
    <Text style={[tw`text-2xl mb-3 font-bold`, { color: theme.text }]}>{title}</Text>
    {books.length > 0 ? (
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={books}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/book/${item.id}`, { book: item })}
            style={tw`mr-3`}
          >
            <Image
              source={{ uri: item.coverImage }}
              style={tw`w-20 h-25 rounded-lg mr-4`}
            />
          </TouchableOpacity>
        )}
      />
    ) : (
      <Text style={[tw`text-base`, { color: theme.text }]}>No books available in this category.</Text>
    )}
  </View>
);
}