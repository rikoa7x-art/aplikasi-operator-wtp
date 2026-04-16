import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase only if the config is not completely empty
let db: ReturnType<typeof initializeFirestore> | null = null;

try {
    if (firebaseConfig.apiKey && firebaseConfig.apiKey !== 'your_api_key') {
        const app = initializeApp(firebaseConfig);
        // ignoreUndefinedProperties: Firestore mengabaikan field undefined
        // sehingga tidak throw error saat ada field yang tidak diset
        db = initializeFirestore(app, {
            ignoreUndefinedProperties: true,
        });
    }
} catch (error) {
    console.error('Error initializing Firebase:', error);
}

export { db };
