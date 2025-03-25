import React, { useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, Image } from 'react-native';
import tw from 'twrnc';
import { AirbnbRating } from 'react-native-ratings';
import Chapters from '../../components/Chapters';
import Related from '../../components/Related';
import Reviews from '../../components/Reviews';
import AudioPlayer from './AudioPlayer';
import { ThemedView } from '@/components/ThemedView.jsx';
import { ThemedText } from '@/components/ThemedText';


const BookDetails = ({ defaultRating = 4 }) => {
 
  const [selectedTab, setSelectedTab] = useState('Chapters');
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
    <ThemedView style={[tw`flex-1`]}>
      <ThemedView style={tw`p-4`}>
        <ThemedView style={tw`flex-row mb-4 items-center`}>
          <TouchableOpacity onPress={() => console.log('Back pressed')}>
            <ThemedText style={[tw`text-lg mr-4`]}>←</ThemedText>
          </TouchableOpacity>
          <ThemedText style={[tw`text-3xl font-bold`]}>
            {book.title}
          </ThemedText>
        </ThemedView>

        <ThemedView style={tw`flex-row mb-4 items-center`}>
          <Image
            source={{ uri: book.coverImage }}
            style={tw`w-30 h-30 mr-3`} // Increased width and height
            resizeMode="contain"
          />
          <ThemedView>
            <ThemedText style={[tw`text-base text-[#ff1493]`]}>
              {book.author}
            </ThemedText>
            <ThemedText style={[tw`text-base text-[#ff1493]`]}>
              Read by: {book.reciter}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={tw`mb-3 flex-row items-center ml-4`}>
          <AirbnbRating
            count={5} // Total number of stars
            defaultRating={defaultRating} // Use the default rating parameter
            size={18}
            showRating={false}
            selectedColor="#FFD700" // Color for selected stars
            unSelectedColor={'#323232B3'} // Color for unselected stars
          />
        </ThemedView>

        <ThemedText style={[tw`text-sm mb-4`]}>
          {book.description}
        </ThemedText>

        {/* Tabs */}
        <ThemedView style={[tw`flex-row justify-between mb-4 relative`]}>
          <TouchableOpacity onPress={() => setSelectedTab('Chapters')}>
            <ThemedView style={tw`items-center`}>
              <ThemedText
                style={[
                  tw`text-lg p-4`,
                  { color: selectedTab === 'Chapters' ? text : placeholder },
                ]}
              >
                Chapters
              </ThemedText>
              {selectedTab === 'Chapters' && (
                <ThemedView style={tw`absolute bottom-0 h-0.5 w-full bg-[#ff1493]`}></ThemedView>
              )}
            </ThemedView>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedTab('Reviews')}>
            <ThemedView style={tw`items-center`}>
              <ThemedText
                style={[
                  tw`text-lg p-4`,
                  { color: selectedTab === 'Reviews' ? text : placeholder },
                ]}
              >
                Reviews
              </ThemedText>
              {selectedTab === 'Reviews' && (
                <View style={tw`absolute bottom-0 h-0.5 w-full bg-[#ff1493]`}></View>
              )}
            </ThemedView>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedTab('Related')}>
            <ThemedView style={tw`items-center`}>
              <ThemedText
                style={[
                  tw`text-lg p-4`,
                  { color: selectedTab === 'Related' ? text : placeholder },
                ]}
              >
                Related
              </ThemedText>
              {selectedTab === 'Related' && (
                <View style={tw`absolute bottom-0 h-0.5 w-full bg-[#ff1493]`}></View>
              )}
            </ThemedView>
          </TouchableOpacity>
        </ThemedView>

        {/* Tab Content */}
        {renderTabContent()}
      </ThemedView>

      {selectedChapter && (
        <AudioPlayer
          audio={selectedChapter.audio}
          bookName={book.title}
          chapterTitle={selectedChapter.title}
          onClose={() => setSelectedChapter(null)}
        />
      )}
    </ThemedView>
  );
};

export default BookDetails;
