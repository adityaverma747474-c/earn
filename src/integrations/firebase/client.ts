import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBummah6YvO2i09BOd9P_J8l_GsO5kt-OY",
  authDomain: "earnbits-16def.firebaseapp.com",
  projectId: "earnbits-16def",
  storageBucket: "earnbits-16def.firebasestorage.app",
  messagingSenderId: "643357318230",
  appId: "1:643357318230:web:b7c33af2dc9b9ce4ceeff7",
  measurementId: "G-5MYDDPTH0D"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
