import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import tw from 'twrnc';
import { useAppTheme } from '../themeContext'; 

export default function Profile() {
  const router = useRouter();
  const theme = useAppTheme();

  const user = {
    name: 'Ali',
    email: 'ali@example.com',
    profilePicture: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1tf3QiePLGWrYYU0hiSD594zkUHdspxc6Og&s'
  };

  const handleSignOut = () => {
    // signOut();
    router.push('/logout');
  };

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: theme.background }]}>
      <ScrollView>
        <View style={tw`p-5`}>
          <View style={tw`items-center mb-5`}>
            <Image
              source={{ uri: user.profilePicture }}
              style={tw`w-32 h-32 rounded-full mt-3`} // Profile picture rounded and size adjusted
            />
            <Text style={[tw`text-2xl font-bold`, { color: theme.text }]}>{user.name}</Text>
            <Text style={[tw`text-lg`, { color: theme.text }]}>{user.email}</Text>
          </View>

          <TouchableOpacity
            style={tw`bg-[#070c70] rounded-full px-4 py-2 mb-5`}
            onPress={() => router.push('/edit-profile')}>
            <Text style={tw`text-white text-base font-bold`}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={tw`bg-[#070c70] rounded-full px-4 py-2 mb-5`}
            onPress={() => router.push('/settings')}>
            <Text style={tw`text-white text-base font-bold`}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={tw`bg-[#070c70] rounded-full px-4 py-2 mb-5`}
            onPress={() => router.push('/privacy-policy')}
          >
            <Text style={tw`text-white text-base font-bold`}>Privacy Policy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={tw`bg-[#070c70] rounded-full px-4 py-2 mb-5`}
            onPress={() => router.push('/terms-of-service')}
          >
            <Text style={tw`text-white text-base font-bold`}>Terms of Service</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={tw`bg-[#070c70] rounded-full px-4 py-2 mb-5`}
            onPress={() => router.push('/about-iweohun')}
          >
            <Text style={tw`text-white text-base font-bold`}>About Iweohun</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={tw`bg-[#070c70] rounded-full px-4 py-2 mb-5`}
            onPress={() => router.push('/about-okin-technologies')}
          >
            <Text style={tw`text-white text-base font-bold`}>About Okin Technologies</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={tw`bg-red-600 rounded-full px-4 py-2 mb-5`}
            onPress={handleSignOut} >
            <Text style={tw`text-white text-base font-bold`}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
