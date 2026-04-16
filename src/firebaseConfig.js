// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getFirestore } from "firebase/firestore"; // Adicione este import no topo

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAqREU1ixHbedIhzUpIf2SjtyyiL6PDedM",
  authDomain: "olha-o-produto.firebaseapp.com",
  projectId: "olha-o-produto",
  storageBucket: "olha-o-produto.firebasestorage.app",
  messagingSenderId: "796684421076",
  appId: "1:796684421076:web:5771d50759e69139e9f841"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app); // Adicione esta linha no final