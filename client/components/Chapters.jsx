import React, { useState, useEffect } from 'react';
import { Alert, FlatList, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import SecureStore from '@/lib/SecureStore';
import { useRouter } from 'expo-router';
<<<<<<< HEAD
import axios from 'axios';
import { useAudio } from '@/context/AudioContext';
import { MINI_AUDIO_PLAYER_CLEARANCE, TAB_BAR_CONTENT_HEIGHT } from '@/constants/layout';
=======
import apiClient, { getApiErrorMessage } from '@/lib/api';
>>>>>>> f2780159c4f959ab1a343223f0569019255c3da6


const Chapters = ({ book, onChapterSelect }) => {
  const [showMoreInfo, setShowMoreInfo] = useState(false); 
  const primaryColor = useThemeColor({}, 'primary');
  const onPrimaryColor = useThemeColor({}, 'onPrimary');
  const dangerColor = useThemeColor({}, 'danger');
  const mutedColor = useThemeColor({}, 'muted');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const [role, setRole] = useState(null);  
  const [userId, setUserId] = useState(null);  
  const router = useRouter();
  const { audioDetails } = useAudio();

  useEffect(() => {
    let isMounted = true;
    const loadInfo = async () => {
      try {
        const [storedRole, storedUserId] = await Promise.all([
          SecureStore.getItemAsync('userRole'),
          SecureStore.getItemAsync('userId'),
        ]);
        if (isMounted) {
          setRole(storedRole);
          setUserId(storedUserId ? String(storedUserId) : null);
        }
      } catch (error) {
        console.error('Unable to load book permissions:', error);
      }
    };

    loadInfo();
    return () => {
      isMounted = false;
    };
  }, []);

  const postedBy = book?.postedBy;
  const postedById = postedBy && typeof postedBy === 'object'
    ? postedBy._id || postedBy.id || postedBy.$oid
    : postedBy;
  const isBookOwner = Boolean(
    userId && postedById && String(userId).trim().toLowerCase() === String(postedById).trim().toLowerCase()
  );
  const normalizedRole = typeof role === 'string' ? role.trim().toLowerCase() : '';
  const canManageBook = isBookOwner || normalizedRole === 'admin' || normalizedRole === 'superadmin';
  const canEditBook = canManageBook;
  const canDeleteBook = canManageBook;
   

  const handleDelete = () => {
  Alert.alert(
    'Confirm Delete',
    'Are you sure you want to delete this book?',
    [
      {
        text: 'Cancel',
        style: 'cancel'
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
<<<<<<< HEAD
            const token = await SecureStore.getItemAsync('authToken');
            if (!token) throw new Error('You must be signed in to delete this book.');

            const response = await axios.delete(`${apiUrl}/deleteBook/${book._id}`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
=======
            const response = await apiClient.delete(`/deleteBook/${book._id}`);
>>>>>>> f2780159c4f959ab1a343223f0569019255c3da6

            if (response.status !== 200) {
              throw new Error("Failed to delete book");
            }
            router.back();
          } catch (error) {
            console.error("Delete error:", error);
<<<<<<< HEAD
            Alert.alert('Error', error.response?.data?.message || error.message || 'Failed to delete the book.', [{ text: 'OK' }]);
=======
            Alert.alert('Error', getApiErrorMessage(error, 'Failed to delete the book.'), [{ text: 'OK' }]);
>>>>>>> f2780159c4f959ab1a343223f0569019255c3da6
          }
        }
      }
    ]
  );
};

  
  return (
    <ThemedView style={tw`flex-1 px-2 pt-0`}>
      <TouchableOpacity
<<<<<<< HEAD
        onPress={() => setShowMoreInfo((isExpanded) => !isExpanded)}
        accessibilityRole="button"
        accessibilityState={{ expanded: showMoreInfo }}
        accessibilityLabel={showMoreInfo ? 'Hide book information' : 'Show book information'}
        style={[
          tw`flex-row items-center justify-between px-4 py-2 mb-2`]}>

        <ThemedText style={[tw`text-base font-semibold`, { color: primaryColor }]}>
=======
        onPress={() => setShowMoreInfo(prevState => !prevState)} // Toggle the visibility of more info
        style={tw`flex-row items-center justify-start`}
      >
        <ThemedText
          style={[
            tw`text-base text-blue-500 m-5`,
            { color: primaryColor },
          ]}
        >
>>>>>>> f2780159c4f959ab1a343223f0569019255c3da6
          {showMoreInfo ? 'Show less info' : 'Show more info'}
        </ThemedText>
        <ThemedView style={[tw`w-8 h-8 rounded-full items-center justify-center`,]}>
          <MaterialCommunityIcons
            name={showMoreInfo ? 'chevron-up' : 'chevron-down'}
            size={22}
            color={primaryColor}
          />
        </ThemedView>
      </TouchableOpacity>

      {showMoreInfo && (
        <ThemedView style={[tw`p-4 mb-3 rounded-xl border`, { backgroundColor: surfaceColor, borderColor }]}>
          {(canEditBook || canDeleteBook) && (
            <ThemedView style={tw`flex-row flex-wrap justify-center gap-4 mb-4`}>
              {canEditBook && (
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Update book"
                  style={[tw`flex-row items-center justify-center rounded-lg px-4 py-2`, { backgroundColor: primaryColor }]}
                  onPress={() =>
                    router.push({
                      pathname: '/edit-book/[bookId]',
                      params: { bookId: book._id.toString() },
                    })
                  }
                >
                  <MaterialCommunityIcons name="pencil-outline" size={18} color={onPrimaryColor} />
                  <ThemedText style={[tw`ml-2 font-semibold`, { color: onPrimaryColor }]}>Update</ThemedText>
                </TouchableOpacity>
              )}
              {canDeleteBook && (
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Delete book"
                  style={[tw`flex-row items-center justify-center rounded-lg px-4 py-2`, { backgroundColor: dangerColor }]}
                  onPress={handleDelete}
                >
                  <MaterialCommunityIcons name="delete-outline" size={18} color={onPrimaryColor} />
                  <ThemedText style={[tw`ml-2 font-semibold`, { color: onPrimaryColor }]}>Delete</ThemedText>
                </TouchableOpacity>
              )}
            </ThemedView>
          )}

<<<<<<< HEAD
          <ThemedView style={tw`flex-row items-center flex-wrap gap-4 mb-3`}>
            <ThemedView style={tw`flex-row items-center gap-2`}>
              <MaterialCommunityIcons name="pencil" size={16} color={primaryColor} />
              <ThemedText>{book.bookAuthor}</ThemedText>
            </ThemedView>
            <ThemedView style={tw`flex-row items-center gap-2`}>
              <MaterialCommunityIcons name="microphone" size={16} color={primaryColor} />
              <ThemedText>{book.reciter || 'N/A'}</ThemedText>
            </ThemedView>
=======

  <ThemedView style={tw`flex-row gap-5 justify-end my-4 mb-8`}>
    {( role === 'superAdmin' || userId === book.postedBy?._id) && (
      <TouchableOpacity
        style={[tw`rounded-3xl px-6 py-2`, { backgroundColor: primaryColor }]}
        onPress={() => router.push(`/edit-book/${book._id}`)}
      >
        <ThemedText style={tw`text-white text-lg font-semibold text-center`}>✎ Edit</ThemedText>
      </TouchableOpacity>
    )}

    {(role === 'superAdmin' || role === 'admin')&& (
      <TouchableOpacity
        style={[tw`rounded-3xl px-4 py-2`, { backgroundColor: primaryColor }]}
        onPress={handleDelete}>
        <ThemedText style={tw`text-white text-lg font-semibold text-center`}>✖ Delete</ThemedText>
      </TouchableOpacity>
    )}
  </ThemedView>



     <ThemedView style={tw`flex-row items-center justify-start gap-2 flex-wrap`}>
            {/* Author Icon and Text */}
            <MaterialCommunityIcons
              name="pencil"
              size={16}
              style={[{ color: primaryColor }]}
            />
            <ThemedText style={tw`text-base text-gray-600`}>
              {book.bookAuthor}
            </ThemedText>

            {/* Reciter Icon and Text */}
            <MaterialCommunityIcons
              name="microphone"
              size={16}
              style={[{ color: primaryColor }]}
            />
            <ThemedText style={tw`text-base text-gray-600`}>
              {book.reciter || 'N/A'}
            </ThemedText>
>>>>>>> f2780159c4f959ab1a343223f0569019255c3da6
          </ThemedView>

          <ThemedText style={[tw`text-sm`, { color: mutedColor }]}>
            {book.bookDescription || 'N/A'}
          </ThemedText>
        </ThemedView>
      )}

      {/* Chapters List */}
      <FlatList
        style={tw`flex-1`}
        data={book.chapters || []}
        keyExtractor={(item, index) => item._id?.toString() || String(index)}
        contentContainerStyle={{
          paddingBottom: audioDetails
            ? MINI_AUDIO_PLAYER_CLEARANCE + TAB_BAR_CONTENT_HEIGHT
            : 16,
        }}
        scrollIndicatorInsets={{
          bottom: audioDetails
            ? MINI_AUDIO_PLAYER_CLEARANCE + TAB_BAR_CONTENT_HEIGHT
            : 0,
        }}
        ListEmptyComponent={
          <ThemedText style={tw`text-center p-4`}>
            No chapters available.
          </ThemedText>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => onChapterSelect(item)} // Handle chapter selection
            style={[
              tw`p-3 m-2 border rounded-lg flex-row justify-between`,
              { borderColor, backgroundColor: surfaceColor },
            ]}
          >
            <ThemedText style={tw`text-lg font-semibold`}>{item.title}</ThemedText>
            <ThemedText style={[tw`text-sm`, { color: mutedColor }]}>{item.duration}</ThemedText>
          </TouchableOpacity>
        )}
      />
    </ThemedView>
  );
};

export default Chapters;
