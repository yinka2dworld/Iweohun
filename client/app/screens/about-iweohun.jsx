import React from 'react';
import tw from 'twrnc';
import { ScrollView, SafeAreaView, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function AboutIweohun() {
  const primaryColor = useThemeColor({}, 'primary');

  return (
    <SafeAreaView style={tw`flex-1`}>
      <ThemedView style={tw`flex-1 px-4 pt-4`}>
        <ThemedText style={[tw`text-xl font-bold py-5`, { color: primaryColor }]} type="title">
            About Iweohun
          </ThemedText>

        <ScrollView showsVerticalScrollIndicator={false}>
          <ThemedText style={[tw`font-bold mb-1`, { color: primaryColor }]} type="defaultSemiBold">
            Our Mission
          </ThemedText>
          <ThemedText style={tw`mb-3`} type="default">
            Iweohun is committed to bridging language gaps by providing audiobooks in multiple African languages. Our platform makes literature accessible to diverse communities, promoting both entertainment and educational enrichment.
          </ThemedText>

          {/* What We Do Section */}
          <ThemedText style={[tw`font-bold mb-1`, { color: primaryColor }]} type="defaultSemiBold">
            What We Do
          </ThemedText>
          <ThemedText style={tw`mb-3`} type="default">
            We offer a wide variety of audiobooks in African languages, including children's books, educational content, and cultural literature. Our platform is designed to encourage literacy and cultural exchange.
          </ThemedText>

          {/* Who We Serve Section */}
          <ThemedText style={[tw`font-bold mb-1`, { color: primaryColor }]} type="defaultSemiBold">
            Who We Serve
          </ThemedText>
          <ThemedText style={tw`mb-3`} type="default">
            Iweohun serves a diverse audience: language learners, parents seeking culturally relevant content for their children, and book lovers who wish to experience African literature in audio form.
          </ThemedText>

          {/* Vision Section */}
          <ThemedText style={[tw`font-bold mb-1`, { color: primaryColor }]} type="defaultSemiBold">
            Our Vision
          </ThemedText>
          <ThemedText style={tw`mb-3`} type="default">
            Our vision is to expand the global reach of African literature. We aim to provide a platform where African stories are accessible to audiences worldwide, enhancing cultural exchange and understanding.
          </ThemedText>

          {/* Why Choose Us Section */}
          <ThemedText style={[tw`font-bold mb-1`, { color: primaryColor }]} type="defaultSemiBold">
            Why Choose Iweohun?
          </ThemedText>
          
          <View style={tw`mb-3`}>
            <ThemedText style={tw`mb-1`} type="default">
              • Diverse Language Options: Our audiobooks are available in various African languages, promoting multilingual learning.
            </ThemedText>
            <ThemedText style={tw`mb-1`} type="default">
              • Culturally Relevant Content: We prioritize African voices and stories.
            </ThemedText>
            <ThemedText style={tw`mb-1`} type="default">
              • Inclusive for All Ages: From children's books to adult literature, there's something for everyone.
            </ThemedText>
            <ThemedText style={tw`mb-1`} type="default">
              • Quality Narration: Our audiobooks feature skilled narrators to deliver the best listening experience.
            </ThemedText>
          </View>

          {/* Join Our Community Section */}
          <ThemedText style={[tw`font-bold mb-1`, { color: primaryColor }]} type="defaultSemiBold">
            Join Our Community
          </ThemedText>
          <ThemedText style={tw`mb-3`} type="default">
            We invite you to become part of our community and explore African storytelling through our audiobooks. Whether you're learning a new language, sharing stories with your family, or enjoying literature, Iweohun is here to serve your needs.
          </ThemedText>

          {/* Contact Info */}
          <ThemedText style={[tw`text-center text-sm mb-8`, { color: primaryColor }]} type="link">
            📧 Contact Us: support@iweohun.com
          </ThemedText>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}