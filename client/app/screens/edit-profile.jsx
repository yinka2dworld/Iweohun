import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

const EMAIL_RE = /^\S+@\S+\.\S+$/;
const PHONE_RE = /^\+?\d{7,15}$/;

export default function EditProfile() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const boxColor = useThemeColor({}, 'box');

  const [form, setForm] = useState({ username: '', email: '', phoneNumber: '', fullName: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const userId = await SecureStore.getItemAsync('userId');
      if (!userId) {
        router.replace('/auth/login');
        return;
      }

      const { data } = await apiClient.get(`/user/${userId}`);
      setForm({
        username: data.username || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
        fullName: data.fullName || '',
      });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load your profile.'));
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const updateField = (field, value) => {
    if (error) setError(null);
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleSave = async () => {
    const username = form.username.trim();
    const email = form.email.trim().toLowerCase();
    const phoneNumber = form.phoneNumber.trim();

    if (!username) return setError('Username is required');
    if (username.length < 3) return setError('Username must be at least 3 characters');
    if (/\s/.test(username)) return setError('Username cannot contain spaces');
    if (!EMAIL_RE.test(email)) return setError('Enter a valid email address');
    if (!PHONE_RE.test(phoneNumber)) return setError('Enter a valid phone number');

    try {
      setSaving(true);
      setError(null);

      const userId = await SecureStore.getItemAsync('userId');
      if (!userId) {
        router.replace('/auth/login');
        return;
      }

      const { data } = await apiClient.put(`/updateUser/${userId}`, {
        username,
        email,
        phoneNumber,
        fullName: form.fullName.trim(),
      });

      const updatedUser = data.user || { username, email, phoneNumber };
      await SecureStore.setItemAsync('username', updatedUser.username || username);

      Alert.alert('Profile updated', 'Your account details were saved.');
      router.back();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not update your profile.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor }]}>
      <KeyboardAvoidingView
        style={tw`flex-1`}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={tw`flex-row items-center gap-4 px-4 pt-6 pb-4`}>
          <TouchableOpacity onPress={() => router.back()} style={tw`p-1`}>
            <MaterialCommunityIcons name="arrow-left" size={26} color={primaryColor} />
          </TouchableOpacity>
          <ThemedText style={[tw`text-xl font-bold`, { color: primaryColor }]}>
            Edit Profile
          </ThemedText>
        </View>

        {loading ? (
          <ThemedView style={tw`flex-1 items-center justify-center`}>
            <ActivityIndicator size="large" color={primaryColor} />
          </ThemedView>
        ) : (
          <ScrollView
            contentContainerStyle={tw`px-6 pb-10`}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Field label="Full name" color={textColor}>
              <TextInput
                value={form.fullName}
                onChangeText={(value) => updateField('fullName', value)}
                placeholder="Your full name"
                placeholderTextColor="#999"
                style={[tw`h-12 px-4 border rounded-md text-base`, { borderColor: boxColor, color: textColor }]}
              />
            </Field>

            <Field label="Username *" color={textColor}>
              <TextInput
                value={form.username}
                onChangeText={(value) => updateField('username', value)}
                placeholder="Username"
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor="#999"
                style={[tw`h-12 px-4 border rounded-md text-base`, { borderColor: boxColor, color: textColor }]}
              />
            </Field>

            <Field label="Email *" color={textColor}>
              <TextInput
                value={form.email}
                onChangeText={(value) => updateField('email', value)}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor="#999"
                style={[tw`h-12 px-4 border rounded-md text-base`, { borderColor: boxColor, color: textColor }]}
              />
            </Field>

            <Field label="Phone number *" color={textColor}>
              <TextInput
                value={form.phoneNumber}
                onChangeText={(value) => updateField('phoneNumber', value)}
                placeholder="+2348012345678"
                keyboardType="phone-pad"
                placeholderTextColor="#999"
                style={[tw`h-12 px-4 border rounded-md text-base`, { borderColor: boxColor, color: textColor }]}
              />
            </Field>

            {error ? (
              <ThemedText style={tw`text-red-500 text-center mb-4`}>{error}</ThemedText>
            ) : null}

            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              style={[
                tw`h-12 rounded-md items-center justify-center mt-2`,
                { backgroundColor: saving ? '#9ca3af' : primaryColor },
              ]}
            >
              {saving ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <ThemedText style={tw`text-white text-base font-bold`}>Save changes</ThemedText>
              )}
            </TouchableOpacity>

            {!loading && error ? (
              <TouchableOpacity onPress={loadProfile} style={tw`mt-4`}>
                <ThemedText style={tw`text-center`} lightColor="#ff1493">Reload profile</ThemedText>
              </TouchableOpacity>
            ) : null}
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, color, children }) {
  return (
    <View style={tw`mb-4`}>
      <ThemedText style={[tw`mb-1 text-sm font-semibold`, { color }]}>{label}</ThemedText>
      {children}
    </View>
  );
}
