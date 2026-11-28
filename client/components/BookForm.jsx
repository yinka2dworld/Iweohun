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
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
<<<<<<<< HEAD:client/components/BookForm.jsx
import axios from 'axios';
import { API_BASE_URL } from '@/constants/api';
import {  useRouter } from 'expo-router';
import tw from 'twrnc';
import { MaterialIcons, FontAwesome, Ionicons, Entypo } from '@expo/vector-icons';
import { getAudioDuration } from '@/utils/audio';
========
import apiClient, { getApiErrorMessage } from '@/lib/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import tw from 'twrnc';
import { MaterialIcons, FontAwesome, Ionicons, Entypo } from '@expo/vector-icons';
import { createAudioPlayer } from 'expo-audio';
>>>>>>>> f2780159c4f959ab1a343223f0569019255c3da6:client/app/edit-book/[bookId].jsx

import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';


const CATEGORIES = [
  'History & Biographies',
  'Fiction',
  'Non-fiction',
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
  'Somali',
  'Shona',
  'Fulani',
  'Malagasy',
  'Oromo'
];

export default function BookForm({ mode = 'add', bookId }) {
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
<<<<<<<< HEAD:client/components/BookForm.jsx
  const [loading, setLoading] = useState(mode === 'edit');
  const [loadError, setLoadError] = useState(null);
========
  const [loading, setLoading] = useState(true);
>>>>>>>> f2780159c4f959ab1a343223f0569019255c3da6:client/app/edit-book/[bookId].jsx
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterAudioUri, setChapterAudioUri] = useState(null);
  const [chapterAudioFile, setChapterAudioFile] = useState(null);
  const [calculatingDuration, setCalculatingDuration] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  
  const router = useRouter();
<<<<<<<< HEAD:client/components/BookForm.jsx
  const apiUrl = API_BASE_URL;
  const isEditing = mode === 'edit';
