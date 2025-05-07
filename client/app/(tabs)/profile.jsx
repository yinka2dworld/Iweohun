import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
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

export default function Profile() {
  const router = useRouter();
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);

  const apiUrl = Constants.expoConfig?.extra?.API_BASE_URL;

  const backgroundColor = useThemeColor({}, 'background');
  const buttonColor = '#070c70';

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

        const response = await axios.get(`${apiUrl}/user/${userId}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
             },
          }
        );
        setUserData(response.data);
      } catch (error) {
        console.error('Error retrieving user data:', error);
      } finally {
        setLoading(false);
      }
    };

    getUserData();
  }, []);

  const handleSignOut = async () => {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync('userId'),
        SecureStore.deleteItemAsync('authToken'), 
        SecureStore.deleteItemAsync('userRole'), 
        SecureStore.deleteItemAsync('username'),
        
      ]);
  
     
      console.log('User signed out successfully');
  
      
      router.replace('/auth/login'); 
  
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <ThemedView style={tw`flex-1 items-center justify-center`}>
        <ActivityIndicator size="large" color={buttonColor} />
        <ThemedText style={tw`mt-4`}>Loading profile</ThemedText>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor }]}>
      <ScrollView>
        <View style={tw`items-center my-10`}>
          <Image
            source={{ uri: userData.profilePhoto || sampleUser.profilePhoto }}
            style={tw`w-30 h-30 rounded-full border-4 border-white`}
          />
          <ThemedText style={tw`text-2xl font-bold mt-3`}>
            {userData.username || sampleUser.username}
          </ThemedText>
          <ThemedText style={tw`text-lg`}>
            {userData.email || sampleUser.email}
          </ThemedText>
        </View>

        <ThemedView style={tw`px-10 py-6`}>
          <ProfileButton label="Become a creator" onPress={() => router.push('/edit-profile')} buttonColor={buttonColor} />
          <ProfileButton label="My Dashboard" onPress={() => router.push('/settings')} buttonColor={buttonColor} />
          <ProfileButton label="Settings" onPress={() => router.push('/settings')} buttonColor={buttonColor} />
          <ProfileButton label="Terms and Privacy Policy" onPress={() => router.push('/screens/terms-policy')} buttonColor={buttonColor} />
          <ProfileButton label="About Iweohun" onPress={() => router.push('/screens/about-iweohun')} buttonColor={buttonColor} />
          <ProfileButton label="About Okin Technologies" onPress={() => router.push('/screens/about-okin')} buttonColor={buttonColor} />
          <ProfileButton label="Sign Out" onPress={handleSignOut} buttonColor="red" />
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileButton({ label, onPress, buttonColor }) {
  return (
    <TouchableOpacity
      style={[tw`rounded-3xl px-3 py-3 mb-6`, { backgroundColor: buttonColor }]}
      onPress={onPress}
    >
      <ThemedText style={tw`text-white text-lg font-semibold text-center`}>
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
}
