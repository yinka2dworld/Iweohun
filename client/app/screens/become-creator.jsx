import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  Modal,
  FlatList,
  ScrollView,
} from 'react-native';
import tw from 'twrnc';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const countries = [
  'Nigeria', 'Ghana', 'Kenya', 'Tanzania', 'Uganda', 'South Africa',
  'Ethiopia', 'Benin', 'Togo', 'Niger', 'Cameroon', 'Algeria',
  'Morocco', 'Madagascar', 'Somalia'
];

const countryCurrencyMap = {
  Nigeria: 'NGN', Ghana: 'GHS', Kenya: 'KES', Tanzania: 'TZS', Uganda: 'UGX',
  'South Africa': 'ZAR', Ethiopia: 'ETB', Benin: 'XOF', Togo: 'XOF',
  Niger: 'XOF', Cameroon: 'XAF', Algeria: 'DZD', Morocco: 'MAD',
  Madagascar: 'MGA', Somalia: 'SOS',
};

export default function BecomeACreator() {
  const router = useRouter();
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const bgColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'tint');

  const [formData, setFormData] = useState({
    country: '',
    currency: '',
    paymentMethod: '',
    accountNumber: '',
    bankName: '',
    swiftCode: '',
    taxId: '',
  });

  const [showCountryModal, setShowCountryModal] = useState(false);

  const handleChange = (field, value) => {
    const newCurrency = field === 'country' ? countryCurrencyMap[value] || '' : formData.currency;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'country' && { currency: newCurrency }),
    }));
  };

  const renderCountryItem = ({ item }) => (
    <Pressable
      key={item}
      style={tw`p-3 border-b ${borderColor}`}
      onPress={() => {
        handleChange('country', item);
        setShowCountryModal(false);
      }}
    >
      <Text style={{ color: textColor }}>{item}</Text>
    </Pressable>
  );

  const handleSubmit = async () => {
    if (!formData.country || !formData.paymentMethod || !formData.accountNumber) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const res = await fetch('https://your-backend.com/api/creator/payment-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (res.ok) {
        alert('Payment information saved successfully');
        router.back();
      } else {
        alert(result.message || 'Failed to save information');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <ScrollView style={tw`flex-1 px-4 py-6`} contentContainerStyle={{ paddingBottom: 80 }}>
      {/* Header */}
      <View style={tw`flex-row items-center gap-4 mb-6`}>
        <TouchableOpacity onPress={() => router.back()} style={tw`p-2`}>
          <MaterialCommunityIcons name="arrow-left" size={28} color={primaryColor} />
        </TouchableOpacity>
        <Text style={[tw`text-xl font-bold`, { color: primaryColor }]}>
          Become a Creator
        </Text>
      </View>

      {/* Country Picker */}
      <Text style={[tw`mb-1`, { color: textColor }]}>Country</Text>
      <TouchableOpacity
        onPress={() => setShowCountryModal(true)}
        style={tw`p-3 rounded-md border ${borderColor} mb-4`}
      >
        <Text style={{ color: textColor }}>
          {formData.country || 'Select your country'}
        </Text>
      </TouchableOpacity>

      {/* Currency Display */}
      <Text style={[tw`mb-1`, { color: textColor }]}>Currency</Text>
      <View style={tw`p-3 rounded-md border ${borderColor} mb-4 bg-gray-100`}>
        <Text style={{ color: textColor }}>
          {formData.currency || 'Will be auto-filled'}
        </Text>
      </View>

      {/* Payment Method */}
      <Text style={[tw`mb-1`, { color: textColor }]}>Payment Method</Text>
      <TextInput
        placeholder="e.g. Bank Transfer, PayPal, Mobile Money"
        value={formData.paymentMethod}
        onChangeText={(text) => handleChange('paymentMethod', text)}
        style={tw`p-3 border rounded-md mb-4 ${borderColor}`}
        placeholderTextColor="#888"
      />

      {/* Account Number / Email */}
      <Text style={[tw`mb-1`, { color: textColor }]}>Account Number / PayPal Email</Text>
      <TextInput
        placeholder="Enter your account number or PayPal email"
        value={formData.accountNumber}
        onChangeText={(text) => handleChange('accountNumber', text)}
        style={tw`p-3 border rounded-md mb-4 ${borderColor}`}
        placeholderTextColor="#888"
      />

      {/* Bank Name */}
      <Text style={[tw`mb-1`, { color: textColor }]}>Bank Name (if applicable)</Text>
      <TextInput
        placeholder="e.g. Zenith Bank, First Bank"
        value={formData.bankName}
        onChangeText={(text) => handleChange('bankName', text)}
        style={tw`p-3 border rounded-md mb-4 ${borderColor}`}
        placeholderTextColor="#888"
      />

      {/* SWIFT Code */}
      <Text style={[tw`mb-1`, { color: textColor }]}>
        SWIFT Code (for international transfers)
      </Text>
      <TextInput
        placeholder="Optional - e.g. ABNGNGLA"
        value={formData.swiftCode}
        onChangeText={(text) => handleChange('swiftCode', text)}
        style={tw`p-3 border rounded-md mb-4 ${borderColor}`}
        placeholderTextColor="#888"
      />

      {/* Tax ID */}
      <Text style={[tw`mb-1`, { color: textColor }]}>
        Tax ID (if required in your country)
      </Text>
      <TextInput
        placeholder="Optional"
        value={formData.taxId}
        onChangeText={(text) => handleChange('taxId', text)}
        style={tw`p-3 border rounded-md mb-6 ${borderColor}`}
        placeholderTextColor="#888"
      />

      {/* Submit Button */}
      <TouchableOpacity
        onPress={handleSubmit}
        style={tw`bg-pink-600 py-3 rounded-md`}
      >
        <Text style={tw`text-white text-center text-base font-bold`}>Submit Info</Text>
      </TouchableOpacity>

      {/* Country Picker Modal */}
      <Modal visible={showCountryModal} animationType="slide">
        <View style={[tw`flex-1 p-4`, { backgroundColor: bgColor }]}>
          <Text style={tw`text-lg font-bold mb-4`} style={{ color: textColor }}>
            Select your Country
          </Text>
          <FlatList
            data={countries}
            keyExtractor={(item) => item}
            renderItem={renderCountryItem}
          />
          <TouchableOpacity onPress={() => setShowCountryModal(false)} style={tw`mt-4`}>
            <Text style={[tw`text-center`, { color: '#ff1493' }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
}
