import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; 
const firebaseConfig = {
  apiKey: "AIzaSyAqREU1ixHbedIhzUpIf2SjtyyiL6PDedM",
  authDomain: "olha-o-produto.firebaseapp.com",
  projectId: "olha-o-produto",
  storageBucket: "olha-o-produto.firebasestorage.app",
  messagingSenderId: "796684421076",
  appId: "1:796684421076:web:5771d50759e69139e9f841"
};

const app = initializeApp(firebaseConfig);


export const db = getFirestore(app);
export const auth = getAuth(app); 