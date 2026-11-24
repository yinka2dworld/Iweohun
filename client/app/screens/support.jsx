import React, { useState } from 'react';
import { Alert, Linking, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import tw from 'twrnc';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

const SUPPORT_EMAIL = 'support@iweohun.com';

const FAQS = [
  {
    question: 'How do I listen to an audiobook?',
    answer:
      'Open any book from Home, Library, or Top Chart, choose a chapter, and playback starts in the mini player at the bottom of the screen.',
  },
  {
    question: 'Can I download books for offline listening?',
    answer:
      'Offline downloads are available from the player. Downloaded audio is stored on your device and can be played without a connection.',
  },
  {
    question: 'How do I become a creator?',
    answer:
      'Go to Profile → Settings → Become a Creator and submit your payout details. Once saved, the Create button appears on the Home tab.',
  },
  {
    question: 'I forgot my password. What should I do?',
    answer:
      'Password reset is not available in the app yet. Contact support from this page and the team will help you recover access.',
  },
];

export default function Support() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const [openFaq, setOpenFaq] = useState(null);

  const openEmail = async () => {
    const url = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Iweohun support request')}`;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Contact support', `Email us at ${SUPPORT_EMAIL}`);
    }
  };

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor }]}>
      <View style={tw`flex-row items-center gap-4 px-4 pt-6 pb-4`}>
        <TouchableOpacity onPress={() => router.back()} style={tw`p-1`}>
          <MaterialCommunityIcons name="arrow-left" size={26} color={primaryColor} />
        </TouchableOpacity>
        <ThemedText style={[tw`text-xl font-bold`, { color: primaryColor }]}>
          Help & Support
        </ThemedText>
      </View>

      <ScrollView contentContainerStyle={tw`px-5 pb-12`} showsVerticalScrollIndicator={false}>
        <View style={[tw`rounded-2xl p-5 mb-6`, { backgroundColor: '#070c70' }]}>
          <ThemedText style={tw`text-white text-lg font-bold`}>We are here to help</ThemedText>
          <ThemedText style={tw`text-gray-200 text-sm mt-2`}>
            Questions about your account, playback, downloads, or publishing? Send us a message.
          </ThemedText>
          <TouchableOpacity
            onPress={openEmail}
            style={[tw`mt-4 self-start rounded-full px-5 py-2`, { backgroundColor: primaryColor }]}
          >
            <ThemedText style={tw`text-white font-semibold`}>Email support</ThemedText>
          </TouchableOpacity>
          <ThemedText style={tw`text-gray-300 text-xs mt-3`}>{SUPPORT_EMAIL}</ThemedText>
        </View>

        <ThemedText style={[tw`text-lg font-bold mb-3`, { color: textColor }]}>
          Frequently asked questions
        </ThemedText>

        {FAQS.map((faq) => {
          const isOpen = openFaq === faq.question;
          return (
            <View key={faq.question} style={tw`border-b border-gray-200`}>
              <TouchableOpacity
                onPress={() => setOpenFaq(isOpen ? null : faq.question)}
                style={tw`flex-row items-center justify-between py-4`}
                accessibilityRole="button"
                accessibilityState={{ expanded: isOpen }}
              >
                <ThemedText style={[tw`flex-1 text-base font-semibold pr-3`, { color: textColor }]}>
                  {faq.question}
                </ThemedText>
                <MaterialCommunityIcons
                  name={isOpen ? 'chevron-up' : 'chevron-down'}
                  size={22}
                  color={secondaryColor}
                />
              </TouchableOpacity>
              {isOpen ? (
                <ThemedText style={[tw`text-sm pb-4`, { color: secondaryColor }]}>
                  {faq.answer}
                </ThemedText>
              ) : null}
            </View>
          );
        })}

        <View style={tw`mt-8`}>
          <LinkRow label="Terms & Privacy" onPress={() => router.push('/screens/terms-policy')} color={primaryColor} />
          <LinkRow label="About Iweohun" onPress={() => router.push('/screens/about-iweohun')} color={primaryColor} />
          <LinkRow label="About Ọkín Technologies" onPress={() => router.push('/screens/about-okin')} color={primaryColor} />
        </View>

        <ThemedText style={[tw`text-xs text-center mt-8`, { color: secondaryColor }]}>
          Iweohun version {Constants.expoConfig?.version || '1.0.0'}
        </ThemedText>
      </ScrollView>
    </SafeAreaView>
  );
}

function LinkRow({ label, onPress, color }) {
  return (
    <TouchableOpacity onPress={onPress} style={tw`flex-row items-center justify-between py-3`}>
      <ThemedText style={{ color }}>{label}</ThemedText>
      <MaterialCommunityIcons name="chevron-right" size={22} color={color} />
    </TouchableOpacity>
  );
}
