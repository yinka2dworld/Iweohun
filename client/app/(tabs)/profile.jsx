import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import tw from 'twrnc';
import { useThemeColor } from '@/hooks/useThemeColor'; // Import useThemeColor
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import AsyncStorage from "@react-native-async-storage/async-storage";


export default function Profile() {
  const router = useRouter();

  // const getUserData = async () => {
  //   try {
  //     const userId = await AsyncStorage.getItem("userId");
  //     const role = await AsyncStorage.getItem("role");
  //     const token = await AsyncStorage.getItem("authToken");
  
  //     console.log("User Data:", { userId, role, token });
  //   } catch (error) {
  //     console.error("Error retrieving user data:", error);
  //   }
  // };
  

  const user = {
    name: 'Ali',
    email: 'ali@example.com',
    profilePicture:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1tf3QiePLGWrYYU0hiSD594zkUHdspxc6Og&s',
  };

  const handleSignOut = () => {
    // signOut();
    router.push('/logout');
  };

  const backgroundColor = useThemeColor({}, 'background'); // Get background color from theme
  const textColor = useThemeColor({}, 'text'); // Get text color from theme
  const buttonColor = useThemeColor({}, 'text')

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor }]}>
      <ScrollView>
        <ThemedView style={tw`p-5`}>
          <ThemedView style={tw`items-center mb-5`}>
            <Image
              source={{ uri: user.profilePicture }}
              style={tw`w-32 h-32 rounded-full mt-3`} // Profile picture rounded and size adjusted
            />
            <ThemedText style={[tw`text-2xl font-bold`, { color: textColor }]}>{user.name}</ThemedText>
            <ThemedText style={[tw`text-lg`, { color: textColor }]}>{user.email}</ThemedText>
          </ThemedView>

          <ProfileButton
            label="Edit Profile"
            onPress={() => router.push('/edit-profile')}
            buttonColor={buttonColor}
          />
          <ProfileButton
            label="Settings"
            onPress={() => router.push('/settings')}
            buttonColor={buttonColor}
          />
          <ProfileButton
            label="Privacy Policy"
            onPress={() => router.push('/privacy-policy')}
            buttonColor={buttonColor}
          />
          <ProfileButton
            label="Terms of Service"
            onPress={() => router.push('/terms-of-service')}
            buttonColor={buttonColor}
          />
          <ProfileButton
            label="About Iweohun"
            onPress={() => router.push('/about-iweohun')}
            buttonColor={buttonColor}
          />
          <ProfileButton
            label="About Okin Technologies"
            onPress={() => router.push('/about-okin-technologies')}
            buttonColor={buttonColor}
          />
          <ProfileButton
            label="Sign Out"
            onPress={handleSignOut}
            buttonColor="red"
          />
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileButton({ label, onPress, buttonColor }) {
  return (
    <TouchableOpacity
      style={[tw`rounded-full px-4 py-2 mb-5`, { backgroundColor: buttonColor }]}
      onPress={onPress}
    >
      <Text style={tw`text-white text-base font-bold`}>{label}</Text>
    </TouchableOpacity>
  );
}
