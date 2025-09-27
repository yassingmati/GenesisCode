// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
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
const analytics = getAnalytics(app);
export { app }; // 👈 très important ici
