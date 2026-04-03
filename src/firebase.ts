import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase only if the config is not completely empty
let app;
let db: ReturnType<typeof getFirestore> | null = null;

try {
    if (firebaseConfig.apiKey && firebaseConfig.apiKey !== 'your_api_key') {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
    }
} catch (error) {
    console.error('Error initializing Firebase:', error);
}

export { db };
