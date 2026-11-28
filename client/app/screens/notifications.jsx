import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Switch, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tw from 'twrnc';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import SecureStore from '@/lib/SecureStore';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

const DEFAULT_PREFERENCES = {
  newReleases: true,
  reviewReplies: true,
  creatorUpdates: false,
};

const OPTIONS = [
  {
    key: 'newReleases',
    title: 'New releases',
    description: 'Audiobooks added in your preferred languages.',
  },
  {
    key: 'reviewReplies',
    title: 'Review replies',
    description: 'When someone replies to one of your reviews.',
  },
  {
    key: 'creatorUpdates',
    title: 'Creator updates',
    description: 'Tips and updates for publishing on Iweohun.',
  },
];

export default function Notifications() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');

  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [storageKey, setStorageKey] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadPreferences = useCallback(async () => {
    try {
      setLoading(true);
      const userId = await SecureStore.getItemAsync('userId');
      if (!userId) {
        router.replace('/auth/login');
        return;
      }

      const key = `notificationPrefs_${userId}`;
      setStorageKey(key);

      const raw = await AsyncStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      }
    } catch (error) {
      console.warn('Could not load notification preferences:', error.message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  const togglePreference = async (key, value) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);

    if (!storageKey) return;
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (error) {
      console.warn('Could not save notification preferences:', error.message);
      setPreferences(preferences);
    }
  };

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor }]}>
      <View style={tw`flex-row items-center gap-4 px-4 pt-6 pb-4`}>
        <TouchableOpacity onPress={() => router.back()} style={tw`p-1`}>
          <MaterialCommunityIcons name="arrow-left" size={26} color={primaryColor} />
        </TouchableOpacity>
        <ThemedText style={[tw`text-xl font-bold`, { color: primaryColor }]}>
          Notifications
        </ThemedText>
      </View>

      {loading ? (
        <ThemedView style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator size="large" color={primaryColor} />
        </ThemedView>
      ) : (
        <View style={tw`px-5 pt-2`}>
          {OPTIONS.map((option) => (
            <View
              key={option.key}
              style={tw`flex-row items-center justify-between py-4 border-b border-gray-200`}
            >
              <View style={tw`flex-1 pr-4`}>
                <ThemedText style={[tw`text-base font-semibold`, { color: textColor }]}>
                  {option.title}
                </ThemedText>
                <ThemedText style={[tw`text-sm mt-1`, { color: secondaryColor }]}>
                  {option.description}
                </ThemedText>
              </View>
              <Switch
                value={Boolean(preferences[option.key])}
                onValueChange={(value) => togglePreference(option.key, value)}
                trackColor={{ false: '#d1d5db', true: primaryColor }}
                thumbColor="#ffffff"
                accessibilityLabel={option.title}
              />
            </View>
          ))}

          <ThemedText style={[tw`text-xs mt-6`, { color: secondaryColor }]}>
            Preferences are saved on this device. Push notification delivery is managed by your
            device settings.
          </ThemedText>
        </View>
      )}
    </SafeAreaView>
  );
}
