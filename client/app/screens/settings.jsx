import React from 'react';
import tw from 'twrnc';
import { ScrollView, TouchableOpacity, Alert, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { clearAuthSession } from '@/lib/api';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function Settings() {
  const primaryColor = useThemeColor({}, 'primary');
  const backgroundColor = useThemeColor({}, 'background');
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await clearAuthSession();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor }]}>
      <View style={tw`flex-row items-center gap-4 px-4 pt-6 pb-4`}>
        <TouchableOpacity onPress={() => router.back()} style={tw`p-1`}>
          <MaterialCommunityIcons name="arrow-left" size={26} color={primaryColor} />
        </TouchableOpacity>
        <ThemedText style={[tw`text-xl font-bold`, { color: primaryColor }]}>
          Settings
        </ThemedText>
      </View>

      <ScrollView
        contentContainerStyle={tw`px-8 pt-2 pb-12`}
        showsVerticalScrollIndicator={false}
      >
        <ProfileButton
          label="Edit Profile"
          iconName="account-edit"
          onPress={() => router.push('/screens/edit-profile')}
        />
        <ProfileButton
          label="Become a Creator"
          iconName="star-outline"
          onPress={() => router.push('/screens/become-creator')}
        />
        <ProfileButton
          label="Notifications"
          iconName="bell-outline"
          onPress={() => router.push('/screens/notifications')}
        />
        <ProfileButton
          label="Help & Support"
          iconName="help-circle-outline"
          onPress={() => router.push('/screens/support')}
        />
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
    </SafeAreaView>
  );
}

function ProfileButton({ label, onPress, iconName, buttonColor = '#070c70' }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        tw`flex-row items-center justify-center px-2 py-4 rounded-2xl mb-6`,
        { backgroundColor: buttonColor },
      ]}
    >
      <MaterialCommunityIcons name={iconName} size={22} color="white" />
      <ThemedText style={tw`text-white text-lg font-semibold ml-3`}>{label}</ThemedText>
    </TouchableOpacity>
  );
}
