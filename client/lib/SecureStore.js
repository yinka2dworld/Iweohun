import { Platform } from 'react-native';
import * as ExpoSecureStore from 'expo-secure-store';

// expo-secure-store has no web implementation (its web build is an empty
// object). On web we fall back to localStorage so the app still runs in a
// browser; on iOS/Android we use the real encrypted SecureStore.
const webStore = {
  async getItemAsync(key) {
    try {
      return globalThis.localStorage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  },
  async setItemAsync(key, value) {
    try {
      globalThis.localStorage?.setItem(key, value);
    } catch {
      // storage unavailable (private mode, disabled cookies, etc.) — ignore
    }
  },
  async deleteItemAsync(key) {
    try {
      globalThis.localStorage?.removeItem(key);
    } catch {
      // ignore
    }
  },
};

const SecureStore = Platform.OS === 'web' ? webStore : ExpoSecureStore;

export default SecureStore;
