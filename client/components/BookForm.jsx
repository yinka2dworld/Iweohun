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
  Switch,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';
import Constants from 'expo-constants';
import { useLocalSearchParams } from 'expo-router';
import tw from 'twrnc';
import { MaterialIcons, FontAwesome, Ionicons, Entypo } from '@expo/vector-icons';
import * as Audio from 'expo-av';

import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

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
  const [loading, setLoading] = useState(type === 'edit');
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterAudioUri, setChapterAudioUri] = useState('');
  const [calculatingDuration, setCalculatingDuration] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  const { bookId } = useLocalSearchParams();
  const apiUrl = Constants.expoConfig?.extra?.API_BASE_URL;

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'border');

  useEffect(() => {
    if (type === 'edit' && bookId) {
      const fetchBook = async () => {
        try {
          const token = await SecureStore.getItemAsync('authToken');
          const res = await axios.get(`${apiUrl}/books/${bookId}`, {
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
        } catch (err) {
          Alert.alert('Error', 'Failed to load book details');
        } finally {
          setLoading(false);
        }
      };
      fetchBook();
    }
  }, [type, bookId]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      // allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled) {
      setBookCoverUri(result.assets[0].uri);
    }
  };

  const pickAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*' });
      if (result.type === 'success') {
        setChapterAudioUri(result.uri);
        await calculateAudioDuration(result.uri); // Optional: for preview
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick audio file');
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
      
      sound.unloadAsync();
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
        id: `chap-${Date.now()}`,
        title: chapterTitle,
        duration,
        progress: 0,
        audioUrl: chapterAudioUri,
      };

      setFormData((prev) => ({
        ...prev,
        chapters: [...prev.chapters, newChapter],
      }));

      setChapterTitle('');
      setChapterAudioUri('');
    } catch (error) {
      Alert.alert('Error', 'Failed to add chapter');
    }
  };

  const handleRemoveChapter = (chapterId) => {
    setFormData((prev) => ({
      ...prev,
      chapters: prev.chapters.filter(chap => chap.id !== chapterId),
    }));
  };

  const handleSubmit = async () => {
    if (!formData.bookName || !formData.bookAuthor) {
      Alert.alert('Error', 'Book name and author are required');
      return;
    }

    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync('authToken');
      const form = new FormData();

      // Add all form data fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'chapters') {
          form.append('chapters', JSON.stringify(value));
        } else {
          form.append(key, value);
        }
      });

      // Add book cover if it's a new image
      if (bookCoverUri && !bookCoverUri.startsWith('http')) {
        form.append('bookCover', {
          uri: bookCoverUri,
          name: 'cover.jpg',
          type: 'image/jpeg',
        });
      }

      const url =
        type === 'edit'
          ? `${apiUrl}/updateBook/${bookId}`
          : `${apiUrl}/addBook`;

      await axios({
        method: type === 'edit' ? 'put' : 'post',
        url,
        data: form,
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      Alert.alert('Success', `Book ${type === 'edit' ? 'updated' : 'added'}!`);
    } catch (err) {
      Alert.alert('Error', err.message || 'Submission failed');
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

  return (
    <View style={[tw`flex-1`, { backgroundColor }]}>
      {/* Tab Navigation */}
      <View style={tw`flex-row border-b mt-5 border-[${borderColor}]`}>
        <TouchableOpacity
          style={[
            tw`flex-1 items-center py-3`,
            activeTab === 'details' && tw`border-b-2 border-[${primaryColor}]`,
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
            activeTab === 'chapters' && tw`border-b-2 border-[${primaryColor}]`,
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

      <ScrollView style={tw`p-10`}>
        {activeTab === 'details' ? (
          <>
            <ThemedText style={tw`text-xl mb-4 text-center font-bold`}>
              {type === 'edit' ? 'Edit Book' : 'Add New Book'}
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

        
            {/* Book Details Form */}
            {[
              { key: 'bookName', label: 'Book Name', icon: 'book', required: true },
              { key: 'bookAuthor', label: 'Author', icon: 'person', required: true },
              { key: 'reciter', label: 'Reciter', icon: 'mic' },
              { key: 'category', label: 'Category', icon: 'category' },
              { key: 'language', label: 'Language', icon: 'language' },
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

            {/* Description */}
            <View style={tw`mb-10`}>
              <View style={tw`flex-row items-center mb-1`}>
                <MaterialIcons name="description" size={18} color={textColor} />
                <Text style={[tw`ml-2`, { color: textColor }]}>Description</Text>
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
          </>
        ) : (
          <>
            <ThemedText style={tw`text-xl mb-4 text-center font-bold`}>
            Add Chapters
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
                  onPress={() => pickAudio(setChapterAudioUri)}
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
                    key={chap.id} 
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
                    <TouchableOpacity onPress={() => handleRemoveChapter(chap.id)}>
                      <MaterialIcons name="delete" size={24} color="#ff4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <View style={tw`items-center py-8 `}>
                <MaterialIcons name="info-outline" size={32} color={textColor} />
                <Text style={[tw`mt-2 text-center`, { color: textColor }]}>
                  No chapters added yet. Add your first chapter above.
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Submit Button */}
      {activeTab === 'details' && (
        <View style={tw`p-4 border-[${borderColor}]`}>
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
              <MaterialIcons name={type === 'edit' ? "save" : "add"} size={20} color="white" />
            )}
            <Text style={tw`text-white ml-2 text-lg font-medium`}>
              {type === 'edit' ? 'Update Book' : 'Submit Book'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}