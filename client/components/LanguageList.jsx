import React, { useRef, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList } from 'react-native';
import tw from 'twrnc';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function LanguageList() {
    const router = useRouter();
    const flatListRef = useRef(null);

    const languages = [
        { id: '1', name: 'Swahili', coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkiggRraKdnNphiix6pCSAVTPY2MrrlmDKsA&s' },
        { id: '2', name: 'Yoruba', coverImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/IMG-20180922-WA0007_cropped.jpg/220px-IMG-20180922-WA0007_cropped.jpg' },
        { id: '3', name: 'Zulu', coverImage: 'https://www.stylerave.com/wp-content/uploads/2023/03/1000-x-1000-24.png' },
        { id: '4', name: 'Amharic', coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0CDqNhhQRbERgf6Z8gh9xMTG2wMXryhxIjg&s' },
        { id: '5', name: 'Hausa', coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1qzqm6FKbddttB5DQgVAf186WbrxzC2QV9A&s' },
        { id: '6', name: 'Igbo', coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJetgqrz78e_qHm2S6VKb2wZ9MqyK_J2rTtA&s' },
        { id: '7', name: 'Amazigh', coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFTVNKiJRWD3G92bAgGX53ClcYehOHnckL2Q&s' },
        { id: '8', name: 'Somali', coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEnvbTNpKC3rvTUrU55v_q6NsGlS5Bufx3mg&s' },
        { id: '9', name: 'Shona', coverImage: 'https://st3.depositphotos.com/16578042/19080/i/450/depositphotos_190809432-stock-photo-zulu-tribal-dance.jpg' },
        { id: '10', name: 'Fulani', coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEVqIFOrMQp3PCD-i1DqBa1sMjKW1H2GBHgw&s' },
        { id: '11', name: 'Malagasy', coverImage: 'https://st.depositphotos.com/5447696/59371/i/450/depositphotos_593719166-stock-photo-arusha-tanzania-2011-african-wood.jpg' },
        {id: '12', name: 'Oromo', coverImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTc2ufGwt7wuJYwK4j-eCZVlyAgN0UiIGSbvA&s' },
       
    ];

    useEffect(() => {
        let scrollValue = 0;
        const itemWidth = 240; // Adjust this value according to the width of each item
        const totalWidth = itemWidth * languages.length;
        const interval = setInterval(() => {
            if (flatListRef.current) {
                scrollValue += itemWidth;
                if (scrollValue > totalWidth) {
                    scrollValue = 0;
                }
                flatListRef.current.scrollToOffset({ animated: true, offset: scrollValue });
            }
        }, 3000); // Adjust the time interval for the scroll

        return () => clearInterval(interval); // Clean up on unmount
    }, []);

    return (
        <View style={tw`w-full mt-5 mb-15`}>
            <LinearGradient
                colors={['#070c70', '#ff1493']}
                style={tw`w-full rounded-2xl p-4 `}
            >
                <View style={tw`flex-row justify-between items-center mb-4`}>
                    <Text style={tw`text-[#f8f8f8] text-3xl font-bold`}>Languages</Text>
                </View>

                <FlatList
                    ref={flatListRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={languages}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => router.push(`/language/${item.id}`, { language: item })}
                            style={tw`mr-3`}>
                            <View style={tw`relative w-60 h-60 rounded-lg overflow-hidden`}>
                                <Image
                                    source={{ uri: item.coverImage }}
                                    style={tw`w-full h-full`}
                                    resizeMode="cover" 
                                />
                                <View style={tw`absolute inset-0 bg-[#070c70] bg-opacity-50 flex items-center justify-center rounded-lg`}>
                                    <Text style={tw`text-[#f8f8f8] text-3xl font-bold text-center`}>{item.name}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={tw`px-4`}
                />
            </LinearGradient>
        </View>
    );
}
