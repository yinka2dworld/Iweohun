import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import tw from 'twrnc';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import Constants from 'expo-constants';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function Profile() {
  const router = useRouter();
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);

  const apiUrl = Constants.expoConfig?.extra?.API_BASE_URL;

  const backgroundColor = useThemeColor({}, 'background');
  const buttonColor = '#070c70';
  const textColor = useThemeColor({}, 'text');

  const sampleUser = {
    username: 'User',
    email: 'user@example.com',
    profilePhoto:
      'https://static.vecteezy.com/system/resources/previews/018/765/757/original/user-profile-icon-in-flat-style-member-avatar-illustration-on-isolated-background-human-permission-sign-business-concept-vector.jpg',
  };

  useEffect(() => {
    const getUserData = async () => {
      try {
        const userId = await SecureStore.getItemAsync('userId');
        const token = await SecureStore.getItemAsync('authToken');
        if (!userId) throw new Error('User ID not found');

        const response = await axios.get(`${apiUrl}/user/${userId}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        setUserData(response.data);
      } catch (error) {
        console.error('Error retrieving user data:', error);
      } finally {
        setLoading(false);
      }
    };

    getUserData();
  }, []);

  
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
            style={tw`w-25 h-25 rounded-full border-4 border-white`}
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
          />
        
<ProfileButton label="Terms & Privacy"
 iconName="shield-lock-outline" 
 onPress={() => router.push('/screens/terms-policy')} 
 buttonColor={buttonColor}/>

<ProfileButton label="About Iweohun"
 iconName="book-open-page-variant" 
 onPress={() => router.push('/screens/about-iweohun')}
 buttonColor={buttonColor}/>

<ProfileButton label="About Okin Technologies"
 iconName="domain" 
 onPress={() => router.push('/screens/about-okin')} 
 buttonColor={buttonColor}/>


        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileButton({ label, iconName, onPress, buttonColor }) {
  return (
  <TouchableOpacity
  onPress={onPress}
  style={[
    tw`flex-row items-center justify-center px-2 py-3 rounded-2xl mb-8`,
    { backgroundColor: buttonColor },
  ]}
>
  <MaterialCommunityIcons name={iconName} size={22} color="white" />
  <ThemedText style={tw`text-white text-lg font-semibold ml-3`}>
    {label}
  </ThemedText>
</TouchableOpacity>
  );
}
