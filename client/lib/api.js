import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import SecureStore from './SecureStore';

const DEFAULT_API_PORT = 3000;
const DEFAULT_TIMEOUT = 30000;

export const AUTH_STORAGE_KEYS = ['userId', 'userRole', 'authToken', 'username'];

const stripTrailingSlash = (value) => String(value || '').replace(/\/+$/, '');

const isLoopback = (host) =>
  ['localhost', '127.0.0.1', '0.0.0.0', '::1', '[::1]'].includes(String(host || '').toLowerCase());

/**
 * Resolve the API origin for the current environment.
 *
 * Priority:
 *  1. EXPO_PUBLIC_API_URL (recommended for production and custom setups)
 *  2. app.json -> expo.extra.apiBaseUrl (or legacy API_BASE_URL)
 *  3. Development: the host the app used to reach Metro, port 3000
 *  4. Web: the current browser hostname, port 3000
 *  5. http://localhost:3000
 */
export function getApiUrl() {
  const envUrl = stripTrailingSlash(process.env.EXPO_PUBLIC_API_URL);
  if (envUrl) return envUrl.replace(/\/api$/i, '');

  const extra = Constants.expoConfig?.extra || {};
  const configuredUrl = stripTrailingSlash(extra.apiBaseUrl || extra.API_BASE_URL || '');
  if (configuredUrl) return configuredUrl.replace(/\/api$/i, '');

  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location) {
    const { protocol, hostname, port, origin } = window.location;
    const isDevServer = typeof __DEV__ !== 'undefined' && __DEV__;
    if (hostname) {
      // Expo web dev server runs on 8081; the API runs on 3000.
      if (isDevServer || port === '8081' || port === '19006') {
        return `${protocol}//${hostname}:${DEFAULT_API_PORT}`;
      }
      // In production, assume a reverse proxy on the same origin unless an
      // explicit EXPO_PUBLIC_API_URL was provided above.
      return origin;
    }
  }

  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.expoGoConfig?.debuggerHost ||
    Constants.manifest2?.extra?.expoClient?.hostUri ||
    '';

  const metroHost = String(hostUri)
    .replace(/^[a-z]+:\/\//i, '')
    .split(':')[0];
  if (metroHost) {
    // Android emulators reach the host machine through 10.0.2.2, not localhost.
    const host =
      Platform.OS === 'android' && isLoopback(metroHost) ? '10.0.2.2' : metroHost;
    return `http://${host}:${DEFAULT_API_PORT}`;
  }

  return `http://localhost:${DEFAULT_API_PORT}`;
}

export const API_BASE_URL = `${getApiUrl()}/api`;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    Accept: 'application/json',
  },
});

let unauthorizedHandler = null;

/**
 * Register a callback that runs when an authenticated request returns 401.
 * The root layout uses this to clear the session and return to login.
 */
export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = typeof handler === 'function' ? handler : null;
};

export const clearAuthSession = async () => {
  await Promise.all(
    AUTH_STORAGE_KEYS.map((key) => SecureStore.deleteItemAsync(key).catch(() => {}))
  );
};

const isAuthEndpoint = (url = '') => /\/(login|signup)\b/i.test(url);

apiClient.interceptors.request.use(async (config) => {
  if (config.skipAuth) return config;

  try {
    const token = await SecureStore.getItemAsync('authToken');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Storage can be unavailable (private mode, etc.) — request still proceeds.
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';

    if (
      status === 401 &&
      !error.config?.skipAuth &&
      !isAuthEndpoint(url) &&
      typeof unauthorizedHandler === 'function'
    ) {
      unauthorizedHandler();
    }

    error.userMessage = getApiErrorMessage(error);
    return Promise.reject(error);
  }
);

/**
 * Convert an axios/network error into a message that is safe to show in the UI.
 */
export function getApiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return fallback;

  if (error.code === 'ECONNABORTED' || /timeout/i.test(error.message || '')) {
    return 'The server took too long to respond. Please try again.';
  }

  if (!error.response) {
    return `Can't reach the server at ${getApiUrl()}. Check your internet connection and make sure the server is running.`;
  }

  const { status, data } = error.response;

  if (data) {
    if (typeof data === 'string' && data.trim()) return data;
    if (data.message) return data.message;
    if (typeof data.error === 'string' && data.error.trim()) return data.error;
    if (data.error?.message) return data.error.message;
    if (Array.isArray(data.errors) && data.errors[0]?.msg) return data.errors[0].msg;
  }

  if (status === 401) return 'Your session has expired. Please sign in again.';
  if (status === 403) return 'You do not have permission to do that.';
  if (status === 404) return 'The requested item was not found.';
  if (status === 413) return 'The file is too large to upload.';
  if (status === 429) return 'Too many requests. Please wait a moment and try again.';
  if (status >= 500) return 'The server ran into a problem. Please try again.';

  return fallback;
}

// Helpful while setting up a device or a new environment.
if (typeof __DEV__ !== 'undefined' && __DEV__) {
  console.log(`[api] Using API at ${API_BASE_URL}`);
}

export default apiClient;
