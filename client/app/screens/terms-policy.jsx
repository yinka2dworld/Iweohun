import React from 'react';
import tw from 'twrnc';
import { ScrollView, SafeAreaView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function TermsAndPolicy() {
  
 const primaryColor = useThemeColor({}, 'primary');

  return (
    <SafeAreaView style={tw`flex-1`}>
      <ThemedView style={tw`flex-1 px-4 pt-4`}>
      <ThemedText style={[tw`text-xl font-bold py-5`, { color: primaryColor }]} type="title">Terms of Use – Iweohun</ThemedText>
        <ScrollView showsVerticalScrollIndicator={false}>

          <ThemedText style={[tw`font-bold mb-1`, { color: primaryColor }]} type="defaultSemiBold">1. Eligibility</ThemedText>
          <ThemedText style={tw`mb-3`} type="default">
            Users must be at least 13 years old to create an account. Children under 13 must access the platform under adult supervision.
          </ThemedText>

          <ThemedText style={[tw`font-bold mb-1`, { color: primaryColor }]} type="defaultSemiBold">2. User Content and Responsibility</ThemedText>
          <ThemedText style={tw`mb-3`} type="default">
            You may upload content only if you own it, it's in the public domain, or you have legal permission. You're responsible for all uploaded content and must not infringe on others' rights.
          </ThemedText>

          <ThemedText style={[tw`font-bold mb-1`, { color: primaryColor }]} type="defaultSemiBold">3. License Grant</ThemedText>
          <ThemedText style={tw`mb-3`} type="default">
            By submitting content, you grant Iweohun a non-exclusive, royalty-free, global license to use and distribute your content.
          </ThemedText>

          <ThemedText style={[tw`font-bold mb-1`, { color: primaryColor }]} type="defaultSemiBold">4. Prohibited Activities</ThemedText>
          <ThemedText style={tw`mb-3`} type="default">
            No uploading copyrighted material without permission, offensive content, illegal activity, or use of bots/scripts is allowed.
          </ThemedText>

          <ThemedText style={[tw`font-bold mb-1`, { color: primaryColor }]} type="defaultSemiBold">5. Content Moderation</ThemedText>
          <ThemedText style={tw`mb-3`} type="default">
            We reserve the right to remove content or accounts at any time without prior notice if violations are found.
          </ThemedText>

          <ThemedText style={[tw`font-bold mb-1`, { color: primaryColor }]} type="defaultSemiBold">6. Intellectual Property</ThemedText>
          <ThemedText style={tw`mb-3`} type="default">
            All app designs, branding, and internal content are the property of Iweohun and are protected by copyright.
          </ThemedText>

          <ThemedText style={[tw`font-bold mb-1`, { color: primaryColor }]} type="defaultSemiBold">7. Copyright Complaints</ThemedText>
          <ThemedText style={tw`mb-3`} type="default">
            Contact us at copyright@Iweohun.com if you believe your intellectual property has been used improperly.
          </ThemedText>

          <ThemedText style={[tw`font-bold mb-1`, { color: primaryColor }]} type="defaultSemiBold">8. Termination</ThemedText>
          <ThemedText style={tw`mb-3`} type="default">
            We may terminate access for any breach of these terms.
          </ThemedText>

          <ThemedText style={[tw`font-bold mb-1`, { color: primaryColor }]} type="defaultSemiBold">9. Updates</ThemedText>
          <ThemedText style={tw`mb-3`} type="default">
            We may update these Terms. Continued use implies agreement to updated terms.
          </ThemedText>

          <ThemedText style={[tw`text-xl font-bold mt-6 mb-4`, { color: primaryColor }]} type="title">Privacy Policy – Iweohun</ThemedText>

          <ThemedText style={[tw`font-bold mb-1`, { color: primaryColor }]} type="defaultSemiBold">1. Information Collected</ThemedText>
          <ThemedText style={tw`mb-3`} type="default">
            We collect name, email, age range, device type, and app activity.
          </ThemedText>

          <ThemedText style={[tw`font-bold mb-1`, { color: primaryColor }]} type="defaultSemiBold">2. Children’s Privacy</ThemedText>
          <ThemedText style={tw`mb-3`} type="default">
            We don’t knowingly collect data from children under 13. Parents may request data removal.
          </ThemedText>

          <ThemedText style={[tw`font-bold mb-1`, { color: primaryColor }]} type="defaultSemiBold">3. Use of Information</ThemedText>
          <ThemedText style={tw`mb-3`} type="default">
            Data is used to personalize content, improve services, and send notifications.
          </ThemedText>

          <ThemedText style={[tw`font-bold mb-1`, { color: primaryColor }]} type="defaultSemiBold">4. Sharing</ThemedText>
          <ThemedText style={tw`mb-3`} type="default">
            Data is only shared with essential service providers. We do not sell user data.
          </ThemedText>

          <ThemedText style={[tw`font-bold mb-1`, { color: primaryColor }]} type="defaultSemiBold">5. Your Rights</ThemedText>
          <ThemedText style={tw`mb-3`} type="default">
            You may update, access, or delete your data anytime by contacting privacy@Iweohun.com.
          </ThemedText>

          <ThemedText style={[tw`font-bold mb-1`, { color: primaryColor }]} type="defaultSemiBold">6. Data Security</ThemedText>
          <ThemedText style={tw`mb-3`} type="default">
            We implement standard encryption and access controls to secure your information.
          </ThemedText>

          <ThemedText style={[tw`font-bold mb-1`, { color: primaryColor }]} type="defaultSemiBold">7. Cookies & Analytics</ThemedText>
          <ThemedText style={tw`mb-3`} type="default">
            We may use cookies or analytics tools to improve your experience.
          </ThemedText>

          <ThemedText style={[tw`font-bold mb-1`, { color: primaryColor }]} type="defaultSemiBold">8. Changes</ThemedText>
          <ThemedText style={tw`mb-6`} type="default">
            Any changes to our Privacy Policy will be posted in-app or via email notifications.
          </ThemedText>

          <ThemedText style={[tw`text-center text-sm mb-8`, { color: primaryColor }]} type="link">
            📧 Contact: support@Iweohun.com | copyright@Iweohun.com
          </ThemedText>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}
