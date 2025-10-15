import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Debug: Log environment variables
console.log('🔥 Firebase Config Check:');
console.log('API Key exists:', !!process.env.EXPO_PUBLIC_FIREBASE_API_KEY);
console.log('Auth Domain:', process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN);
console.log('Project ID:', process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID);
console.log('Storage Bucket:', process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET);
console.log('Messaging Sender ID:', process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID);
console.log('App ID exists:', !!process.env.EXPO_PUBLIC_FIREBASE_APP_ID);

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Validate config
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  console.error('❌ Firebase config is missing! Check your .env file');
  console.error('Config:', firebaseConfig);
  throw new Error('Firebase configuration is incomplete');
}

console.log('✅ Firebase config loaded successfully');


const app = initializeApp(firebaseConfig);

// Initialize Auth for React Native with persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);

console.log('✅ Firebase initialized successfully');

export default app;