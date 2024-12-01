import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCpzf4vM_uBOzn2ZauO8Bfh_xoEN8nUuJQ",
    authDomain: "detask-ea467.firebaseapp.com",
    projectId: "detask-ea467",
    storageBucket: "detask-ea467.firebasestorage.app",
    messagingSenderId: "1041257555473",
    appId: "1:1041257555473:web:17470509c7d322801233b0"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
