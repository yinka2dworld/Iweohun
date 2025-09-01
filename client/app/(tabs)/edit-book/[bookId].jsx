import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  View,
  Text,
  Modal,
  Pressable,
  FlatList
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';
import Constants from 'expo-constants';
import { useLocalSearchParams, useRouter } from 'expo-router';
import tw from 'twrnc';
import { MaterialIcons, FontAwesome, Ionicons, Entypo } from '@expo/vector-icons';
import { Audio } from 'expo-av';

import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';


const CATEGORIES = [
  'History & Biographies',
  'Fiction',
  'Romance',
  'Kids',
  'Personal Development',
  'Adventure & Thrillers'
];

const LANGUAGES = [
  'Swahili',
  'Yoruba',
  'Zulu',
  'Amharic',
  'Hausa',
  'Igbo',
  'Amazigh',
  'Shona',
  'Fulani',
  'Malagasy',
  'Oromo'
];

export default function BookForm({ type = 'add' }) {
  const [formData, setFormData] = useState({
    bookName: '',
    bookDescription: '',
    bookAuthor: '',
    reciter: '',
    category: '',
    language: '',
    chapters: [],
  });

  const [bookCoverUri, setBookCoverUri] = useState(null);
  const [bookCoverFile, setBookCoverFile] = useState(null);
  const [loading, setLoading] = useState(type === 'edit');
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterAudioUri, setChapterAudioUri] = useState(null);
  const [chapterAudioFile, setChapterAudioFile] = useState(null);
  const [calculatingDuration, setCalculatingDuration] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const { bookId } = useLocalSearchParams();
  const router = useRouter();
  const apiUrl = Constants.expoConfig?.extra?.API_BASE_URL;

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'border');

  useEffect(() => {
    if (bookId) {
      const fetchBook = async () => {
        try {
          const token = await SecureStore.getItemAsync('authToken');
          const res = await axios.get(`${apiUrl}/book/${bookId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const book = res.data;
          setFormData({
            bookName: book.bookName || '',
            bookDescription: book.bookDescription || '',
            bookAuthor: book.bookAuthor || '',
            reciter: book.reciter || '',
            category: book.category || '',
            language: book.language || '',
            chapters: book.chapters || [],
          });
          setBookCoverUri(book.bookCover);
        } catch (error) {
          Alert.alert('Error', 'Failed to load book details');
        } finally {
          setLoading(false);
        }
      };
      fetchBook();
    }
  }, [bookId]);

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };


  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need camera roll permissions to select an image');
      return;
    }
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes:  ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      aspect: [4, 3],
    });
  
    if (!result.canceled && result.assets.length > 0) {
      const imageAsset = result.assets[0];
      setBookCoverUri(imageAsset.uri);
  
      const file = {
        uri: imageAsset.uri,
        type: imageAsset.type || 'image/jpeg',
        name: imageAsset.fileName || 'bookCover.jpg',
      };
      setBookCoverFile(file);
    }
  };
  
  
    const pickAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*' });
      if (result.assets && result.assets.length > 0) {
        const audioAsset = result.assets[0];
        const uri = audioAsset.uri;
        setChapterAudioUri(uri);
        const file = {
          uri,
          type: audioAsset.mimeType || 'audio/mpeg',
          name: audioAsset.name || 'chapterAudio.mp3',
        };
        setChapterAudioFile(file);
        await calculateAudioDuration(uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick audio file', error.message);
    }
  };
  
  
    const calculateAudioDuration = async (uri) => {
      try {
        setCalculatingDuration(true);
        const { sound } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: false }
        );
        const status = await sound.getStatusAsync();
        const durationInSeconds = status.durationMillis / 1000;
        const minutes = Math.floor(durationInSeconds / 60);
        const seconds = Math.floor(durationInSeconds % 60);
        const formattedDuration = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
        await sound.unloadAsync();
        return formattedDuration;
      } catch (error) {
        console.error('Error calculating duration:', error);
        return '00:00';
      } finally {
        setCalculatingDuration(false);
      }
    };
    
  
const handleAddChapter = async () => {
    if (!chapterTitle || !chapterAudioUri) {
      Alert.alert('Error', 'Chapter title and audio are required');
      return;
    }

    try {
      const duration = await calculateAudioDuration(chapterAudioUri);
      
      const newChapter = {
        title: chapterTitle,
        duration,
        progress: 0,
        audioFile: chapterAudioFile,
      };

      setFormData(prev => ({
        ...prev,
        chapters: [...prev.chapters, newChapter],
      }));

      setChapterTitle('');
      setChapterAudioUri(null);
      setChapterAudioFile(null);
    } catch (error) {
      console.log(error)
      Alert.alert('Error', 'Failed to add chapter');
    }
  };

  
 const handleRemoveChapter = (indexToRemove) => {
  setFormData(prev => ({
    ...prev,
    chapters: prev.chapters.filter((_, index) => index !== indexToRemove),
  }));
};


   const handleSubmit = async () => {
    if (!formData.bookName || !formData.bookAuthor || !formData.category || !formData.language) {
      Alert.alert('Error', 'Book name, author, category, and language are required');
      return;
    }
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync('authToken');
      const form = new FormData();

      form.append('bookName', formData.bookName);
      form.append('bookDescription', formData.bookDescription);
      form.append('bookAuthor', formData.bookAuthor);
      form.append('reciter', formData.reciter);
      form.append('category', formData.category);
      form.append('language', formData.language);

      if (bookCoverFile) {
        form.append('bookCover', {
          uri: bookCoverFile.uri,
          name: bookCoverFile.name || 'cover.jpg',
          type: bookCoverFile.type || 'image/jpeg',
        });
      }

      // 📌 Chapters meta with existing audio URL if no new file
      const chaptersMeta = formData.chapters.map((chapter, index) => ({
        index,
        title: chapter.title,
        duration: chapter.duration,
        progress: chapter.progress,
        existingAudioUrl: chapter.audioUrl || '', // keep old audio if no replacement
      }));
      form.append('chaptersMeta', JSON.stringify(chaptersMeta));

      // 📌 Attach new chapter audio files
      formData.chapters.forEach((chapter, index) => {
        if (chapter.audioFile) {
          form.append(`chapterAudio_${index}`, {
            uri: chapter.audioFile.uri,
            name: chapter.audioFile.name || `chapter-${index}.mp3`,
            type: chapter.audioFile.type || 'audio/mpeg',
          });
        }
      });

      const response = await axios.put(`${apiUrl}/updateBook/${bookId}`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
      });

      if (response.data) {
        Alert.alert('Success', 'Book updated successfully!');
        router.push('/(tabs)/main');
      }
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      Alert.alert('Error', error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <ThemedView style={tw`flex-1 justify-center items-center`}>
        <ActivityIndicator size="large" color={primaryColor} />
      </ThemedView>
    );
  }

  const renderCategoryItem = ({ item }) => (
    <Pressable
      style={tw`p-3 border-b ${borderColor}`}
      onPress={() => {
        handleChange('category', item);
        setShowCategoryModal(false);
      }}
    >
      <Text style={{ color: textColor }}>{item}</Text>
    </Pressable>
  );

  const renderLanguageItem = ({ item }) => (
    <Pressable
      style={tw`p-3 border-b ${borderColor}`}
      onPress={() => {
        handleChange('language', item);
        setShowLanguageModal(false);
      }}
    >
      <Text style={{ color: textColor }}>{item}</Text>
    </Pressable>
  );

  return (
   <View style={[tw`flex-1`, { backgroundColor }]}>
      {/* Tab Navigation */}
      <View style={tw`flex-row border-b mt-8 ${borderColor}`}>
        <TouchableOpacity
          style={[
            tw`flex-1 items-center py-3`,
            activeTab === 'details' && tw`border-b-2 ${primaryColor}`,
          ]}
          onPress={() => setActiveTab('details')}
        >
          <Text style={[
            tw`text-lg`,
            activeTab === 'details' && { color: primaryColor }
          ]}>
            <MaterialIcons name="book" size={20} color={activeTab === 'details' ? primaryColor : textColor} /> Details
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            tw`flex-1 items-center py-3`,
            activeTab === 'chapters' && tw`border-b-2 ${primaryColor}`,
          ]}
          onPress={() => setActiveTab('chapters')}
        >
          <Text style={[
            tw`text-lg`,
            activeTab === 'chapters' && { color: primaryColor }
          ]}>
            <Ionicons name="list" size={20} color={activeTab === 'chapters' ? primaryColor : textColor} /> Chapters ({formData.chapters.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={tw`p-4`}>
        {activeTab === 'details' ? (
          <>
            <ThemedText style={tw`text-xl mb-4 text-center font-bold`}>
               Update Book
            </ThemedText>

            {/* Book Cover */}
            <View style={tw`items-center mb-6`}>
              <TouchableOpacity 
                onPress={pickImage}
                style={[
                  tw`w-32 h-40 rounded-lg border-2 border-dashed justify-center items-center`,
                  { borderColor }
                ]}
              >
                {bookCoverUri ? (
                  <Image
                    source={{ uri: bookCoverUri }}
                    style={tw`w-full h-full rounded-lg`}
                  />
                ) : (
                  <>
                    <MaterialIcons name="add-photo-alternate" size={32} color={textColor} />
                    <Text style={[tw`mt-2`, { color: textColor }]}>Add Cover</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Description */}
            <View style={tw`mb-4`}>
              <View style={tw`flex-row items-center mb-1`}>
                <MaterialIcons name="description" size={18} color={textColor} />
                <Text style={[tw`ml-2`, { color: textColor }]}>Description{<Text style={tw`text-red-500`}> *</Text>}</Text>
              </View>
              <TextInput
                placeholder="Enter book description"
                value={formData.bookDescription}
                onChangeText={(text) => handleChange('bookDescription', text)}
                multiline
                numberOfLines={4}
                style={[
                  tw`border rounded-lg p-3 h-24`,
                  { borderColor, color: textColor }
                ]}
              />
            </View>

            {/* Book Details Form */}
            {[
              { key: 'bookName', label: 'Book Name', icon: 'book', required: true },
              { key: 'bookAuthor', label: 'Author', icon: 'person', required: true },
              { key: 'reciter', label: 'Reciter', icon: 'mic', required: true },
            ].map(({ key, label, icon, required }) => (
              <View key={key} style={tw`mb-4`}>
                <View style={tw`flex-row items-center mb-1`}>
                  <MaterialIcons name={icon} size={18} color={textColor} />
                  <Text style={[tw`ml-2`, { color: textColor }]}>{label}{required && <Text style={tw`text-red-500`}> *</Text>}</Text>
                </View>
                <TextInput
                  placeholder={`Enter ${label}`}
                  value={formData[key]}
                  onChangeText={(text) => handleChange(key, text)}
                  style={[
                    tw`border rounded-lg p-3`,
                    { borderColor, color: textColor }
                  ]}
                />
              </View>
            ))}


            {/* Category Dropdown */}
            <View style={tw`mb-4`}>
              <View style={tw`flex-row items-center mb-1`}>
                <MaterialIcons name="category" size={18} color={textColor} />
                <Text style={[tw`ml-2`, { color: textColor }]}>Category{!formData.category && <Text style={tw`text-red-500`}> *</Text>}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowCategoryModal(true)}
                style={[
                  tw`border rounded-lg p-3 flex-row items-center justify-between`,
                  { borderColor }
                ]}
              >
                <Text style={{ color: formData.category ? textColor : textColor + '80' }}>
                  {formData.category || 'Select Category'}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={24} color={textColor} />
              </TouchableOpacity>
            </View>

          
            {/* Language Dropdown */}
            <View style={tw`mb-40`}>
              <View style={tw`flex-row items-center mb-1`}>
                <MaterialIcons name="language" size={18} color={textColor} />
                <Text style={[tw`ml-2`, { color: textColor }]}>Language{!formData.language && <Text style={tw`text-red-500`}> *</Text>}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowLanguageModal(true)}
                style={[
                  tw`border rounded-lg p-3 flex-row items-center justify-between`,
                  { borderColor }
                ]}
              >
                <Text style={{ color: formData.language ? textColor : textColor + '80' }}>
                  {formData.language || 'Select Language'}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={24} color={textColor} />
              </TouchableOpacity>
            </View>

            
          </>
        ) : (
          <>
            <ThemedText style={tw`text-xl mb-4 text-center font-bold`}>
              Update Chapters
            </ThemedText>

            {/* Add Chapter Form */}
            <View style={tw`mb-6 p-4 rounded-lg`}>
              <View style={tw`mb-3`}>
                <View style={tw`flex-row items-center mb-1`}>
                  <Text style={[tw`ml-2`, { color: textColor }]}>Chapter Title</Text>
                </View>
                <TextInput
                  placeholder="Enter chapter title"
                  value={chapterTitle}
                  onChangeText={setChapterTitle}
                  style={[
                    tw`border rounded-lg p-3`,
                    { borderColor, color: textColor }
                  ]}
                />
              </View>

              <View style={tw`mb-4`}>
                <View style={tw`flex-row items-center mb-1`}>
                  <MaterialIcons name="audiotrack" size={18} color={textColor} />
                  <Text style={[tw`ml-2`, { color: textColor }]}>Chapter Audio</Text>
                </View>
                <TouchableOpacity
                  onPress={pickAudio}
                  style={[
                    tw`border rounded-lg p-3 flex-row items-center justify-between mb-2`,
                    { borderColor }
                  ]}
                >
                  <Text style={{ color: textColor }}>
                    {chapterAudioUri ? 'Audio Selected' : 'Select Audio File'}
                  </Text>
                  <FontAwesome name="music" size={18} color={textColor} />
                </TouchableOpacity>
                {calculatingDuration && (
                  <View style={tw`flex-row items-center`}>
                    <ActivityIndicator size="small" color={primaryColor} style={tw`mr-2`} />
                    <Text style={{ color: textColor }}>Calculating duration...</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                onPress={handleAddChapter}
                disabled={!chapterTitle || !chapterAudioUri}
                style={[
                  tw`bg-[${primaryColor}] p-3 rounded-lg flex-row items-center justify-center`,
                  (!chapterTitle || !chapterAudioUri) && tw`opacity-50`
                ]}
              >
                <Entypo name="plus" size={18} color="white" />
                <Text style={tw`text-white ml-2`}>Add Chapter</Text>
              </TouchableOpacity>
            </View>

            {/* Chapters List */}
            {formData.chapters.length > 0 ? (
              <View style={tw`mb-6`}>
                <ThemedText style={tw`text-lg mb-3 font-medium`}>Chapter List</ThemedText>
                {formData.chapters.map((chap, index) => (
                  <View 
                    key={index} 
                    style={[
                      tw`p-3 mb-2 rounded-lg flex-row justify-between items-center`,
                      { backgroundColor: borderColor + '20' }
                    ]}
                  >
                    <View style={tw`flex-1`}>
                      <Text style={[tw`font-medium`, { color: textColor }]}>
                        {index + 1}. {chap.title}
                      </Text>
                      <Text style={[tw`text-sm`, { color: textColor + '80' }]}>
                        Duration: {chap.duration}
                      </Text>
                      <Text style={[tw`text-sm`, { color: textColor + '80' }]}>
                        Progress: {chap.progress}%
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => handleRemoveChapter(index)}>
                      <MaterialIcons name="delete" size={24} color="#ff4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <View style={tw`items-center py-8`}>
                <MaterialIcons name="info-outline" size={32} color={textColor} />
                <Text style={[tw`mt-2 text-center`, { color: textColor }]}>
                  No chapters added yet. Add your first chapter above.
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={[tw`flex-1 justify-center`, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[tw`m-6 bg-white rounded-lg`, { backgroundColor }]}>
            <View style={tw`p-4 border-b ${borderColor}`}>
              <Text style={[tw`text-lg font-bold`, { color: textColor }]}>Select Category</Text>
            </View>
            <FlatList
              data={CATEGORIES}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item}
              style={tw`max-h-64`}
            />
            <TouchableOpacity
              style={tw`p-3 border-t ${borderColor} items-center`}
              onPress={() => setShowCategoryModal(false)}
            >
              <Text style={{ color: primaryColor }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={[tw`flex-1 justify-center`, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[tw`m-6 bg-white rounded-lg`, { backgroundColor }]}>
            <View style={tw`p-4 border-b ${borderColor}`}>
              <Text style={[tw`text-lg font-bold`, { color: textColor }]}>Select Language</Text>
            </View>
            <FlatList
              data={LANGUAGES}
              renderItem={renderLanguageItem}
              keyExtractor={(item) => item}
              style={tw`max-h-64`}
            />
            <TouchableOpacity
              style={tw`p-3 border-t ${borderColor} items-center`}
              onPress={() => setShowLanguageModal(false)}
            >
              <Text style={{ color: primaryColor }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Submit Button */}
      {activeTab === 'chapters' && (
        <View style={tw`p-4 mb-25`}>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={[
              tw`bg-[${primaryColor}] p-4 rounded-lg flex-row items-center justify-center`,
              loading && tw`opacity-70`
            ]}
          >
            {loading ? (
              <ActivityIndicator color="white" style={tw`mr-2`} />
            ) : (
              <MaterialIcons name={"add"} size={20} color="white" />
            )}
            <Text style={tw`text-white ml-2 text-lg font-medium`}>
              Submit Book
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>  
  );
}