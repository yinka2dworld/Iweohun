import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import tw from 'twrnc';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import SecureStore from '@/lib/SecureStore';
import apiClient, { getApiErrorMessage } from '@/lib/api';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from '@/components/ThemedText';

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

const PAYMENT_METHODS = ['Bank Transfer', 'Mobile Money', 'PayPal'];

export default function BecomeACreator() {
  const router = useRouter();
  const textColor = useThemeColor({}, 'text');
  const boxColor = useThemeColor({}, 'box');
  const bgColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'primary');

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const loadCreatorProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const userId = await SecureStore.getItemAsync('userId');
      if (!userId) {
        router.replace('/auth/login');
        return;
      }

      const { data } = await apiClient.get('/creator/payment-info');
      if (data.creatorProfile) {
        setFormData((previous) => ({
          ...previous,
          ...Object.fromEntries(
            Object.entries(data.creatorProfile).map(([key, value]) => [key, value ?? ''])
          ),
        }));
      }
    } catch (err) {
      // A missing profile is fine for first-time creators; only surface real errors.
      if (err.response?.status !== 404) {
        setError(getApiErrorMessage(err, 'Could not load your payout details.'));
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadCreatorProfile();
  }, [loadCreatorProfile]);

  const handleChange = (field, value) => {
    if (error) setError(null);
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'country' && { currency: countryCurrencyMap[value] || '' }),
    }));
  };

  const renderCountryItem = ({ item }) => (
    <Pressable
      key={item}
      style={tw`p-4 border-b border-gray-200`}
      onPress={() => {
        handleChange('country', item);
        setShowCountryModal(false);
      }}
    >
      <Text style={{ color: textColor }}>{item}</Text>
    </Pressable>
  );

  const handleSubmit = async () => {
    if (!formData.country || !formData.paymentMethod || !formData.accountNumber.trim()) {
      setError('Country, payment method, and account number are required.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const { data } = await apiClient.post('/creator/payment-info', formData);

      await SecureStore.setItemAsync('userRole', String(data.role || 'creator'));
      if (data.token) {
        await SecureStore.setItemAsync('authToken', String(data.token));
      }
      Alert.alert('Application saved', 'Your creator payout details have been saved.');
      router.back();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not save your payout details.'));
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = [tw`h-12 px-4 border rounded-md text-base`, { borderColor: boxColor, color: textColor }];

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: bgColor }]}>
      <ScrollView
        contentContainerStyle={tw`px-4 py-6 pb-20`}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={tw`flex-row items-center gap-4 mb-6`}>
          <TouchableOpacity onPress={() => router.back()} style={tw`p-2`}>
            <MaterialCommunityIcons name="arrow-left" size={28} color={primaryColor} />
          </TouchableOpacity>
          <ThemedText style={[tw`text-xl font-bold`, { color: primaryColor }]}>
            Become a Creator
          </ThemedText>
        </View>

        <ThemedText style={[tw`text-sm mb-6`, { color: textColor }]}>
          Add the payout details we should use when your audiobooks start earning. You can update
          these later from Settings.
        </ThemedText>

        {loading ? (
          <View style={tw`py-20 items-center`}>
            <ActivityIndicator size="large" color={primaryColor} />
          </View>
        ) : (
          <>
            <Text style={[tw`mb-1 text-sm font-semibold`, { color: textColor }]}>Country *</Text>
            <TouchableOpacity
              onPress={() => setShowCountryModal(true)}
              style={[inputStyle, tw`mb-4 flex-row items-center justify-between`]}
            >
              <Text style={{ color: formData.country ? textColor : '#999' }}>
                {formData.country || 'Select your country'}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={22} color={textColor} />
            </TouchableOpacity>

            <Text style={[tw`mb-1 text-sm font-semibold`, { color: textColor }]}>Currency</Text>
            <View
              style={[
                tw`h-12 px-4 border rounded-md mb-4 justify-center`,
                { borderColor: boxColor, backgroundColor: 'rgba(0,0,0,0.04)' },
              ]}
            >
              <Text style={{ color: textColor }}>
                {formData.currency || 'Auto-filled from your country'}
              </Text>
            </View>

            <Text style={[tw`mb-1 text-sm font-semibold`, { color: textColor }]}>
              Payment method *
            </Text>
            <View style={tw`flex-row flex-wrap gap-2 mb-4`}>
              {PAYMENT_METHODS.map((method) => {
                const selected = formData.paymentMethod === method;
                return (
                  <TouchableOpacity
                    key={method}
                    onPress={() => handleChange('paymentMethod', method)}
                    style={[
                      tw`rounded-full px-4 py-2 border`,
                      {
                        borderColor: selected ? primaryColor : boxColor,
                        backgroundColor: selected ? primaryColor : 'transparent',
                      },
                    ]}
                  >
                    <Text style={{ color: selected ? '#ffffff' : textColor }}>{method}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[tw`mb-1 text-sm font-semibold`, { color: textColor }]}>
              Account number / PayPal email *
            </Text>
            <TextInput
              placeholder="Enter your account number or PayPal email"
              value={formData.accountNumber}
              onChangeText={(text) => handleChange('accountNumber', text)}
              style={[inputStyle, tw`mb-4`]}
              placeholderTextColor="#999"
              autoCapitalize="none"
            />

            <Text style={[tw`mb-1 text-sm font-semibold`, { color: textColor }]}>
              Bank name (if applicable)
            </Text>
            <TextInput
              placeholder="e.g. Zenith Bank"
              value={formData.bankName}
              onChangeText={(text) => handleChange('bankName', text)}
              style={[inputStyle, tw`mb-4`]}
              placeholderTextColor="#999"
            />

            <Text style={[tw`mb-1 text-sm font-semibold`, { color: textColor }]}>
              SWIFT code (international transfers)
            </Text>
            <TextInput
              placeholder="Optional - e.g. ABNGNGLA"
              value={formData.swiftCode}
              onChangeText={(text) => handleChange('swiftCode', text)}
              style={[inputStyle, tw`mb-4`]}
              placeholderTextColor="#999"
              autoCapitalize="characters"
            />

            <Text style={[tw`mb-1 text-sm font-semibold`, { color: textColor }]}>
              Tax ID (if required in your country)
            </Text>
            <TextInput
              placeholder="Optional"
              value={formData.taxId}
              onChangeText={(text) => handleChange('taxId', text)}
              style={[inputStyle, tw`mb-6`]}
              placeholderTextColor="#999"
            />

            {error ? (
              <ThemedText style={tw`text-red-500 text-center mb-4`}>{error}</ThemedText>
            ) : null}

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={saving}
              style={[
                tw`h-12 rounded-md items-center justify-center`,
                { backgroundColor: saving ? '#9ca3af' : primaryColor },
              ]}
            >
              {saving ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={tw`text-white text-base font-bold`}>Save payout details</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <Modal visible={showCountryModal} animationType="slide" transparent>
        <View style={[tw`flex-1 justify-end`, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
          <View style={[tw`rounded-t-2xl p-4`, { backgroundColor: bgColor, maxHeight: '70%' }]}>
            <View style={tw`flex-row items-center justify-between mb-2`}>
              <Text style={[tw`text-lg font-bold`, { color: textColor }]}>Select your country</Text>
              <TouchableOpacity onPress={() => setShowCountryModal(false)} style={tw`p-2`}>
                <MaterialCommunityIcons name="close" size={24} color={textColor} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={countries}
              keyExtractor={(item) => item}
              renderItem={renderCountryItem}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
