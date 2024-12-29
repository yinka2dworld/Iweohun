import React, { useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, Image } from 'react-native';
import tw from 'twrnc';
import { AirbnbRating } from 'react-native-ratings';
import { useAppTheme } from '../themeContext';
import Chapters from '../../components/Chapters';
import Related from '../../components/Related';
import Reviews from '../../components/Reviews';
import AudioPlayer from './AudioPlayer';

const BookDetails = ({
  book = {
    id: '7',
    title: 'The Art of War',
    author: 'Sun Tzu',
    reciter: 'Moira Fogarty',
    category: 'Military Strategy',
    description: 'The Art of War is a Chinese military treatise written during the 6th century BC by Sun Tzu. It has long been praised as the definitive work on military strategies and tactics of its time.',
    chapters: [
      { id: '1', title: 'Chapter 1', audio: require('../../assets/audio.mp3') },
      { id: '2', title: 'Chapter 2', audio: require('../../assets/audio2.mp3') },
      { id: '3', title: 'Chapter 3', audio: require('../../assets/audio3.mp3') }
    ],
    coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1tf3QiePLGWrYYU0hiSD594zkUHdspxc6Og&s',
  },
  defaultRating = 4, // Default rating value set to 4 stars
}) => {
  const { background, text, placeholder } = useAppTheme();

  const [selectedTab, setSelectedTab] = useState('Chapters'); // Default to the "Chapters" tab
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [currentSound, setCurrentSound] = useState(null);

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'Chapters':
        return (
          <Chapters
            book={book}
            selectedChapter={selectedChapter}
            setSelectedChapter={setSelectedChapter}
            currentSound={currentSound}
            setCurrentSound={setCurrentSound}
          />
        );
      case 'Related':
        return <Related />;
      case 'Reviews':
        return <Reviews />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: background }]}>
      <View style={tw`p-4`}>
        <View style={tw`flex-row mb-4 items-center`}>
          <TouchableOpacity onPress={() => console.log('Back pressed')}>
            <Text style={[tw`text-lg mr-4`, { color: text }]}>←</Text>
          </TouchableOpacity>
          <Text style={[tw`text-3xl font-bold`, { color: text }]}>
            {book.title}
          </Text>
        </View>

        <View style={tw`flex-row mb-4 items-center`}>
          <Image
            source={{ uri: book.coverImage }}
            style={tw`w-30 h-30 mr-3`} // Increased width and height
            resizeMode="contain"
          />
          <View>
            <Text style={[tw`text-base text-[#ff1493]`]}>
              {book.author}
            </Text>
            <Text style={[tw`text-base text-[#ff1493]`]}>
              Read by: {book.reciter}
            </Text>
          </View>
        </View>

        <View style={tw`mb-3 flex-row items-center ml-4`}>
          <AirbnbRating
            count={5} // Total number of stars
            defaultRating={defaultRating} // Use the default rating parameter
            size={18}
            showRating={false}
            selectedColor="#FFD700" // Color for selected stars
            unSelectedColor={'#323232B3'} // Color for unselected stars
          />
        </View>

        <Text style={[tw`text-sm mb-4`, { color: placeholder }]}>
          {book.description}
        </Text>

        {/* Tabs */}
        <View style={[tw`flex-row justify-between mb-4 relative`]}>
          <TouchableOpacity onPress={() => setSelectedTab('Chapters')}>
            <View style={tw`items-center`}>
              <Text
                style={[
                  tw`text-lg p-4`,
                  { color: selectedTab === 'Chapters' ? text : placeholder },
                ]}
              >
                Chapters
              </Text>
              {selectedTab === 'Chapters' && (
                <View style={tw`absolute bottom-0 h-0.5 w-full bg-[#ff1493]`}></View>
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedTab('Reviews')}>
            <View style={tw`items-center`}>
              <Text
                style={[
                  tw`text-lg p-4`,
                  { color: selectedTab === 'Reviews' ? text : placeholder },
                ]}
              >
                Reviews
              </Text>
              {selectedTab === 'Reviews' && (
                <View style={tw`absolute bottom-0 h-0.5 w-full bg-[#ff1493]`}></View>
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedTab('Related')}>
            <View style={tw`items-center`}>
              <Text
                style={[
                  tw`text-lg p-4`,
                  { color: selectedTab === 'Related' ? text : placeholder },
                ]}
              >
                Related
              </Text>
              {selectedTab === 'Related' && (
                <View style={tw`absolute bottom-0 h-0.5 w-full bg-[#ff1493]`}></View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {renderTabContent()}
      </View>

      {selectedChapter && (
        <AudioPlayer
          audio={selectedChapter.audio}
          bookName={book.title}
          chapterTitle={selectedChapter.title}
          onClose={() => setSelectedChapter(null)} // Close the player and reset the selected chapter
        />
      )}
    </SafeAreaView>
  );
};

export default BookDetails;
