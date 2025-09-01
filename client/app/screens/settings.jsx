import React from 'react';
import tw from 'twrnc';
import {
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  View
} from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function Settings() {
   const primaryColor = useThemeColor({}, 'primary');
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync('userId'),
        SecureStore.deleteItemAsync('authToken'),
        SecureStore.deleteItemAsync('userRole'),
        SecureStore.deleteItemAsync('username'),
      ]);
      router.replace('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
 <SafeAreaView style={tw`flex-1`}>
      <ScrollView showsVerticalScrollIndicator={false}>

<View style={tw`flex-row items-center gap-6 px-4 pt-6`}>
          <TouchableOpacity onPress={() => router.back()} style={tw`p-1`}>
            <MaterialCommunityIcons name="arrow-left" size={26} color={primaryColor} />
          </TouchableOpacity>
          <ThemedText style={[tw`text-xl font-bold`, { color: primaryColor }]}>
            Settings
          </ThemedText>
        </View>

        <ScrollView style={tw`mx-8 my-30 `} showsVerticalScrollIndicator={false}>
           
          <ProfileButton label="Edit Profile" iconName="account-edit" onPress={() => router.push('/screens/edit-profile')} />
          <ProfileButton label="Become a Creator" iconName="star-outline" onPress={() => router.push('/screens/become-creator')} />

          <ProfileButton label="Notifications" iconName="bell-outline" onPress={() => router.push('/screens/notifications')} />

          <ProfileButton label="Help & Support" iconName="help-circle-outline" onPress={() => router.push('/screens/support')} />
          
          {/* Sign Out */}
          <ProfileButton
            label="Sign Out"
            iconName="logout"
            onPress={() =>
              Alert.alert('Logout', 'Are you sure you want to logout?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', onPress: handleSignOut },
              ])
            }
            buttonColor="#d9534f"
          />
          </ScrollView>

      </ScrollView>
    </SafeAreaView>
  );
}


// Compact, reusable button
function ProfileButton({ label, onPress, iconName, buttonColor = '#070c70' }) {
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


