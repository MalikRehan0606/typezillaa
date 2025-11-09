
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;
let storage: FirebaseStorage | undefined;

if (
  !!firebaseConfig.apiKey &&
  !!firebaseConfig.authDomain &&
  !!firebaseConfig.projectId
) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const databaseId = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID;
    db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);

    if (typeof window !== 'undefined' && db) {
      enableIndexedDbPersistence(db)
        .catch((err) => {
          if (err.code == 'failed-precondition') {
            console.warn('Firestore persistence can only be enabled in one tab at a time.');
          } else if (err.code == 'unimplemented') {
            console.warn('The current browser does not support all of the features required to enable persistence.');
          }
        });
    }
  } catch (e) {
    console.error("Failed to initialize Firebase", e);
  }
} else {
  console.warn("Firebase config is missing. The app will run in a limited mode. Please set up your .env file.");
}

export { db, auth, storage };
