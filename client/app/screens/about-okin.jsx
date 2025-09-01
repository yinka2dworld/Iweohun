import React from 'react';
import tw from 'twrnc';
import { ScrollView, SafeAreaView, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';

export default function AboutOkínTechnologies() {
  const primaryColor = useThemeColor({}, 'primary');
  const router= useRouter();

  return (
    <SafeAreaView style={tw`flex-1`}>
      <ThemedView style={tw`flex-1 px-3 pt-3`}>
      

<ThemedView style={tw`flex-row items-center gap-5`}>
        <TouchableOpacity onPress={() => router.back()} style={tw`p-2`}>
     <MaterialCommunityIcons name="arrow-left" size={28} color={primaryColor} />
                      </TouchableOpacity>
 <ThemedText style={[tw`text-xl font-bold py-5`, { color: primaryColor }]} type="title">About Ọkín Technologies</ThemedText>       
    </ThemedView>

        <ScrollView showsVerticalScrollIndicator={false}>
          <ThemedText style={[tw`font-bold mb-1`, { color: primaryColor }]} type="defaultSemiBold">
            Our Mission
          </ThemedText>
          <ThemedText style={tw`mb-3`} type="default">
            Ọkín Technologies is dedicated to advancing digital platforms, particularly in the African market. Our mission is to build innovative products and services that help bridge the technological divide, fostering growth, learning, and development through technology.
          </ThemedText>

          {/* What We Do */}
          <ThemedText style={[tw`font-bold mb-1`, { color: primaryColor }]} type="defaultSemiBold">
            What We Do
          </ThemedText>
          <ThemedText style={tw`mb-3`} type="default">
            At Ọkín Technologies, we specialize in creating user-friendly, culturally relevant, and impactful digital solutions. Our focus includes digital content, mobile applications, and cloud-based services that empower businesses and individuals across Africa.
          </ThemedText>

          {/* Our Values */}
          <ThemedText style={[tw`font-bold mb-1`, { color: primaryColor }]} type="defaultSemiBold">
            Our Values
          </ThemedText>
          <View style={tw`mb-3`}>
            <ThemedText style={tw`mb-1`} type="default">
              • Innovation: We are driven by a passion for creativity and solving real-world problems.
            </ThemedText>
            <ThemedText style={tw`mb-1`} type="default">
              • Integrity: We conduct business ethically and with transparency.
            </ThemedText>
            <ThemedText style={tw`mb-1`} type="default">
              • Excellence: We strive to deliver the highest quality products and services.
            </ThemedText>
            <ThemedText style={tw`mb-1`} type="default">
              • Community: Our mission is to create solutions that uplift the communities we serve.
            </ThemedText>
          </View>

          {/* Our Vision */}
          <ThemedText style={[tw`font-bold mb-1`, { color: primaryColor }]} type="defaultSemiBold">
            Our Vision
          </ThemedText>
          <ThemedText style={tw`mb-3`} type="default">
            Our vision is to lead the digital transformation of Africa by creating sustainable and scalable technological solutions that empower businesses, organizations, and individuals to thrive in a digital world.
          </ThemedText>

          {/* Why Ọkín Technologies? */}
          <ThemedText style={[tw`font-bold mb-1`, { color: primaryColor }]} type="defaultSemiBold">
            Why Choose Ọkín Technologies?
          </ThemedText>
          <View style={tw`mb-3`}>
            <ThemedText style={tw`mb-1`} type="default">
              • Tech Expertise: Our team includes professionals with expertise in software development, digital content creation, and cloud technologies.
            </ThemedText>
            <ThemedText style={tw`mb-1`} type="default">
              • Culturally Relevant Solutions: We focus on designing products that address the specific needs of African markets.
            </ThemedText>
            <ThemedText style={tw`mb-1`} type="default">
              • Global Reach: Our solutions are designed to scale globally, impacting more than just Africa.
            </ThemedText>
          </View>

          {/* Contact Us Section */}
          <ThemedText style={[tw`font-bold mb-1`, { color: primaryColor }]} type="defaultSemiBold">
            Get in Touch
          </ThemedText>
          <ThemedText style={tw`mb-3`} type="default">
            To learn more about our work or get in touch with our team:
          </ThemedText>
          <View style={tw`mb-15`}>
            <ThemedText style={[tw`text-center text-sm`, { color: primaryColor }]} type="link">
              🌐 Website: www.okintech.com
            </ThemedText>
            <ThemedText style={[tw`text-center text-sm`, { color: primaryColor }]} type="link">
              📧 Email: contact@okintech.com
            </ThemedText>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}