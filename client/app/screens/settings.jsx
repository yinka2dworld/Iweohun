import React from 'react';
import tw from 'twrnc';
<<<<<<< HEAD
import {
  ScrollView,
  TouchableOpacity,
  Alert,
  View
} from 'react-native';
=======
import { ScrollView, TouchableOpacity, Alert, View } from 'react-native';
>>>>>>> f2780159c4f959ab1a343223f0569019255c3da6
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { clearAuthSession } from '@/lib/api';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useThemeSettings } from '@/context/ThemeContext';

const THEME_OPTIONS = [
  { value: 'system', label: 'System', icon: 'theme-light-dark' },
  { value: 'light', label: 'Light', icon: 'white-balance-sunny' },
  { value: 'dark', label: 'Dark', icon: 'weather-night' },
];

export default function Settings() {
  const primaryColor = useThemeColor({}, 'primary');
<<<<<<< HEAD
  const onPrimaryColor = useThemeColor({}, 'onPrimary');
  const dangerColor = useThemeColor({}, 'danger');
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const surfaceAltColor = useThemeColor({}, 'surfaceAlt');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'muted');
  const borderColor = useThemeColor({}, 'border');
  const { themePreference, setThemePreference } = useThemeSettings();
=======
  const backgroundColor = useThemeColor({}, 'background');
>>>>>>> f2780159c4f959ab1a343223f0569019255c3da6
  const router = useRouter();

  const handleThemeChange = async (preference) => {
    try {
      await setThemePreference(preference);
    } catch (error) {
      console.error('Error saving theme preference:', error);
      Alert.alert('Unable to change theme', 'Your appearance setting could not be saved. Please try again.');
    }
  };

  const handleSignOut = async () => {
    try {
      await clearAuthSession();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
<<<<<<< HEAD
 <SafeAreaView style={[tw`flex-1`, { backgroundColor }]}>
      <ScrollView showsVerticalScrollIndicator={false}>

<View style={tw`flex-row items-center gap-6 px-4 pt-4`}>
          <TouchableOpacity onPress={() => router.back()} style={tw`p-1`}>
            <MaterialCommunityIcons name="arrow-left" size={26} color={primaryColor} />
          </TouchableOpacity>
          <ThemedText style={[tw`text-xl font-bold`, { color: primaryColor }]}>
            Settings
          </ThemedText>
        </View>

        <ScrollView style={tw`mx-8 my-10`} showsVerticalScrollIndicator={false}>
          <View style={[tw`mb-10 rounded-2xl p-4 border`, { backgroundColor: surfaceColor, borderColor }]}>
            <ThemedText style={[tw`text-lg font-semibold`, { color: textColor }]}>
              Appearance
            </ThemedText>
            <ThemedText style={[tw`mt-1 text-sm`, { color: mutedColor }]}>
              Choose your preferred theme.
            </ThemedText>
            <View style={tw`flex-row gap-2 mt-4`}>
              {THEME_OPTIONS.map(({ value, label, icon }) => {
                const isSelected = themePreference === value;
                const optionTextColor = isSelected ? onPrimaryColor : textColor;
                return (
                  <TouchableOpacity
                    key={value}
                    onPress={() => handleThemeChange(value)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: isSelected }}
                    accessibilityLabel={`${label} theme`}
                    style={[
                      tw`flex-1 items-center justify-center rounded-xl px-2 py-3`,
                      { backgroundColor: isSelected ? primaryColor : surfaceAltColor },
                    ]}
                  >
                    <MaterialCommunityIcons name={icon} size={22} color={optionTextColor} />
                    <ThemedText style={[tw`mt-1 text-sm font-semibold`, { color: optionTextColor }]}>
                      {label}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <ProfileButton label="Edit Profile" iconName="account-edit" onPress={() => router.push('/screens/edit-profile')} buttonColor={primaryColor} textColor={onPrimaryColor} />
          <ProfileButton label="Become a Creator" iconName="star-outline" onPress={() => router.push('/screens/become-creator')} buttonColor={primaryColor} textColor={onPrimaryColor} />

          <ProfileButton label="Notifications" iconName="bell-outline" onPress={() => router.push('/screens/notifications')} buttonColor={primaryColor} textColor={onPrimaryColor} />

          <ProfileButton label="Help & Support" iconName="help-circle-outline" onPress={() => router.push('/screens/support')} buttonColor={primaryColor} textColor={onPrimaryColor} />
          
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
            buttonColor={dangerColor}
            textColor={onPrimaryColor}
          />
          </ScrollView>
=======
    <SafeAreaView style={[tw`flex-1`, { backgroundColor }]}>
      <View style={tw`flex-row items-center gap-4 px-4 pt-6 pb-4`}>
        <TouchableOpacity onPress={() => router.back()} style={tw`p-1`}>
          <MaterialCommunityIcons name="arrow-left" size={26} color={primaryColor} />
        </TouchableOpacity>
        <ThemedText style={[tw`text-xl font-bold`, { color: primaryColor }]}>
          Settings
        </ThemedText>
      </View>
>>>>>>> f2780159c4f959ab1a343223f0569019255c3da6

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

<<<<<<< HEAD

// Compact, reusable button
function ProfileButton({ label, onPress, iconName, buttonColor, textColor }) {
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
=======
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
>>>>>>> f2780159c4f959ab1a343223f0569019255c3da6
  );
}
