// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCAH1yVWXxxkFzuttm8gn0SNeMC69e4oTc",
  authDomain: "dones-espirituales-app.firebaseapp.com",
  projectId: "dones-espirituales-app",
  storageBucket: "dones-espirituales-app.appspot.com", // Corregido: .appspot.com es lo común para storageBucket
  messagingSenderId: "615714514109",
  appId: "1:615714514109:web:e558ee1dff15e680c9c3d4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export { db };