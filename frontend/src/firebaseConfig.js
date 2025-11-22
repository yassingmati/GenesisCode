// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAyWwRXyunN_wKhvG6LKvNP3MIItuje_aQ",
  authDomain: "codegenesis-3dc24.firebaseapp.com",
  projectId: "codegenesis-3dc24",
  storageBucket: "codegenesis-3dc24.firebasestorage.app",
  messagingSenderId: "346485812971",
  appId: "1:346485812971:web:58905e0aea5586835ed8ae",
  measurementId: "G-VRRKD87HRN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

let analyticsPromise = Promise.resolve(null);

if (typeof window !== 'undefined') {
  analyticsPromise = isAnalyticsSupported()
    .then((supported) => {
      if (supported) {
        return getAnalytics(app);
      }

      if (process.env.NODE_ENV !== 'production') {
        console.info('[Firebase] Analytics not supported in this environment.');
      }
      return null;
    })
    .catch((error) => {
      console.warn('[Firebase] Analytics initialization skipped:', error);
      return null;
    });
}

export { app, analyticsPromise };
