import React, { useState, useEffect } from 'react';
import axios from 'axios';
import tw from 'twrnc';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Image, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';


export default function Profile() {
  const router = useRouter();
  const [userData, setUserData] = useState({});
  const apiUrl = Constants.expoConfig?.extra?.API_BASE_URL;

  useEffect(() => {
    getUserData();
  }, []);

  const getUserData = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const response = await axios.get(`${apiUrl}/user/${userId}`);
      setUserData(response.data);
    } catch (error) {
      console.error('Error retrieving user data:', error);
    }
  };

  const testUser = {
    name: 'Ali',
    email: 'ali@example.com',
    profilePicture:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1tf3QiePLGWrYYU0hiSD594zkUHdspxc6Og&s',
  };

  const handleSignOut = () => {
    router.push('/logout');
  };

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const buttonColor = useThemeColor({}, 'text');

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor }]}> 
      <ScrollView>
        
          <View style={tw`items-center mt-10 mb-5`}>
            <Image
              source={{ uri: userData.profilePicture || testUser.profilePicture }}
              style={tw`w-40 h-40 rounded-full border-4 border-white`}
            />
            <ThemedText style={[tw`text-2xl font-bold mt-3`, { color: primaryColor }]}>
              {userData.fullName || testUser.name}
            </ThemedText>
            <ThemedText style={[tw`text-lg`, { color: primaryColor }]}>{userData.email || testUser.email}</ThemedText>
          </View>
        
        <ThemedView style={tw`px-5 py-6`}>
          <ProfileButton label="Edit Profile" onPress={() => router.push('/edit-profile')} buttonColor={buttonColor} />
          <ProfileButton label="Settings" onPress={() => router.push('/settings')} buttonColor={buttonColor} />
          <ProfileButton label="Privacy Policy" onPress={() => router.push('/privacy-policy')} buttonColor={buttonColor} />
          <ProfileButton label="Terms of Service" onPress={() => router.push('/terms-of-service')} buttonColor={buttonColor} />
          <ProfileButton label="About Iweohun" onPress={() => router.push('/about-iweohun')} buttonColor={buttonColor} />
          <ProfileButton label="About Okin Technologies" onPress={() => router.push('/about-okin-technologies')} buttonColor={buttonColor} />
          <ProfileButton label="Sign Out" onPress={handleSignOut} buttonColor="red" />
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileButton({ label, onPress, buttonColor }) {
  return (
    <TouchableOpacity
      style={[tw`rounded-3xl px-6 py-3 mb-6`, { backgroundColor: buttonColor }]}
      onPress={onPress}
    >
      <Text style={tw`text-white text-lg font-semibold text-center`}>{label}</Text>
    </TouchableOpacity>
  );
}