========
>>>>>>>> f2780159c4f959ab1a343223f0569019255c3da6:client/app/edit-book/[bookId].jsx

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const onPrimaryColor = useThemeColor({}, 'onPrimary');
  const surfaceColor = useThemeColor({}, 'surface');
  const surfaceAltColor = useThemeColor({}, 'surfaceAlt');
  const placeholderColor = useThemeColor({}, 'placeholder');
  const dangerColor = useThemeColor({}, 'danger');
  const borderColor = useThemeColor({}, 'border');
  const overlayColor = useThemeColor({}, 'overlay');

  useEffect(() => {
<<<<<<<< HEAD:client/components/BookForm.jsx
    if (mode !== 'edit') {
      return;
    }

    if (!bookId) {
      setLoadError('The book ID is missing.');
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetchBook = async () => {
      try {
        setLoading(true);
        const token = await SecureStore.getItemAsync('authToken');
        if (!token) {
          throw new Error('You must be signed in to edit a book.');
        }

        const response = await axios.get(`${apiUrl}/book/${bookId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const book = response.data?.book || response.data;
        if (!book) {
          throw new Error('The requested book could not be found.');
        }
        if (!isMounted) return;

        setFormData({
          bookName: book.bookName || '',
          bookDescription: book.bookDescription || '',
          bookAuthor: book.bookAuthor || '',
          reciter: book.reciter || '',
          category: book.category || '',
          language: book.language || '',
          chapters: (Array.isArray(book.chapters) ? book.chapters : []).map((chapter) => ({
            ...chapter,
            audioUrl: chapter.bookAudio || chapter.audioUrl || '',
            audioFile: null,
          })),
        });
        setBookCoverUri(book.bookCover || null);
      } catch (error) {
        if (isMounted) {
          const message = error.response?.data?.message || error.message || 'Failed to load book details.';
          setLoadError(message);
        }
      } finally {
        if (isMounted) {
========
    if (bookId) {
      const fetchBook = async () => {
        try {
          const res = await apiClient.get(`/book/${bookId}`);
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
          console.warn('Failed to load book details:', error.message);
          Alert.alert('Error', 'Failed to load book details');
        } finally {
>>>>>>>> f2780159c4f959ab1a343223f0569019255c3da6:client/app/edit-book/[bookId].jsx
          setLoading(false);
        }
      }
    };

    fetchBook();
    return () => {
      isMounted = false;
    };
  }, [apiUrl, bookId, mode]);

  
  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };


  const pickImage = async () => {
<<<<<<<< HEAD:client/components/BookForm.jsx
========
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need camera roll permissions to select an image');
      return;
    }
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
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
>>>>>>>> f2780159c4f959ab1a343223f0569019255c3da6:client/app/edit-book/[bookId].jsx
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'We need camera roll permissions to select an image.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets.length > 0) {
        const imageAsset = result.assets[0];
        setBookCoverUri(imageAsset.uri);
        setBookCoverFile({
          uri: imageAsset.uri,
          type: imageAsset.mimeType || 'image/jpeg',
          name: imageAsset.fileName || 'bookCover.jpg',
        });
      }
    } catch (error) {
      console.error('Error selecting book cover:', error);
      Alert.alert('Unable to select cover', error.message || 'Please try again.');
    }
  };
<<<<<<<< HEAD:client/components/BookForm.jsx


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
    Alert.alert('Error', error.message || 'Failed to pick audio file.');
  }
};


  const calculateAudioDuration = async (uri) => {
    try {
      setCalculatingDuration(true);
      return await getAudioDuration(uri);
    } finally {
      setCalculatingDuration(false);
    }
  };

  const handleAddChapter = async () => {
========
  
  
    const calculateAudioDuration = async (uri) => {
      let player;
      try {
        setCalculatingDuration(true);
        player = createAudioPlayer({ uri });

        // Wait until the player has loaded so duration is known.
        const status = await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            try { subscription?.remove(); } catch {}
            reject(new Error('Timed out loading audio'));
          }, 15000);

          const subscription = player.addListener('playbackStatusUpdate', (s) => {
            if (s?.isLoaded) {
              clearTimeout(timeout);
              try { subscription.remove(); } catch {}
              resolve(s);
            }
          });

          // Already loaded before the listener attached.
          if (player.currentStatus?.isLoaded) {
            clearTimeout(timeout);
            try { subscription.remove(); } catch {}
            resolve(player.currentStatus);
          }
        });

        const durationInSeconds = status.duration || 0;
        const minutes = Math.floor(durationInSeconds / 60);
        const seconds = Math.floor(durationInSeconds % 60);
        const formattedDuration = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        return formattedDuration;
      } catch (error) {
        console.error('Error calculating duration:', error);
        return '00:00';
      } finally {
        try { player?.remove(); } catch {}
        setCalculatingDuration(false);
      }
    };
    
  
const handleAddChapter = async () => {
>>>>>>>> f2780159c4f959ab1a343223f0569019255c3da6:client/app/edit-book/[bookId].jsx
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
      console.error('Error adding chapter:', error);
      Alert.alert('Unable to add chapter', error.message || 'Please try again.');
    }
  };

  const handleRemoveChapter = (indexToRemove) => {
  setFormData(prev => ({
    ...prev,
    chapters: prev.chapters.filter((_, index) => index !== indexToRemove),
  }));
};

  const handleSubmit = async () => {
    const requiredFields = [
      ['bookName', 'Book name'],
      ['bookDescription', 'Description'],
      ['bookAuthor', 'Author'],
      ['reciter', 'Reciter'],
      ['category', 'Category'],
      ['language', 'Language'],
    ];
    const missingField = requiredFields.find(([key]) => !formData[key]?.trim());

    if (missingField || (!isEditing && !bookCoverFile) || (isEditing && !bookCoverUri)) {
      const missing = missingField?.[1] || 'Book cover';
      Alert.alert('Required information', `Please provide ${missing.toLowerCase()} before saving.`);
      return;
    }

    if (isEditing && !bookId) {
      Alert.alert('Unable to update book', 'The book ID is missing.');
      return;
    }

    try {
      setLoading(true);
<<<<<<<< HEAD:client/components/BookForm.jsx
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) {
        throw new Error('You must be signed in to save a book.');
      }
========
      const form = new FormData();
>>>>>>>> f2780159c4f959ab1a343223f0569019255c3da6:client/app/edit-book/[bookId].jsx

      const form = new FormData();
      form.append('bookName', formData.bookName.trim());
      form.append('bookDescription', formData.bookDescription.trim());
      form.append('bookAuthor', formData.bookAuthor.trim());
      form.append('reciter', formData.reciter.trim());
      form.append('category', formData.category);
      form.append('language', formData.language);

      if (bookCoverFile) {
        form.append('bookCover', {
          uri: bookCoverFile.uri,
          name: bookCoverFile.name || 'cover.jpg',
          type: bookCoverFile.type || 'image/jpeg',
        });
      }

      const chaptersMeta = formData.chapters.map((chapter, index) => ({
        index,
        title: chapter.title,
        duration: chapter.duration,
<<<<<<<< HEAD:client/components/BookForm.jsx
        progress: chapter.progress ?? 0,
        existingAudioUrl: isEditing ? chapter.audioUrl || chapter.bookAudio || '' : '',
========
        progress: chapter.progress,
        existingAudioUrl: chapter.bookAudio || chapter.audioUrl || '', // keep old audio if no replacement
>>>>>>>> f2780159c4f959ab1a343223f0569019255c3da6:client/app/edit-book/[bookId].jsx
      }));
      form.append('chaptersMeta', JSON.stringify(chaptersMeta));

      formData.chapters.forEach((chapter, index) => {
        if (chapter.audioFile) {
          form.append(`chapterAudio_${index}`, {
            uri: chapter.audioFile.uri,
            name: chapter.audioFile.name || `chapter-${index}.mp3`,
            type: chapter.audioFile.type || 'audio/mpeg',
          });
        }
      });

<<<<<<<< HEAD:client/components/BookForm.jsx
      const request = isEditing
        ? axios.put(`${apiUrl}/updateBook/${bookId}`, form, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
            timeout: 60000,
          })
        : axios.post(`${apiUrl}/addBook`, form, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
            timeout: 60000,
          });
      const response = await request;
========
      const response = await apiClient.put(`/updateBook/${bookId}`, form, {
        timeout: 120000,
      });
>>>>>>>> f2780159c4f959ab1a343223f0569019255c3da6:client/app/edit-book/[bookId].jsx

      if (response.data) {
        Alert.alert(
          'Success',
          isEditing ? 'Book updated successfully!' : 'Book added successfully!',
          [{ text: 'OK', onPress: () => router.replace('/(tabs)/main') }]
        );
      }
    } catch (error) {
<<<<<<<< HEAD:client/components/BookForm.jsx
      console.error('Error saving book:', error.response?.data || error.message);
      Alert.alert('Unable to save book', error.response?.data?.message || error.message);
========
      console.error('Error:', error.response?.data || error.message);
      Alert.alert('Error', getApiErrorMessage(error, 'Could not update this book.'));
>>>>>>>> f2780159c4f959ab1a343223f0569019255c3da6:client/app/edit-book/[bookId].jsx
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

  if (loadError) {
    return (
      <ThemedView style={[tw`flex-1 justify-center items-center p-6`, { backgroundColor }]}>
        <ThemedText style={tw`mb-4 text-center`}>{loadError}</ThemedText>
        <TouchableOpacity onPress={() => router.back()} style={[tw`rounded-lg px-5 py-3`, { backgroundColor: primaryColor }]}>
          <Text style={{ color: onPrimaryColor }}>Go back</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const renderCategoryItem = ({ item }) => (
    <Pressable
<<<<<<<< HEAD:client/components/BookForm.jsx
      style={[tw`p-3 border-b`, { borderColor }]}
========
      style={[tw`p-3 border-b`, { borderBottomColor: borderColor }]}
>>>>>>>> f2780159c4f959ab1a343223f0569019255c3da6:client/app/edit-book/[bookId].jsx
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
<<<<<<<< HEAD:client/components/BookForm.jsx
      style={[tw`p-3 border-b`, { borderColor }]}
========
      style={[tw`p-3 border-b`, { borderBottomColor: borderColor }]}
>>>>>>>> f2780159c4f959ab1a343223f0569019255c3da6:client/app/edit-book/[bookId].jsx
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
<<<<<<<< HEAD:client/components/BookForm.jsx
      <View style={[tw`flex-row border-b mt-8`, { borderColor }]}>
        <TouchableOpacity
          style={[
            tw`flex-1 items-center py-3`,
            activeTab === 'details' && tw`border-b-2`,
            activeTab === 'details' && { borderColor: primaryColor },
========
      <View style={[tw`flex-row border-b mt-8`, { borderBottomColor: borderColor }]}>
        <TouchableOpacity
          style={[
            tw`flex-1 items-center py-3`,
            activeTab === 'details' && [tw`border-b-2`, { borderColor: primaryColor }],
>>>>>>>> f2780159c4f959ab1a343223f0569019255c3da6:client/app/edit-book/[bookId].jsx
          ]}
          onPress={() => setActiveTab('details')}
        >
          <Text style={[
            tw`text-lg`,
            { color: activeTab === 'details' ? primaryColor : textColor }
          ]}>
            <MaterialIcons name="book" size={20} color={activeTab === 'details' ? primaryColor : textColor} /> Details
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            tw`flex-1 items-center py-3`,
<<<<<<<< HEAD:client/components/BookForm.jsx
            activeTab === 'chapters' && tw`border-b-2`,
            activeTab === 'chapters' && { borderColor: primaryColor },
========
            activeTab === 'chapters' && [tw`border-b-2`, { borderColor: primaryColor }],
>>>>>>>> f2780159c4f959ab1a343223f0569019255c3da6:client/app/edit-book/[bookId].jsx
          ]}
          onPress={() => setActiveTab('chapters')}
        >
          <Text style={[
            tw`text-lg`,
            { color: activeTab === 'chapters' ? primaryColor : textColor }
          ]}>
            <Ionicons name="list" size={20} color={activeTab === 'chapters' ? primaryColor : textColor} /> Chapters ({formData.chapters.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={tw`p-4`}
        contentContainerStyle={tw`pb-6`}
        keyboardShouldPersistTaps="handled"
      >
        {activeTab === 'details' ? (
          <>
            <ThemedText style={tw`text-xl mb-4 text-center font-bold`}>
              {isEditing ? 'Edit Book' : 'Add New Book'}
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

            {[
              { key: 'bookName', label: 'Book Name', icon: 'book', required: true },
              { key: 'bookAuthor', label: 'Author', icon: 'person', required: true },
              { key: 'reciter', label: 'Reciter', icon: 'mic', required: true },
            ].map(({ key, label, icon, required }) => (
              <View key={key} style={tw`mb-4`}>
                <View style={tw`flex-row items-center mb-1`}>
                  <MaterialIcons name={icon} size={18} color={textColor} />
                  <Text style={[tw`ml-2`, { color: textColor }]}>{label}{required && <Text style={{ color: dangerColor }}> *</Text>}</Text>
                </View>
                <TextInput
                  placeholder={`Enter ${label}`}
                  value={formData[key]}
                  onChangeText={(text) => handleChange(key, text)}
                  style={[
                    tw`border rounded-lg p-3`,
                    { borderColor, color: textColor, backgroundColor: surfaceColor }
                  ]}
                  placeholderTextColor={placeholderColor}
                />
              </View>
            ))}

            <View style={tw`mb-4`}>
              <View style={tw`flex-row items-center mb-1`}>
                <MaterialIcons name="description" size={18} color={textColor} />
                <Text style={[tw`ml-2`, { color: textColor }]}>
                  Description<Text style={{ color: dangerColor }}> *</Text>
                </Text>
              </View>
              <TextInput
                placeholder="Enter book description"
                value={formData.bookDescription}
                onChangeText={(text) => handleChange('bookDescription', text)}
                multiline
                numberOfLines={4}
                style={[
                  tw`border rounded-lg p-3 h-24`,
                  { borderColor, color: textColor, backgroundColor: surfaceColor },
                ]}
                placeholderTextColor={placeholderColor}
              />
            </View>

            {/* Category Dropdown */}
            <View style={tw`mb-4`}>
              <View style={tw`flex-row items-center mb-1`}>
                <MaterialIcons name="category" size={18} color={textColor} />
                <Text style={[tw`ml-2`, { color: textColor }]}>Category{!formData.category && <Text style={{ color: dangerColor }}> *</Text>}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowCategoryModal(true)}
                style={[
                  tw`border rounded-lg p-3 flex-row items-center justify-between`,
                  { borderColor, backgroundColor: surfaceColor }
                ]}
              >
                <Text style={{ color: formData.category ? textColor : textColor + '80' }}>
                  {formData.category || 'Select Category'}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={24} color={textColor} />
              </TouchableOpacity>
            </View>


          
            {/* Language Dropdown */}
            <View style={tw`mb-8`}>
              <View style={tw`flex-row items-center mb-1`}>
                <MaterialIcons name="language" size={18} color={textColor} />
                <Text style={[tw`ml-2`, { color: textColor }]}>Language{!formData.language && <Text style={{ color: dangerColor }}> *</Text>}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowLanguageModal(true)}
                style={[
                  tw`border rounded-lg p-3 flex-row items-center justify-between`,
                  { borderColor, backgroundColor: surfaceColor }
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
              {isEditing ? 'Edit Chapters' : 'Add Chapters'}
            </ThemedText>

            {/* Add Chapter Form */}
            <View style={[tw`mb-6 p-4 rounded-lg`, { backgroundColor: surfaceColor }]}>
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
                    { borderColor, color: textColor, backgroundColor: surfaceColor }
                  ]}
                  placeholderTextColor={placeholderColor}
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
                    { borderColor, backgroundColor: surfaceColor }
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
<<<<<<<< HEAD:client/components/BookForm.jsx
                  tw`p-3 rounded-lg flex-row items-center justify-center`,
                  { backgroundColor: primaryColor },
========
                  [tw`p-3 rounded-lg flex-row items-center justify-center`, { backgroundColor: primaryColor }],
>>>>>>>> f2780159c4f959ab1a343223f0569019255c3da6:client/app/edit-book/[bookId].jsx
                  (!chapterTitle || !chapterAudioUri) && tw`opacity-50`
                ]}
              >
                <Entypo name="plus" size={18} color={onPrimaryColor} />
                <Text style={[tw`ml-2`, { color: onPrimaryColor }]}>Add Chapter</Text>
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
                      { backgroundColor: surfaceAltColor }
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
                      <MaterialIcons name="delete" size={24} color={dangerColor} />
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
<<<<<<<< HEAD:client/components/BookForm.jsx
        <View style={[tw`flex-1 justify-center`, { backgroundColor: overlayColor }]}>
          <View style={[tw`m-6 rounded-lg`, { backgroundColor: surfaceColor }]}>
          <View style={[tw`p-4 border-b`, { borderColor }]}>
========
        <View style={[tw`flex-1 justify-center`, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[tw`m-6 bg-white rounded-lg`, { backgroundColor }]}>
            <View style={[tw`p-4 border-b`, { borderBottomColor: borderColor }]}>
>>>>>>>> f2780159c4f959ab1a343223f0569019255c3da6:client/app/edit-book/[bookId].jsx
              <Text style={[tw`text-lg font-bold`, { color: textColor }]}>Select Category</Text>
            </View>
            <FlatList
              data={CATEGORIES}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item}
              style={tw`max-h-64`}
            />
            <TouchableOpacity
<<<<<<<< HEAD:client/components/BookForm.jsx
              style={[tw`p-3 border-t items-center`, { borderColor }]}
========
              style={[tw`p-3 border-t items-center`, { borderTopColor: borderColor }]}
>>>>>>>> f2780159c4f959ab1a343223f0569019255c3da6:client/app/edit-book/[bookId].jsx
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
<<<<<<<< HEAD:client/components/BookForm.jsx
        <View style={[tw`flex-1 justify-center`, { backgroundColor: overlayColor }]}>
          <View style={[tw`m-6 rounded-lg`, { backgroundColor: surfaceColor }]}>
          <View style={[tw`p-4 border-b`, { borderColor }]}>
========
        <View style={[tw`flex-1 justify-center`, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[tw`m-6 bg-white rounded-lg`, { backgroundColor }]}>
            <View style={[tw`p-4 border-b`, { borderBottomColor: borderColor }]}>
>>>>>>>> f2780159c4f959ab1a343223f0569019255c3da6:client/app/edit-book/[bookId].jsx
              <Text style={[tw`text-lg font-bold`, { color: textColor }]}>Select Language</Text>
            </View>
            <FlatList
              data={LANGUAGES}
              renderItem={renderLanguageItem}
              keyExtractor={(item) => item}
              style={tw`max-h-64`}
            />
            <TouchableOpacity
<<<<<<<< HEAD:client/components/BookForm.jsx
              style={[tw`p-3 border-t items-center`, { borderColor }]}
========
              style={[tw`p-3 border-t items-center`, { borderTopColor: borderColor }]}
>>>>>>>> f2780159c4f959ab1a343223f0569019255c3da6:client/app/edit-book/[bookId].jsx
              onPress={() => setShowLanguageModal(false)}
            >
              <Text style={{ color: primaryColor }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Submit Button */}
<<<<<<<< HEAD:client/components/BookForm.jsx
      <View style={[tw`p-4 border-t`, { backgroundColor, borderColor }]}>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={[
            tw`p-4 rounded-lg flex-row items-center justify-center`,
            { backgroundColor: primaryColor },
            loading && tw`opacity-70`,
          ]}
        >
          <MaterialIcons name={isEditing ? 'save' : 'add'} size={20} color={onPrimaryColor} />
          <Text style={[tw`ml-2 text-lg font-medium`, { color: onPrimaryColor }]}>
            {isEditing ? 'Save Changes' : 'Add Book'}
          </Text>
        </TouchableOpacity>
      </View>

    </View>
========
      {activeTab === 'chapters' && (
        <View style={tw`p-4 mb-25`}>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={[
              [tw`p-4 rounded-lg flex-row items-center justify-center`, { backgroundColor: primaryColor }],
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
>>>>>>>> f2780159c4f959ab1a343223f0569019255c3da6:client/app/edit-book/[bookId].jsx
  );
}