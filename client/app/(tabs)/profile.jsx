import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import tw from 'twrnc';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
<<<<<<< HEAD
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { API_BASE_URL } from '@/constants/api';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
=======
import SecureStore from '@/lib/SecureStore';
import apiClient, { getApiErrorMessage } from '@/lib/api';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
>>>>>>> f2780159c4f959ab1a343223f0569019255c3da6

export default function Profile() {
  const router = useRouter();
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);
<<<<<<< HEAD

  const apiUrl = API_BASE_URL;
=======
  const [error, setError] = useState(null);
>>>>>>> f2780159c4f959ab1a343223f0569019255c3da6

  const backgroundColor = useThemeColor({}, 'background');
  const buttonColor = useThemeColor({}, 'primary');
  const onPrimaryColor = useThemeColor({}, 'onPrimary');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');

  const sampleUser = {
    username: 'User',
    email: 'user@example.com',
    profilePhoto:
      'https://static.vecteezy.com/system/resources/previews/018/765/757/original/user-profile-icon-in-flat-style-member-avatar-illustration-on-isolated-background-human-permission-sign-business-concept-vector.jpg',
  };

  const getUserData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const userId = await SecureStore.getItemAsync('userId');
      if (!userId) {
        router.replace('/auth/login');
        return;
      }

      const response = await apiClient.get(`/user/${userId}`);
      setUserData(response.data || {});
    } catch (err) {
      console.error('Error retrieving user data:', err.message);
      setError(getApiErrorMessage(err, 'Could not load your profile.'));
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    getUserData();
  }, [getUserData]);

  if (error) {
    return (
      <ThemedView style={[tw`flex-1 items-center justify-center px-8`, { backgroundColor }]}>
        <ThemedText style={tw`text-center text-gray-500`}>{error}</ThemedText>
        <TouchableOpacity onPress={getUserData} style={tw`mt-6`}>
          <ThemedText style={{ color: '#ff1493' }}>Try again</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }
  
  if (loading) {
    return (
      <ThemedView style={tw`flex-1 items-center justify-center`}>
        <ActivityIndicator size="large" color={buttonColor} />
        <ThemedText style={tw`mt-4`}>Loading profile...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={tw`items-center mt-20 mb-8`}>
          <Image
            source={{ uri: userData.profilePhoto || sampleUser.profilePhoto }}
            style={[tw`w-25 h-25 rounded-full border-4`, { borderColor: surfaceColor }]}
          />
          <ThemedText style={tw`text-2xl font-bold mt-3 text-center`} darkColor={textColor}>
            {userData.username || sampleUser.username}
          </ThemedText>
          <ThemedText style={tw`text-lg text-center`} darkColor={textColor}>
            {userData.email || sampleUser.email}
          </ThemedText>
        </View>

        <ThemedView style={tw`px-8`}>
          <ProfileButton
            label="Settings"
            iconName="cog-outline"
            onPress={() => router.push('/screens/settings')}
            buttonColor={buttonColor}
            textColor={onPrimaryColor}
          />
        
<ProfileButton label="Terms & Privacy"
 iconName="shield-lock-outline"
 onPress={() => router.push('/screens/terms-policy')}
 buttonColor={buttonColor}
 textColor={onPrimaryColor}/>

<ProfileButton label="About Iweohun"
 iconName="book-open-page-variant" 
 onPress={() => router.push('/screens/about-iweohun')}
 buttonColor={buttonColor}
 textColor={onPrimaryColor}/>

<ProfileButton label="About Okin Technologies"
 iconName="domain" 
 onPress={() => router.push('/screens/about-okin')}
 buttonColor={buttonColor}
 textColor={onPrimaryColor}/>


        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileButton({ label, iconName, onPress, buttonColor, textColor }) {
  return (
  <TouchableOpacity
  onPress={onPress}
  style={[
    tw`flex-row items-center justify-center px-2 py-3 rounded-2xl mb-8`,
    { backgroundColor: buttonColor },
  ]}
>
  <MaterialCommunityIcons name={iconName} size={22} color={textColor} />
  <ThemedText style={[tw`text-lg font-semibold ml-3`, { color: textColor }]}>
    {label}
  </ThemedText>
</TouchableOpacity>
  );
}
